import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const borrowerId = searchParams.get('borrowerId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const upcoming = searchParams.get('upcoming');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (borrowerId) {
      filter.borrowerId = borrowerId;
    }

    if (startDate || endDate) {
      filter.dueDate = {};
      if (startDate) filter.dueDate.$gte = new Date(startDate);
      if (endDate) filter.dueDate.$lte = new Date(endDate);
    }

    // Auto-mark overdue
    const now = new Date();
    await Payment.updateMany(
      { status: 'pending', dueDate: { $lt: now } },
      { $set: { status: 'overdue' } }
    );

    if (upcoming === 'true') {
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
      filter.status = { $in: ['pending', 'overdue'] };
      filter.dueDate = { $lte: sevenDaysLater };
    }

    const payments = await Payment.find(filter)
      .populate('borrowerId', 'name phone')
      .sort({ dueDate: 1 })
      .lean();

    return NextResponse.json(payments);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
