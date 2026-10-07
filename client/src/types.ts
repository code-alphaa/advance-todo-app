export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskType = 'task' | 'story' | 'bug' | 'epic';

export interface ISubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface IRolloverHistory {
  fromDate: string;
  toDate: string;
  timestamp: string;
  reason?: string;
}

export interface ITask {
  _id: string;
  key: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assignedDate: string; // 'YYYY-MM-DD'
  originalDate: string; // 'YYYY-MM-DD'
  isRolledOver: boolean;
  rolloverCount: number;
  rolloverHistory: IRolloverHistory[];
  order: number;
  labels: string[];
  subtasks: ISubtask[];
  estimatedHours: number;
  loggedHours: number;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DayInfo {
  name: string; // e.g. "Monday"
  shortName: string; // e.g. "Mon"
  dateString: string; // e.g. "2026-10-05"
  displayDate: string; // e.g. "Oct 5"
  fullDisplay: string; // e.g. "Monday, Oct 5, 2026"
  isToday: boolean;
  isPast: boolean;
}

export interface MetaStats {
  total: number;
  done: number;
  inProgress: number;
  inReview: number;
  todo: number;
  rolledOver: number;
  completionRate: number;
}
