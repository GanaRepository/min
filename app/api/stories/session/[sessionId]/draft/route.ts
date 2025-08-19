// app/api/stories/session/[sessionId]/draft/route.ts - DRAFT SAVE API
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { sessionId } = params;
    const body = await request.json();
    const { draftContent } = body;

    if (!sessionId || !draftContent) {
      return NextResponse.json(
        { error: 'Session ID and draft content are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify session ownership and status
    const storySession = await StorySession.findOne({
      _id: sessionId,
      childId: session.user.id,
    });

    if (!storySession) {
      return NextResponse.json(
        { error: 'Story session not found' },
        { status: 404 }
      );
    }

    if (storySession.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot save drafts for completed stories' },
        { status: 400 }
      );
    }

    // Save draft content
    await StorySession.findByIdAndUpdate(sessionId, {
      draftContent: draftContent.trim(),
      lastDraftSaved: new Date(),
      updatedAt: new Date(),
    });

    console.log(
      `💾 Draft saved for session ${sessionId}: ${draftContent.length} characters`
    );

    return NextResponse.json({
      success: true,
      message: 'Draft saved successfully',
      savedAt: new Date(),
      draftLength: draftContent.trim().length,
    });
  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get story session with draft
    const storySession = await StorySession.findOne({
      _id: sessionId,
      childId: session.user.id,
    }).select('draftContent lastDraftSaved');

    if (!storySession) {
      return NextResponse.json(
        { error: 'Story session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      draftContent: storySession.draftContent || '',
      lastSaved: storySession.lastDraftSaved || null,
      hasDraft: !!storySession.draftContent,
    });
  } catch (error) {
    console.error('Error fetching draft:', error);
    return NextResponse.json(
      { error: 'Failed to fetch draft' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify session ownership
    const storySession = await StorySession.findOne({
      _id: sessionId,
      childId: session.user.id,
    });

    if (!storySession) {
      return NextResponse.json(
        { error: 'Story session not found' },
        { status: 404 }
      );
    }

    // Clear draft content
    await StorySession.findByIdAndUpdate(sessionId, {
      $unset: {
        draftContent: 1,
        lastDraftSaved: 1,
      },
      updatedAt: new Date(),
    });

    console.log(`🗑️ Draft cleared for session ${sessionId}`);

    return NextResponse.json({
      success: true,
      message: 'Draft cleared successfully',
    });
  } catch (error) {
    console.error('Error clearing draft:', error);
    return NextResponse.json(
      { error: 'Failed to clear draft' },
      { status: 500 }
    );
  }
}
