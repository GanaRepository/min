import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import { ComprehensiveAssessmentEngine } from '@/lib/ai/comprehensive-assessment-engine';
import mongoose from 'mongoose';

// Helper function to generate detailed teacher comment
function generateDetailedTeacherComment(assessment: any): string {
  const overallScore = assessment.overallScore;
  const integrityStatus = assessment.integrityAnalysis.overallStatus;

  // Handle AI detection cases first
  if (integrityStatus === 'FAIL') {
    return `This submission requires attention to ensure authentic student work. Please focus on developing your own creative writing abilities through personal expression and original ideas. Remember that the goal is to develop your unique voice as a writer.`;
  }

  // Handle integrity warnings
  if (integrityStatus === 'WARNING') {
    return `Your story shows creativity and effort. To strengthen your writing further, focus on developing your authentic personal voice and expressing your unique ideas and experiences. Continue practicing to build your individual writing style.`;
  }

  // Generate positive, detailed feedback for authentic work
  const strengths =
    assessment.comprehensiveFeedback.strengths?.slice(0, 2).join(' ') ||
    'Your creativity shows through in this story.';
  const improvements =
    assessment.comprehensiveFeedback.areasForEnhancement?.[0] ||
    'continue developing your writing skills';

  if (overallScore >= 90) {
    return `Outstanding work on your story! ${strengths} Your writing demonstrates exceptional skill across multiple areas. To make your writing even stronger, ${improvements.toLowerCase()}. This is impressive creative writing that shows real talent and dedication.`;
  } else if (overallScore >= 80) {
    return `Excellent story! ${strengths} You're showing strong writing skills and creative thinking. Focus on ${improvements.toLowerCase()} to take your writing to the next level. Your imagination and effort really shine through in this piece.`;
  } else if (overallScore >= 70) {
    return `Good work on your story! I can see your creativity and effort coming through. ${strengths} Work on ${improvements.toLowerCase()} to improve your storytelling. Keep writing and exploring your imagination!`;
  } else if (overallScore >= 60) {
    return `Nice effort on your story! You have some good creative ideas that show promise. Focus on ${improvements.toLowerCase()} to strengthen your writing. Remember, every story you write helps you become a better writer.`;
  } else {
    return `Keep practicing your writing! Every story you create helps you improve your skills. Try focusing on ${improvements.toLowerCase()}. Your imagination is valuable - keep using it to create stories!`;
  }
}

