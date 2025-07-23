// app/api/stories/session/[sessionId]/draft/route.ts
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
    const body = await request.json();
    const { draftContent, turnNumber } = body;

    if (!draftContent || !turnNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Update session with draft
    const updatedSession = await StorySession.findOneAndUpdate(
      {
        _id: sessionId,
        childId: session.user.id,
        status: 'active'
      },
      {
        $set: {
          [`draft.turn${turnNumber}`]: draftContent,
          'draft.lastSaved': new Date()
        }
      },
      { new: true }
    );

    if (!updatedSession) {
      return NextResponse.json(
        { error: 'Story session not found or not active' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Draft saved successfully'
    });

  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    );
  }
}