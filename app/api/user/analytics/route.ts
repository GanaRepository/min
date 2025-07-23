// app/api/user/analytics/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get story statistics
    const [totalSessions, completedSessions, activeSessions] =
      await Promise.all([
        StorySession.countDocuments({ childId: userId }),
        StorySession.countDocuments({ childId: userId, status: 'completed' }),
        StorySession.countDocuments({ childId: userId, status: 'active' }),
      ]);

    // Get monthly stats
    const monthlyStats = await StorySession.aggregate([
      {
        $match: {
          childId: userId,
          createdAt: { $gte: monthStart },
        },
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalWords: { $sum: '$childWords' },
          totalApiCalls: { $sum: '$apiCallsUsed' },
          completedThisMonth: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
        },
      },
    ]);

    // Get weekly progress
    const weeklyStats = await StorySession.aggregate([
      {
        $match: {
          childId: userId,
          createdAt: { $gte: weekStart },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          storiesCreated: { $sum: 1 },
          wordsWritten: { $sum: '$childWords' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlyData = monthlyStats[0] || {
      totalSessions: 0,
      totalWords: 0,
      totalApiCalls: 0,
      completedThisMonth: 0,
    };

    // Calculate achievements
    const achievements: string[] = [];
    const totalStories = user.totalStoriesCreated || 0;
    const totalWords = user.totalWordsWritten || 0;
    const writingStreak = user.writingStreak || 0;

    if (totalStories >= 1) achievements.push('First Story');
    if (totalStories >= 5) achievements.push('Story Teller');
    if (totalStories >= 10) achievements.push('Author');
    if (totalWords >= 1000) achievements.push('Word Warrior');
    if (totalWords >= 5000) achievements.push('Vocabulary Master');
    if (writingStreak >= 7) achievements.push('Week Streak');

    // Calculate completion rate
    const completionRate =
      totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    // Weekly progress for chart
    const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = weeklyStats.find((stat) => stat._id === dateStr);
      return {
        date: dateStr,
        stories: dayData?.storiesCreated || 0,
        words: dayData?.wordsWritten || 0,
      };
    });

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalStoriesCreated: totalStories,
          totalWordsWritten: totalWords,
          averageWordsPerStory:
            totalStories > 0 ? Math.round(totalWords / totalStories) : 0,
          writingStreak: writingStreak,
          completionRate: Math.round(completionRate),
          isActiveToday: true, // Implement based on last activity
        },
        monthly: {
          storiesCreated: monthlyData.completedThisMonth,
          wordsWritten: monthlyData.totalWords,
          apiCallsUsed: monthlyData.totalApiCalls,
        },
        sessions: {
          total: totalSessions,
          completed: completedSessions,
          active: activeSessions,
          completionRate: Math.round(completionRate),
        },
        achievements,
        weeklyProgress,
        recentStories: [], // Implement as needed
        recentActivity: [], // Implement as needed
      },
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
