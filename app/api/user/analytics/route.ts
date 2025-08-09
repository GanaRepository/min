import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get user's writing analytics
    const stories = await StorySession.find({ childId: session.user.id });

    const analytics = {
      overview: {
        totalStories: stories.length,
        completedStories: stories.filter(s => s.status === 'completed').length,
        totalWords: stories.reduce((sum, s) => sum + (s.childWords || 0), 0),
        averageWords: stories.length > 0 ? Math.round(stories.reduce((sum, s) => sum + (s.childWords || 0), 0) / stories.length) : 0,
        bestScore: Math.max(...stories.filter(s => s.assessment?.overallScore).map(s => s.assessment.overallScore), 0),
        averageScore: stories.filter(s => s.assessment?.overallScore).length > 0 
          ? Math.round(stories.filter(s => s.assessment?.overallScore).reduce((sum, s) => sum + s.assessment.overallScore, 0) / stories.filter(s => s.assessment?.overallScore).length)
          : 0,
      },
      monthly: {
        thisMonth: stories.filter(s => {
          const storyDate = new Date(s.createdAt);
          const now = new Date();
          return storyDate.getMonth() === now.getMonth() && storyDate.getFullYear() === now.getFullYear();
        }).length,
        wordsThisMonth: stories.filter(s => {
          const storyDate = new Date(s.createdAt);
          const now = new Date();
          return storyDate.getMonth() === now.getMonth() && storyDate.getFullYear() === now.getFullYear();
        }).reduce((sum, s) => sum + (s.childWords || 0), 0),
      },
      categories: {
        grammarAverage: stories.filter(s => s.assessment?.grammarScore).length > 0
          ? Math.round(stories.filter(s => s.assessment?.grammarScore).reduce((sum, s) => sum + s.assessment.grammarScore, 0) / stories.filter(s => s.assessment?.grammarScore).length)
          : 0,
        creativityAverage: stories.filter(s => s.assessment?.creativityScore).length > 0
          ? Math.round(stories.filter(s => s.assessment?.creativityScore).reduce((sum, s) => sum + s.assessment.creativityScore, 0) / stories.filter(s => s.assessment?.creativityScore).length)
          : 0,
        vocabularyAverage: stories.filter(s => s.assessment?.vocabularyScore).length > 0
          ? Math.round(stories.filter(s => s.assessment?.vocabularyScore).reduce((sum, s) => sum + s.assessment.vocabularyScore, 0) / stories.filter(s => s.assessment?.vocabularyScore).length)
          : 0,
      },
      recent: stories
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(s => ({
          id: s._id,
          title: s.title,
          createdAt: s.createdAt,
          status: s.status,
          words: s.childWords || 0,
          score: s.assessment?.overallScore || null,
        }))
    };

    return NextResponse.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}