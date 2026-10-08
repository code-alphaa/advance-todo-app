import { ITask } from '../types';

// Default daily reminder times (HH:mm) for each reminders-per-day count
export const DEFAULT_REMINDER_TIMES: Record<number, string[]> = {
  0: [],
  1: ['09:00'],
  2: ['09:00', '17:00'],
  3: ['09:00', '13:00', '17:00'],
  4: ['09:00', '12:00', '15:00', '18:00'],
  5: ['09:00', '11:00', '13:00', '15:00', '17:00'],
};

export function getDefaultReminderTimes(count: number): string[] {
  return [...(DEFAULT_REMINDER_TIMES[count] || [])];
}

export function sortTimes(times: string[]): string[] {
  return [...times].sort();
}

// Times a task should remind at; older tasks without custom times fall back to the defaults
export function getTaskReminderTimes(task: Pick<ITask, 'remindersPerDay' | 'reminderTimes'>): string[] {
  const count = task.remindersPerDay || 0;
  if (count <= 0) return [];
  if (task.reminderTimes && task.reminderTimes.length === count) return sortTimes(task.reminderTimes);
  return getDefaultReminderTimes(count);
}

export function timeStringToDate(time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

export function dateToTimeString(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// 24h "HH:mm" -> "9:00 AM"
export function formatTime12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

// How many of the given HH:mm times have already been reached today
export function countPassedTimes(times: string[], now: Date = new Date()): number {
  const current = dateToTimeString(now);
  return times.filter((time) => time <= current).length;
}
