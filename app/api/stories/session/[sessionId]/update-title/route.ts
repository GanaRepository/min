// app/api/stories/session/[sessionId]/update-title/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title } = await request.json();

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Valid title is required' },
        { status: 400 }
      );
    }

    if (title.trim().length > 100) {
      return NextResponse.json(
        { error: 'Title too long (max 100 characters)' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const storySession = await StorySession.findOne({
      _id: params.sessionId,
      childId: session.user.id,
    });

    if (!storySession) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    storySession.title = title.trim();
    await storySession.save();

    return NextResponse.json({
      success: true,
      title: storySession.title,
      message: 'Title updated successfully',
    });
  } catch (error) {
    console.error('Error updating story title:', error);
    return NextResponse.json(
      { error: 'Failed to update title' },
      { status: 500 }
    );
  }
}
