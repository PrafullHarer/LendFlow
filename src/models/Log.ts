import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILog extends Document {
  action: string;
  details: string;
  timestamp: Date;
}

const LogSchema = new Schema<ILog>(
  {
    action: { type: String, required: true },
    details: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Log: Model<ILog> = mongoose.models.Log || mongoose.model<ILog>('Log', LogSchema);
