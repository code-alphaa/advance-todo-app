import { DayInfo } from '../types';

export const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const SHORT_DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseYYYYMMDD(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Gets the Monday of the week for the specified date
 */
export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns the 7 days of the week starting from Monday for the target date
 */
export function getWeekDates(referenceDate: Date, todayDateStr: string): DayInfo[] {
  const monday = getMondayOfWeek(referenceDate);
  const days: DayInfo[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateString = formatDateToYYYYMMDD(d);

    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = d.getDate();
    const year = d.getFullYear();

    days.push({
      name: DAY_NAMES[i],
      shortName: SHORT_DAY_NAMES[i],
      dateString,
      displayDate: `${monthName} ${dayNum}`,
      fullDisplay: `${DAY_NAMES[i]}, ${monthName} ${dayNum}, ${year}`,
      isToday: dateString === todayDateStr,
      isPast: dateString < todayDateStr,
    });
  }

  return days;
}

export function formatFriendlyDate(dateStr: string): string {
  try {
    const d = parseYYYYMMDD(dateStr);
    const todayStr = formatDateToYYYYMMDD(new Date());
    if (dateStr === todayStr) {
      return `Today (${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
    }
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
