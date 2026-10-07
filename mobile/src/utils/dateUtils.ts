import { DayInfo } from '../types';

export function formatDateToYYYYMMDD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatFriendlyDate(dateString: string): string {
  if (!dateString) return '';
  const [y, m, d] = dateString.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatMonthYear(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function getWeekDates(referenceDate: Date, todayDateStr: string): DayInfo[] {
  const current = new Date(referenceDate);
  const currentDay = current.getDay(); // 0 is Sunday, 1 is Monday
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

  const monday = new Date(current);
  monday.setDate(current.getDate() + distanceToMonday);

  const days: DayInfo[] = [];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const shortNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);

    const dateString = formatDateToYYYYMMDD(dayDate);
    const displayDate = dayDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    const isToday = dateString === todayDateStr;
    const isPast = dateString < todayDateStr;

    days.push({
      name: dayNames[i],
      shortName: shortNames[i],
      dateString,
      displayDate,
      isToday,
      isPast,
    });
  }

  return days;
}

export interface CalendarDayCell {
  date: Date;
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function getMonthCalendarCells(year: number, month: number, todayDateStr: string): CalendarDayCell[] {
  const cells: CalendarDayCell[] = [];
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Monday-based index: 0 = Mon, 6 = Sun
  const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7;

  // Days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const date = new Date(year, month - 1, day);
    const dateString = formatDateToYYYYMMDD(date);
    cells.push({
      date,
      dateString,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dateString === todayDateStr,
    });
  }

  // Days of current month
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const date = new Date(year, month, day);
    const dateString = formatDateToYYYYMMDD(date);
    cells.push({
      date,
      dateString,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateString === todayDateStr,
    });
  }

  // Days from next month to complete standard 35 or 42 grid
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= remaining; day++) {
    const date = new Date(year, month + 1, day);
    const dateString = formatDateToYYYYMMDD(date);
    cells.push({
      date,
      dateString,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dateString === todayDateStr,
    });
  }

  return cells;
}
