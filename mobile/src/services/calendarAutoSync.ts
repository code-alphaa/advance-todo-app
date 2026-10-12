import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { googleCalendarSyncService } from './googleCalendarSync';

export const CALENDAR_SYNC_TASK = 'google-calendar-auto-sync';
export const CALENDAR_SYNC_INTERVAL_MINUTES = 4 * 60;
const SYNC_INTERVAL_MS = CALENDAR_SYNC_INTERVAL_MINUTES * 60 * 1000;

/**
 * Syncs the connected calendar if the last sync is older than 4 hours.
 * Returns true when a sync actually ran and succeeded.
 */
export async function syncCalendarIfDue(): Promise<boolean> {
  const url = await googleCalendarSyncService.getSavedIcalUrl();
  if (!url) return false;

  const lastSync = await googleCalendarSyncService.getLastSyncTime();
  if (lastSync && Date.now() - new Date(lastSync).getTime() < SYNC_INTERVAL_MS) return false;

  const result = await googleCalendarSyncService.syncFromIcalUrl(url);
  return result.success;
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

/** Registers the 4-hourly background sync once a calendar is connected. iOS decides the exact run time. */
export async function startCalendarAutoSync(): Promise<void> {
  try {
    if (!(await googleCalendarSyncService.getSavedIcalUrl())) return;
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

export async function stopCalendarAutoSync(): Promise<void> {
  try {
    if (await TaskManager.isTaskRegisteredAsync(CALENDAR_SYNC_TASK)) {
      await BackgroundTask.unregisterTaskAsync(CALENDAR_SYNC_TASK);
    }
  } catch (e) {
    console.error('Failed to unregister calendar auto-sync:', e);
  }
}
