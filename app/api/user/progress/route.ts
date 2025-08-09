import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'month';

    await connectToDatabase();

    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const stories = await StorySession.find({
      childId: session.user.id,
      createdAt: { $gte: startDate },
    }).sort({ createdAt: -1 });

    const allTimeStories = await StorySession.find({
      childId: session.user.id,
    }).sort({ createdAt: -1 });

    const assessedStories = stories.filter(
      (s) =>
        s.assessment?.overallScore !== undefined &&
        s.assessment.overallScore !== null
    );

    const allTimeAssessed = allTimeStories.filter(
      (s) =>
        s.assessment?.overallScore !== undefined &&
        s.assessment.overallScore !== null
    );

    const progress = {
      overview: {
        totalStoriesCreated: allTimeStories.length,
        totalWordsWritten: allTimeStories.reduce(
          (sum, s) => sum + (Number(s.childWords) || 0),
          0
        ),
        averageWordsPerStory:
          allTimeStories.length > 0
            ? Math.round(
                allTimeStories.reduce(
                  (sum, s) => sum + (Number(s.childWords) || 0),
                  0
                ) / allTimeStories.length
              )
            : 0,
        writingStreak: calculateWritingStreak(allTimeStories),
        completionRate:
          allTimeStories.length > 0
            ? Math.round(
                (allTimeStories.filter((s) => s.status === 'completed').length /
                  allTimeStories.length) *
                  100
              )
            : 0,
        bestScore:
          allTimeAssessed.length > 0
            ? Math.max(
                ...allTimeAssessed.map((s) =>
                  Number(s.assessment!.overallScore)
                )
              )
            : 0,
        averageScore:
          allTimeAssessed.length > 0
            ? Math.round(
                allTimeAssessed.reduce(
                  (sum, s) => sum + Number(s.assessment!.overallScore),
                  0
                ) / allTimeAssessed.length
              )
            : 0,
      },
      timeframe: {
        period: timeframe,
        storiesCreated: stories.length,
        wordsWritten: stories.reduce(
          (sum, s) => sum + (Number(s.childWords) || 0),
          0
        ),
        averageScore:
          assessedStories.length > 0
            ? Math.round(
                assessedStories.reduce(
                  (sum, s) => sum + Number(s.assessment!.overallScore),
                  0
                ) / assessedStories.length
              )
            : 0,
        daysActive: calculateActiveDays(stories),
      },
      skills: calculateSkillProgress(allTimeAssessed),
      recent: stories.slice(0, 5).map((s) => ({
        date: s.createdAt,
        title: s.title,
        words: Number(s.childWords) || 0,
        score: s.assessment?.overallScore
          ? Number(s.assessment.overallScore)
          : null,
      })),
      achievements: calculateAchievements(allTimeStories, allTimeAssessed),
    };

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

function calculateWritingStreak(stories: any[]): number {
  if (stories.length === 0) return 0;

  const sortedStories = stories.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let currentDate = new Date(today);

  for (let i = 0; i < 30; i++) {
    const dayStories = sortedStories.filter((story) => {
      const storyDate = new Date(story.createdAt);
      storyDate.setHours(0, 0, 0, 0);
      return storyDate.getTime() === currentDate.getTime();
    });

    if (dayStories.length > 0) {
      streak++;
    } else if (streak > 0) {
      break;
    }

    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

function calculateActiveDays(stories: any[]): number {
  const uniqueDays = new Set();
  stories.forEach((story) => {
    const date = new Date(story.createdAt);
    date.setHours(0, 0, 0, 0);
    uniqueDays.add(date.getTime());
  });
  return uniqueDays.size;
}

function calculateSkillProgress(assessedStories: any[]) {
  if (assessedStories.length === 0) {
    return {
      grammar: { current: 0, improvement: 0 },
      creativity: { current: 0, improvement: 0 },
      vocabulary: { current: 0, improvement: 0 },
      structure: { current: 0, improvement: 0 },
    };
  }

  const recent = assessedStories.slice(0, 3);
  const older = assessedStories.slice(3, 6);

  const currentAvg = {
    grammar:
      recent.length > 0
        ? Math.round(
            recent.reduce(
              (sum, s) => sum + (Number(s.assessment?.grammarScore) || 0),
              0
            ) / recent.length
          )
        : 0,
    creativity:
      recent.length > 0
        ? Math.round(
            recent.reduce(
              (sum, s) => sum + (Number(s.assessment?.creativityScore) || 0),
              0
            ) / recent.length
          )
        : 0,
    vocabulary:
      recent.length > 0
        ? Math.round(
            recent.reduce(
              (sum, s) => sum + (Number(s.assessment?.vocabularyScore) || 0),
              0
            ) / recent.length
          )
        : 0,
    structure:
      recent.length > 0
        ? Math.round(
            recent.reduce(
              (sum, s) => sum + (Number(s.assessment?.structureScore) || 0),
              0
            ) / recent.length
          )
        : 0,
  };

  const olderAvg =
    older.length > 0
      ? {
          grammar: Math.round(
            older.reduce(
              (sum, s) => sum + (Number(s.assessment?.grammarScore) || 0),
              0
            ) / older.length
          ),
          creativity: Math.round(
            older.reduce(
              (sum, s) => sum + (Number(s.assessment?.creativityScore) || 0),
              0
            ) / older.length
          ),
          vocabulary: Math.round(
            older.reduce(
              (sum, s) => sum + (Number(s.assessment?.vocabularyScore) || 0),
              0
            ) / older.length
          ),
          structure: Math.round(
            older.reduce(
              (sum, s) => sum + (Number(s.assessment?.structureScore) || 0),
              0
            ) / older.length
          ),
        }
      : currentAvg;

  return {
    grammar: {
      current: currentAvg.grammar,
      improvement: currentAvg.grammar - olderAvg.grammar,
    },
    creativity: {
      current: currentAvg.creativity,
      improvement: currentAvg.creativity - olderAvg.creativity,
    },
    vocabulary: {
      current: currentAvg.vocabulary,
      improvement: currentAvg.vocabulary - olderAvg.vocabulary,
    },
    structure: {
      current: currentAvg.structure,
      improvement: currentAvg.structure - olderAvg.structure,
    },
  };
}

function calculateAchievements(allStories: any[], assessedStories: any[]) {
  const achievements = [];

  if (allStories.length >= 1) {
    achievements.push({
      id: 'first_story',
      title: 'First Story',
      description: 'Completed your first story',
      category: 'writing',
      earnedAt: allStories[allStories.length - 1].createdAt,
    });
  }

  if (allStories.length >= 5) {
    achievements.push({
      id: 'five_stories',
      title: 'Storyteller',
      description: 'Written 5 stories',
      category: 'writing',
      earnedAt: allStories[allStories.length - 5].createdAt,
    });
  }

  const highScoreStories = assessedStories.filter(
    (s) => Number(s.assessment?.overallScore) >= 90
  );
  if (highScoreStories.length >= 1) {
    achievements.push({
      id: 'high_score',
      title: 'Excellence',
      description: 'Scored 90% or higher',
      category: 'quality',
      earnedAt: highScoreStories[0].createdAt,
    });
  }

  return achievements;
}
