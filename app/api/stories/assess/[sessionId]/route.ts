// app/api/stories/assess/[sessionId]/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import { collaborationEngine } from '@/lib/ai/collaboration';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import mongoose from 'mongoose';

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    await connectToDatabase();
    const { sessionId } = params;

    const userSession = await getServerSession(authOptions);
    if (!userSession || userSession.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    console.log('Generating assessment for sessionId:', sessionId);

    // Find the story session with flexible ID lookup
    let storySession = null;
    let actualSessionId = null;

    if (mongoose.Types.ObjectId.isValid(sessionId)) {
      storySession = await StorySession.findOne({
        _id: sessionId,
        childId: userSession.user.id,
      });
      actualSessionId = sessionId;
    } else if (!isNaN(Number(sessionId))) {
      storySession = await StorySession.findOne({
        storyNumber: Number(sessionId),
        childId: userSession.user.id,
      });
      actualSessionId = storySession?._id?.toString();
    }

    if (!storySession || !actualSessionId) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Only allow assessment if story is completed
    if (storySession.status !== 'completed') {
      return NextResponse.json(
        { error: 'Story not completed' },
        { status: 400 }
      );
    }

    // If assessment already exists, return it
    if (storySession.assessment) {
      return NextResponse.json({ assessment: storySession.assessment });
    }

    // Get all turns for the session using actual MongoDB _id
    const turns = await Turn.find({ sessionId: actualSessionId }).sort({ turnNumber: 1 });

    // Aggregate story content from child inputs only
    const storyContent = turns
      .filter((turn) => turn.childInput)
      .map((turn) => turn.childInput)
      .join(' ');

    const totalWords =
      storySession.childWords ||
      storyContent.split(/\s+/).filter((w) => w.length > 0).length;

    // Use the detailed assessment method
    const assessment = await collaborationEngine.generateAssessment(
      storyContent,
      storySession.elements || {
        genre: 'Adventure',
        character: 'Hero',
        setting: 'Forest',
        theme: 'Friendship',
        mood: 'Exciting',
        tone: 'Brave'
      },
      {
        totalWords,
        turnCount: turns.length,
        storyTheme: storySession.elements?.theme || 'Adventure',
        storyGenre: storySession.elements?.genre || 'Fantasy'
      }
    );

    // Save assessment to session
    await StorySession.findByIdAndUpdate(
      actualSessionId,
      {
        $set: {
          assessment: assessment,
          overallScore: assessment.overallScore,
          grammarScore: assessment.grammarScore,
          creativityScore: assessment.creativityScore,
          feedback: assessment.feedback,
          status: 'completed',
        },
      },
      { new: true }
    );

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error('Error generating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to generate assessment' },
      { status: 500 }
    );
  }
}