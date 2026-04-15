import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';
import Borrower from '@/models/Borrower';
import { logAction } from '@/lib/logAction';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const payment = await Payment.findById(id);
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (body.action === 'mark_paid') {
      payment.status = 'paid';
      payment.amountPaid = payment.amountDue;
      payment.paidOn = new Date();
      await payment.save();

      const borrower = await Borrower.findById(payment.borrowerId);
      if (borrower) {
        await logAction('Payment Received', `Marked payment of ₹${payment.amountDue.toLocaleString('en-IN')} as paid for ${borrower.name}`);
      }

      // Check if all payments for this borrower are paid
      const pendingPayments = await Payment.countDocuments({
        borrowerId: payment.borrowerId,
        status: { $ne: 'paid' },
      });

      if (pendingPayments === 0) {
        await Borrower.findByIdAndUpdate(payment.borrowerId, { status: 'closed' });
        if (borrower) {
          await logAction('System Log', `Loan for ${borrower.name} fully repaid and marked as closed.`);
        }
      }

      return NextResponse.json(payment);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}
