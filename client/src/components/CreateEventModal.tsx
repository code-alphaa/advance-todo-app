import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import { Calendar, Clock, Bell, MapPin, X } from 'lucide-react';
import { IEvent } from '../types';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: Partial<IEvent>) => void;
  initialDate?: string;
}

const REMINDER_OPTIONS = [
  { value: 0, label: 'At time of event' },
  { value: 5, label: '5 minutes before' },
  { value: 10, label: '10 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 120, label: '2 hours before' },
  { value: 1440, label: '1 day before' },
];

const COLOR_OPTIONS = [
  { label: 'Red (Accent)', hex: '#F62440' },
  { label: 'Blue', hex: '#2563EB' },
  { label: 'Emerald', hex: '#059669' },
  { label: 'Purple', hex: '#7C3AED' },
  { label: 'Amber', hex: '#D97706' },
  { label: 'Pink', hex: '#DB2777' },
  { label: 'Charcoal', hex: '#44444E' },
];

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(
    initialDate || new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [color, setColor] = useState('#F62440');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialDate) setEventDate(initialDate);
      setTitle('');
      setDescription('');
      setLocation('');
      // Default to next nearest hour
      const now = new Date();
      now.setHours(now.getHours() + 1, 0, 0, 0);
      const nextHourStr = `${String(now.getHours()).padStart(2, '0')}:00`;
      now.setHours(now.getHours() + 1);
      const afterHourStr = `${String(now.getHours()).padStart(2, '0')}:00`;
      setStartTime(nextHourStr);
      setEndTime(afterHourStr);
    }
  }, [isOpen, initialDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate || !startTime) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        eventDate,
        startTime,
        endTime: endTime || undefined,
        reminderMinutes,
        color,
        location: location.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error('Failed to create event', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      disableScrollLock
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            bgcolor: 'var(--bg-card)',
            backgroundImage: 'none',
            border: '1px solid var(--border-color)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            overscrollBehavior: 'contain',
          },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-color)',
            pb: 1.5,
            pt: 2,
            px: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                bgcolor: 'var(--accent-color)',
                color: 'var(--text-on-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Calendar size={18} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
              Add Calendar Event
            </Typography>
          </Box>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--column-bg)] transition-colors"
          >
            <X className="w-6 h-6" strokeWidth={2.4} />
          </button>
        </DialogTitle>

        {/* DialogContent with explicit pt: '24px !important' to prevent MUI default collapse */}
        <DialogContent
          sx={{
            px: 3,
            pb: 3,
            pt: '24px !important',
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            overscrollBehavior: 'contain',
          }}
        >
          {/* Title */}
          <TextField
            autoFocus
            required
            fullWidth
            label="Event Title"
            placeholder="e.g. Sprint Planning / Team Standup"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size="small"
            sx={{ mt: 0.5 }}
          />

          {/* Date, Start Time & End Time */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1fr 1fr' }, gap: 1.5 }}>
            <TextField
              required
              fullWidth
              type="date"
              label="Event Date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              size="small"
            />
            <TextField
              required
              fullWidth
              type="time"
              label="Start Time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              size="small"
            />
            <TextField
              fullWidth
              type="time"
              label="End Time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              size="small"
            />
          </Box>

          {/* Reminder Offset Selector (approximate time before which reminded) */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="reminder-select-label">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Bell size={14} />
                  <span>Reminder Alert</span>
                </Box>
              </InputLabel>
              <Select
                labelId="reminder-select-label"
                value={reminderMinutes}
                label="Reminder Alert---"
                onChange={(e) => setReminderMinutes(Number(e.target.value))}
              >
                {REMINDER_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.85rem' }}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Location / Link (Optional)"
              placeholder="Google Meet, Room 3A..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <MapPin size={15} style={{ marginRight: 6, color: 'var(--text-muted)' }} />
                  ),
                },
              }}
            />
          </Box>

          {/* Color Tag Picker */}
          <Box>
            <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 600, mb: 1, display: 'block' }}>
              Event Color Tag
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                    color === c.hex ? 'scale-110 ring-2 ring-offset-2 ring-[var(--accent-color)]' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                />
              ))}
            </Box>
          </Box>

          {/* Description */}
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Description / Notes (Optional)"
            placeholder="Agenda or details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            size="small"
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, borderTop: '1px solid var(--border-color)', gap: 1 }}>
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
            disabled={isSubmitting}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)',
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !title.trim()}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              px: 2.5,
              bgcolor: 'var(--accent-color)',
              color: 'var(--text-on-accent)',
              '&:hover': {
                bgcolor: 'var(--accent-hover)',
              },
            }}
          >
            {isSubmitting ? 'Creating...' : 'Schedule Event'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
