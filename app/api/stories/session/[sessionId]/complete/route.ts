// app/api/stories/session/[sessionId]/complete/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
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

    // Find story session with flexible ID lookup (same as existing pattern)
    let storySession = null;
    let actualSessionId = null;

    if (mongoose.Types.ObjectId.isValid(sessionId)) {
      storySession = await StorySession.findOne({
        _id: sessionId,
        childId: session.user.id,
        status: 'completed', // Only completed stories
      });
      actualSessionId = sessionId;
    } else if (!isNaN(Number(sessionId))) {
      storySession = await StorySession.findOne({
        storyNumber: Number(sessionId),
        childId: session.user.id,
        status: 'completed',
      });
      actualSessionId = storySession?._id?.toString();
    }

    if (!storySession || !actualSessionId) {
      return NextResponse.json(
        { error: 'Completed story not found' },
        { status: 404 }
      );
    }

    // Get all turns to rebuild the story content
    const turns = await Turn.find({ sessionId: actualSessionId })
      .sort({ turnNumber: 1 })
      .lean();

    // Build complete story content
    const storyParts = [];
    
    if (storySession.aiOpening) {
      storyParts.push(storySession.aiOpening);
    }

    turns.forEach(turn => {
      if (turn.childInput) {
        storyParts.push(turn.childInput);
      }
      if (turn.aiResponse) {
        storyParts.push(turn.aiResponse);
      }
    });

    const completeStory = {
      _id: storySession._id,
      title: storySession.title,
      content: storyParts.join('\n\n'),
      elements: storySession.elements,
      totalWords: storySession.totalWords,
      childWords: storySession.childWords,
      
      // Assessment scores (from either new assessment field or legacy fields)
      grammarScore: storySession.assessment?.grammarScore || storySession.grammarScore || 0,
      creativityScore: storySession.assessment?.creativityScore || storySession.creativityScore || 0,
      overallScore: storySession.assessment?.overallScore || storySession.overallScore || 0,
      aifeedback: storySession.assessment?.feedback || storySession.feedback || 'No feedback available',
      
      publishedAt: storySession.updatedAt,
    };

    return NextResponse.json({
      success: true,
      story: completeStory,
    });

  } catch (error) {
    console.error('Error fetching completed story:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story' },
      { status: 500 }
    );
  }
}