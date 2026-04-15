import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Borrower from '@/models/Borrower';
import Payment from '@/models/Payment';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const borrower = await Borrower.findById(id).lean();
    if (!borrower) {
      return NextResponse.json({ error: 'Borrower not found' }, { status: 404 });
    }

    // Auto-mark overdue payments
    const now = new Date();
    await Payment.updateMany(
      {
        borrowerId: id,
        status: 'pending',
        dueDate: { $lt: now },
      },
      { $set: { status: 'overdue' } }
    );

    const payments = await Payment.find({ borrowerId: id })
      .sort({ monthNumber: 1 })
      .lean();

    return NextResponse.json({ borrower, payments });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch borrower' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    await Payment.deleteMany({ borrowerId: id });
    await Borrower.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete borrower' }, { status: 500 });
  }
}
