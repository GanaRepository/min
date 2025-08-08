//app/api/admin/revenue/route.ts
// app/api/admin/revenue/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectToDatabase();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Revenue analytics
    const revenueData = await User.aggregate([
      { $match: { role: 'child' } },
      { $unwind: { path: '$purchaseHistory', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$purchaseHistory.amount' },
          thisMonthRevenue: {
            $sum: {
              $cond: [
                { $gte: ['$purchaseHistory.purchaseDate', monthStart] },
                '$purchaseHistory.amount',
                0
              ]
            }
          },
          lastMonthRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$purchaseHistory.purchaseDate', lastMonthStart] },
                    { $lt: ['$purchaseHistory.purchaseDate', lastMonthEnd] }
                  ]
                },
                '$purchaseHistory.amount',
                0
              ]
            }
          },
          storyPacksSold: {
            $sum: {
              $cond: [
                { $eq: ['$purchaseHistory.type', 'story_pack'] },
                1,
                0
              ]
            }
          },
          publicationsSold: {
            $sum: {
              $cond: [
                { $eq: ['$purchaseHistory.type', 'story_publication'] },
                1,
                0
              ]
            }
          },
        }
      }
    ]);

    const revenue = revenueData[0] || {
      totalRevenue: 0,
      thisMonthRevenue: 0,
      lastMonthRevenue: 0,
      storyPacksSold: 0,
      publicationsSold: 0,
    };

    // Revenue growth
    const revenueGrowth = revenue.lastMonthRevenue > 0
      ? ((revenue.thisMonthRevenue - revenue.lastMonthRevenue) / revenue.lastMonthRevenue * 100)
      : 0;

    // Top paying users
    const topPayingUsers = await User.aggregate([
      { $match: { role: 'child' } },
      { $unwind: '$purchaseHistory' },
      {
        $group: {
          _id: '$_id',
          firstName: { $first: '$firstName' },
          lastName: { $first: '$lastName' },
          email: { $first: '$email' },
          totalSpent: { $sum: '$purchaseHistory.amount' },
          purchaseCount: { $sum: 1 },
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);

    return NextResponse.json({
      success: true,
      revenue: {
        ...revenue,
        growth: revenueGrowth,
        topPayingUsers,
      },
    });

  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return NextResponse.json({ error: 'Failed to fetch revenue data' }, { status: 500 });
  }
}