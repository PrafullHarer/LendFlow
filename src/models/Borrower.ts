import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBorrower extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  principal: number;
  interestRate: number;
  durationMonths: number;
  startDate: Date;
  status: 'active' | 'closed';
  createdAt: Date;
}

const BorrowerSchema = new Schema<IBorrower>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, default: '', trim: true },
  principal: { type: Number, required: true, min: 0 },
  interestRate: { type: Number, required: true, min: 0 },
  durationMonths: { type: Number, required: true, min: 1 },
  startDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

BorrowerSchema.index({ userId: 1, status: 1 });

const Borrower: Model<IBorrower> = mongoose.models.Borrower || mongoose.model<IBorrower>('Borrower', BorrowerSchema);

export default Borrower;
