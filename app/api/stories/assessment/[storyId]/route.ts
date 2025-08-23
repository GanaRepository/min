import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import { AIAssessmentEngine } from '@/lib/ai/ai-assessment-engine';
import mongoose from 'mongoose';

// Helper function to generate detailed teacher comment
function generateDetailedTeacherComment(
  assessment: any,
  sixteenStepAnalysis: any
): string {
  const overallScore = assessment.overallScore;
  const integrityRisk = assessment.integrityAnalysis.integrityRisk;
  const aiLikelihood =
    assessment.integrityAnalysis.aiDetectionResult.likelihood;

  // Handle AI detection cases first
  if (aiLikelihood === 'very_high' || aiLikelihood === 'high') {
    return `This content shows patterns consistent with AI generation. Academic integrity requires authentic, original work. The writing demonstrates technical proficiency but lacks the natural voice and personal perspective expected from human authors. Please rewrite using only your own ideas, experiences, and voice.`;
  }

  // Handle integrity concerns
  if (integrityRisk === 'critical' || integrityRisk === 'high') {
    return `While this story shows creativity, there are some concerns about originality that should be addressed. Focus on writing completely from your own imagination and experiences. The technical elements are good, but authentic voice development is essential.`;
  }

  // Generate positive, detailed feedback for authentic work
  const strengths = assessment.educationalFeedback.strengths
    .slice(0, 2)
    .join(' ');
  const improvements = assessment.educationalFeedback.improvements
    .slice(0, 1)
    .join('');

  if (overallScore >= 90) {
    return `Outstanding work on your story! ${strengths} Your writing demonstrates exceptional skill across multiple areas. ${improvements ? `To make your writing even stronger, ${improvements.toLowerCase()}` : 'Continue developing your unique voice and storytelling style.'} This is impressive creative writing that shows real talent and dedication.`;
  } else if (overallScore >= 80) {
    return `Excellent story! ${strengths} You're showing strong writing skills and creative thinking. ${improvements ? `Focus on ${improvements.toLowerCase()} to take your writing to the next level.` : 'Keep practicing to make your writing even stronger.'} Your imagination and effort really shine through in this piece.`;
  } else if (overallScore >= 70) {
    return `Good work on your story! I can see your creativity and effort coming through. ${strengths} ${improvements ? `Work on ${improvements.toLowerCase()} to improve your storytelling.` : 'Continue practicing to develop your skills further.'} Keep writing and exploring your imagination!`;
  } else if (overallScore >= 60) {
    return `Nice effort on your story! You have some good creative ideas that show promise. ${improvements ? `Focus on ${improvements.toLowerCase()} to strengthen your writing.` : 'Practice will help you develop your storytelling skills.'} Remember, every story you write helps you become a better writer.`;
  } else {
    return `Keep practicing your writing! Every story you create helps you improve your skills. ${improvements ? `Try focusing on ${improvements.toLowerCase()}.` : 'Work on developing your ideas and expressing them clearly.'} Your imagination is valuable - keep using it to create stories!`;
  }
}

