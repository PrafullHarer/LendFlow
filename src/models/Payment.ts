import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  borrowerId: mongoose.Types.ObjectId;
  dueDate: Date;
  monthNumber: number;
  amountDue: number;
  amountPaid: number;
  paidOn: Date | null;
  type: 'interest' | 'final';
  status: 'pending' | 'paid' | 'overdue';
}

const PaymentSchema = new Schema<IPayment>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  borrowerId: { type: Schema.Types.ObjectId, ref: 'Borrower', required: true, index: true },
  dueDate: { type: Date, required: true },
  monthNumber: { type: Number, required: true, min: 1 },
  amountDue: { type: Number, required: true, min: 0 },
  amountPaid: { type: Number, default: 0 },
  paidOn: { type: Date, default: null },
  type: { type: String, enum: ['interest', 'final'], required: true },
  status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
});

PaymentSchema.index({ dueDate: 1, status: 1 });
PaymentSchema.index({ borrowerId: 1, monthNumber: 1 });
PaymentSchema.index({ userId: 1, status: 1 });

const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
