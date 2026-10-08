import React, { useState } from 'react';
import {
  Calendar,
  MoreVertical,
  CheckSquare,
  Flame,
  Bookmark,
  Bug,
  Zap,
  Trash2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  Bell,
} from 'lucide-react';
import {
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  Divider,
} from '@mui/material';
import { ArrowRight, FastForward } from 'lucide-react';
import { addDaysToDateStr } from '../utils/dateUtils';
import { ITask, TaskStatus, TaskPriority, TaskType, DayInfo } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

interface TaskCardProps {
  task: ITask;
  onOpenDetails: (task: ITask) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onAssignDate: (id: string, date: string) => void;
  onDelete: (id: string) => void;
  weekDates: DayInfo[];
  isKanbanView?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onOpenDetails,
  onStatusChange,
  onAssignDate,
  onDelete,
  weekDates,
}) => {
  // Material UI Menu Anchor States
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dayPickerAnchorEl, setDayPickerAnchorEl] = useState<null | HTMLElement>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const isMenuOpen = Boolean(anchorEl);
  const isDayPickerOpen = Boolean(dayPickerAnchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDayPickerOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setDayPickerAnchorEl(event.currentTarget);
    setAnchorEl(null);
  };

  const handleDayPickerClose = () => {
    setDayPickerAnchorEl(null);
  };

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  const getTypeIcon = (type: TaskType) => {
    switch (type) {
      case 'bug':
        return <Bug className="w-3.5 h-3.5 text-red-500 shrink-0" />;
      case 'story':
        return <Bookmark className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      case 'epic':
        return <Zap className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
      default:
        return <CheckSquare className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
    }
  };

    const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'URGENT':
        return (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded shadow-xs whitespace-nowrap">
            <Flame className="w-2.5 h-2.5" /> URGENT
          </span>
        );
      case 'HIGH':
        return (
          <span className="text-[10px] font-bold text-white bg-orange-600 px-2 py-0.5 rounded shadow-xs whitespace-nowrap">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="text-[10px] font-bold text-[#131313] bg-[#EFD395] px-2 py-0.5 rounded shadow-xs whitespace-nowrap">
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="text-[10px] font-bold text-white bg-cyan-600 px-2 py-0.5 rounded shadow-xs whitespace-nowrap">
            LOW
          </span>
        );
    }
  };

    const getStatusChip = (status: TaskStatus) => {
    const map = {
      TODO: { label: 'TO DO', style: 'bg-stone-600 text-white' },
      IN_PROGRESS: { label: 'IN PROGRESS', style: 'bg-blue-600 text-white' },
      IN_REVIEW: { label: 'IN REVIEW', style: 'bg-purple-600 text-white' },
      DONE: { label: 'DONE', style: 'bg-emerald-600 text-white' },
    };
    const s = map[status] || map.TODO;
    return (
      <span className={`text-[9px] font-bold tracking-wide px-2 py-0.5 rounded-md whitespace-nowrap ${s.style}`}>
        {s.label}
      </span>
    );
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      taskId: task._id,
      sourceDate: task.assignedDate,
      sourceStatus: task.status,
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  // Clean short date: e.g. "Oct 7"
  const shortDate = task.assignedDate ? task.assignedDate.slice(5) : '';

  return (
    <>
      <div
        draggable
        onDragStart={handleDragStart}
        onClick={() => onOpenDetails(task)}
        className="group relative bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-color)] hover:border-[var(--accent-color)] rounded-xl p-3 shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer select-none mb-2.5"
      >
        {/* Top row: Type, Key, Priority, and Material UI Menu button */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            
            <span className="text-xs font-mono font-bold text-[var(--accent-color)] truncate hover:underline">
              {task.key}
            </span>
            {task.isRolledOver && (
              <span
                title={`Rolled over from earlier day (${task.rolloverCount}x)`}
                className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 px-1 py-0.5 rounded border border-amber-500/30 whitespace-nowrap"
              >
                🔄 +{task.rolloverCount}d
              </span>
            )}
            {Boolean(task.remindersPerDay && task.remindersPerDay > 0 && task.status !== 'DONE') && (
              <span
                title={`Daily reminder: ${task.remindersSentToday || 0}/${task.remindersPerDay} sent today`}
                className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30 whitespace-nowrap"
              >
                
                <span>{task.remindersPerDay}/d</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            {getPriorityBadge(task.priority)}

            <IconButton
              size="small"
              onClick={handleMenuClick}
              sx={{
                color: 'var(--text-muted)',
                padding: '2px',
                '&:hover': {
                  color: 'var(--text-main)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                },
              }}
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </IconButton>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-xs font-semibold text-[var(--text-main)] mb-2 line-clamp-2 leading-snug">
          {task.title}
        </h4>



        {/* Card Footer: Date, Subtasks, and Status */}
        <div className="flex items-center justify-between pt-1.5 border-t border-[var(--border-color)]/60 text-[10px] text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            {task.assignedDate && (
              <span className="flex items-center gap-1 font-mono text-[10px] text-[var(--text-secondary)]">
                <Calendar className="w-2.5 h-2.5 text-[var(--accent-color)]" />
                <span>{shortDate}</span>
              </span>
            )}

            {totalSubtasks > 0 && (
              <span
                className={`flex items-center gap-0.5 text-[10px] font-medium ${
                  completedSubtasks === totalSubtasks
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>{completedSubtasks}/{totalSubtasks}</span>
              </span>
            )}
          </div>

          <div>
            {getStatusChip(task.status)}
          </div>
        </div>

        {/* Material UI Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <div className="px-3 py-1 text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
            Change Status
          </div>
          <MenuItem
            selected={task.status === 'TODO'}
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(task._id, 'TODO');
              handleMenuClose();
            }}
          >
            <ListItemIcon sx={{ minWidth: 26 }}>
              <Clock className="w-3.5 h-3.5 text-stone-400" />
            </ListItemIcon>
            <span className="text-xs font-medium">To Do</span>
          </MenuItem>

          <MenuItem
            selected={task.status === 'IN_PROGRESS'}
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(task._id, 'IN_PROGRESS');
              handleMenuClose();
            }}
          >
            <ListItemIcon sx={{ minWidth: 26 }}>
              <Clock className="w-3.5 h-3.5 text-blue-400" />
            </ListItemIcon>
            <span className="text-xs font-medium">In Progress</span>
          </MenuItem>

          <MenuItem
            selected={task.status === 'IN_REVIEW'}
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(task._id, 'IN_REVIEW');
              handleMenuClose();
            }}
          >
            <ListItemIcon sx={{ minWidth: 26 }}>
              <Eye className="w-3.5 h-3.5 text-purple-400" />
            </ListItemIcon>
            <span className="text-xs font-medium">In Review</span>
          </MenuItem>

          <MenuItem
            selected={task.status === 'DONE'}
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(task._id, 'DONE');
              handleMenuClose();
            }}
          >
            <ListItemIcon sx={{ minWidth: 26 }}>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </ListItemIcon>
            <span className="text-xs font-bold">Done</span>
          </MenuItem>

          <Divider sx={{ my: 0.5, borderColor: 'var(--border-color)' }} />

          <Divider sx={{ my: 0.5, borderColor: 'var(--border-color)' }} />

          <div className="px-3 py-1 text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
            Move Date
          </div>
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              const nextDay = addDaysToDateStr(task.assignedDate || new Date().toISOString().slice(0, 10), 1);
              onAssignDate(task._id, nextDay);
              handleMenuClose();
            }}
          >
            <ListItemIcon sx={{ minWidth: 26 }}>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--accent-color)]" />
            </ListItemIcon>
            <span className="text-xs font-medium">Next Day (+1d)</span>
          </MenuItem>

          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              const nextWeek = addDaysToDateStr(task.assignedDate || new Date().toISOString().slice(0, 10), 7);
              onAssignDate(task._id, nextWeek);
              handleMenuClose();
            }}
          >
            <ListItemIcon sx={{ minWidth: 26 }}>
              <FastForward className="w-3.5 h-3.5 text-[var(--accent-color)]" />
            </ListItemIcon>
            <span className="text-xs font-medium">Next Week (+7d)</span>
          </MenuItem>

          {/* Reassign to another day */}
          <MenuItem onClick={handleDayPickerOpen}>
            <ListItemIcon sx={{ minWidth: 26 }}>
              <CalendarDays className="w-3.5 h-3.5 text-[var(--accent-color)]" />
            </ListItemIcon>
            <span className="text-xs font-medium">Assign to Day...</span>
          </MenuItem>

          <Divider sx={{ my: 0.5, borderColor: 'var(--border-color)' }} />

          {/* Delete with MUI confirmation dialog */}
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleMenuClose();
              setIsConfirmDeleteOpen(true);
            }}
            sx={{ color: '#ef4444' }}
          >
            <ListItemIcon sx={{ minWidth: 26, color: '#ef4444' }}>
              <Trash2 className="w-3.5 h-3.5" />
            </ListItemIcon>
            <span className="text-xs font-medium text-red-500">Delete Issue</span>
          </MenuItem>
        </Menu>

        {/* Material UI Submenu: Quick Assign Day */}
        <Menu
          anchorEl={dayPickerAnchorEl}
          open={isDayPickerOpen}
          onClose={handleDayPickerClose}
          onClick={(e) => e.stopPropagation()}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <div className="px-3 py-1 text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
            Assign to Day
          </div>
          {weekDates.map((d) => {
            const isCurrent = task.assignedDate === d.dateString;
            return (
              <MenuItem
                key={d.dateString}
                selected={isCurrent}
                onClick={(e) => {
                  e.stopPropagation();
                  onAssignDate(task._id, d.dateString);
                  handleDayPickerClose();
                }}
              >
                <div className="flex flex-col">
                  <span className={`text-xs ${isCurrent ? 'font-bold' : 'font-medium'}`}>
                    {d.name} ({d.displayDate})
                  </span>
                  {d.isToday && (
                    <span className="text-[10px] text-[var(--accent-color)] font-bold">
                      Today
                    </span>
                  )}
                </div>
              </MenuItem>
            );
          })}
        </Menu>
      </div>

      {/* Material UI Confirmation Popup for Deleting Task */}
      <ConfirmDialog
        open={isConfirmDeleteOpen}
        title="Delete Task"
        message={`Are you sure you want to permanently delete issue ${task.key}? This action cannot be undone.`}
        confirmText="Delete Issue"
        cancelText="Cancel"
        confirmColor="error"
        onConfirm={() => {
          setIsConfirmDeleteOpen(false);
          onDelete(task._id);
        }}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />
    </>
  );
};
