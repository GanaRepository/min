import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get current month start
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get the current user
    const user = (await User.findById(session.user.id).lean()) as any;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Use session.user.id consistently since it's the same as user._id
    const userId = session.user.id;

    // Count actual stories created this month
    const allStoriesThisMonth = await StorySession.find({
      childId: userId,
      createdAt: { $gte: currentMonthStart },
    }).lean();

    const regularStoriesThisMonth = allStoriesThisMonth.filter(
      (story) => !story.isUploadedForAssessment
    );

    const assessmentStoriesThisMonth = allStoriesThisMonth.filter(
      (story) => story.isUploadedForAssessment === true
    );

    const competitionStoriesThisMonth = allStoriesThisMonth.filter(
      (story) => story.competitionEntries && story.competitionEntries.length > 0
    );

    // Get all stories for this user (not just this month)
    const allUserStories = await StorySession.find({
      childId: userId,
    }).lean();

    const debugData = {
      user: {
        id: user._id,
        email: user.email || '',
        storiesCreatedThisMonth: user.storiesCreatedThisMonth || 0,
        assessmentUploadsThisMonth: user.assessmentUploadsThisMonth || 0,
        competitionEntriesThisMonth: user.competitionEntriesThisMonth || 0,
        lastMonthlyReset: user.lastMonthlyReset || null,
      },
      currentMonth: {
        start: currentMonthStart,
        end: now,
      },
      actualCounts: {
        totalStoriesAllTime: allUserStories.length,
        totalStoriesThisMonth: allStoriesThisMonth.length,
        regularStoriesThisMonth: regularStoriesThisMonth.length,
        assessmentStoriesThisMonth: assessmentStoriesThisMonth.length,
        competitionStoriesThisMonth: competitionStoriesThisMonth.length,
      },
      userModelFields: {
        storiesCreatedThisMonth: user.storiesCreatedThisMonth || 0,
        assessmentUploadsThisMonth: user.assessmentUploadsThisMonth || 0,
        competitionEntriesThisMonth: user.competitionEntriesThisMonth || 0,
      },
      storiesBreakdown: {
        allStoriesThisMonth: allStoriesThisMonth.map((story) => ({
          id: story._id,
          title: story.title,
          createdAt: story.createdAt,
          isUploadedForAssessment: story.isUploadedForAssessment,
          hasCompetitionEntries: !!(
            story.competitionEntries && story.competitionEntries.length > 0
          ),
          status: story.status,
        })),
        allStoriesAllTime: allUserStories.map((story) => ({
          id: story._id,
          title: story.title,
          createdAt: story.createdAt,
          isUploadedForAssessment: story.isUploadedForAssessment,
          hasCompetitionEntries: !!(
            story.competitionEntries && story.competitionEntries.length > 0
          ),
          status: story.status,
        })),
      },
      mismatch: {
        storiesMismatch:
          (user.storiesCreatedThisMonth || 0) !==
          regularStoriesThisMonth.length,
        assessmentMismatch:
          (user.assessmentUploadsThisMonth || 0) !==
          assessmentStoriesThisMonth.length,
        competitionMismatch:
          (user.competitionEntriesThisMonth || 0) !==
          competitionStoriesThisMonth.length,
      },
    };

    return NextResponse.json(debugData);
  } catch (error) {
    console.error('Error in debug stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to get debug stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
