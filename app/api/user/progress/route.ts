// app/api/user/progress/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';
import Achievement from '@/models/Achievement';
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

    // Get story sessions
    const [allSessions, completedSessions] = await Promise.all([
      StorySession.find({ childId: userId }).lean(),
      StorySession.find({ childId: userId, status: 'completed' }).lean(),
    ]);

    // Calculate overview stats
    const totalWords = completedSessions.reduce(
      (sum, session) => sum + (session.childWords || 0),
      0
    );
    const totalStories = completedSessions.length;
    const averageScore =
      completedSessions.length > 0
        ? Math.round(
            completedSessions.reduce(
              (sum, session) => sum + (session.overallScore || 0),
              0
            ) / completedSessions.length
          )
        : 0;
    const bestScore = Math.max(
      ...completedSessions.map((session) => session.overallScore || 0),
      0
    );
    const completionRate =
      allSessions.length > 0
        ? Math.round((completedSessions.length / allSessions.length) * 100)
        : 0;

    // Get monthly stats
    const monthlyStats = await StorySession.aggregate([
      {
        $match: {
          childId: userId,
          createdAt: { $gte: monthStart },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          storiesCreated: { $sum: 1 },
          wordsWritten: { $sum: '$childWords' },
          avgScore: { $avg: '$overallScore' },
          daysActive: {
            $addToSet: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
          },
        },
      },
    ]);

    const monthlyData = monthlyStats[0] || {
      storiesCreated: 0,
      wordsWritten: 0,
      avgScore: 0,
      daysActive: [],
    };

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
          stories: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          words: { $sum: '$childWords' },
          avgScore: {
            $avg: {
              $cond: [{ $eq: ['$status', 'completed'] }, '$overallScore', null],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Create 7-day progress array
    const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = weeklyStats.find((stat) => stat._id === dateStr);
      return {
        date: dateStr,
        stories: dayData?.stories || 0,
        words: dayData?.words || 0,
        score: dayData?.avgScore || 0,
      };
    });

    // Get achievements
    const achievements = await Achievement.find({ userId })
      .sort({ earnedAt: -1 })
      .limit(10)
      .lean();

    // Calculate skills (mock improvement for now - implement real tracking later)
    const skills = {
      grammar: {
        current: Math.min(
          averageScore + Math.floor(Math.random() * 10) - 5,
          100
        ),
        improvement: Math.floor(Math.random() * 5) + 1,
      },
      creativity: {
        current: Math.min(
          averageScore + Math.floor(Math.random() * 15) - 5,
          100
        ),
        improvement: Math.floor(Math.random() * 7) + 1,
      },
      vocabulary: {
        current: Math.min(
          averageScore + Math.floor(Math.random() * 12) - 3,
          100
        ),
        improvement: Math.floor(Math.random() * 4) + 1,
      },
      storytelling: {
        current: Math.min(
          averageScore + Math.floor(Math.random() * 8) - 2,
          100
        ),
        improvement: Math.floor(Math.random() * 6) + 1,
      },
    };

    // Generate goals based on current progress
    const goals = [
      {
        id: 'monthly_stories',
        title: 'Complete 5 Stories This Month',
        target: 5,
        current: monthlyData.storiesCreated,
        type: 'stories' as const,
      },
      {
        id: 'word_milestone',
        title: 'Write 1,000 Words',
        target: 1000,
        current: Math.min(totalWords % 1000, totalWords),
        type: 'words' as const,
      },
      {
        id: 'writing_streak',
        title: 'Maintain 7-Day Streak',
        target: 7,
        current: user.writingStreak || 0,
        type: 'streak' as const,
      },
      {
        id: 'quality_score',
        title: 'Achieve 90% Average Score',
        target: 90,
        current: averageScore,
        type: 'score' as const,
      },
    ];

    return NextResponse.json({
      success: true,
      progress: {
        overview: {
          totalStoriesCreated: totalStories,
          totalWordsWritten: totalWords,
          averageWordsPerStory:
            totalStories > 0 ? Math.round(totalWords / totalStories) : 0,
          writingStreak: user.writingStreak || 0,
          completionRate,
          bestScore,
          averageScore,
        },
        monthly: {
          storiesCreated: monthlyData.storiesCreated,
          wordsWritten: monthlyData.wordsWritten,
          averageScore: Math.round(monthlyData.avgScore || 0),
          daysActive: monthlyData.daysActive.length,
        },
        weekly: weeklyProgress,
        achievements: achievements.map((achievement) => ({
          id: achievement._id,
          title: achievement.title,
          description: achievement.description,
          earnedAt: achievement.earnedAt,
          category: achievement.category,
        })),
        skills,
        goals,
      },
    });
  } catch (error) {
    console.error('Error fetching progress data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress data' },
      { status: 500 }
    );
  }
}
