import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { googleCalendarSyncService } from './googleCalendarSync';
import { outlookCalendarSyncService } from './outlookCalendarSync';

export const CALENDAR_SYNC_TASK = 'calendar-auto-sync';
export const CALENDAR_SYNC_INTERVAL_MINUTES = 4 * 60;
const SYNC_INTERVAL_MS = CALENDAR_SYNC_INTERVAL_MINUTES * 60 * 1000;

/**
 * Syncs connected calendars (Google and Outlook) if the last sync is older than 4 hours.
 * Returns true when at least one calendar was synced successfully.
 */
export async function syncCalendarIfDue(): Promise<boolean> {
  let anySynced = false;

  // 1. Google Calendar
  try {
    const gUrl = await googleCalendarSyncService.getSavedIcalUrl();
    if (gUrl) {
      const lastSync = await googleCalendarSyncService.getLastSyncTime();
      if (!lastSync || Date.now() - new Date(lastSync).getTime() >= SYNC_INTERVAL_MS) {
        const res = await googleCalendarSyncService.syncFromIcalUrl(gUrl);
        if (res.success) anySynced = true;
      }
    }
  } catch (e) {
    console.error('Auto sync Google Calendar error:', e);
  }

  // 2. Outlook Calendar
  try {
    const oUrl = await outlookCalendarSyncService.getSavedIcalUrl();
    if (oUrl) {
      const lastSync = await outlookCalendarSyncService.getLastSyncTime();
      if (!lastSync || Date.now() - new Date(lastSync).getTime() >= SYNC_INTERVAL_MS) {
        const res = await outlookCalendarSyncService.syncFromIcalUrl(oUrl);
        if (res.success) anySynced = true;
      }
    }
  } catch (e) {
    console.error('Auto sync Outlook Calendar error:', e);
  }

  return anySynced;
}

// Must be defined at module scope so iOS can run it while the app is backgrounded
TaskManager.defineTask(CALENDAR_SYNC_TASK, async () => {
  try {
    await syncCalendarIfDue();
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (e) {
    console.error('Background calendar sync failed:', e);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

/** Registers the 4-hourly background sync if any calendar is connected. */
export async function startCalendarAutoSync(): Promise<void> {
  try {
    const [gUrl, oUrl] = await Promise.all([
      googleCalendarSyncService.getSavedIcalUrl(),
      outlookCalendarSyncService.getSavedIcalUrl(),
    ]);
    if (!gUrl && !oUrl) return;

    const status = await BackgroundTask.getStatusAsync();
    if (status !== BackgroundTask.BackgroundTaskStatus.Available) return;
    if (await TaskManager.isTaskRegisteredAsync(CALENDAR_SYNC_TASK)) return;
    await BackgroundTask.registerTaskAsync(CALENDAR_SYNC_TASK, {
      minimumInterval: CALENDAR_SYNC_INTERVAL_MINUTES,
    });
  } catch (e) {
    console.error('Failed to register calendar auto-sync:', e);
  }
}

/** Stops background auto sync only if neither Google nor Outlook is connected. */
export async function stopCalendarAutoSyncIfNoneActive(): Promise<void> {
  try {
    const [gUrl, oUrl] = await Promise.all([
      googleCalendarSyncService.getSavedIcalUrl(),
      outlookCalendarSyncService.getSavedIcalUrl(),
    ]);
    if (!gUrl && !oUrl) {
      await stopCalendarAutoSync();
    }
  } catch (e) {
    console.error('Failed checking active calendars:', e);
  }
}

export async function stopCalendarAutoSync(): Promise<void> {
  try {
    if (await TaskManager.isTaskRegisteredAsync(CALENDAR_SYNC_TASK)) {
      await BackgroundTask.unregisterTaskAsync(CALENDAR_SYNC_TASK);
    }
  } catch (e) {
    console.error('Failed to unregister calendar auto-sync:', e);
  }
}