// Helper function to generate integrity assessment
function generateIntegrityAssessment(integrityAnalysis: any): string {
  const aiLikelihood = integrityAnalysis.aiDetectionResult.likelihood;
  const integrityRisk = integrityAnalysis.integrityRisk;
  const originalityScore = integrityAnalysis.originalityScore;

  // Always return PASS for children but provide guidance
  if (aiLikelihood === 'very_high' || aiLikelihood === 'high') {
    return 'PASS - Story completed. Please focus on authentic, original writing for future assignments.';
  }

  if (integrityRisk === 'critical' || integrityRisk === 'high') {
    return 'PASS - Story completed. Work on developing your unique writing voice and personal storytelling style.';
  }

  if (originalityScore >= 85) {
    return 'PASS - Excellent original work! Your creativity and authentic voice shine through.';
  } else if (originalityScore >= 70) {
    return 'PASS - Good original content. Continue developing your unique storytelling style.';
  } else {
    return 'PASS - Story completed. Focus on writing from your own imagination and experiences.';
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

    console.log('🎯 Assessment request for story:', storyId);

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

    console.log('📝 Story is completed, generating assessment...');

    // Get all story content
    let storyContent = '';

    if (storySession.isUploadedForAssessment) {
      // For uploaded stories
      storyContent = storySession.aiOpening || '';
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

    console.log(`📊 Assessing ${storyContent.length} characters of content`);

    try {
      // Generate comprehensive assessment with 16-step analysis
      const assessment = await AIAssessmentEngine.performCompleteAssessment(
        storyContent,
        {
          childAge: 10, // Default age
          isCollaborativeStory: !storySession.isUploadedForAssessment,
          storyTitle: storySession.title || 'Untitled Story',
          expectedGenre: 'creative',
        }
      );

      // Generate detailed 16-step breakdown
      const sixteenStepAnalysis =
        await AIAssessmentEngine.performSixteenStepAnalysis(storyContent, {
          childAge: 10,
          storyTitle: storySession.title || 'Untitled Story',
          isCollaborativeStory: !storySession.isUploadedForAssessment,
          expectedGenre: 'creative',
        });

      console.log('✅ Assessment completed successfully');
      console.log(`📈 Overall Score: ${assessment.overallScore}%`);
      console.log(
        `🔒 Integrity Risk: ${assessment.integrityAnalysis.integrityRisk}`
      );
      console.log(
        `🤖 AI Detection: ${assessment.integrityAnalysis.aiDetectionResult.likelihood}`
      );

      // Prepare comprehensive assessment data
      const assessmentData = {
        // Core scores
        overallScore: assessment.overallScore,
        categoryScores: assessment.categoryScores,

        // Legacy compatibility fields
        grammarScore: assessment.categoryScores.grammar,
        creativityScore: assessment.categoryScores.creativity,
        vocabularyScore: assessment.categoryScores.vocabulary,
        structureScore: assessment.categoryScores.structure,
        characterDevelopmentScore:
          assessment.categoryScores.characterDevelopment,
        plotDevelopmentScore: assessment.categoryScores.plotDevelopment,
        readingLevel: assessment.categoryScores.readingLevel,

        // NEW: 16-Step Analysis Results
        sixteenStepAnalysis,

        // Educational feedback - Enhanced with detailed teacher-style comments
        feedback: generateDetailedTeacherComment(
          assessment,
          sixteenStepAnalysis
        ),
        strengths: assessment.educationalFeedback.strengths,
        improvements: assessment.educationalFeedback.improvements,
        educationalInsights: assessment.educationalFeedback.encouragement,

        // Integrity analysis - Enhanced
        integrityStatus: generateIntegrityAssessment(
          assessment.integrityAnalysis
        ),
        aiDetectionScore:
          assessment.integrityAnalysis.aiDetectionResult.overallScore || 0,
        plagiarismScore: assessment.integrityAnalysis.originalityScore || 100,
        integrityRisk: assessment.integrityAnalysis.integrityRisk || 'low',

        // Advanced fields
        integrityAnalysis: assessment.integrityAnalysis,
        recommendations: assessment.recommendations,
        progressTracking: assessment.progressTracking,

        // Metadata
        assessmentVersion: '3.0',
        assessmentDate: new Date().toISOString(),
        assessmentType: storySession.isUploadedForAssessment
          ? 'uploaded'
          : 'collaborative',
      };

      // Update story session with assessment
      const updateData = {
        assessment: assessmentData,
        overallScore: assessment.overallScore,
        grammarScore: assessment.categoryScores.grammar,
        creativityScore: assessment.categoryScores.creativity,
        lastAssessedAt: new Date(),
        assessmentAttempts: (storySession.assessmentAttempts || 0) + 1,
        // HUMAN-FIRST: Always keep as completed, add flags for mentor review
        status: 'completed',
        // Add integrity flags for mentor/admin review if concerns exist
        ...((assessment.integrityAnalysis?.integrityRisk === 'critical' ||
          assessment.integrityAnalysis?.integrityRisk === 'high' ||
          assessment.integrityAnalysis?.aiDetectionResult?.likelihood ===
            'high' ||
          assessment.integrityAnalysis?.aiDetectionResult?.likelihood ===
            'very_high') && {
          integrityFlags: {
            needsReview: true,
            aiDetectionLevel:
              assessment.integrityAnalysis.aiDetectionResult?.likelihood ||
              'unknown',
            plagiarismRisk:
              assessment.integrityAnalysis.plagiarismResult?.riskLevel || 'low',
            integrityRisk: assessment.integrityAnalysis.integrityRisk,
            flaggedAt: new Date(),
            reviewStatus: 'pending_mentor_review',
          },
        }),
      };

      await StorySession.findByIdAndUpdate(actualSessionId, updateData);

      console.log('💾 Assessment saved to database');

      return NextResponse.json({
        success: true,
        message: 'Assessment completed successfully',
        assessment: assessmentData,
      });
    } catch (assessmentError) {
      console.error('❌ Assessment generation failed:', assessmentError);

      // Mark story as needing manual assessment instead of providing fake scores
      await StorySession.findByIdAndUpdate(actualSessionId, {
        assessmentAttempts: (storySession.assessmentAttempts || 0) + 1,
        lastAssessmentError:
          assessmentError instanceof Error
            ? assessmentError.message
            : 'Unknown error',
        needsManualAssessment: true,
        status: 'completed', // Keep status as completed but flag for manual review
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Assessment generation failed',
          message:
            'Your story has been saved but assessment could not be completed automatically. Please contact support or try again later.',
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
    console.error('❌ Assessment endpoint error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate assessment',
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
    console.error('❌ Get assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve assessment' },
      { status: 500 }
    );
  }
}
