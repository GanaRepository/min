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

    const body = await request.json();
    const { action, storyId } = body;

    // Validate action
    const validActions = ['create_story', 'upload_assessment', 'attempt_assessment', 'enter_competition'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action specified' },
        { status: 400 }
      );
    }

    // Check usage limits for the specific action
    const result = await UsageManager.enforceLimit(session.user.id, action, storyId);

    if (result.allowed) {
      return NextResponse.json({
        allowed: true,
        message: 'Action permitted',
      });
    } else {
      return NextResponse.json({
        allowed: false,
        message: result.message,
        needsUpgrade: result.needsUpgrade,
      });
    }

  } catch (error) {
    console.error('Error checking usage:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check usage limits',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}