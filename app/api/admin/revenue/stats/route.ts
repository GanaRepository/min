// app/api/admin/revenue/stats/route.ts (Fixed)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Revenue trends over last 12 months
    const revenueTrends = await User.aggregate([
      { $match: { role: 'child' } },
      { $unwind: '$purchaseHistory' },
      {
        $match: {
          'purchaseHistory.purchaseDate': {
            $gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth() - 11,
              1
            ),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$purchaseHistory.purchaseDate' },
            month: { $month: '$purchaseHistory.purchaseDate' },
            type: '$purchaseHistory.type',
          },
          revenue: { $sum: '$purchaseHistory.amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Customer lifetime value
    const customerLTV = await User.aggregate([
      { $match: { role: 'child' } },
      {
        $unwind: { path: '$purchaseHistory', preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: '$_id',
          totalSpent: { $sum: { $ifNull: ['$purchaseHistory.amount', 0] } },
          purchaseCount: {
            $sum: { $cond: [{ $ne: ['$purchaseHistory', null] }, 1, 0] },
          },
          firstPurchase: { $min: '$purchaseHistory.purchaseDate' },
          lastPurchase: { $max: '$purchaseHistory.purchaseDate' },
        },
      },
      {
        $group: {
          _id: null,
          avgLTV: { $avg: '$totalSpent' },
          avgPurchases: { $avg: '$purchaseCount' },
          payingCustomers: {
            $sum: { $cond: [{ $gt: ['$purchaseCount', 0] }, 1, 0] },
          },
          totalCustomers: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        revenueTrends,
        customerLTV: customerLTV[0] || {},
      },
    });
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue stats' },
      { status: 500 }
    );
  }
}
