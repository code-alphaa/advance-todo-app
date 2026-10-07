import React, { useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import {
  TextField,
  Button,
  IconButton,
  Chip,
} from '@mui/material';
import { ITask, DayInfo, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';

interface SingleDayViewProps {
  days: DayInfo[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  tasks: ITask[];
  onOpenDetails: (task: ITask) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onAssignDate: (id: string, date: string) => void;
  onDelete: (id: string) => void;
  onQuickAddTask: (date: string, title: string) => void;
}

export const SingleDayView: React.FC<SingleDayViewProps> = ({
  days,
  selectedDate,
  onSelectDate,
  tasks,
  onOpenDetails,
  onStatusChange,
  onAssignDate,
  onDelete,
  onQuickAddTask,
}) => {
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');

  const currentIndex = days.findIndex((d) => d.dateString === selectedDate);
  const currentDay = currentIndex !== -1 ? days[currentIndex] : days[0];

  const handlePrevDay = () => {
    if (currentIndex > 0) {
      onSelectDate(days[currentIndex - 1].dateString);
    }
  };

  const handleNextDay = () => {
    if (currentIndex < days.length - 1) {
      onSelectDate(days[currentIndex + 1].dateString);
    }
  };

  const dayTasks = tasks.filter((t) => t.assignedDate === currentDay.dateString);
  const completedCount = dayTasks.filter((t) => t.status === 'DONE').length;
  const totalCount = dayTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTasks = statusFilter === 'ALL'
    ? dayTasks
    : dayTasks.filter((t) => t.status === statusFilter);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickAddTitle.trim()) {
      onQuickAddTask(currentDay.dateString, quickAddTitle.trim());
      setQuickAddTitle('');
      setIsAdding(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 pb-20 md:pb-6">
      {/* 7-Day Quick Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {days.map((d) => {
          const isSelected = d.dateString === currentDay.dateString;
          const count = tasks.filter((t) => t.assignedDate === d.dateString).length;

          return (
            <button
              key={d.dateString}
              onClick={() => onSelectDate(d.dateString)}
              className={`flex-1 min-w-[56px] py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all border ${
                isSelected
                  ? 'bg-[var(--accent-color)] text-[var(--text-on-accent)] border-[var(--accent-color)] shadow-md scale-102 font-bold'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-main)] border-[var(--border-color)]'
              }`}
            >
              <span className="text-[10px] uppercase font-bold tracking-tight opacity-80">
                {d.shortName}
              </span>
              <span className="text-sm font-extrabold my-0.5">
                {d.displayDate.split(' ')[1]}
              </span>
              <div className="flex items-center gap-1">
                {count > 0 && (
                  <span
                    className={`text-[9px] px-1 rounded-full font-bold ${
                      isSelected
                        ? 'bg-black/20 text-[var(--text-on-accent)]'
                        : 'bg-[var(--border-color)] text-[var(--text-main)]'
                    }`}
                  >
                    {count}
                  </span>
                )}
                {d.isToday && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-current' : 'bg-[var(--accent-color)]'}`} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Day Header Banner */}
      <div className="bg-[var(--column-bg)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <IconButton
            size="small"
            onClick={handlePrevDay}
            disabled={currentIndex === 0}
            sx={{
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              bgcolor: 'var(--bg-card)',
            }}
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </IconButton>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-base font-extrabold text-[var(--text-main)]">
                {currentDay.name}
              </h2>
              {currentDay.isToday && (
                <span className="text-[10px] font-black uppercase bg-[var(--accent-color)] text-[var(--text-on-accent)] px-2 py-0.5 rounded-full shadow-xs">
                  Today
                </span>
              )}
            </div>
            <div className="flex items-center justify-center gap-1 text-xs text-[var(--text-secondary)] font-medium mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-[var(--accent-color)]" />
              <span>{currentDay.displayDate}, {currentDay.dateString.split('-')[0]}</span>
            </div>
          </div>

          <IconButton
            size="small"
            onClick={handleNextDay}
            disabled={currentIndex === days.length - 1}
            sx={{
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              bgcolor: 'var(--bg-card)',
            }}
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </IconButton>
        </div>

        {/* Day Progress */}
        <div className="mt-3 pt-3 border-t border-[var(--border-color)]/60">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium mb-1.5">
            <span>Progress: {progressPercent}%</span>
            <span>
              {completedCount} of {totalCount} completed
            </span>
          </div>
          <div className="w-full bg-[var(--border-color)]/50 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[var(--accent-color)] h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Filter Status Tabs */}
        <div className="flex items-center gap-1.5 mt-3 pt-2 overflow-x-auto scrollbar-none text-[11px] font-semibold">
          {(['ALL', 'TODO', 'IN_PROGRESS', 'DONE'] as const).map((st) => {
            const count = st === 'ALL'
              ? dayTasks.length
              : dayTasks.filter((t) => t.status === st).length;
            const isTabSelected = statusFilter === st;

            return (
              <Chip
                key={st}
                label={`${st === 'ALL' ? 'All' : st.replace('_', ' ')} (${count})`}
                onClick={() => setStatusFilter(st)}
                size="small"
                sx={{
                  fontWeight: isTabSelected ? 700 : 500,
                  bgcolor: isTabSelected ? 'var(--accent-color)' : 'var(--bg-card)',
                  color: isTabSelected ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                  borderColor: isTabSelected ? 'var(--accent-color)' : 'var(--border-color)',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: isTabSelected ? 'var(--accent-color)' : 'var(--border-color)',
                  },
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.map((task) => (
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

        {filteredTasks.length === 0 && !isAdding && (
          <div className="py-12 px-4 rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--column-bg)]/40 text-center text-[var(--text-muted)]">
            <p className="text-sm font-semibold">No tasks for {currentDay.name}</p>
            <p className="text-xs mt-1 opacity-70">
              Tap below to schedule a task for this day
            </p>
          </div>
        )}

        {/* Quick Add Form with Material UI inputs */}
        {isAdding ? (
          <form
            onSubmit={handleQuickAdd}
            className="bg-[var(--bg-card)] border-2 border-[var(--accent-color)] rounded-2xl p-4 shadow-md animate-slide-up space-y-3"
          >
            <TextField
              fullWidth
              autoFocus
              size="small"
              placeholder={`Add task for ${currentDay.name}...`}
              value={quickAddTitle}
              onChange={(e) => setQuickAddTitle(e.target.value)}
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  setIsAdding(false);
                  setQuickAddTitle('');
                }}
                sx={{ color: 'var(--text-muted)' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="small"
                disabled={!quickAddTitle.trim()}
                sx={{
                  bgcolor: 'var(--accent-color)',
                  color: 'var(--text-on-accent)',
                  fontWeight: 700,
                  '&:hover': {
                    bgcolor: 'var(--accent-hover)',
                  },
                }}
              >
                Add Task
              </Button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-3 px-4 rounded-2xl border border-dashed border-[var(--border-color)] hover:border-[var(--accent-color)] bg-[var(--bg-card)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-main)] flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs"
          >
            <Plus className="w-4 h-4 text-[var(--accent-color)]" />
            <span>Add Task to {currentDay.name}</span>
          </button>
        )}
      </div>
    </div>
  );
};
