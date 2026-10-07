import mongoose, { Schema, Document } from 'mongoose';

export interface ICounter extends Document {
  id: string;
  seq: number;
}

const CounterSchema = new Schema<ICounter>({
  id: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

export const Counter = mongoose.model<ICounter>('Counter', CounterSchema);

export async function getNextSequence(name: string): Promise<number> {
  const counter = await Counter.findOneAndUpdate(
    { id: name },
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  return counter ? counter.seq : 1;
}
