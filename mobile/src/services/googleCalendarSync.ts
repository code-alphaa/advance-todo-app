import AsyncStorage from '@react-native-async-storage/async-storage';
import { IEvent } from '../types/index';
import { offlineStorage } from './storage';

const ICAL_URL_STORAGE_KEY = '@tt_google_calendar_ical_url';
const ICAL_LAST_SYNC_KEY = '@tt_google_calendar_last_sync';

export interface SyncResult {
  success: boolean;
  createdCount: number;
  updatedCount: number;
  totalSynced: number;
  lastSyncTime?: string;
  error?: string;
}

export const googleCalendarSyncService = {
  async getSavedIcalUrl(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ICAL_URL_STORAGE_KEY);
    } catch {
      return null;
    }
  },

  async saveIcalUrl(url: string): Promise<void> {
    await AsyncStorage.setItem(ICAL_URL_STORAGE_KEY, url.trim());
  },

  async clearSavedIcalUrl(): Promise<void> {
    await AsyncStorage.removeItem(ICAL_URL_STORAGE_KEY);
    await AsyncStorage.removeItem(ICAL_LAST_SYNC_KEY);
  },

  async getLastSyncTime(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ICAL_LAST_SYNC_KEY);
    } catch {
      return null;
    }
  },

  parseICalDate(str?: string): { eventDate: string; time: string } | null {
    if (!str) return null;
    const clean = str.trim();

    // Format 1: All-day event (YYYYMMDD)
    if (/^\d{8}$/.test(clean)) {
      const y = clean.substring(0, 4);
      const m = clean.substring(4, 6);
      const d = clean.substring(6, 8);
      return { eventDate: `${y}-${m}-${d}`, time: '09:00' };
    }

    // Format 2: UTC timestamp (YYYYMMDDTHHMMSSZ)
    if (/^\d{8}T\d{6}Z$/.test(clean)) {
      const y = parseInt(clean.substring(0, 4), 10);
      const m = parseInt(clean.substring(4, 6), 10) - 1;
      const d = parseInt(clean.substring(6, 8), 10);
      const h = parseInt(clean.substring(9, 11), 10);
      const min = parseInt(clean.substring(11, 13), 10);
      const sec = parseInt(clean.substring(13, 15), 10);
      const utc = new Date(Date.UTC(y, m, d, h, min, sec));
      const pad = (n: number) => String(n).padStart(2, '0');
      return {
        eventDate: `${utc.getFullYear()}-${pad(utc.getMonth() + 1)}-${pad(utc.getDate())}`,
        time: `${pad(utc.getHours())}:${pad(utc.getMinutes())}`,
      };
    }

    // Format 3: Local or timezone offset (YYYYMMDDTHHMMSS)
    const match = clean.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
    if (match) {
      return {
        eventDate: `${match[1]}-${match[2]}-${match[3]}`,
        time: `${match[4]}:${match[5]}`,
      };
    }

    return null;
  },

  parseICS(rawText: string) {
    // Unfold lines per RFC 5545
    const unfolded = rawText.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
    const lines = unfolded.split(/\r\n|\r|\n/);

    const items: Array<{
      uid?: string;
      summary?: string;
      description?: string;
      location?: string;
      dtstart?: string;
      dtend?: string;
    }> = [];

    let inEvent = false;
    let current: any = {};

    for (let line of lines) {
      line = line.trim();
      if (line === 'BEGIN:VEVENT') {
        inEvent = true;
        current = {};
      } else if (line === 'END:VEVENT') {
        inEvent = false;
        if (current.summary || current.dtstart) {
          items.push(current);
        }
      } else if (inEvent) {
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) continue;
        const fullKey = line.substring(0, colonIdx);
        const val = line.substring(colonIdx + 1);
        const key = fullKey.split(';')[0].toUpperCase();

        if (key === 'SUMMARY') {
          current.summary = val.replace(/\\,/g, ',').replace(/\\n/g, '\n').replace(/\\;/g, ';');
        } else if (key === 'DESCRIPTION') {
          current.description = val.replace(/\\,/g, ',').replace(/\\n/g, '\n').replace(/\\;/g, ';');
        } else if (key === 'LOCATION') {
          current.location = val.replace(/\\,/g, ',').replace(/\\n/g, '\n').replace(/\\;/g, ';');
        } else if (key === 'UID') {
          current.uid = val;
        } else if (key === 'DTSTART') {
          current.dtstart = val;
        } else if (key === 'DTEND') {
          current.dtend = val;
        }
      }
    }

    return items;
  },

  async syncFromIcalUrl(url: string): Promise<SyncResult> {
    try {
      const normalizedUrl = url.trim().replace(/^webcal:\/\//i, 'https://');
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        return {
          success: false,
          createdCount: 0,
          updatedCount: 0,
          totalSynced: 0,
          error: 'Please enter a valid Google Calendar URL starting with https:// or webcal://',
        };
      }

      // 1. Fetch iCal feed
      const response = await fetch(normalizedUrl, {
        headers: {
          'Accept': 'text/calendar, text/plain, */*',
        },
      });

      if (!response.ok) {
        throw new Error(`Google Calendar server returned status ${response.status}`);
      }

      const icsText = await response.text();
      if (!icsText || !icsText.includes('BEGIN:VCALENDAR')) {
        throw new Error('The URL did not return a valid iCal/ICS calendar feed. Ensure you copied the Secret address in iCal format.');
      }

      // 2. Parse events
      const parsedItems = this.parseICS(icsText);
      const existingEvents = await offlineStorage.getEvents();
      let createdCount = 0;
      let updatedCount = 0;

      for (const item of parsedItems) {
        const startInfo = this.parseICalDate(item.dtstart);
        if (!startInfo) continue;

        const endInfo = this.parseICalDate(item.dtend);
        const eventDate = startInfo.eventDate;
        const startTime = startInfo.time;
        const endTime = endInfo ? endInfo.time : startTime;
        const title = (item.summary || 'Google Calendar Event').trim();
        const description = (item.description || '').trim();
        const location = (item.location || '').trim();
        const uid = item.uid || `${eventDate}_${startTime}_${title}`;

        // Find existing match by googleEventId or (eventDate + startTime + title)
        const matchIndex = existingEvents.findIndex(
          (e) => e.googleEventId === uid || (e.eventDate === eventDate && e.startTime === startTime && e.title === title)
        );

        if (matchIndex >= 0) {
          const matched = existingEvents[matchIndex];
          matched.title = title;
          matched.description = description;
          matched.eventDate = eventDate;
          matched.startTime = startTime;
          matched.endTime = endTime;
          matched.location = location;
          matched.googleEventId = uid;
          matched.source = 'google';
          if (!matched.color || matched.color === '#F62440') {
            matched.color = '#4285F4'; // Signature Google blue
          }
          await offlineStorage.updateEvent(matched._id, matched);
          updatedCount++;
        } else {
          await offlineStorage.createEvent({
            title,
            description,
            eventDate,
            startTime,
            endTime,
            location,
            reminderMinutes: 15,
            color: '#4285F4', // Signature Google blue
            googleEventId: uid,
            source: 'google',
          });
          createdCount++;
        }
      }

      const nowIso = new Date().toISOString();
      await AsyncStorage.setItem(ICAL_LAST_SYNC_KEY, nowIso);
      await this.saveIcalUrl(url);

      return {
        success: true,
        createdCount,
        updatedCount,
        totalSynced: createdCount + updatedCount,
        lastSyncTime: nowIso,
      };
    } catch (err: any) {
      console.error('Google Calendar sync failed:', err);
      return {
        success: false,
        createdCount: 0,
        updatedCount: 0,
        totalSynced: 0,
        error: err.message || 'Failed to sync Google Calendar. Please check your network and URL.',
      };
    }
  },
};
