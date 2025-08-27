// app/api/admin/analytics/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';
import StoryComment from '@/models/StoryComment';

export const dynamic = 'force-dynamic';

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

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // FIXED: Consistently exclude admin users from ALL counts
    const [
      totalUsers,
      thisMonthUsers,
      lastMonthUsers,
      activeUsers,
      totalStories,
      thisMonthStories,
      lastMonthStories,
      completedStories,
      publishedStories,
      totalComments,
      thisMonthComments,
      unresolvedComments,
      revenueData,
    ] = await Promise.all([
      // FIXED: All user counts exclude admin
      User.countDocuments({ role: { $in: ['child', 'mentor'] } }),
      User.countDocuments({
        role: { $in: ['child', 'mentor'] },
        createdAt: { $gte: monthStart },
      }),
      User.countDocuments({
        role: { $in: ['child', 'mentor'] },
        createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
      }),
      User.countDocuments({
        role: { $in: ['child', 'mentor'] },
        lastActiveDate: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      }),

      // Story Analytics
      StorySession.countDocuments({}),
      StorySession.countDocuments({ createdAt: { $gte: monthStart } }),
      StorySession.countDocuments({
        createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
      }),
      StorySession.countDocuments({ status: 'completed' }),
      StorySession.countDocuments({ isPublished: true }),

      // Comment Analytics
      StoryComment.countDocuments({}),
      StoryComment.countDocuments({ createdAt: { $gte: monthStart } }),
      StoryComment.countDocuments({ isResolved: false }),

      // Revenue Analytics - only from children (they buy story packs)
      User.aggregate([
        { $match: { role: 'child' } },
        {
          $unwind: {
            path: '$purchaseHistory',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$purchaseHistory.amount' },
            thisMonthRevenue: {
              $sum: {
                $cond: [
                  { $gte: ['$purchaseHistory.purchaseDate', monthStart] },
                  '$purchaseHistory.amount',
                  0,
                ],
              },
            },
            lastMonthRevenue: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $gte: ['$purchaseHistory.purchaseDate', lastMonthStart],
                      },
                      { $lt: ['$purchaseHistory.purchaseDate', lastMonthEnd] },
                    ],
                  },
                  '$purchaseHistory.amount',
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const revenue = revenueData[0] || {
      totalRevenue: 0,
      thisMonthRevenue: 0,
      lastMonthRevenue: 0,
    };

    // Growth calculations
    const userGrowth =
      lastMonthUsers > 0
        ? (((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100).toFixed(
            1
          )
        : 0;

    const storyGrowth =
      lastMonthStories > 0
        ? (
            ((thisMonthStories - lastMonthStories) / lastMonthStories) *
            100
          ).toFixed(1)
        : 0;

    const revenueGrowth =
      revenue.lastMonthRevenue > 0
        ? (
            ((revenue.thisMonthRevenue - revenue.lastMonthRevenue) /
              revenue.lastMonthRevenue) *
            100
          ).toFixed(1)
        : 0;

    return NextResponse.json({
      success: true,
      analytics: {
        users: {
          total: totalUsers, // FIXED: Now consistently excludes admin
          thisMonth: thisMonthUsers,
          active: activeUsers,
          growth: parseFloat(userGrowth as string),
        },
        stories: {
          total: totalStories,
          thisMonth: thisMonthStories,
          completed: completedStories,
          published: publishedStories,
          growth: parseFloat(storyGrowth as string),
        },
        comments: {
          total: totalComments,
          thisMonth: thisMonthComments,
          unresolved: unresolvedComments,
        },
        revenue: {
          total: revenue.totalRevenue,
          thisMonth: revenue.thisMonthRevenue,
          growth: parseFloat(revenueGrowth as string),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
