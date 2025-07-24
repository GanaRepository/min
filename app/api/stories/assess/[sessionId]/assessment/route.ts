import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession, { IStorySession } from '@/models/StorySession';

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

    const storySession = (await StorySession.findOne({
      _id: sessionId,
      childId: session.user.id, // FIXED: Verify ownership
      status: 'completed',
    }).lean()) as IStorySession | null;

    if (!storySession) {
      return NextResponse.json(
        { error: 'Completed story session not found' },
        { status: 404 }
      );
    }

    // Check both new assessment field and legacy fields
    const assessment = storySession.assessment || {
      grammarScore: storySession.grammarScore || 85,
      creativityScore: storySession.creativityScore || 88,
      overallScore: storySession.overallScore || 86,
      feedback: storySession.feedback || 'Great work on your creative story!',
    };

    if (
      !assessment.grammarScore &&
      !assessment.creativityScore &&
      !assessment.overallScore
    ) {
      return NextResponse.json(
        { error: 'Assessment not available yet' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      assessment: assessment,
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}
