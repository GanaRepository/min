// app/api/stories/session/[sessionId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const { sessionId } = params;
    await connectToDatabase();

    let storySession = null;
    // Try to find by ObjectId first
    if (mongoose.Types.ObjectId.isValid(sessionId)) {
      storySession = await StorySession.findOne({
        _id: sessionId,
        childId: session.user.id,
      }).lean();
    }
    // If not found, try to find by storyNumber
    if (!storySession && !isNaN(Number(sessionId))) {
      storySession = await StorySession.findOne({
        storyNumber: Number(sessionId),
        childId: session.user.id,
      }).lean();
    }
    if (!storySession) {
      return NextResponse.json(
        { error: 'Story session not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      session: storySession,
    });
  } catch (error) {
    console.error('Error fetching story session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story session' },
      { status: 500 }
    );
  }
}
