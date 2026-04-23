import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  details: string;
  timestamp: Date;
}

const LogSchema = new Schema<ILog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true },
    details: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Log: Model<ILog> = mongoose.models.Log || mongoose.model<ILog>('Log', LogSchema);
