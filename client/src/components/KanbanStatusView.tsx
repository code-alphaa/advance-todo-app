import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
} from 'lucide-react';
import {
  Chip,
  TextField,
  Button,
} from '@mui/material';
import { ITask, TaskStatus, DayInfo } from '../types';
import { TaskCard } from './TaskCard';

interface KanbanStatusViewProps {
  tasks: ITask[];
  days: DayInfo[];
  selectedDayFilter: string | null;
  onSelectDayFilter: (dateStr: string | null) => void;
  onOpenDetails: (task: ITask) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onAssignDate: (id: string, date: string) => void;
  onDelete: (id: string) => void;
  onQuickAddTask: (dateString: string, title: string, status: TaskStatus) => void;
  onDropTaskStatus: (taskId: string, targetStatus: TaskStatus) => void;
}

interface ColumnDef {
  id: TaskStatus;
  title: string;
  icon: React.ReactNode;
  headerBorder: string;
  pillColor: string;
}

export const KanbanStatusView: React.FC<KanbanStatusViewProps> = ({
  tasks,
  days,
  selectedDayFilter,
  onSelectDayFilter,
  onOpenDetails,
  onStatusChange,
  onAssignDate,
  onDelete,
  onQuickAddTask,
  onDropTaskStatus,
}) => {
  const [activeDropColumn, setActiveDropColumn] = useState<TaskStatus | null>(null);
  const [quickAddColumn, setQuickAddColumn] = useState<TaskStatus | null>(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');

  const columns: ColumnDef[] = [
    {
      id: 'TODO',
      title: 'TO DO',
      icon: <Clock className="w-3.5 h-3.5 text-stone-400" />,
      headerBorder: 'border-l-4 border-l-stone-400',
      pillColor: 'bg-stone-500/15 text-stone-700 dark:text-stone-300',
    },
    {
      id: 'IN_PROGRESS',
      title: 'IN PROGRESS',
      icon: <Clock className="w-3.5 h-3.5 text-blue-400" />,
      headerBorder: 'border-l-4 border-l-blue-500',
      pillColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
    },
    {
      id: 'IN_REVIEW',
      title: 'IN REVIEW',
      icon: <Eye className="w-3.5 h-3.5 text-purple-400" />,
      headerBorder: 'border-l-4 border-l-purple-500',
      pillColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300',
    },
    {
      id: 'DONE',
      title: 'DONE',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
      headerBorder: 'border-l-4 border-l-emerald-500',
      pillColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    },
  ];

  // Filter tasks by selected day if active
  const filteredTasks = selectedDayFilter
    ? tasks.filter((t) => t.assignedDate === selectedDayFilter)
    : tasks;

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropColumn !== status) {
      setActiveDropColumn(status);
    }
  };

  const handleDragLeave = () => {
    setActiveDropColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setActiveDropColumn(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data && data.taskId) {
        onDropTaskStatus(data.taskId, status);
      }
    } catch (err) {
      console.error('Failed to parse drag data', err);
    }
  };

  const handleQuickAddSubmit = (status: TaskStatus, e: React.FormEvent) => {
    e.preventDefault();
    if (quickAddTitle.trim()) {
      const targetDate = selectedDayFilter || days.find((d) => d.isToday)?.dateString || days[0].dateString;
      onQuickAddTask(targetDate, quickAddTitle.trim(), status);
      setQuickAddTitle('');
      setQuickAddColumn(null);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Clean Day Filter Bar with Material UI Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[var(--column-bg)]/80 px-3 py-2 rounded-2xl border border-[var(--border-color)] text-xs">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[var(--accent-color)]" />
          <span className="font-bold text-[11px] text-[var(--text-main)] uppercase tracking-wider">
            Day Filter:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Chip
            label={`All 7 Days (${tasks.length})`}
            onClick={() => onSelectDayFilter(null)}
            size="small"
            sx={{
              fontWeight: selectedDayFilter === null ? 700 : 500,
              bgcolor: selectedDayFilter === null ? 'var(--accent-color)' : 'var(--bg-card)',
              color: selectedDayFilter === null ? 'var(--text-on-accent)' : 'var(--text-secondary)',
              borderColor: selectedDayFilter === null ? 'var(--accent-color)' : 'var(--border-color)',
              borderWidth: 1,
              borderStyle: 'solid',
              cursor: 'pointer',
            }}
          />

          {days.map((day) => {
            const count = tasks.filter((t) => t.assignedDate === day.dateString).length;
            const isSelected = selectedDayFilter === day.dateString;
            return (
              <Chip
                key={day.dateString}
                label={`${day.shortName} ${day.displayDate.split(' ')[1]}${count > 0 ? ` (${count})` : ''}`}
                onClick={() => onSelectDayFilter(isSelected ? null : day.dateString)}
                size="small"
                sx={{
                  fontWeight: isSelected ? 700 : 500,
                  bgcolor: isSelected ? 'var(--accent-color)' : 'var(--bg-card)',
                  color: isSelected ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                  borderColor: isSelected ? 'var(--accent-color)' : 'var(--border-color)',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  cursor: 'pointer',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* 4 Status Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-start">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const isDropping = activeDropColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-col rounded-2xl bg-[var(--column-bg)] border border-[var(--border-color)] transition-all min-h-[500px] max-h-[80vh] shadow-sm ${
                isDropping ? 'ring-2 ring-[var(--accent-color)] bg-[var(--accent-color)]/5' : ''
              }`}
            >
              {/* Column Header */}
              <div
                className={`p-3 border-b border-[var(--border-color)] bg-[var(--column-header)] rounded-t-2xl flex items-center justify-between ${col.headerBorder}`}
              >
                <div className="flex items-center gap-1.5">
                  {col.icon}
                  <h3 className="font-bold text-xs tracking-tight text-[var(--text-main)]">
                    {col.title}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${col.pillColor}`}
                  >
                    {colTasks.length}
                  </span>
                </div>

                <button
                  onClick={() => setQuickAddColumn(col.id)}
                  className="p-1 rounded-lg hover:bg-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                  title={`Add ${col.title} task`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Scrollable Column Body */}
              <div className="flex-1 p-2.5 overflow-y-auto space-y-1">
                {colTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onOpenDetails={onOpenDetails}
                    onStatusChange={onStatusChange}
                    onAssignDate={onAssignDate}
                    onDelete={onDelete}
                    weekDates={days}
                    isKanbanView={true}
                  />
                ))}

                {colTasks.length === 0 && !quickAddColumn && (
                  <div className="h-28 flex flex-col items-center justify-center text-center p-3 border border-dashed border-[var(--border-color)] rounded-xl my-2 text-[var(--text-muted)]">
                    <p className="text-xs">No tasks in {col.title}</p>
                    <span className="text-[10px] mt-0.5 opacity-70">
                      Drag cards here to update status
                    </span>
                  </div>
                )}

                {/* Quick Add with Material UI Input */}
                {quickAddColumn === col.id && (
                  <form
                    onSubmit={(e) => handleQuickAddSubmit(col.id, e)}
                    className="bg-[var(--bg-card)] border-2 border-[var(--accent-color)] rounded-2xl p-3 shadow-md mb-2 animate-slide-up space-y-2"
                  >
                    <TextField
                      fullWidth
                      autoFocus
                      size="small"
                      placeholder={`Create task in ${col.title}...`}
                      value={quickAddTitle}
                      onChange={(e) => setQuickAddTitle(e.target.value)}
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => {
                          setQuickAddColumn(null);
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
                        Add
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              {/* Bottom quick button */}
              {quickAddColumn !== col.id && (
                <div className="p-2 border-t border-[var(--border-color)]/60 bg-[var(--column-bg)]/50 rounded-b-2xl">
                  <button
                    onClick={() => setQuickAddColumn(col.id)}
                    className="w-full py-1.5 px-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors flex items-center justify-center gap-1 border border-dashed border-transparent hover:border-[var(--border-color)]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Issue</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
