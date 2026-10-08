import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Bell,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { IEvent, ITask } from '../types';
import { formatDateToYYYYMMDD } from '../utils/dateUtils';
import { SyncGoogleCalendarModal } from './SyncGoogleCalendarModal';

interface CalendarViewProps {
  events: IEvent[];
  tasks: ITask[];
  onAddEvent: (dateString: string) => void;
  onDeleteEvent: (id: string, title: string) => void;
  onOpenTaskDetails: (task: ITask) => void;
  onRefreshEvents?: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  tasks,
  onAddEvent,
  onDeleteEvent,
  onOpenTaskDetails,
  onRefreshEvents,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar days for the current month
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayIndex = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const calendarDays: Array<{
    dateString: string;
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
  }> = [];

  const todayObj = new Date();
  const todayStr = formatDateToYYYYMMDD(todayObj);
  const todayDayOfWeekIndex = (todayObj.getDay() + 6) % 7; // Monday = 0

  // Previous month trailing days
  for (let i = startingDayIndex - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const prevDate = new Date(year, month - 1, dayNum);
    const dateString = formatDateToYYYYMMDD(prevDate);
    calendarDays.push({
      dateString,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateString = formatDateToYYYYMMDD(dateObj);
    calendarDays.push({
      dateString,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateString === todayStr,
    });
  }

  // Next month leading days to complete the 35 or 42 grid
  const remainingCells = (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nextDate = new Date(year, month + 1, d);
    const dateString = formatDateToYYYYMMDD(nextDate);
    calendarDays.push({
      dateString,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
    });
  }

  const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="flex-1 flex flex-col gap-4 max-w-7xl mx-auto w-full">
      {/* Month Navigation & Action Bar */}
      <div className="flex items-center justify-between bg-[var(--bg-card)] p-3 sm:p-4 rounded-2xl border border-[var(--border-color)] shadow-xs flex-wrap gap-3">
        {/* Starting: Previous Month Arrow Button */}
        <button
          onClick={prevMonth}
          className="p-2 sm:p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-app)] text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--column-bg)] transition-all active:scale-95 shadow-xs shrink-0"
          title="Previous Month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Center: Month Title & Actions */}
        <div className="flex flex-1 items-center justify-center gap-2 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-color)] text-[var(--text-on-accent)] flex items-center justify-center font-bold shadow-xs shrink-0">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-main)] tracking-tight leading-tight">
                {monthName}
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)] hidden md:block">
                Scheduled Events & Tasks Overview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-1 sm:ml-3">
            <button
              onClick={jumpToToday}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--column-header)] text-[var(--text-main)] hover:bg-[var(--accent-color)] hover:text-[var(--text-on-accent)] border border-[var(--border-color)] transition-all shadow-xs"
            >
              Today
            </button>

            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#4285F4] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs hover:bg-[#3367D6] transition-colors"
              title="Sync with Google Calendar"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Google Sync</span>
            </button>

            <button
              onClick={() => onAddEvent(todayStr)}
              className="flex items-center gap-1.5 bg-[var(--accent-color)] text-[var(--text-on-accent)] px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs hover:opacity-95 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        {/* End: Next Month Arrow Button */}
        <button
          onClick={nextMonth}
          className="p-2 sm:p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-app)] text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--column-bg)] transition-all active:scale-95 shadow-xs shrink-0"
          title="Next Month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-[var(--border-color)] bg-[var(--column-header)]/80 text-center py-2 text-xs font-bold uppercase tracking-wider">
          {dayHeaders.map((dh, idx) => (
            <div
              key={dh}
              className={
                idx === todayDayOfWeekIndex
                  ? 'text-[var(--accent-color)] font-extrabold'
                  : 'text-[var(--text-secondary)]'
              }
            >
              {dh}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[var(--border-color)] bg-[var(--border-color)]/20">
          {calendarDays.map((day) => {
            const dayEvents = events.filter((e) => e.eventDate === day.dateString);
            const dayTasks = tasks.filter((t) => t.assignedDate === day.dateString);

            return (
              <div
                key={day.dateString}
                className={`min-h-[110px] sm:min-h-[135px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors relative group ${
                  day.isCurrentMonth
                    ? 'bg-[var(--bg-card)] hover:bg-[var(--column-bg)]/60'
                    : 'bg-[var(--bg-app)] opacity-40'
                } ${day.isToday ? 'ring-2 ring-[var(--accent-color)] ring-inset' : ''}`}
              >
                {/* Header inside cell */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-extrabold px-1.5 py-0.5 rounded-md ${
                      day.isToday
                        ? 'bg-[var(--accent-color)] text-[var(--text-on-accent)]'
                        : 'text-[var(--text-main)]'
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  <button
                    onClick={() => onAddEvent(day.dateString)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-[var(--column-bg)] text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-all"
                    title={`Add event for ${day.dateString}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Events list */}
                <div className="flex-1 space-y-1 overflow-y-auto max-h-[85px] sm:max-h-[105px] pr-0.5">
                  {dayEvents.map((evt) => (
                    <div
                      key={evt._id}
                      style={{
                        backgroundColor: evt.color || '#4285F4',
                      }}
                      className="text-white text-[11px] font-semibold px-1.5 py-0.5 rounded-md flex items-center justify-between shadow-2xs group/event cursor-pointer hover:brightness-105 transition-all"
                    >
                      <div className="flex items-center gap-1 truncate">
                        <Clock className="w-2.5 h-2.5 shrink-0 opacity-80" />
                        <span className="truncate">{evt.title}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {evt.source === 'google' && (
                          <span className="bg-white/25 text-[8px] font-bold px-1 rounded-sm">
                            G
                          </span>
                        )}
                        {evt.reminderMinutes > 0 && (
                          <span title={`Reminds ${evt.reminderMinutes}m before`}>
                            <Bell className="w-2.5 h-2.5 text-white/90" />
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteEvent(evt._id, evt.title);
                          }}
                          className="opacity-0 group-hover/event:opacity-100 hover:text-red-200 transition-opacity ml-0.5"
                          title="Delete Event"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Tasks on this Day */}
                  {dayTasks.map((t) => (
                    <div
                      key={t._id}
                      onClick={() => onOpenTaskDetails(t)}
                      className={`flex items-center justify-between px-1.5 py-0.5 rounded text-[10px] cursor-pointer transition-colors border ${
                        t.status === 'DONE'
                          ? 'line-through opacity-60 bg-[var(--bg-app)] border-[var(--border-color)] text-[var(--text-muted)]'
                          : 'bg-[var(--column-bg)] border-[var(--border-color)] text-[var(--text-main)] hover:border-[var(--accent-color)] font-medium'
                      }`}
                      title={`${t.key}: ${t.title}`}
                    >
                      <span className="truncate">{t.title}</span>
                      <span className="text-[8px] font-mono shrink-0 ml-1 text-[var(--text-secondary)]">
                        {t.key}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Day Summary Pill */}
                <div className="text-[9px] text-[var(--text-muted)] text-right pt-0.5 font-medium">
                  {dayEvents.length > 0 && `${dayEvents.length} evt`}
                  {dayEvents.length > 0 && dayTasks.length > 0 && ' • '}
                  {dayTasks.length > 0 && `${dayTasks.length} tasks`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Google Calendar Sync Modal */}
      <SyncGoogleCalendarModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSyncSuccess={() => {
          onRefreshEvents?.();
        }}
      />
    </div>
  );
};
