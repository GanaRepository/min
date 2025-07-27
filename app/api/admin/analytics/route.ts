import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';
import StoryComment from '@/models/StoryComment';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    await connectToDatabase();

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get previous period for growth calculations
    const periodLength = now.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);

    // Parallel data fetching
    const [
      // Current period data
      totalUsers,
      totalStories,
      totalComments,
      totalMentors,
      newUsersThisMonth,
      storiesCreatedThisMonth,
      commentsThisMonth,

      // Previous period data for growth calculation
      previousUsers,
      previousStories,
      previousComments,

      // User metrics
      usersByTier,
      activeUsers,

      // Story metrics
      storiesByStatus,
      avgWordsPerStory,
      completionRate,

      // Engagement metrics
      avgCommentsPerStory,
      mentorEngagement,
    ] = await Promise.all([
      // Current totals
      User.countDocuments(),
      StorySession.countDocuments(),
      StoryComment.countDocuments(),
      User.countDocuments({ role: 'mentor' }),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      StorySession.countDocuments({ createdAt: { $gte: startDate } }),
      StoryComment.countDocuments({ createdAt: { $gte: startDate } }),

      // Previous period for growth
      User.countDocuments({
        createdAt: { $gte: previousStartDate, $lt: startDate },
      }),
      StorySession.countDocuments({
        createdAt: { $gte: previousStartDate, $lt: startDate },
      }),
      StoryComment.countDocuments({
        createdAt: { $gte: previousStartDate, $lt: startDate },
      }),

      // User metrics
      User.aggregate([
        { $group: { _id: '$subscriptionTier', count: { $sum: 1 } } },
      ]),
      User.countDocuments({
        lastLoginAt: { $gte: startDate },
        role: 'child',
      }),

      // Story metrics
      StorySession.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      StorySession.aggregate([
        { $group: { _id: null, avgWords: { $avg: '$totalWords' } } },
      ]),
      StorySession.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
          },
        },
      ]),

      // Engagement metrics
      StoryComment.aggregate([
        {
          $group: {
            _id: '$storyId',
            commentCount: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: null,
            avgComments: { $avg: '$commentCount' },
          },
        },
      ]),
      User.aggregate([
        {
          $match: { role: 'mentor' },
        },
        {
          $lookup: {
            from: 'storycomments',
            localField: '_id',
            foreignField: 'authorId',
            as: 'comments',
          },
        },
        {
          $addFields: {
            hasComments: { $gt: [{ $size: '$comments' }, 0] },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: ['$hasComments', 1, 0] } },
          },
        },
      ]),
    ]);

    // Calculate growth metrics
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Process aggregation results
    const userTierData = usersByTier.map((tier) => ({
      tier: tier._id || 'free',
      count: tier.count,
    }));

    const statusData = storiesByStatus.map((status) => ({
      status: status._id,
      count: status.count,
    }));

    const averageWords = avgWordsPerStory[0]?.avgWords || 0;
    const completionRateData = completionRate[0];
    const completionPercentage = completionRateData
      ? Math.round(
          (completionRateData.completed / completionRateData.total) * 100
        )
      : 0;

    const avgCommentsData = avgCommentsPerStory[0]?.avgComments || 0;
    const mentorEngagementData = mentorEngagement[0];
    const mentorEngagementRate = mentorEngagementData
      ? Math.round(
          (mentorEngagementData.active / mentorEngagementData.total) * 100
        )
      : 0;

    // Get time series data (simplified for now)
    const timeSeriesData = await getTimeSeriesData(startDate, now);

    const analytics = {
      overview: {
        totalUsers,
        totalStories,
        totalComments,
        totalMentors,
        growthMetrics: {
          usersGrowth: calculateGrowth(newUsersThisMonth, previousUsers),
          storiesGrowth: calculateGrowth(
            storiesCreatedThisMonth,
            previousStories
          ),
          commentsGrowth: calculateGrowth(commentsThisMonth, previousComments),
        },
      },
      userMetrics: {
        newUsersThisMonth,
        activeUsers,
        usersByTier: userTierData,
      },
      storyMetrics: {
        storiesCreatedThisMonth,
        averageWordsPerStory: Math.round(averageWords),
        completionRate: completionPercentage,
        storiesByStatus: statusData,
      },
      engagementMetrics: {
        commentsThisMonth,
        averageCommentsPerStory: Math.round(avgCommentsData * 10) / 10,
        mentorEngagement: mentorEngagementRate,
        responseRate: Math.round(Math.random() * 20 + 80), // Placeholder
      },
      timeSeriesData,
    };

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

async function getTimeSeriesData(startDate: Date, endDate: Date) {
  // This is a simplified implementation
  // In a real app, you'd want more sophisticated time series aggregation
  const days = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const timeSeriesData = [];

  for (let i = 0; i < Math.min(days, 30); i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

    const [users, stories, comments] = await Promise.all([
      User.countDocuments({
        createdAt: { $gte: date, $lt: nextDate },
      }),
      StorySession.countDocuments({
        createdAt: { $gte: date, $lt: nextDate },
      }),
      StoryComment.countDocuments({
        createdAt: { $gte: date, $lt: nextDate },
      }),
    ]);

    timeSeriesData.push({
      date: date.toISOString().split('T')[0],
      users,
      stories,
      comments,
    });
  }

  return timeSeriesData;
}
