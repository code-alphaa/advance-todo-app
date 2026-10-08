import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description?: string;
  eventDate: string; // 'YYYY-MM-DD'
  startTime: string; // 'HH:mm', e.g. '09:00'
  endTime?: string; // 'HH:mm', e.g. '10:00'
  color?: string; // Hex color code
  location?: string;
  reminderMinutes: number; // e.g. 5, 10, 15, 30, 60, 1440. 0 = none
  isNotified: boolean;
  googleEventId?: string;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    eventDate: { type: String, required: true, index: true },
    startTime: { type: String, required: true, default: '09:00' },
    endTime: { type: String, default: '10:00' },
    color: { type: String, default: '#F62440' },
    location: { type: String, default: '' },
    reminderMinutes: { type: Number, default: 15 },
    isNotified: { type: Boolean, default: false },
    googleEventId: { type: String, index: true, sparse: true },
    source: { type: String, default: 'manual' },
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.model<IEvent>('Event', EventSchema);
