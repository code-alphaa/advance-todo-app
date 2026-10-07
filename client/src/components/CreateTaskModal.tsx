import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { TaskStatus, TaskPriority, TaskType, DayInfo, ITask } from '../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Partial<ITask>) => void;
  weekDays: DayInfo[];
  defaultDate?: string;
  defaultStatus?: TaskStatus;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  weekDays,
  defaultDate,
  defaultStatus = 'TODO',
}) => {
  const todayStr = weekDays.find((d) => d.isToday)?.dateString || weekDays[0]?.dateString || '';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [type, setType] = useState<TaskType>('task');
  const [assignedDate, setAssignedDate] = useState(defaultDate || todayStr);
  const [labelsInput, setLabelsInput] = useState('Frontend, Sprint');
  const [estimatedHours, setEstimatedHours] = useState(2);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setPriority('MEDIUM');
      setType('task');
      setAssignedDate(defaultDate || todayStr);
    }
  }, [isOpen, defaultDate, defaultStatus, todayStr]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const labels = labelsInput
      .split(',')
      .map((l) => l.trim().replace(/^#/, ''))
      .filter(Boolean);

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      type,
      assignedDate,
      labels,
      estimatedHours: Number(estimatedHours) || 1,
      subtasks: [],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-[var(--border-color)] bg-[var(--column-header)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-color)]" />
            <h3 className="font-bold text-sm sm:text-base text-[var(--text-main)]">
              Create New Jira Issue
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border-color)] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Issue Type & Priority (Material UI Selects) */}
          <div className="grid grid-cols-2 gap-3">
            <FormControl fullWidth size="small">
              <InputLabel id="mui-issue-type-label">Issue Type</InputLabel>
              <Select
                labelId="mui-issue-type-label"
                label="Issue Type"
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
              >
                <MenuItem value="task">📘 Task</MenuItem>
                <MenuItem value="story">📗 Story</MenuItem>
                <MenuItem value="bug">🐞 Bug</MenuItem>
                <MenuItem value="epic">⚡ Epic</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="mui-priority-label">Priority</InputLabel>
              <Select
                labelId="mui-priority-label"
                label="Priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <MenuItem value="URGENT">🔥 Urgent</MenuItem>
                <MenuItem value="HIGH">▲ High</MenuItem>
                <MenuItem value="MEDIUM">═ Medium</MenuItem>
                <MenuItem value="LOW">▼ Low</MenuItem>
              </Select>
            </FormControl>
          </div>

          {/* Title (Material UI TextField) */}
          <TextField
            fullWidth
            required
            autoFocus
            size="small"
            label="Summary / Title"
            placeholder="e.g., Implement drag and drop reordering"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Description (Material UI Multiline) */}
          <TextField
            fullWidth
            multiline
            rows={3}
            size="small"
            label="Description"
            placeholder="Provide context, acceptance criteria or steps..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Day of the Week Picker (Requirement 2 & 3 & 4) */}
          <div className="bg-[var(--column-bg)] p-3.5 rounded-2xl border border-[var(--border-color)]">
            <label className="block text-xs font-bold uppercase text-[var(--text-main)] tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[var(--accent-color)]" />
              Schedule for Day of the Week
            </label>

            <div className="grid grid-cols-7 gap-1 mb-2.5">
              {weekDays.map((d) => (
                <button
                  key={d.dateString}
                  type="button"
                  onClick={() => setAssignedDate(d.dateString)}
                  className={`py-1.5 px-1 rounded-xl text-center transition-all border ${
                    assignedDate === d.dateString
                      ? 'bg-[var(--accent-color)] text-[var(--text-on-accent)] border-[var(--accent-color)] font-bold shadow-xs'
                      : 'bg-[var(--bg-card)] hover:bg-[var(--border-color)] text-[var(--text-main)] border-[var(--border-color)]'
                  }`}
                >
                  <div className="text-[10px] font-bold">{d.shortName}</div>
                  <div className="text-[8px] opacity-80">{d.displayDate}</div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[var(--text-secondary)] font-medium">Or custom date:</span>
              <input
                type="date"
                value={assignedDate}
                onChange={(e) => setAssignedDate(e.target.value)}
                className="bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg px-2 py-0.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-color)]"
              />
            </div>
          </div>

          {/* Status & Estimated Hours (Material UI Controls) */}
          <div className="grid grid-cols-2 gap-3">
            <FormControl fullWidth size="small">
              <InputLabel id="mui-status-label">Initial Status</InputLabel>
              <Select
                labelId="mui-status-label"
                label="Initial Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                <MenuItem value="TODO">To Do</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="IN_REVIEW">In Review</MenuItem>
                <MenuItem value="DONE">Done</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              type="number"
              label="Estimated Hours"
              slotProps={{ htmlInput: { min: 0.5, step: 0.5 } }}
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(Number(e.target.value))}
            />
          </div>

          {/* Labels (Material UI TextField) */}
          <TextField
            fullWidth
            size="small"
            label="Labels (comma separated)"
            placeholder="e.g. Design, Frontend, Urgent"
            value={labelsInput}
            onChange={(e) => setLabelsInput(e.target.value)}
          />

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-end gap-2">
            <Button
              variant="text"
              onClick={onClose}
              sx={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!title.trim()}
              sx={{
                bgcolor: 'var(--accent-color)',
                color: 'var(--text-on-accent)',
                fontWeight: 700,
                '&:hover': {
                  bgcolor: 'var(--accent-hover)',
                },
              }}
            >
              Create Issue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
