import React, { useState, useEffect } from 'react';
import { X, Calendar, ArrowRight, FastForward } from 'lucide-react';
import { addDaysToDateStr } from '../utils/dateUtils';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { useScrollLock } from '../utils/scrollLock';
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
  const [remindersPerDay, setRemindersPerDay] = useState<number>(0);

  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setPriority('MEDIUM');
      setAssignedDate(defaultDate || todayStr);
      setRemindersPerDay(0);

      const prevBody = document.body.style.overflow;
      const prevHtml = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      document.documentElement.classList.add('modal-open');

      return () => {
        document.body.style.overflow = prevBody;
        document.documentElement.style.overflow = prevHtml;
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');
      };
    }
  }, [isOpen, defaultDate, defaultStatus, todayStr]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      type: 'task',
      assignedDate,
      labels: [],
      estimatedHours: Number(estimatedHours) || 1,
      remindersPerDay: Number(remindersPerDay) || 0,
      subtasks: [],
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overscroll-contain"
      onClick={onClose}
      onWheel={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
    >
      <div
        className="w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col overscroll-contain"
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
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border-color)] rounded-xl transition-colors"
          >
            <X className="w-6 h-6" strokeWidth={2.4} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 overscroll-contain">
                    {/* Priority (Material UI Select with Distinct Colored Badges) */}
          <FormControl fullWidth size="small">
            <InputLabel id="mui-priority-label">Priority</InputLabel>
            <Select
              labelId="mui-priority-label"
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              <MenuItem value="LOW">
                <span className="inline-flex items-center text-xs font-bold text-white bg-cyan-600 px-2 py-0.5 rounded">LOW</span>
              </MenuItem>
              <MenuItem value="MEDIUM">
                <span className="inline-flex items-center text-xs font-bold text-[#131313] bg-[#EFD395] px-2 py-0.5 rounded">MEDIUM</span>
              </MenuItem>
              <MenuItem value="HIGH">
                <span className="inline-flex items-center text-xs font-bold text-white bg-orange-600 px-2 py-0.5 rounded">HIGH</span>
              </MenuItem>
              <MenuItem value="URGENT">
                <span className="inline-flex items-center text-xs font-bold text-white bg-red-600 px-2 py-0.5 rounded">URGENT</span>
              </MenuItem>
            </Select>
          </FormControl>

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
                <MenuItem value="TODO">
                  <span className="inline-flex items-center text-xs font-bold text-white bg-stone-600 px-2 py-0.5 rounded">TO DO</span>
                </MenuItem>
                <MenuItem value="IN_PROGRESS">
                  <span className="inline-flex items-center text-xs font-bold text-white bg-blue-600 px-2 py-0.5 rounded">IN PROGRESS</span>
                </MenuItem>
                <MenuItem value="IN_REVIEW">
                  <span className="inline-flex items-center text-xs font-bold text-white bg-purple-600 px-2 py-0.5 rounded">IN REVIEW</span>
                </MenuItem>
                <MenuItem value="DONE">
                  <span className="inline-flex items-center text-xs font-bold text-white bg-emerald-600 px-2 py-0.5 rounded">DONE</span>
                </MenuItem>
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

          {/* Daily Reminder Frequency */}
          <div className="p-3 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-color)]">
            <div className="flex items-center gap-1.5 mb-2">
              
              <span className="text-xs font-bold text-[var(--text-main)]">
                Daily Task Reminders
              </span>
            </div>
            <FormControl fullWidth size="small">
              <InputLabel id="mui-reminders-label">Reminder Frequency in a Day</InputLabel>
              <Select
                labelId="mui-reminders-label"
                label="Reminder Frequency in a Day"
                value={remindersPerDay}
                onChange={(e) => setRemindersPerDay(Number(e.target.value))}
              >
                <MenuItem value={0}>No reminders (Off)</MenuItem>
                <MenuItem value={1}>1 time / day</MenuItem>
                <MenuItem value={2}>2 times / day</MenuItem>
                <MenuItem value={3}>3 times / day</MenuItem>
                <MenuItem value={4}>4 times / day</MenuItem>
                <MenuItem value={5}>5 times / day</MenuItem>
              </Select>
            </FormControl>
            <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
              {remindersPerDay === 0
                ? 'No notifications will be triggered for this task.'
                : `You will receive up to ${remindersPerDay} notification reminder(s) throughout the day until completed.`}
            </p>
          </div>

          

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
