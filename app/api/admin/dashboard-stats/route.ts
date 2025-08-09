// app/api/admin/dashboard-stats/route.ts - UPDATED to include ALL users
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';
import StoryComment from '@/models/StoryComment';

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
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // UPDATED: Count ALL users including admin
    const [
      // User statistics - INCLUDE ALL ROLES
      totalUsers,
      childrenCount,
      mentorsCount,
      adminCount,
      activeUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,

      // Story statistics
      totalStories,
      storiesThisMonth,
      storiesThisWeek,
      completedStories,

      // Comment statistics
      totalComments,
      commentsThisWeek,
      unresolvedComments,

      // Revenue data
      revenueData,
    ] = await Promise.all([
      // UPDATED: Count ALL users including admin
      User.countDocuments({
        isActive: true,
      }),

      User.countDocuments({
        role: 'child',
        isActive: true,
      }),

      User.countDocuments({
        role: 'mentor',
        isActive: true,
      }),

      User.countDocuments({
        role: 'admin',
        isActive: true,
      }),

      User.countDocuments({
        isActive: true,
        lastActiveDate: { $gte: todayStart },
      }),

      User.countDocuments({
        createdAt: { $gte: weekStart },
      }),

      User.countDocuments({
        createdAt: { $gte: monthStart },
      }),

      StorySession.countDocuments({}),
      StorySession.countDocuments({ createdAt: { $gte: monthStart } }),
      StorySession.countDocuments({ createdAt: { $gte: weekStart } }),
      StorySession.countDocuments({ status: 'completed' }),

      StoryComment.countDocuments({}),
      StoryComment.countDocuments({ createdAt: { $gte: weekStart } }),
      StoryComment.countDocuments({ isResolved: false }),

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
            monthlyRevenue: {
              $sum: {
                $cond: [
                  { $gte: ['$purchaseHistory.purchaseDate', monthStart] },
                  '$purchaseHistory.amount',
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const revenue = revenueData[0] || { totalRevenue: 0, monthlyRevenue: 0 };

    console.log('Dashboard Stats Debug (All Users):', {
      totalUsers,
      childrenCount,
      mentorsCount,
      adminCount,
      activeUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
    });

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers, // NOW includes admin
          children: childrenCount, // Children count
          mentors: mentorsCount, // Mentors count
          admins: adminCount, // NEW: Admin count
          activeToday: activeUsersToday,
          newThisWeek: newUsersThisWeek,
          newThisMonth: newUsersThisMonth,
        },
        stories: {
          total: totalStories,
          thisMonth: storiesThisMonth,
          thisWeek: storiesThisWeek,
          completed: completedStories,
          completionRate:
            totalStories > 0
              ? Math.round((completedStories / totalStories) * 100)
              : 0,
        },
        comments: {
          total: totalComments,
          thisWeek: commentsThisWeek,
          unresolved: unresolvedComments,
        },
        revenue: {
          total: revenue.totalRevenue,
          thisMonth: revenue.monthlyRevenue,
          growth: 0, // Calculate this based on previous month if needed
        },
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
