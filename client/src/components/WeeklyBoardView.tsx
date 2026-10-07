import React, { useState, useRef } from 'react';
import { Calendar, Plus, ChevronLeft, ChevronRight, Clock, Bell } from 'lucide-react';
import { ITask, IEvent, DayInfo, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';

interface WeeklyBoardViewProps {
  days: DayInfo[];
  tasks: ITask[];
  events?: IEvent[];
  onOpenDetails: (task: ITask) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onAssignDate: (id: string, date: string) => void;
  onDelete: (id: string) => void;
  onQuickAddTask: (date: string, title: string) => void;
  onDropTask: (taskId: string, targetDate: string) => void;
}

export const WeeklyBoardView: React.FC<WeeklyBoardViewProps> = ({
  days,
  tasks,
  events = [],
  onOpenDetails,
  onStatusChange,
  onAssignDate,
  onDelete,
  onQuickAddTask,
  onDropTask,
}) => {
  const [activeDropDay, setActiveDropDay] = useState<string | null>(null);
  const [quickAddDay, setQuickAddDay] = useState<string | null>(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [mobileMode, setMobileMode] = useState<'single' | 'all'>('single');
  const [selectedMobileDay, setSelectedMobileDay] = useState<string>(() => {
    const today = days.find((d) => d.isToday);
    return today ? today.dateString : days[0]?.dateString || '';
  });

  const handleDragOver = (e: React.DragEvent, dateString: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropDay !== dateString) {
      setActiveDropDay(dateString);
    }
  };

  const handleDragLeave = () => {
    setActiveDropDay(null);
  };

  const handleDrop = (e: React.DragEvent, dateString: string) => {
    e.preventDefault();
    setActiveDropDay(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data && data.taskId) {
        onDropTask(data.taskId, dateString);
      }
    } catch (err) {
      console.error('Failed to parse drag data', err);
    }
  };

  const handleQuickAddSubmit = (dateString: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddTitle.trim()) return;
    onQuickAddTask(dateString, quickAddTitle.trim());
    setQuickAddTitle('');
    setQuickAddDay(null);
  };

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const renderColumn = (day: DayInfo, isSingleMobile: boolean = false) => {
    const dayTasks = tasks
      .filter((t) => t.assignedDate === day.dateString)
      .sort((a, b) => a.order - b.order);

    const dayEvents = events.filter((e) => e.eventDate === day.dateString);

    const isDropTarget = activeDropDay === day.dateString;
    const completedTasks = dayTasks.filter((t) => t.status === 'DONE').length;
    const totalTasks = dayTasks.length;
    const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
      <div
        key={day.dateString}
        onDragOver={(e) => handleDragOver(e, day.dateString)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, day.dateString)}
        className={`${
          isSingleMobile ? 'w-full' : 'w-[290px] min-w-[290px] flex-shrink-0'
        } flex flex-col rounded-2xl border transition-all duration-200 bg-[var(--column-bg)] ${
          isDropTarget
            ? 'border-[var(--accent-color)] ring-2 ring-[var(--accent-color)]/20 scale-[1.01]'
            : day.isToday
            ? 'border-[var(--accent-color)]/70 shadow-sm'
            : 'border-[var(--border-color)]'
        }`}
        style={{ minHeight: isSingleMobile ? 'calc(100vh - 280px)' : 'calc(100vh - 220px)' }}
      >
        {/* Column Header */}
        <div
          className={`p-3 border-b border-[var(--border-color)] rounded-t-2xl transition-colors ${
            day.isToday ? 'bg-[var(--accent-subtle)]' : 'bg-[var(--column-header)]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-bold tracking-tight ${
                  day.isToday ? 'text-[var(--accent-color)]' : 'text-[var(--text-main)]'
                }`}
              >
                {day.name}
              </span>
              {day.isToday && (
                <span className="text-[10px] uppercase font-bold tracking-wider bg-[var(--accent-color)] text-[var(--text-on-accent)] px-1.5 py-0.5 rounded shadow-xs">
                  Today
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--text-secondary)]">
              <span>{completedTasks}/{totalTasks}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-1 text-[11px] text-[var(--text-secondary)] font-mono">
            <span>{day.displayDate}</span>
            {day.isPast && !day.isToday && (
              <span className="text-[9px] text-[var(--text-muted)] italic">
                Past
              </span>
            )}
          </div>

          {/* Minimal progress bar */}
          <div className="w-full bg-[var(--border-color)]/40 rounded-full h-1 mt-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 bg-[var(--accent-color)]"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Tasks & Events List */}
        <div className="flex-1 p-2.5 overflow-y-auto space-y-1 scrollbar-none">
          {/* Scheduled Events Strip */}
          {dayEvents.length > 0 && (
            <div className="mb-2 space-y-1">
              <div className="text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-wider px-1">
                Calendar Events ({dayEvents.length})
              </div>
              {dayEvents.map((evt) => (
                <div
                  key={evt._id}
                  className="flex items-center justify-between gap-1 text-[11px] px-2 py-1 rounded-lg text-white font-medium shadow-2xs"
                  style={{ backgroundColor: evt.color || '#F62440' }}
                  title={`${evt.startTime} - ${evt.title} (${evt.reminderMinutes}m reminder)`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Clock className="w-3 h-3 shrink-0 opacity-80" />
                    <span className="text-[10px] font-bold opacity-90">{evt.startTime}</span>
                    <span className="truncate">{evt.title}</span>
                  </div>
                  {evt.reminderMinutes > 0 && (
                    <Bell className="w-2.5 h-2.5 shrink-0 opacity-90" />
                  )}
                </div>
              ))}
            </div>
          )}

          {dayTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onOpenDetails={onOpenDetails}
              onStatusChange={onStatusChange}
              onAssignDate={onAssignDate}
              onDelete={onDelete}
              weekDates={days}
            />
          ))}

          {dayTasks.length === 0 && dayEvents.length === 0 && (
            <div className="h-28 flex flex-col items-center justify-center text-center p-3 border border-dashed border-[var(--border-color)] rounded-xl my-2 text-[var(--text-muted)]">
              <p className="text-xs">No tasks scheduled</p>
              <span className="text-[10px] mt-0.5 opacity-70">
                Drag tasks here or add below
              </span>
            </div>
          )}

          {/* Quick Add Form in Column */}
          {quickAddDay === day.dateString && (
            <form
              onSubmit={(e) => handleQuickAddSubmit(day.dateString, e)}
              className="bg-[var(--bg-card)] border-2 border-[var(--accent-color)] rounded-xl p-2.5 shadow-md mb-2 animate-slide-up"
            >
              <input
                type="text"
                autoFocus
                placeholder={`Add task for ${day.shortName}...`}
                value={quickAddTitle}
                onChange={(e) => setQuickAddTitle(e.target.value)}
                className="w-full bg-transparent text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none mb-2 font-medium"
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setQuickAddDay(null);
                    setQuickAddTitle('');
                  }}
                  className="px-2 py-1 rounded text-xs text-[var(--text-muted)] hover:bg-[var(--border-color)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!quickAddTitle.trim()}
                  className="px-3 py-1 rounded text-xs font-semibold bg-[var(--accent-color)] text-[var(--text-on-accent)] hover:opacity-95 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Bottom Quick Button */}
        {quickAddDay !== day.dateString && (
          <div className="p-2 border-t border-[var(--border-color)]/60 bg-[var(--column-bg)]/50 rounded-b-2xl">
            <button
              onClick={() => setQuickAddDay(day.dateString)}
              className="w-full py-1.5 px-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors flex items-center justify-center gap-1 border border-dashed border-transparent hover:border-[var(--border-color)]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const activeSingleDay = days.find((d) => d.dateString === selectedMobileDay) || days[0];

  return (
    <div className="w-full space-y-3">
      {/* Top Controls: Desktop scroll chevrons + Mobile day switcher */}
      <div className="flex items-center justify-between gap-2">
        {/* Mobile View Toggle */}
        <div className="flex md:hidden items-center gap-1 bg-[var(--column-bg)] p-1 rounded-xl border border-[var(--border-color)]">
          <button
            onClick={() => setMobileMode('single')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              mobileMode === 'single'
                ? 'bg-[var(--accent-color)] text-[var(--text-on-accent)] shadow-xs'
                : 'text-[var(--text-secondary)]'
            }`}
          >
            Day-by-Day
          </button>
          <button
            onClick={() => setMobileMode('all')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              mobileMode === 'all'
                ? 'bg-[var(--accent-color)] text-[var(--text-on-accent)] shadow-xs'
                : 'text-[var(--text-secondary)]'
            }`}
          >
            All 7 Days
          </button>
        </div>

        {/* Scroll Chevrons for Desktop */}
        <div className="hidden md:flex items-center gap-1 ml-auto">
          <button
            onClick={handleScrollLeft}
            className="p-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--column-bg)] shadow-xs transition-colors"
            title="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleScrollRight}
            className="p-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--column-bg)] shadow-xs transition-colors"
            title="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Day Selector Tabs (When single day mode is active) */}
      <div className="md:hidden">
        {mobileMode === 'single' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
              {days.map((d) => {
                const isSelected = d.dateString === selectedMobileDay;
                return (
                  <button
                    key={d.dateString}
                    onClick={() => setSelectedMobileDay(d.dateString)}
                    className={`flex-1 min-w-[50px] py-1.5 px-2 rounded-xl text-center border transition-all ${
                      isSelected
                        ? 'bg-[var(--accent-color)] text-[var(--text-on-accent)] border-[var(--accent-color)] font-bold shadow-xs'
                        : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)]'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold">{d.shortName}</div>
                    <div className="text-xs">{d.displayDate.split(' ')[1]}</div>
                  </button>
                );
              })}
            </div>
            {renderColumn(activeSingleDay, true)}
          </div>
        ) : null}
      </div>

      {/* Standard Horizontal Scrollable 7-Day Board (Desktop & Multi-column Mobile) */}
      <div
        ref={scrollContainerRef}
        className={`w-full overflow-x-auto pb-4 transition-all scrollbar-none ${
          mobileMode === 'single' ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="flex gap-3 pb-2 min-w-full">
          {days.map((day) => renderColumn(day, false))}
        </div>
      </div>
    </div>
  );
};
