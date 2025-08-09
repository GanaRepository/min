//app/api/admin/analytics/users/route.ts
// app/api/admin/analytics/users/route.ts
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
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // User registration trends (last 12 months)
    const registrationTrends = await User.aggregate([
      {
        $match: {
          role: { $in: ['child', 'mentor'] },
          createdAt: {
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
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          children: {
            $sum: { $cond: [{ $eq: ['$role', 'child'] }, 1, 0] },
          },
          mentors: {
            $sum: { $cond: [{ $eq: ['$role', 'mentor'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // User activity analysis
    const activityAnalysis = await User.aggregate([
      { $match: { role: 'child' } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: {
              $cond: [
                {
                  $gt: [
                    '$lastActiveDate',
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  ],
                },
                1,
                0,
              ],
            },
          },
          highUsageUsers: {
            $sum: { $cond: [{ $gte: ['$totalStoriesCreated', 10] }, 1, 0] },
          },
          paidUsers: {
            $sum: {
              $cond: [
                { $gt: [{ $size: { $ifNull: ['$purchaseHistory', []] } }, 0] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // Top users by engagement
    const topUsers = await User.find({ role: 'child' })
      .sort({ totalStoriesCreated: -1 })
      .limit(10)
      .select(
        'firstName lastName totalStoriesCreated totalWordsWritten createdAt'
      )
      .lean();

    return NextResponse.json({
      success: true,
      userAnalytics: {
        registrationTrends,
        activityAnalysis: activityAnalysis[0] || {},
        topUsers,
      },
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user analytics' },
      { status: 500 }
    );
  }
}
