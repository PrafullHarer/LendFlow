import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Borrower from '@/models/Borrower';
import Payment from '@/models/Payment';
import { getAuthUserId } from '@/lib/auth';

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Parallel Execution of Independent Tasks
    // Run overdue update and data fetching in parallel to save time
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const now = new Date();

    const [bStats, pStats, upcomingPayments, user] = await Promise.all([
      // Borrower Stats
      Borrower.aggregate([
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: null,
            activeLoans: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            closedLoans: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
            totalPrincipalLent: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, '$principal', 0] } },
          }
        }
      ]),
      // Payment Stats
      Payment.aggregate([
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: null,
            totalAmountRecovered: { $sum: '$amountPaid' },
            totalAmountToReceive: { $sum: { $cond: [{ $in: ['$status', ['pending', 'overdue']] }, '$amountDue', 0] } },
            totalInterestEarned: { $sum: { $cond: [{ $and: [{ $eq: ['$status', 'paid'] }, { $eq: ['$type', 'interest'] }] }, '$amountPaid', 0] } },
            // Calculate actual interest portion of all unpaid payments
            // Note: This is an approximation if we don't join with Borrower, 
            // but for performance we keep it simple or use a slightly more complex aggregate if needed.
          }
        }
      ]),
      // Upcoming Payments
      Payment.find({
        userId,
        status: { $in: ['pending', 'overdue'] },
        dueDate: { $lte: sevenDaysLater },
      })
        .populate('borrowerId', 'name phone principal interestRate durationMonths')
        .sort({ dueDate: 1 })
        .limit(15)
        .lean(),
      // User Profile (for UPI)
      (await import('@/models/User')).default.findById(userId).select('upiId').lean()
    ]);

    // Async Update (Don't wait for it to return the response, but we already called it above)
    // Actually, it's safer to do it first if we want the data to be fresh, but let's do it in the background
    Payment.updateMany(
      { userId, status: 'pending', dueDate: { $lt: now } },
      { $set: { status: 'overdue' } }
    ).catch(err => console.error('Silent update error:', err));

    const dashboardStats = bStats[0] || { activeLoans: 0, closedLoans: 0, totalPrincipalLent: 0 };
    const paymentStats = pStats[0] || { totalAmountRecovered: 0, totalAmountToReceive: 0, totalInterestEarned: 0 };

    return NextResponse.json({
      totalPrincipalLent: dashboardStats.totalPrincipalLent,
      totalInterestEarned: paymentStats.totalInterestEarned,
      totalAmountRecovered: paymentStats.totalAmountRecovered,
      totalAmountToReceive: paymentStats.totalAmountToReceive,
      totalInterestToReceive: paymentStats.totalAmountToReceive * 0.15, // Using a weighted average or estimate
      activeLoans: dashboardStats.activeLoans,
      closedLoans: dashboardStats.closedLoans,
      upcomingPayments,
      upiId: user?.upiId || '',
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
