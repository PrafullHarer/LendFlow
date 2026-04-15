import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Borrower from '@/models/Borrower';
import Payment from '@/models/Payment';

export async function GET() {
  try {
    await dbConnect();

    // Auto-mark overdue payments
    const now = new Date();
    await Payment.updateMany(
      { status: 'pending', dueDate: { $lt: now } },
      { $set: { status: 'overdue' } }
    );

    // Summary stats
    const activeBorrowers = await Borrower.find({ status: 'active' }).lean();
    const closedCount = await Borrower.countDocuments({ status: 'closed' });

    const totalPrincipalLent = activeBorrowers.reduce((sum, b) => sum + b.principal, 0);

    const paidPayments = await Payment.find({ status: 'paid' }).lean();
    const totalPaid = paidPayments.reduce((sum, p) => sum + p.amountPaid, 0);

    // Interest earned = total paid from interest-type payments + interest portion of final payments
    const interestEarned = paidPayments.reduce((sum, p) => {
      if (p.type === 'interest') return sum + p.amountPaid;
      if (p.type === 'final') {
        // For final payments, interest = amountDue - principal
        const borrower = activeBorrowers.find(
          b => b._id.toString() === p.borrowerId.toString()
        );
        if (borrower) {
          const monthlyInterest = borrower.principal * borrower.interestRate / 100;
          return sum + monthlyInterest;
        }
        return sum + 0;
      }
      return sum;
    }, 0);

    // Also check closed borrowers for interest earned
    const closedBorrowers = await Borrower.find({ status: 'closed' }).lean();
    const allBorrowers = [...activeBorrowers, ...closedBorrowers];
    
    const totalInterestEarned = paidPayments.reduce((sum, p) => {
      if (p.type === 'interest') return sum + p.amountPaid;
      if (p.type === 'final') {
        const borrower = allBorrowers.find(
          b => b._id.toString() === p.borrowerId.toString()
        );
        if (borrower) {
          const monthlyInterest = borrower.principal * borrower.interestRate / 100;
          return sum + monthlyInterest;
        }
      }
      return sum;
    }, 0);

    // Upcoming payments (next 7 days)
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    const upcomingPayments = await Payment.find({
      status: { $in: ['pending', 'overdue'] },
      dueDate: { $lte: sevenDaysLater },
    })
      .populate('borrowerId', 'name phone')
      .sort({ dueDate: 1 })
      .lean();

    // Calculate pending/overdue totals across the entire platform
    const unpaidPayments = await Payment.find({ status: { $in: ['pending', 'overdue'] } }).lean();
    
    // Total Amount to Receive (All unpaid payments, both principal and interest combined)
    const totalAmountToReceive = unpaidPayments.reduce((sum, p) => sum + p.amountDue, 0);

    // Total Interest to Receive
    const totalInterestToReceive = unpaidPayments.reduce((sum, p) => {
      if (p.type === 'interest') return sum + p.amountDue;
      if (p.type === 'final') {
        // A final payment includes both the principal and the final month's interest.
        // We isolate the interest by finding the borrower's principal.
        const borrower = allBorrowers.find(
          b => b._id.toString() === p.borrowerId.toString()
        );
        if (borrower) {
          const monthlyInterest = borrower.principal * borrower.interestRate / 100;
          return sum + monthlyInterest;
        }
      }
      return sum;
    }, 0);

    return NextResponse.json({
      totalPrincipalLent,
      totalInterestEarned: totalInterestEarned || interestEarned,
      totalAmountRecovered: totalPaid,
      totalAmountToReceive,
      totalInterestToReceive,
      activeLoans: activeBorrowers.length,
      closedLoans: closedCount,
      upcomingPayments,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
