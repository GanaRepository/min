import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const storySession = await StorySession.findOne({
      _id: params.sessionId,
      childId: session.user.id,
    });

    if (!storySession) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    if (!storySession.assessment) {
      return NextResponse.json(
        { error: 'No assessment found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      storySession: {
        _id: storySession._id,
        title: storySession.title,
        storyNumber: storySession.storyNumber,
        status: storySession.status,
        totalWords: storySession.totalWords,
        childWords: storySession.childWords,
        assessmentAttempts: storySession.assessmentAttempts,
        isUploadedForAssessment: storySession.isUploadedForAssessment,
        createdAt: storySession.createdAt,
        assessment: {
          ...storySession.assessment,
          // Ensure all required fields exist
          grammarScore: storySession.assessment.grammarScore || 0,
          creativityScore: storySession.assessment.creativityScore || 0,
          vocabularyScore: storySession.assessment.vocabularyScore || 0,
          structureScore: storySession.assessment.structureScore || 0,
          characterDevelopmentScore:
            storySession.assessment.characterDevelopmentScore || 0,
          plotDevelopmentScore:
            storySession.assessment.plotDevelopmentScore || 0,
          overallScore: storySession.assessment.overallScore || 0,
          readingLevel: storySession.assessment.readingLevel || 'Not assessed',
          feedback: storySession.assessment.feedback || '',
          strengths: storySession.assessment.strengths || [],
          improvements: storySession.assessment.improvements || [],
          educationalInsights:
            storySession.assessment.educationalInsights || '',
          plagiarismScore: storySession.assessment.plagiarismScore || 0,
          aiDetectionScore: storySession.assessment.aiDetectionScore || 0,
          integrityRisk: storySession.assessment.integrityRisk || 'low',
          integrityAnalysis: storySession.assessment.integrityAnalysis || {
            originalityScore: 100,
            plagiarismScore: 0,
            aiDetectionScore: 0,
            integrityRisk: 'low',
          },
          assessmentDate:
            storySession.assessment.assessmentDate ||
            storySession.lastAssessedAt ||
            new Date().toISOString(),
          assessmentVersion: storySession.assessment.assessmentVersion || '2.0',
        },
      },
    });
  } catch (error) {
    console.error('Error fetching story assessment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}
