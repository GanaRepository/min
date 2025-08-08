//app/api/admin/dashboard-stats/route.ts
// app/api/admin/dashboard-stats/route.ts
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
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectToDatabase();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      // User stats
      totalUsers,
      activeUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      
      // Story stats
      totalStories,
      storiesThisMonth,
      storiesThisWeek,
      completedStories,
      
      // Comment stats
      totalComments,
      commentsThisWeek,
      unresolvedComments,
      
      // Revenue stats
      revenueData,
    ] = await Promise.all([
      User.countDocuments({ role: { $in: ['child', 'mentor'] } }),
      User.countDocuments({ 
        role: { $in: ['child', 'mentor'] },
        lastActiveDate: { $gte: dayStart } 
      }),
      User.countDocuments({ 
        role: { $in: ['child', 'mentor'] },
        createdAt: { $gte: weekStart } 
      }),
      User.countDocuments({ 
        role: { $in: ['child', 'mentor'] },
        createdAt: { $gte: monthStart } 
      }),
      
      StorySession.countDocuments(),
      StorySession.countDocuments({ createdAt: { $gte: monthStart } }),
      StorySession.countDocuments({ createdAt: { $gte: weekStart } }),
      StorySession.countDocuments({ status: 'completed' }),
      
      StoryComment.countDocuments(),
      StoryComment.countDocuments({ createdAt: { $gte: weekStart } }),
      StoryComment.countDocuments({ isResolved: false }),
      
      User.aggregate([
        { $match: { role: 'child' } },
        { $unwind: { path: '$purchaseHistory', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$purchaseHistory.amount' },
            monthlyRevenue: {
              $sum: {
                $cond: [
                  { $gte: ['$purchaseHistory.purchaseDate', monthStart] },
                  '$purchaseHistory.amount',
                  0
                ]
              }
            }
          }
        }
      ])
    ]);

    const revenue = revenueData[0] || { totalRevenue: 0, monthlyRevenue: 0 };

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          activeToday: activeUsersToday,
          newThisWeek: newUsersThisWeek,
          newThisMonth: newUsersThisMonth,
        },
        stories: {
          total: totalStories,
          thisMonth: storiesThisMonth,
          thisWeek: storiesThisWeek,
          completed: completedStories,
          completionRate: totalStories > 0 ? Math.round((completedStories / totalStories) * 100) : 0,
        },
        comments: {
          total: totalComments,
          thisWeek: commentsThisWeek,
          unresolved: unresolvedComments,
        },
        revenue: {
          total: revenue.totalRevenue,
          thisMonth: revenue.monthlyRevenue,
        },
      },
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}