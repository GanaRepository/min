// app/api/stories/session/[sessionId]/pause/route.ts
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

    console.log('Pausing story with ID:', sessionId);

    let query = {};

    // Build query based on ID type
    if (mongoose.Types.ObjectId.isValid(sessionId)) {
      query = { _id: sessionId, childId: session.user.id, status: 'active' };
    } else if (!isNaN(Number(sessionId))) {
      query = {
        storyNumber: Number(sessionId),
        childId: session.user.id,
        status: 'active',
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
        status: 'paused',
        pausedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedSession) {
      return NextResponse.json(
        { error: 'Story session not found or cannot be paused' },
        { status: 404 }
      );
    }

    console.log('Story paused successfully:', updatedSession._id);

    return NextResponse.json({
      success: true,
      message: 'Story paused successfully',
    });
  } catch (error) {
    console.error('Error pausing story:', error);
    return NextResponse.json(
      { error: 'Failed to pause story' },
      { status: 500 }
    );
  }
}
