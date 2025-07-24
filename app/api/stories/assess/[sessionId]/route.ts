import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import { collaborationEngine } from '@/lib/ai/collaboration';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    await connectToDatabase();
    const { sessionId } = params;

    // Require authentication and child role
    const userSession = await getServerSession(authOptions);
    if (!userSession || userSession.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    // Find the story session and verify ownership
    const session = await StorySession.findOne({
      _id: sessionId,
      childId: userSession.user.id, // FIXED: Verify ownership
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Only allow assessment if story is completed
    if (session.status !== 'completed') {
      return NextResponse.json(
        { error: 'Story not completed' },
        { status: 400 }
      );
    }

    // If assessment already exists, return it
    if (session.assessment) {
      return NextResponse.json({ assessment: session.assessment });
    }

    // Get all turns for the session
    const turns = await Turn.find({ sessionId }).sort({ turnNumber: 1 });

    // Aggregate story content from child inputs only
    const storyContent = turns
      .filter((turn) => turn.childInput) // Only child inputs
      .map((turn) => turn.childInput)
      .join(' ');

    const totalWords =
      session.childWords ||
      storyContent.split(/\s+/).filter((w) => w.length > 0).length;

    // Generate assessment using AI logic
    const assessment = await collaborationEngine.generateAssessment(
      storyContent,
      totalWords
    );

    // Save assessment to session
    const updatedSession = await StorySession.findByIdAndUpdate(
      sessionId,
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
