import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Calendar,
  Tag,
  Trash2,
  CheckSquare,
  Plus,
  History,
} from 'lucide-react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
} from '@mui/material';
import { ITask, TaskStatus, TaskPriority, TaskType, DayInfo, ISubtask } from '../types';
import { formatFriendlyDate } from '../utils/dateUtils';

interface TaskDetailModalProps {
  task: ITask | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<ITask>) => void;
  onDelete: (id: string) => void;
  weekDays: DayInfo[];
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  weekDays,
}) => {
  if (!isOpen || !task) return null;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [type, setType] = useState<TaskType>(task.type);
  const [assignedDate, setAssignedDate] = useState(task.assignedDate);
  const [subtasks, setSubtasks] = useState<ISubtask[]>(task.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [labels, setLabels] = useState<string[]>(task.labels || []);
  const [newLabel, setNewLabel] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(task.estimatedHours || 1);
  const [loggedHours, setLoggedHours] = useState(task.loggedHours || 0);

  // Sync state if task prop changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setPriority(task.priority);
    setType(task.type);
    setAssignedDate(task.assignedDate);
    setSubtasks(task.subtasks || []);
    setLabels(task.labels || []);
    setEstimatedHours(task.estimatedHours || 1);
    setLoggedHours(task.loggedHours || 0);
  }, [task]);

  const handleSave = () => {
    onUpdate(task._id, {
      title,
      description,
      status,
      priority,
      type,
      assignedDate,
      subtasks,
      labels,
      estimatedHours,
      loggedHours,
    });
    onClose();
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatus(newStatus);
    onUpdate(task._id, { status: newStatus });
    if (newStatus === 'DONE') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleAssignDateChange = (newDate: string) => {
    setAssignedDate(newDate);
    onUpdate(task._id, { assignedDate: newDate });
  };

  const handleToggleSubtask = (id: string) => {
    const updated = subtasks.map((st) =>
      st.id === id ? { ...st, completed: !st.completed } : st
    );
    setSubtasks(updated);
    onUpdate(task._id, { subtasks: updated });

    if (updated.length > 0 && updated.every((s) => s.completed)) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      const newSub: ISubtask = {
        id: Math.random().toString(36).substring(2, 9),
        title: newSubtaskTitle.trim(),
        completed: false,
      };
      const updated = [...subtasks, newSub];
      setSubtasks(updated);
      setNewSubtaskTitle('');
      onUpdate(task._id, { subtasks: updated });
    }
  };

  const handleDeleteSubtask = (id: string) => {
    const updated = subtasks.filter((st) => st.id !== id);
    setSubtasks(updated);
    onUpdate(task._id, { subtasks: updated });
  };

  const handleAddLabel = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newLabel.trim()) {
      e.preventDefault();
      const cleanLabel = newLabel.trim().replace(/^#/, '');
      if (!labels.includes(cleanLabel)) {
        const updated = [...labels, cleanLabel];
        setLabels(updated);
        onUpdate(task._id, { labels: updated });
      }
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (tag: string) => {
    const updated = labels.filter((l) => l !== tag);
    setLabels(updated);
    onUpdate(task._id, { labels: updated });
  };

  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-3xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-[var(--border-color)] bg-[var(--column-header)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-extrabold tracking-tight text-[var(--accent-color)] bg-[var(--bg-card)] px-2.5 py-1 rounded-xl border border-[var(--border-color)] shadow-xs">
              {task.key}
            </span>

            {/* Material UI Issue Type Dropdown */}
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <Select
                value={type}
                onChange={(e) => {
                  const t = e.target.value as TaskType;
                  setType(t);
                  onUpdate(task._id, { type: t });
                }}
                sx={{ height: 32, fontSize: '0.75rem' }}
              >
                <MenuItem value="task">📘 Task</MenuItem>
                <MenuItem value="story">📗 Story</MenuItem>
                <MenuItem value="bug">🐞 Bug</MenuItem>
                <MenuItem value="epic">⚡ Epic</MenuItem>
              </Select>
            </FormControl>
          </div>

          <div className="flex items-center gap-1.5">
            <IconButton
              size="small"
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${task.key}?`)) {
                  onDelete(task._id);
                  onClose();
                }
              }}
              sx={{ color: '#ef4444' }}
              title="Delete Issue"
            >
              <Trash2 className="w-4 h-4" />
            </IconButton>

            <IconButton
              size="small"
              onClick={onClose}
              sx={{ color: 'var(--text-muted)' }}
            >
              <X className="w-5 h-5" />
            </IconButton>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Rollover Alert Banner if applicable */}
          {task.isRolledOver && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
              <span className="text-xl">🔄</span>
              <div className="text-xs">
                <span className="font-bold text-amber-800 dark:text-amber-200">
                  Carried Over Task (Rolled over {task.rolloverCount} time{task.rolloverCount > 1 ? 's' : ''})
                </span>
                <p className="text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                  Originally scheduled for {task.originalDate}. Because it was uncompleted, it automatically carried forward to {task.assignedDate}.
                </p>
              </div>
            </div>
          )}

          {/* Title input (Material UI TextField) */}
          <TextField
            fullWidth
            size="small"
            label="Summary"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => onUpdate(task._id, { title })}
          />

          {/* Primary Controls Row: Status & Priority (Material UI Selects) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormControl fullWidth size="small">
              <InputLabel id="detail-status-label">Status</InputLabel>
              <Select
                labelId="detail-status-label"
                label="Status"
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              >
                <MenuItem value="TODO">To Do</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="IN_REVIEW">In Review</MenuItem>
                <MenuItem value="DONE">Done</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="detail-priority-label">Priority</InputLabel>
              <Select
                labelId="detail-priority-label"
                label="Priority"
                value={priority}
                onChange={(e) => {
                  const p = e.target.value as TaskPriority;
                  setPriority(p);
                  onUpdate(task._id, { priority: p });
                }}
              >
                <MenuItem value="URGENT">🔥 Urgent</MenuItem>
                <MenuItem value="HIGH">▲ High</MenuItem>
                <MenuItem value="MEDIUM">═ Medium</MenuItem>
                <MenuItem value="LOW">▼ Low</MenuItem>
              </Select>
            </FormControl>
          </div>

          {/* REQUIREMENT 4: ASSIGN TO ANY OTHER DAY */}
          <div className="bg-[var(--column-bg)] p-4 rounded-2xl border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase text-[var(--text-main)] tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[var(--accent-color)]" />
                Assigned Day of the Week (Requirement 4)
              </label>
              <span className="text-xs font-semibold text-[var(--accent-color)]">
                Currently: {formatFriendlyDate(assignedDate)}
              </span>
            </div>

            <p className="text-xs text-[var(--text-muted)] mb-3">
              Click any day of the current week or pick a custom date to assign this task.
            </p>

            {/* Quick 7 Days Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 mb-3">
              {weekDays.map((d) => {
                const isSelected = assignedDate === d.dateString;
                return (
                  <button
                    key={d.dateString}
                    type="button"
                    onClick={() => handleAssignDateChange(d.dateString)}
                    className={`py-2 px-1.5 rounded-xl text-center transition-all border ${
                      isSelected
                        ? 'bg-[var(--accent-color)] text-[var(--text-on-accent)] border-[var(--accent-color)] font-bold shadow-md'
                        : 'bg-[var(--bg-card)] hover:bg-[var(--border-color)] text-[var(--text-main)] border-[var(--border-color)]'
                    }`}
                  >
                    <div className="text-[11px] font-bold">{d.shortName}</div>
                    <div className="text-[9px] opacity-80">{d.displayDate}</div>
                    {d.isToday && (
                      <span className="text-[8px] uppercase tracking-tighter opacity-90 block font-black">
                        Today
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Date Input for Any Day */}
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-color)]/70">
              <span className="text-xs text-[var(--text-secondary)] font-medium">
                Or select any date:
              </span>
              <input
                type="date"
                value={assignedDate}
                onChange={(e) => {
                  if (e.target.value) handleAssignDateChange(e.target.value);
                }}
                className="bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg px-2.5 py-1 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-color)] font-medium"
              />
            </div>
          </div>

          {/* Description (Material UI TextField Multiline) */}
          <TextField
            fullWidth
            multiline
            rows={3}
            size="small"
            label="Description & Acceptance Criteria"
            placeholder="Add detailed acceptance criteria, notes, or implementation details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => onUpdate(task._id, { description })}
          />

          {/* Subtasks / Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-[var(--accent-color)]" />
                Checklist / Subtasks ({completedSubtasksCount}/{subtasks.length})
              </label>

              {subtasks.length > 0 && (
                <div className="w-24 bg-[var(--border-color)] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[var(--accent-color)] h-full transition-all duration-300"
                    style={{
                      width: `${(completedSubtasksCount / subtasks.length) * 100}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Subtasks items */}
            <div className="space-y-1.5 mb-2.5">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/50 transition-colors"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1 text-xs text-[var(--text-main)]">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => handleToggleSubtask(st.id)}
                      className="w-4 h-4 rounded text-[var(--accent-color)] focus:ring-0 cursor-pointer"
                    />
                    <span className={st.completed ? 'line-through text-[var(--text-muted)]' : 'font-medium'}>
                      {st.title}
                    </span>
                  </label>
                  <button
                    onClick={() => handleDeleteSubtask(st.id)}
                    className="text-[var(--text-muted)] hover:text-red-500 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Subtask Form with Material UI input */}
            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <TextField
                fullWidth
                size="small"
                placeholder="Add subtask and press Enter..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
              />
              <Button
                type="submit"
                variant="outlined"
                disabled={!newSubtaskTitle.trim()}
                sx={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-main)',
                  '&:hover': {
                    borderColor: 'var(--accent-color)',
                    bgcolor: 'var(--accent-color)',
                    color: 'var(--text-on-accent)',
                  },
                }}
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </form>
          </div>

          {/* Labels & Time Tracking Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Labels */}
            <div>
              <label className="block text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[var(--accent-color)]" />
                Labels
              </label>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {labels.map((lbl) => (
                  <span
                    key={lbl}
                    className="flex items-center gap-1 text-xs bg-[var(--column-header)] text-[var(--text-main)] px-2 py-0.5 rounded-lg border border-[var(--border-color)]"
                  >
                    #{lbl}
                    <button
                      onClick={() => handleRemoveLabel(lbl)}
                      className="text-[var(--text-muted)] hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <TextField
                fullWidth
                size="small"
                placeholder="Type tag & press Enter..."
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={handleAddLabel}
              />
            </div>

            {/* Time Tracking */}
            <div>
              <label className="block text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider mb-1.5 flex items-center gap-1">
                Time Tracking (Hours)
              </label>
              <div className="flex items-center gap-3">
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Estimated"
                  slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Number(e.target.value))}
                  onBlur={() => onUpdate(task._id, { estimatedHours })}
                />
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Logged"
                  slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
                  value={loggedHours}
                  onChange={(e) => setLoggedHours(Number(e.target.value))}
                  onBlur={() => onUpdate(task._id, { loggedHours })}
                />
              </div>
            </div>
          </div>

          {/* Rollover History Audit */}
          {task.rolloverHistory && task.rolloverHistory.length > 0 && (
            <div className="bg-[var(--bg-app)] p-3 rounded-2xl border border-[var(--border-color)]">
              <label className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider mb-2 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[var(--accent-color)]" />
                Rollover Audit Log ({task.rolloverHistory.length})
              </label>
              <div className="space-y-1.5 max-h-28 overflow-y-auto">
                {task.rolloverHistory.map((h, i) => (
                  <div
                    key={i}
                    className="text-[11px] text-[var(--text-secondary)] flex items-center justify-between border-b border-[var(--border-color)]/40 pb-1"
                  >
                    <span>
                      From <span className="font-semibold">{h.fromDate}</span> →{' '}
                      <span className="font-semibold">{h.toDate}</span>
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">{h.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer (Material UI Buttons) */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-[var(--border-color)] bg-[var(--column-header)] flex items-center justify-end gap-2">
          <Button
            variant="text"
            onClick={onClose}
            sx={{ color: 'var(--text-secondary)' }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              bgcolor: 'var(--accent-color)',
              color: 'var(--text-on-accent)',
              fontWeight: 700,
              '&:hover': {
                bgcolor: 'var(--accent-hover)',
              },
            }}
          >
            Done Editing
          </Button>
        </div>
      </div>
    </div>
  );
};
