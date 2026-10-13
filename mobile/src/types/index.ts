export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskType = 'task' | 'bug' | 'story' | 'epic';

export interface ISubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface IRolloverHistory {
  fromDate: string;
  toDate: string;
  timestamp: string;
  reason: string;
}

export interface ITask {
  _id: string;
  key: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assignedDate: string; // YYYY-MM-DD
  originalDate: string;
  isRolledOver: boolean;
  rolloverCount: number;
  rolloverHistory: IRolloverHistory[];
  order: number;
  labels: string[];
  subtasks: ISubtask[];
  estimatedHours: number;
  loggedHours: number;
  remindersPerDay?: number; // 0 = off, 1..5 = times per day
  reminderTimes?: string[]; // HH:mm, one per daily reminder
  remindersSentToday?: number;
  lastReminderDate?: string | null;
  lastReminderTimestamp?: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface IEvent {
  _id: string;
  title: string;
  description?: string;
  eventDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  reminderMinutes: number; // 0, 5, 10, 15, 30, 60
  color: string;
  location?: string;
  isNotified: boolean;
  googleEventId?: string;
  outlookEventId?: string;
  source?: 'google' | 'outlook' | 'manual';
  createdAt: string;
}

export interface ICalendarDay {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // 'MON', 'TUE', ...
  dayNumber: number; // 1..31
  isToday: boolean;
}

export type NoteColorId = 'default' | 'amber' | 'emerald' | 'cyan' | 'purple' | 'rose';

export interface INote {
  _id: string;
  title: string;
  content: string;
  color?: NoteColorId; // Key of NOTE_COLORS, default 'default'
  media?: string[]; // Array of local file URIs for attached images / docs
  isLocked?: boolean; // Protected by device passkey / custom password
  isPinned?: boolean; // Stays at top of list
  isArchived?: boolean; // Moved to archived section
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  eventId?: string;
  taskId?: string;
  read: boolean;
}

export interface DayInfo {
  name: string;
  shortName: string;
  dateString: string;
  displayDate: string;
  isToday: boolean;
  isPast: boolean;
}

export interface MetaStats {
  total: number;
  done: number;
  inProgress: number;
  todo: number;
  rolledOver: number;
  completionRate: number;
}
