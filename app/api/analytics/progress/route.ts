// app/api/analytics/progress/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import PublishedStory from '@/models/PublishedStory';
import StorySession from '@/models/StorySession';

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

    // Get published stories
    const publishedStories = await PublishedStory.find({ childId: session.user.id })
      .sort({ publishedAt: -1 })
      .lean();

    // Get all sessions (including active ones)
    const allSessions = await StorySession.find({ childId: session.user.id })
      .sort({ updatedAt: -1 })
      .lean();

    // Calculate analytics
    const totalWords = publishedStories.reduce((sum, story) => sum + story.totalWords, 0);
    const averageScore = publishedStories.length > 0
      ? Math.round(publishedStories.reduce((sum, story) => sum + story.overallScore, 0) / publishedStories.length)
      : 0;

    // Generate weekly activity (last 7 days)
    const weeklyActivity = generateWeeklyActivity(allSessions);

    // Calculate skill progress
    const skillProgress = calculateSkillProgress(publishedStories);

    // Genre breakdown
    const genreBreakdown = calculateGenreBreakdown(allSessions);

    // Mock achievements and goals (in real app, these would be stored in database)
    const achievements = [
      { id: '1', name: '7-Day Streak', description: 'Keep writing daily!', unlockedAt: new Date().toISOString() },
      { id: '2', name: '10th Story', description: 'Double digits!', unlockedAt: new Date().toISOString() },
      { id: '3', name: 'Grammar Expert', description: '90%+ grammar score', unlockedAt: new Date().toISOString() },
    ];

    const goals = [
      { id: '1', title: 'Write 3 stories this month', progress: publishedStories.length, target: 3, type: 'stories' },
      { id: '2', title: 'Improve grammar to 90%', progress: skillProgress.grammar, target: 90, type: 'skill' },
      { id: '3', title: 'Keep 30-day streak', progress: 7, target: 30, type: 'streak' }, // Mock data
    ];

    return NextResponse.json({
      success: true,
      progress: {
        totalWords,
        storiesCompleted: publishedStories.length,
        writingStreak: 7, // Mock data - in real app calculate from daily writing
        averageScore,
        weeklyActivity,
        skillProgress,
        genreBreakdown,
        achievements,
        goals
      }
    });

  } catch (error) {
    console.error('Error fetching progress data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress data' },
      { status: 500 }
    );
  }
}

function generateWeeklyActivity(sessions: any[]) {
  const activity = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Mock data - in real app, calculate actual words written per day
    const words = Math.floor(Math.random() * 200) + 50;
    
    activity.push({
      date: date.toISOString().split('T')[0],
      words
    });
  }
  
  return activity;
}

function calculateSkillProgress(stories: any[]) {
  if (stories.length === 0) {
    return { grammar: 75, creativity: 80 };
  }

  const grammar = Math.round(
    stories.reduce((sum, story) => sum + story.grammarScore, 0) / stories.length
  );
  const creativity = Math.round(
    stories.reduce((sum, story) => sum + story.creativityScore, 0) / stories.length
  );

  return { grammar, creativity };
}

function calculateGenreBreakdown(sessions: any[]) {
  const genreCounts: Record<string, number> = {};
  
  sessions.forEach(session => {
    const genre = session.elements?.genre || 'Unknown';
    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
  });

  const total = sessions.length;
  return Object.entries(genreCounts).map(([genre, count]) => ({
    genre,
    count,
    percentage: Math.round((count / total) * 100)
  })).sort((a, b) => b.count - a.count);
}