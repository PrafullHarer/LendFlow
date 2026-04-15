import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Borrower from '@/models/Borrower';
import Payment from '@/models/Payment';
import { logAction } from '@/lib/logAction';

export async function GET() {
  try {
    await dbConnect();
    const borrowers = await Borrower.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(borrowers);
  } catch (error) {
    console.error('Borrowers fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch borrowers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const { name, phone, principal, interestRate, durationMonths, startDate } = body;

    if (!name || !principal || !interestRate || !durationMonths || !startDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const borrower = await Borrower.create({
      name: name.trim(),
      phone: phone?.trim() || '',
      principal: Number(principal),
      interestRate: Number(interestRate),
      durationMonths: Number(durationMonths),
      startDate: new Date(startDate),
    });

    // Auto-generate payment records
    const monthlyInterest = Number(principal) * Number(interestRate) / 100;
    const payments = [];
    const start = new Date(startDate);

    for (let i = 1; i <= Number(durationMonths); i++) {
      const dueDate = new Date(start);
      dueDate.setMonth(dueDate.getMonth() + i);

      const isLastMonth = i === Number(durationMonths);
      const amountDue = isLastMonth ? monthlyInterest + Number(principal) : monthlyInterest;

      payments.push({
        borrowerId: borrower._id,
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

    await logAction('Borrower Added', `Created profile for ${borrower.name} (Principal: ₹${borrower.principal.toLocaleString('en-IN')})`);

    return NextResponse.json(borrower, { status: 201 });
  } catch (error) {
    console.error('Error creating borrower:', error);
    return NextResponse.json({ error: 'Failed to create borrower' }, { status: 500 });
  }
}