export async function POST(
  request: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const { storyId } = params;
    await connectToDatabase();

    console.log('🎯 COMPREHENSIVE Assessment request for story:', storyId);

    // Find the story session
    let storySession = null;
    let actualSessionId = storyId;

    if (mongoose.Types.ObjectId.isValid(storyId)) {
      storySession = await StorySession.findOne({
        _id: storyId,
        childId: session.user.id,
      });
    } else if (!isNaN(Number(storyId))) {
      storySession = await StorySession.findOne({
        storyNumber: Number(storyId),
        childId: session.user.id,
      });
      actualSessionId = storySession?._id?.toString() || storyId;
    }

    if (!storySession) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Only assess completed stories
    if (storySession.status !== 'completed') {
      return NextResponse.json(
        { error: 'Story must be completed before assessment' },
        { status: 400 }
      );
    }

    console.log(
      '📝 Story is completed, generating COMPREHENSIVE assessment...'
    );

    // Get all story content
    let storyContent = '';

    if (storySession.isUploadedForAssessment) {
      // For uploaded stories
      storyContent = storySession.aiOpening || storySession.content || '';
    } else {
      // For collaborative stories, get all child inputs
      const turns = await Turn.find({ sessionId: actualSessionId })
        .sort({ turnNumber: 1 })
        .lean();

      const childInputs = turns
        .filter((turn: any) => turn.childInput?.trim())
        .map((turn: any) => turn.childInput.trim());

      storyContent = childInputs.join('\n\n');
    }

    if (!storyContent.trim()) {
      return NextResponse.json(
        { error: 'No story content found for assessment' },
        { status: 400 }
      );
    }

    console.log(
      `📊 Assessing ${storyContent.length} characters with COMPREHENSIVE system`
    );

    try {
      // Generate comprehensive assessment with advanced AI detection
      const assessment =
        await ComprehensiveAssessmentEngine.performCompleteAssessment(
          storyContent,
          {
            childAge: 10, // Default age
            isCollaborativeStory: !storySession.isUploadedForAssessment,
            storyTitle: storySession.title || 'Untitled Story',
            expectedGenre: 'creative',
          }
        );

      console.log('✅ COMPREHENSIVE Assessment completed successfully');
      console.log(`📈 Overall Score: ${assessment.overallScore}%`);
      console.log(
        `🔒 Integrity Status: ${assessment.integrityAnalysis.overallStatus}`
      );
      console.log(
        `🤖 AI Detection: ${assessment.integrityAnalysis.aiDetection.aiLikelihood}`
      );

      // Prepare comprehensive assessment data
      const assessmentData = {
        // NEW: Complete comprehensive assessment
        comprehensiveAssessment: assessment,

        // Core scores for compatibility
        overallScore: assessment.overallScore,
        grammarScore: assessment.coreWritingSkills.grammar.score,
        creativityScore: assessment.coreWritingSkills.creativity.score,
        vocabularyScore: assessment.coreWritingSkills.vocabulary.score,
        structureScore: assessment.coreWritingSkills.structure.score,
        characterDevelopmentScore:
          assessment.storyDevelopment.characterDevelopment.score,
        plotDevelopmentScore: assessment.storyDevelopment.plotDevelopment.score,
        readingLevel: assessment.ageAnalysis.readingLevel,

        // Educational feedback - Enhanced with detailed teacher-style comments
        feedback: generateDetailedTeacherComment(assessment),
        strengths: assessment.comprehensiveFeedback.strengths,
        improvements: assessment.comprehensiveFeedback.areasForEnhancement,
        nextSteps: assessment.comprehensiveFeedback.nextSteps,

        // Integrity analysis - Complete
        integrityAnalysis: {
          aiDetection: assessment.integrityAnalysis.aiDetection,
          plagiarismCheck: assessment.integrityAnalysis.plagiarismCheck,
          overallStatus: assessment.integrityAnalysis.overallStatus,
          message: assessment.integrityAnalysis.message,
          recommendation: assessment.integrityAnalysis.recommendation,
        },

        // Legacy compatibility
        aiDetectionScore:
          assessment.integrityAnalysis.aiDetection.humanLikeScore,
        plagiarismScore:
          assessment.integrityAnalysis.plagiarismCheck.originalityScore,

        // Metadata
        assessmentVersion: '6.0-comprehensive',
        assessmentDate: new Date().toISOString(),
        assessmentType: storySession.isUploadedForAssessment
          ? 'uploaded'
          : 'collaborative',
      };

      // Determine session status based on integrity
      let sessionStatus = 'completed';
      let integrityFlags = null;

      if (assessment.integrityAnalysis.overallStatus === 'FAIL') {
        sessionStatus = 'flagged';
        integrityFlags = {
          needsReview: true,
          aiDetectionLevel:
            assessment.integrityAnalysis.aiDetection.aiLikelihood,
          plagiarismRisk:
            assessment.integrityAnalysis.plagiarismCheck.riskLevel,
          overallRisk: assessment.integrityAnalysis.overallStatus,
          flaggedAt: new Date(),
          reviewStatus: 'pending_mentor_review',
        };
      } else if (assessment.integrityAnalysis.overallStatus === 'WARNING') {
        sessionStatus = 'review';
      }

      // Update story session with assessment
      const updateData = {
        assessment: assessmentData,
        overallScore: assessment.overallScore,
        grammarScore: assessment.coreWritingSkills.grammar.score,
        creativityScore: assessment.coreWritingSkills.creativity.score,
        lastAssessedAt: new Date(),
        assessmentAttempts: (storySession.assessmentAttempts || 0) + 1,
        status: sessionStatus,
        integrityStatus: assessment.integrityAnalysis.overallStatus,
        aiDetectionScore:
          assessment.integrityAnalysis.aiDetection.humanLikeScore,
        plagiarismScore:
          assessment.integrityAnalysis.plagiarismCheck.originalityScore,
        ...(integrityFlags && { integrityFlags }),
      };

      await StorySession.findByIdAndUpdate(actualSessionId, updateData);

      console.log('💾 COMPREHENSIVE Assessment saved to database');

      return NextResponse.json({
        success: true,
        message: 'Comprehensive assessment completed successfully',
        assessment: assessmentData,
        integrityCheck: {
          status: assessment.integrityAnalysis.overallStatus,
          aiDetection: assessment.integrityAnalysis.aiDetection.aiLikelihood,
          humanLikeScore:
            assessment.integrityAnalysis.aiDetection.humanLikeScore,
        },
      });
    } catch (assessmentError) {
      console.error(
        '❌ COMPREHENSIVE Assessment generation failed:',
        assessmentError
      );

      // Mark story as needing manual assessment
      await StorySession.findByIdAndUpdate(actualSessionId, {
        assessmentAttempts: (storySession.assessmentAttempts || 0) + 1,
        lastAssessmentError:
          assessmentError instanceof Error
            ? assessmentError.message
            : 'Unknown error',
        needsManualAssessment: true,
        status: 'completed',
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Assessment generation failed',
          message:
            'Your story has been saved but assessment could not be completed automatically. Please try again later.',
          needsManualAssessment: true,
          details:
            assessmentError instanceof Error
              ? assessmentError.message
              : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ COMPREHENSIVE Assessment endpoint error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate comprehensive assessment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve existing assessment
export async function GET(
  request: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const { storyId } = params;
    await connectToDatabase();

    // Find the story session
    let storySession = null;

    if (mongoose.Types.ObjectId.isValid(storyId)) {
      storySession = await StorySession.findOne({
        _id: storyId,
        childId: session.user.id,
      }).lean();
    } else if (!isNaN(Number(storyId))) {
      storySession = await StorySession.findOne({
        storyNumber: Number(storyId),
        childId: session.user.id,
      }).lean();
    }

    if (!storySession) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    if (!(storySession as any).assessment) {
      return NextResponse.json(
        { error: 'No assessment available for this story' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      assessment: (storySession as any).assessment,
    });
  } catch (error) {
    console.error('❌ Get comprehensive assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve assessment' },
      { status: 500 }
    );
  }
}
