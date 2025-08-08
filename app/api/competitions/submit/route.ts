// app/api/competitions/submit/route.ts - Submit Story to Competition
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import { competitionManager } from '@/lib/competition-manager';
import { checkMonthlyUsage } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { storyId, competitionId } = body;

    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check monthly usage limits
    const usageCheck = await checkMonthlyUsage(session.user.id, 'competition-submit');
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { error: usageCheck.message },
        { status: 429 }
      );
    }

    // Submit story to competition
    const submission = await competitionManager.submitStory(storyId, session.user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Story submitted to competition successfully',
      submission,
    });

  } catch (error: any) {
    console.error('Error submitting to competition:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit story to competition' },
      { status: 500 }
    );
  }
}
