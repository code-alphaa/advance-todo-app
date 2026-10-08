import { Router, Request, Response } from 'express';
import ical from 'node-ical';
import { Event } from '../models/Event';

const router = Router();

// GET /api/events?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, date } = req.query;
    const filter: Record<string, any> = {};

    if (date) {
      filter.eventDate = date;
    } else if (startDate && endDate) {
      filter.eventDate = { $gte: startDate, $lte: endDate };
    }

    const events = await Event.find(filter).sort({ eventDate: 1, startTime: 1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// POST /api/events/sync-ical - Sync Google Calendar via iCal URL
router.post('/sync-ical', async (req: Request, res: Response) => {
  try {
    const { icalUrl } = req.body;
    if (!icalUrl || typeof icalUrl !== 'string') {
      return res.status(400).json({ error: 'A valid Google Calendar iCal URL is required' });
    }

    // Support webcal:// by converting to https://
    const normalizedUrl = icalUrl.trim().replace(/^webcal:\/\//i, 'https://');
    
    // Fetch and parse the ical feed
    const rawEvents = await ical.async.fromURL(normalizedUrl);
    
    let createdCount = 0;
    let updatedCount = 0;
    const syncedEvents: any[] = [];

    for (const key of Object.keys(rawEvents)) {
      const item = rawEvents[key] as any;
      if (!item || item.type !== 'VEVENT' || !item.start) continue;

      const startDate = new Date(item.start);
      if (isNaN(startDate.getTime())) continue;

      const pad = (n: number) => String(n).padStart(2, '0');
      const year = startDate.getFullYear();
      const month = pad(startDate.getMonth() + 1);
      const day = pad(startDate.getDate());
      const eventDate = `${year}-${month}-${day}`;
      const startTime = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;

      let endTime = startTime;
      if (item.end) {
        const endDate = new Date(item.end);
        if (!isNaN(endDate.getTime())) {
          endTime = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;
        }
      }

      const uid = (item.uid || `${eventDate}-${startTime}-${item.summary || 'event'}`).toString();
      const title = (item.summary || 'Google Calendar Event').toString().trim();
      const description = (item.description || '').toString().trim();
      const location = (item.location || '').toString().trim();

      // Check if event already exists by googleEventId or (eventDate + startTime + title)
      const existing = await Event.findOne({
        $or: [
          { googleEventId: uid },
          { eventDate, startTime, title, source: 'google' },
        ],
      });

      if (existing) {
        existing.title = title;
        existing.description = description;
        existing.eventDate = eventDate;
        existing.startTime = startTime;
        existing.endTime = endTime;
        existing.location = location;
        existing.googleEventId = uid;
        existing.source = 'google';
        const saved = await existing.save();
        updatedCount++;
        syncedEvents.push(saved);
      } else {
        const newEvent = new Event({
          title,
          description,
          eventDate,
          startTime,
          endTime,
          color: '#4285F4', // Google signature blue
          location,
          reminderMinutes: 15,
          isNotified: false,
          googleEventId: uid,
          source: 'google',
        });
        const saved = await newEvent.save();
        createdCount++;
        syncedEvents.push(saved);
      }
    }

    // Return all events for the client to refresh its state
    const allEvents = await Event.find().sort({ eventDate: 1, startTime: 1 });

    res.json({
      message: `Google Calendar synced: ${createdCount} imported, ${updatedCount} updated`,
      createdCount,
      updatedCount,
      totalSynced: syncedEvents.length,
      events: allEvents,
    });
  } catch (error: any) {
    console.error('Error syncing iCal:', error);
    res.status(500).json({
      error: 'Failed to sync Google Calendar feed. Please check the URL and ensure it is a valid public or secret iCal address.',
      details: error.message || String(error),
    });
  }
});

// POST /api/events
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      eventDate,
      startTime,
      endTime,
      color,
      location,
      reminderMinutes,
    } = req.body;

    if (!title || !eventDate || !startTime) {
      return res.status(400).json({ error: 'Title, eventDate, and startTime are required' });
    }

    const newEvent = new Event({
      title,
      description: description || '',
      eventDate,
      startTime,
      endTime: endTime || startTime,
      color: color || '#F62440',
      location: location || '',
      reminderMinutes: reminderMinutes !== undefined ? Number(reminderMinutes) : 15,
      isNotified: false,
      source: 'manual',
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT /api/events/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await Event.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// PATCH /api/events/:id/notified
router.patch('/:id/notified', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await Event.findByIdAndUpdate(id, { isNotified: true }, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error marking event notified:', error);
    res.status(500).json({ error: 'Failed to update notification status' });
  }
});

// DELETE /api/events/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Event.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully', id });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;
