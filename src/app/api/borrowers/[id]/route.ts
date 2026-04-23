import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Borrower from '@/models/Borrower';
import Payment from '@/models/Payment';
import { getAuthUserId } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    // Only fetch if borrower belongs to this user
    const borrower = await Borrower.findOne({ _id: id, userId }).lean();
    if (!borrower) {
      return NextResponse.json({ error: 'Borrower not found' }, { status: 404 });
    }

    // Auto-mark overdue payments
    const now = new Date();
    await Payment.updateMany(
      {
        borrowerId: id,
        userId,
        status: 'pending',
        dueDate: { $lt: now },
      },
      { $set: { status: 'overdue' } }
    );

    const payments = await Payment.find({ borrowerId: id, userId })
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
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    // Only delete if borrower belongs to this user
    const borrower = await Borrower.findOne({ _id: id, userId });
    if (!borrower) {
      return NextResponse.json({ error: 'Borrower not found' }, { status: 404 });
    }

    await Payment.deleteMany({ borrowerId: id, userId });
    await Borrower.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete borrower' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid or empty JSON body' }, { status: 400 });
    }

    // Only update if borrower belongs to this user
    const borrower = await Borrower.findOne({ _id: id, userId });
    if (!borrower) {
      return NextResponse.json({ error: 'Borrower not found' }, { status: 404 });
    }

    // Allow updating specific fields
    const allowedUpdates = ['name', 'phone', 'principal', 'interestRate', 'durationMonths', 'startDate'];
    const updates: any = {};
    let financialChanged = false;
    
    allowedUpdates.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
        if (['principal', 'interestRate', 'durationMonths', 'startDate'].includes(field)) {
          financialChanged = true;
        }
      }
    });

    const updatedBorrower = await Borrower.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    // If financial fields changed, regenerate the schedule
    if (financialChanged && updatedBorrower) {
      // 1. Delete existing payments
      await Payment.deleteMany({ borrowerId: id, userId });

      // 2. Regenerate payments
      const principal = Number(updatedBorrower.principal);
      const interestRate = Number(updatedBorrower.interestRate);
      const durationMonths = Number(updatedBorrower.durationMonths);
      const startDate = new Date(updatedBorrower.startDate);

      const monthlyInterest = principal * interestRate / 100;
      const payments = [];

      for (let i = 1; i <= durationMonths; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        const isLastMonth = i === durationMonths;
        const amountDue = isLastMonth ? monthlyInterest + principal : monthlyInterest;

        payments.push({
          userId,
          borrowerId: id,
          dueDate,
          monthNumber: i,
          amountDue,
          amountPaid: 0,
          paidOn: null,
          type: isLastMonth ? 'final' : 'interest',
          status: 'pending',
        });
      }

      await Payment.insertMany(payments);
    }

    return NextResponse.json(updatedBorrower);
  } catch (error) {
    console.error('Failed to update borrower:', error);
    return NextResponse.json({ error: 'Failed to update borrower' }, { status: 500 });
  }
}
