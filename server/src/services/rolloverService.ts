import { Task, ITask } from '../models/Task';

/**
 * Checks for tasks that were assigned to past dates and are still not DONE.
 * Automatically moves them to the current target date (today), records rollover history,
 * and increments rollover count.
 */
export async function performAutomaticRollover(clientTodayDate?: string): Promise<{ rolledOverCount: number; updatedTasks: ITask[] }> {
  // Use provided client local date (YYYY-MM-DD) or fallback to server local date
  const today = clientTodayDate || new Date().toISOString().split('T')[0];

  // Find all tasks that are:
  // 1. assignedDate < today
  // 2. status != 'DONE'
  const overdueTasks = await Task.find({
    assignedDate: { $lt: today },
    status: { $ne: 'DONE' },
  });

  if (overdueTasks.length === 0) {
    return { rolledOverCount: 0, updatedTasks: [] };
  }

  const updatedTasks: ITask[] = [];

  for (const task of overdueTasks) {
    const previousDate = task.assignedDate;
    task.assignedDate = today;
    task.isRolledOver = true;
    task.rolloverCount = (task.rolloverCount || 0) + 1;
    task.rolloverHistory.push({
      fromDate: previousDate,
      toDate: today,
      timestamp: new Date(),
      reason: `Automated rollover: Unfinished task on ${previousDate} carried over to ${today}`,
    });

    await task.save();
    updatedTasks.push(task);
  }

  console.log(`[Rollover Service] Rolled over ${updatedTasks.length} incomplete tasks to ${today}`);
  return { rolledOverCount: updatedTasks.length, updatedTasks };
}
