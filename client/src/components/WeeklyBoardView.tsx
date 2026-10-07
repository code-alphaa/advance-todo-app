import React, { useState, useRef } from 'react';
import { Plus, Calendar, LayoutGrid, Smartphone } from 'lucide-react';
import { ITask, DayInfo, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';

interface WeeklyBoardViewProps {
  days: DayInfo[];
  tasks: ITask[];
  onOpenDetails: (task: ITask) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onAssignDate: (id: string, date: string) => void;
  onDelete: (id: string) => void;
  onQuickAddTask: (date: string, title: string) => void;
  onDropTask: (taskId: string, targetDate: string, targetOrder?: number) => void;
}

export const WeeklyBoardView: React.FC<WeeklyBoardViewProps> = ({
  days,
  tasks,
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

  // Mobile & Tablet view mode: 'single' (focused day) vs 'all' (horizontal scroll)
  const todayStr = days.find((d) => d.isToday)?.dateString || days[0]?.dateString;
  const [focusedDayDate, setFocusedDayDate] = useState<string>(todayStr);
  const [mobileMode, setMobileMode] = useState<'single' | 'all'>('single');

  // Ref to scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToDay = (dateString: string) => {
    setFocusedDayDate(dateString);
    const element = document.getElementById(`day-col-${dateString}`);
    if (element && scrollContainerRef.current) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

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
    if (quickAddTitle.trim()) {
      onQuickAddTask(dateString, quickAddTitle.trim());
      setQuickAddTitle('');
      setQuickAddDay(null);
    }
  };

  const renderColumn = (day: DayInfo, isFullWidthMobile = false) => {
    const dayTasks = tasks.filter((t) => t.assignedDate === day.dateString);
    const completedCount = dayTasks.filter((t) => t.status === 'DONE').length;
    const totalCount = dayTasks.length;
    const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const isDropping = activeDropDay === day.dateString;

    return (
      <div
        key={day.dateString}
        id={`day-col-${day.dateString}`}
        onDragOver={(e) => handleDragOver(e, day.dateString)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, day.dateString)}
        className={`flex flex-col rounded-2xl bg-[var(--column-bg)] border transition-all duration-200 min-h-[500px] max-h-[78vh] ${
          isFullWidthMobile
            ? 'w-full'
            : 'w-[285px] min-w-[285px] max-w-[320px] shrink-0'
        } ${
          day.isToday
            ? 'border-[var(--accent-color)] ring-1 ring-[var(--accent-color)]/30 shadow-md'
            : 'border-[var(--border-color)] shadow-sm'
        } ${isDropping ? 'drop-target-active' : ''}`}
      >
        {/* Column Header */}
        <div className="p-3 border-b border-[var(--border-color)] bg-[var(--column-header)]/90 rounded-t-2xl">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-xs tracking-tight text-[var(--text-main)] truncate">
                {day.name}
              </span>
              {day.isToday && (
                <span className="text-[9px] font-extrabold uppercase bg-[var(--accent-color)] text-[var(--text-on-accent)] px-1.5 py-0.5 rounded-full shadow-xs">
                  Today
                </span>
              )}
            </div>

            <span className="text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--bg-card)] px-1.5 py-0.5 rounded-md border border-[var(--border-color)] shrink-0">
              {completedCount}/{totalCount}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[var(--accent-color)]" />
              {day.displayDate}
            </span>

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

        {/* Tasks List */}
        <div className="flex-1 p-2.5 overflow-y-auto space-y-1">
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

          {dayTasks.length === 0 && !quickAddDay && (
            <div className="h-28 flex flex-col items-center justify-center text-center p-3 border border-dashed border-[var(--border-color)] rounded-xl my-2 text-[var(--text-muted)]">
              <p className="text-xs">No tasks for {day.name}</p>
              <span className="text-[10px] mt-0.5 opacity-70">
                Drag cards here or click + below
              </span>
            </div>
          )}

          {/* Quick Add Form inside column */}
          {quickAddDay === day.dateString && (
            <form
              onSubmit={(e) => handleQuickAddSubmit(day.dateString, e)}
              className="bg-[var(--bg-card)] border-2 border-[var(--accent-color)] rounded-xl p-2.5 shadow-md mb-2 animate-slide-up"
            >
              <input
                type="text"
                autoFocus
                placeholder="What needs to be done?"
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
                  Add Task
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Column Footer */}
        <div className="p-2 border-t border-[var(--border-color)]/50">
          <button
            onClick={() => {
              setQuickAddDay(day.dateString);
              setQuickAddTitle('');
            }}
            className="w-full py-1.5 px-2.5 rounded-xl border border-transparent hover:border-[var(--border-color)] hover:bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-main)] flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-[var(--accent-color)]" />
            <span>Create Task</span>
          </button>
        </div>
      </div>
    );
  };

  const focusedDay = days.find((d) => d.dateString === focusedDayDate) || days[0];

  return (
    <div className="w-full space-y-3">
      {/* Quick Day Selector Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5">
          {days.map((day) => {
            const count = tasks.filter((t) => t.assignedDate === day.dateString).length;
            const isSelected = focusedDayDate === day.dateString;

            return (
              <button
                key={day.dateString}
                onClick={() => scrollToDay(day.dateString)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
                  isSelected
                    ? 'bg-[var(--accent-color)] text-[var(--text-on-accent)] border-[var(--accent-color)] shadow-xs font-bold'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-main)] border-[var(--border-color)] hover:bg-[var(--column-bg)]'
                }`}
              >
                <span>{day.shortName}</span>
                <span className="text-[10px] opacity-80">{day.displayDate.split(' ')[1]}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'bg-black/20 text-[var(--text-on-accent)]'
                      : 'bg-[var(--border-color)] text-[var(--text-main)]'
                  }`}
                >
                  {count}
                </span>
                {day.isToday && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-current' : 'bg-[var(--accent-color)]'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile View Toggle: Single Day Focus vs All Days Horizontal */}
        <div className="md:hidden flex items-center bg-[var(--bg-card)] p-0.5 rounded-xl border border-[var(--border-color)] shrink-0">
          <button
            onClick={() => setMobileMode('single')}
            className={`p-1.5 rounded-lg text-xs ${
              mobileMode === 'single'
                ? 'bg-[var(--accent-color)] text-[var(--text-on-accent)]'
                : 'text-[var(--text-secondary)]'
            }`}
            title="Single Day Focus"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMobileMode('all')}
            className={`p-1.5 rounded-lg text-xs ${
              mobileMode === 'all'
                ? 'bg-[var(--accent-color)] text-[var(--text-on-accent)]'
                : 'text-[var(--text-secondary)]'
            }`}
            title="All Days Horizontal"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile Single Day View (when active on mobile) */}
      <div className="block md:hidden">
        {mobileMode === 'single' ? (
          <div className="w-full">
            {renderColumn(focusedDay, true)}
          </div>
        ) : null}
      </div>

      {/* Standard Horizontal Scrollable 7-Day Board (Desktop & Multi-column Mobile) */}
      <div
        ref={scrollContainerRef}
        className={`w-full overflow-x-auto pb-4 transition-all scrollbar-thin ${
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
