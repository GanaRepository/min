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

    const stories = await StorySession.find({ childId: session.user.id });
    const assessedStories = stories.filter((s) => s.assessment?.overallScore);
    const publishedStories = stories.filter((s) => s.isPublished);
    const competitionEntries = stories.filter(
      (s) => s.competitionEntries && s.competitionEntries.length > 0
    );

    const stats = {
      totalStories: stories.length,
      totalWords: stories.reduce((sum, s) => sum + (s.childWords || 0), 0),
      averageScore:
        assessedStories.length > 0
          ? Math.round(
              assessedStories.reduce(
                (sum, s) => sum + s.assessment.overallScore,
                0
              ) / assessedStories.length
            )
          : 0,
      publishedStories: publishedStories.length,
      competitionEntries: competitionEntries.reduce(
        (sum, s) => sum + s.competitionEntries.length,
        0
      ),
      achievements: assessedStories.filter(
        (s) => s.assessment.overallScore >= 90
      ).length, // Stories with 90%+ scores
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
