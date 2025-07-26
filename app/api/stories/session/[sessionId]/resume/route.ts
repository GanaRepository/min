// app/api/stories/session/[sessionId]/resume/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import mongoose from 'mongoose';

export async function POST(
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

    console.log('Resuming story with ID:', sessionId);

    let query = {};

    // Build query based on ID type
    if (mongoose.Types.ObjectId.isValid(sessionId)) {
      query = { _id: sessionId, childId: session.user.id, status: 'paused' };
    } else if (!isNaN(Number(sessionId))) {
      query = {
        storyNumber: Number(sessionId),
        childId: session.user.id,
        status: 'paused',
      };
    } else {
      return NextResponse.json(
        { error: 'Invalid session ID format' },
        { status: 400 }
      );
    }

    const updatedSession = await StorySession.findOneAndUpdate(
      query,
      {
        status: 'active',
        resumedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedSession) {
      return NextResponse.json(
        { error: 'Story session not found or cannot be resumed' },
        { status: 404 }
      );
    }

    console.log('Story resumed successfully:', updatedSession._id);

    return NextResponse.json({
      success: true,
      message: 'Story resumed successfully',
      session: updatedSession,
    });
  } catch (error) {
    console.error('Error resuming story:', error);
    return NextResponse.json(
      { error: 'Failed to resume story' },
      { status: 500 }
    );
  }
}
