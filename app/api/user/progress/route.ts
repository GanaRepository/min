// app/api/user/progress/route.ts - COMPLETELY FIXED
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userSession = await getServerSession(authOptions);

    if (!userSession || userSession.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Unauthorized access. Children only.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'month';

    console.log(
      '📊 Fetching REAL progress data for user:',
      userSession.user.id
    );

    const childId = new mongoose.Types.ObjectId(userSession.user.id);

    // Get ALL story sessions for this child
    const storySessions = await StorySession.find({ childId }).sort({
      createdAt: -1,
    });

    console.log('📚 Found story sessions:', storySessions.length);

    // Calculate REAL overview statistics
    const totalStoriesCreated = storySessions.length;
    const completedStories = storySessions.filter(
      (s) => s.status === 'completed'
    );
    const totalWordsWritten = storySessions.reduce(
      (sum, session) => sum + (session.childWords || 0),
      0
    );
    const averageWordsPerStory =
      totalStoriesCreated > 0
        ? Math.round(totalWordsWritten / totalStoriesCreated)
        : 0;

    // FIXED: Get scores from direct fields (not nested assessment object)
    const allScores = completedStories
      .filter((story) => story.overallScore > 0) // Only stories with actual scores
      .map((story) => ({
        grammar: story.grammarScore || 0,
        creativity: story.creativityScore || 0,
        overall: story.overallScore || 0,
      }));

    console.log(
      '🎯 Found scores for',
      allScores.length,
      'completed stories:',
      allScores
    );

    let bestScore = 0;
    let averageScore = 0;

    if (allScores.length > 0) {
      bestScore = Math.max(...allScores.map((s) => s.overall));
      averageScore = Math.round(
        allScores.reduce((sum, score) => sum + score.overall, 0) /
          allScores.length
      );
    }

    // Get current period data based on timeframe
    const now = new Date();
    let timeStart: Date;

    if (timeframe === 'week') {
      timeStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === 'year') {
      timeStart = new Date(now.getFullYear(), 0, 1);
    } else {
      timeStart = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const periodStories = storySessions.filter((s) => s.createdAt >= timeStart);
    const periodCompletedStories = periodStories.filter(
      (s) => s.status === 'completed'
    );

    // Calculate period average score
    const periodScores = periodCompletedStories
      .filter((story) => story.overallScore > 0)
      .map((story) => story.overallScore);

    const periodAverageScore =
      periodScores.length > 0
        ? Math.round(
            periodScores.reduce((a, b) => a + b, 0) / periodScores.length
          )
        : 0;

    // Calculate REAL weekly data for chart (last 7 days)
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      const dayStories = storySessions.filter((s) => {
        const storyDate = new Date(s.createdAt).toISOString().split('T')[0];
        return storyDate === dateStr && s.status === 'completed';
      });

      const dayScores = dayStories
        .map((story) => story.overallScore || 0)
        .filter((score) => score > 0);

      return {
        date: dateStr,
        stories: dayStories.length,
        words: dayStories.reduce(
          (sum, story) => sum + (story.childWords || 0),
          0
        ),
        score:
          dayScores.length > 0
            ? Math.round(
                dayScores.reduce((a, b) => a + b, 0) / dayScores.length
              )
            : 0,
      };
    });

    // FIXED: Calculate REAL skills from actual scores
    const skills = {
      grammar: {
        current:
          allScores.length > 0
            ? Math.round(
                allScores.reduce((sum, score) => sum + score.grammar, 0) /
                  allScores.length
              )
            : 0,
        improvement: 0,
      },
      creativity: {
        current:
          allScores.length > 0
            ? Math.round(
                allScores.reduce((sum, score) => sum + score.creativity, 0) /
                  allScores.length
              )
            : 0,
        improvement: 0,
      },
      vocabulary: {
        current:
          allScores.length > 0
            ? Math.round(
                allScores.reduce((sum, score) => sum + score.grammar, 0) /
                  allScores.length
              )
            : 0,
        improvement: 0,
      },
      storytelling: {
        current:
          allScores.length > 0
            ? Math.round(
                allScores.reduce((sum, score) => sum + score.creativity, 0) /
                  allScores.length
              )
            : 0,
        improvement: 0,
      },
    };

    // Calculate writing streak
    const writingStreak = calculateWritingStreak(completedStories);

    const progressData = {
      overview: {
        totalStoriesCreated,
        totalWordsWritten,
        averageWordsPerStory,
        writingStreak,
        completionRate:
          totalStoriesCreated > 0
            ? Math.round((completedStories.length / totalStoriesCreated) * 100)
            : 0,
        bestScore,
        averageScore,
      },
      monthly: {
        storiesCreated: periodCompletedStories.length,
        wordsWritten: periodStories.reduce(
          (sum, story) => sum + (story.childWords || 0),
          0
        ),
        averageScore: periodAverageScore,
        daysActive: new Set(
          periodStories.map((s) => new Date(s.createdAt).toDateString())
        ).size,
      },
      weekly: weeklyData,
      achievements: generateAchievements(completedStories),
      skills,
      goals: generateGoals(
        totalStoriesCreated,
        totalWordsWritten,
        writingStreak,
        averageScore,
        periodCompletedStories.length
      ),
    };

    console.log('✅ REAL progress data calculated:', {
      totalStories: totalStoriesCreated,
      completedStories: completedStories.length,
      bestScore,
      averageScore,
      skills: skills,
      timeframe,
    });

    return NextResponse.json({
      success: true,
      progress: progressData,
    });
  } catch (error) {
    console.error('❌ Error fetching progress data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress data' },
      { status: 500 }
    );
  }
}

// Helper functions remain the same...
function calculateWritingStreak(completedStories: any[]): number {
  if (completedStories.length === 0) return 0;

  const today = new Date();
  let streak = 0;
  let currentDate = new Date(today);

  for (let i = 0; i < 30; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const hasStoryOnDate = completedStories.some((story) => {
      const storyDate = new Date(story.createdAt).toISOString().split('T')[0];
      return storyDate === dateStr;
    });

    if (hasStoryOnDate) {
      streak++;
    } else if (streak > 0) {
      break;
    }

    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

function generateAchievements(completedStories: any[]) {
  const achievements = [];

  if (completedStories.length >= 1) {
    achievements.push({
      id: '1',
      title: 'First Story',
      description: 'Completed your very first story!',
      earnedAt: completedStories[completedStories.length - 1].createdAt,
      category: 'writing' as const,
    });
  }

  return achievements;
}

function generateGoals(
  totalStories: number,
  totalWords: number,
  streak: number,
  avgScore: number,
  monthlyStories: number
) {
  return [
    {
      id: '1',
      title: 'Complete 5 Stories This Month',
      target: 5,
      current: monthlyStories,
      type: 'stories' as const,
    },
    {
      id: '2',
      title: 'Write 1,000 Words',
      target: 1000,
      current: Math.min(totalWords, 1000),
      type: 'words' as const,
    },
    {
      id: '3',
      title: 'Maintain 7-Day Streak',
      target: 7,
      current: streak,
      type: 'streak' as const,
    },
    {
      id: '4',
      title: 'Achieve 90% Average Score',
      target: 90,
      current: avgScore,
      type: 'score' as const,
    },
  ];
}
