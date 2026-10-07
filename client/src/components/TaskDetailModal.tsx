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
  Bell,
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
import { useScrollLock } from '../utils/scrollLock';
import { formatFriendlyDate } from '../utils/dateUtils';
import { ConfirmDialog } from './ConfirmDialog';

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
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'TODO');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'MEDIUM');
  const [type, setType] = useState<TaskType>(task?.type || 'task');
  const [assignedDate, setAssignedDate] = useState(task?.assignedDate || '');
  const [subtasks, setSubtasks] = useState<ISubtask[]>(task?.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [labels, setLabels] = useState<string[]>(task?.labels || []);
  const [newLabel, setNewLabel] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(task?.estimatedHours || 1);
  const [loggedHours, setLoggedHours] = useState(task?.loggedHours || 0);
  const [remindersPerDay, setRemindersPerDay] = useState(task?.remindersPerDay || 0);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Sync state if task prop changes
  useEffect(() => {
    if (task) {
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
      setRemindersPerDay(task.remindersPerDay || 0);
    }
  }, [task]);

  useScrollLock(isOpen);

  if (!isOpen || !task) return null;

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
      remindersPerDay,
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

  const handleToggleSubtask = (subtaskId: string) => {
    const updated = subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    setSubtasks(updated);
    onUpdate(task._id, { subtasks: updated });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSt: ISubtask = {
      id: Date.now().toString(),
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    const updated = [...subtasks, newSt];
    setSubtasks(updated);
    setNewSubtaskTitle('');
    onUpdate(task._id, { subtasks: updated });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const updated = subtasks.filter((st) => st.id !== subtaskId);
    setSubtasks(updated);
    onUpdate(task._id, { subtasks: updated });
  };

  const handleAddLabel = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newLabel.trim()) {
      e.preventDefault();
      if (!labels.includes(newLabel.trim().toLowerCase())) {
        const updated = [...labels, newLabel.trim().toLowerCase()];
        setLabels(updated);
        setNewLabel('');
        onUpdate(task._id, { labels: updated });
      }
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    const updated = labels.filter((l) => l !== labelToRemove);
    setLabels(updated);
    onUpdate(task._id, { labels: updated });
  };

  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in overscroll-contain"
        onClick={onClose}
        onWheel={(e) => {
          if (e.target === e.currentTarget) e.preventDefault();
        }}
        onTouchMove={(e) => {
          if (e.target === e.currentTarget) e.preventDefault();
        }}
      >
        <div
          className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden overscroll-contain"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 border-b border-[var(--border-color)] bg-[var(--column-header)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-[var(--accent-color)] bg-[var(--bg-card)] px-2.5 py-1 rounded-xl border border-[var(--border-color)]">
                {task.key}
              </span>

              {/* Material UI Type Select */}
              <FormControl size="small" sx={{ minWidth: 105 }}>
                <Select
                  value={type}
                  onChange={(e) => {
                    const newType = e.target.value as TaskType;
                    setType(newType);
                    onUpdate(task._id, { type: newType });
                  }}
                  sx={{
                    fontSize: '0.8rem',
                    bgcolor: 'var(--bg-card)',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--border-color)',
                    },
                  }}
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
                onClick={() => setIsConfirmDeleteOpen(true)}
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
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 overscroll-contain">
            {/* Status & Priority Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[var(--bg-app)] p-3 rounded-2xl border border-[var(--border-color)]">
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
                    const newPri = e.target.value as TaskPriority;
                    setPriority(newPri);
                    onUpdate(task._id, { priority: newPri });
                  }}
                >
                  <MenuItem value="LOW">↓ Low</MenuItem>
                  <MenuItem value="MEDIUM">→ Medium</MenuItem>
                  <MenuItem value="HIGH">↑ High</MenuItem>
                  <MenuItem value="URGENT">▲ Urgent</MenuItem>
                </Select>
              </FormControl>
            </div>

            {/* Daily Reminder Notifications */}
            <div className="bg-[var(--bg-app)] p-3 rounded-2xl border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-[var(--accent-color)]" />
                  Daily Task Reminders
                </label>
                {remindersPerDay > 0 && (
                  <span className="text-[10px] font-bold text-[var(--accent-color)] bg-[var(--bg-card)] px-2 py-0.5 rounded-full border border-[var(--border-color)]">
                    {task.remindersSentToday || 0}/{remindersPerDay} sent today
                  </span>
                )}
              </div>
              <FormControl fullWidth size="small">
                <InputLabel id="detail-reminder-label">Reminder Frequency in a Day</InputLabel>
                <Select
                  labelId="detail-reminder-label"
                  label="Reminder Frequency in a Day"
                  value={remindersPerDay}
                  onChange={(e) => {
                    const newFreq = Number(e.target.value);
                    setRemindersPerDay(newFreq);
                    onUpdate(task._id, { remindersPerDay: newFreq });
                  }}
                >
                  <MenuItem value={0}>No reminders (Off)</MenuItem>
                  <MenuItem value={1}>🔔 1 time / day</MenuItem>
                  <MenuItem value={2}>🔔 2 times / day</MenuItem>
                  <MenuItem value={3}>🔔 3 times / day</MenuItem>
                  <MenuItem value={4}>🔔 4 times / day</MenuItem>
                  <MenuItem value={5}>🔔 5 times / day</MenuItem>
                </Select>
              </FormControl>
              <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                {remindersPerDay === 0
                  ? 'No reminder notifications are configured for this task.'
                  : `You will be notified ${remindersPerDay} time(s) a day until this task is completed.`}
              </p>
            </div>

            {/* Date Assignment Carousel */}
            <div>
              <label className="block text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--accent-color)]" />
                Assigned Date: {formatFriendlyDate(assignedDate)}
              </label>

              <div className="grid grid-cols-7 gap-1.5">
                {weekDays.map((d) => (
                  <button
                    key={d.dateString}
                    type="button"
                    onClick={() => handleAssignDateChange(d.dateString)}
                    className={`py-1.5 px-1 rounded-xl text-center transition-all border ${
                      assignedDate === d.dateString
                        ? 'bg-[var(--accent-color)] text-[var(--text-on-accent)] border-[var(--accent-color)] font-bold shadow-xs'
                        : 'bg-[var(--bg-app)] hover:bg-[var(--border-color)] text-[var(--text-main)] border-[var(--border-color)]'
                    }`}
                  >
                    <div className="text-[10px] font-bold">{d.shortName}</div>
                    <div className="text-[8px] opacity-80">{d.displayDate}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Task Summary / Title with Material UI TextField */}
            <TextField
              fullWidth
              label="Summary"
              variant="outlined"
              size="small"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => onUpdate(task._id, { title })}
              slotProps={{ input: { style: { fontWeight: 600 } } }}
            />

            {/* Description with Material UI multiline */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              variant="outlined"
              size="small"
              placeholder="Add details, markdown, or acceptance criteria......"
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

      {/* Delete Confirmation Popup Dialog */}
      <ConfirmDialog
        open={isConfirmDeleteOpen}
        title="Delete Issue"
        message={`Are you sure you want to permanently delete "${task.key}: ${task.title}"? This action cannot be undone.`}
        confirmText="Delete Issue"
        confirmColor="error"
        onConfirm={() => {
          setIsConfirmDeleteOpen(false);
          onDelete(task._id);
          onClose();
        }}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />
    </>
  );
};
