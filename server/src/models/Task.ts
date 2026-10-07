import mongoose, { Schema, Document } from 'mongoose';

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
  timestamp: Date;
  reason?: string;
}

export interface ITask extends Document {
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
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const SubtaskSchema = new Schema<ISubtask>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const RolloverHistorySchema = new Schema<IRolloverHistory>(
  {
    fromDate: { type: String, required: true },
    toDate: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    reason: { type: String, default: 'Automatic daily rollover for incomplete task' },
  },
  { _id: false }
);

const TaskSchema = new Schema<ITask>(
  {
    key: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'],
      default: 'TODO',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    type: {
      type: String,
      enum: ['task', 'story', 'bug', 'epic'],
      default: 'task',
    },
    assignedDate: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
    originalDate: { type: String, required: true }, // Format: YYYY-MM-DD
    isRolledOver: { type: Boolean, default: false },
    rolloverCount: { type: Number, default: 0 },
    rolloverHistory: [RolloverHistorySchema],
    order: { type: Number, default: 0 },
    labels: [{ type: String, trim: true }],
    subtasks: [SubtaskSchema],
    estimatedHours: { type: Number, default: 1 },
    loggedHours: { type: Number, default: 0 },
    completedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

export const Task = mongoose.model<ITask>('Task', TaskSchema);
