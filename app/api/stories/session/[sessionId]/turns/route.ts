// app/api/stories/session/[sessionId]/turns/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import Turn from '@/models/Turn';
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

    console.log('Fetching turns for sessionId:', sessionId);

    // First, find the actual story session to get the real _id
    let storySession = null;
    let actualSessionId = null;

    // Try to find by MongoDB ObjectId first
    if (mongoose.Types.ObjectId.isValid(sessionId)) {
      storySession = await StorySession.findOne({
        _id: sessionId,
        childId: session.user.id,
      });
      actualSessionId = sessionId;
    }

    // If not found by ObjectId, try by storyNumber
    if (!storySession && !isNaN(Number(sessionId))) {
      storySession = await StorySession.findOne({
        storyNumber: Number(sessionId),
        childId: session.user.id,
      });
      actualSessionId = storySession?._id?.toString();
    }

    if (!storySession || !actualSessionId) {
      console.log('Story session not found for:', sessionId);
      return NextResponse.json(
        { error: 'Story session not found' },
        { status: 404 }
      );
    }

    console.log('Found story session, fetching turns for:', actualSessionId);

    // Get all turns for this session using the actual MongoDB _id
    const turns = await Turn.find({ sessionId: actualSessionId })
      .sort({ turnNumber: 1 })
      .lean();

    console.log('Found turns:', turns.length);

    return NextResponse.json({
      success: true,
      turns,
    });
  } catch (error) {
    console.error('Error fetching story turns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story turns' },
      { status: 500 }
    );
  }
}
