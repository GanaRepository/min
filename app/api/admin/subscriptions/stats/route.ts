export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Get REAL subscription data from your database
    const [total, subscriptionData] = await Promise.all([
      User.countDocuments({ role: 'child' }),
      User.aggregate([
        { $match: { role: 'child' } },
        {
          $group: {
            _id: {
              $ifNull: [{ $toLower: '$subscriptionTier' }, 'free'],
            },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Process the aggregation results
    const tierCounts = subscriptionData.reduce(
      (acc, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      {} as Record<string, number>
    );

    const free = tierCounts.free || 0;
    const basic = tierCounts.basic || 0;
    const premium = tierCounts.premium || 0;

    // Calculate revenue (you can adjust these prices)
    const basicPrice = 9.99;
    const premiumPrice = 19.99;
    const monthlyRevenue = basic * basicPrice + premium * premiumPrice;

    const stats = {
      total,
      free,
      basic,
      premium,
      revenue: {
        monthly: Math.round(monthlyRevenue * 100) / 100,
        total: Math.round(monthlyRevenue * 12 * 100) / 100,
      },
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription stats' },
      { status: 500 }
    );
  }
}
