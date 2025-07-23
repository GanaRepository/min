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

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify session belongs to user
    const storySession = await StorySession.findOne({
      _id: sessionId,
      childId: session.user.id
    });

    if (!storySession) {
      return NextResponse.json(
        { error: 'Story session not found' },
        { status: 404 }
      );
    }

    // Get all turns for this session
    const turns = await Turn.find({ sessionId })
      .sort({ turnNumber: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      turns
    });

  } catch (error) {
    console.error('Error fetching story turns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story turns' },
      { status: 500 }
    );
  }
}