// app/api/stories/usage-check/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { UsageManager } from '@/lib/usage-manager';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    // Auto-reset check before usage validation (now preserves Story Packs)
    const { checkAndPerformMonthlyReset } = await import('@/utils/autoReset');
    await checkAndPerformMonthlyReset();

    const body = await request.json();
    const { action, storyId } = body;

    // Validate action
    const validActions = [
      'create_story',
      'upload_assessment',
      'attempt_assessment',
      'enter_competition',
    ];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action specified' },
        { status: 400 }
      );
    }

    // Check usage limits for the specific action using UPDATED UsageManager
    let result;
    switch (action) {
      case 'create_story':
        result = await UsageManager.canCreateStory(session.user.id);
        break;
      case 'upload_assessment':
      case 'attempt_assessment':
        result = await UsageManager.canRequestAssessment(session.user.id);
        break;
      case 'enter_competition':
        result = await UsageManager.canEnterCompetition(session.user.id);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (result.allowed) {
      return NextResponse.json({
        allowed: true,
        message: 'Action permitted',
      });
    } else {
      return NextResponse.json({
        allowed: false,
        message: result.reason,
        needsUpgrade: result.upgradeRequired,
      });
    }
  } catch (error) {
    console.error('Error checking usage:', error);
    return NextResponse.json(
      {
        error: 'Failed to check usage limits',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
