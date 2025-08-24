import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import User from '@/models/User';
import { ComprehensiveAssessmentEngine } from '@/lib/ai/comprehensive-assessment-engine';

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  console.log(
    '🎯 ADVANCED AI ASSESSMENT API called for session:',
    params.sessionId
  );

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { sessionId } = params;
    const { isReassessment = false } = await request.json();

    await connectToDatabase();

    const storySession = await StorySession.findById(sessionId);
    if (!storySession) {
      return NextResponse.json(
        { error: 'Story session not found' },
        { status: 404 }
      );
    }

    if (storySession.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const user = await User.findById(session.user.id);
    const userAge = user?.age || 10;

    console.log(
      `📖 Starting ADVANCED assessment with AI detection for age: ${userAge}`
    );

    // Prepare story content
    let fullStoryContent = '';
    let userContributions: string[] = [];

    if (storySession.type === 'collaborative') {
      const turns = await Turn.find({ sessionId }).sort({ turnNumber: 1 });

      userContributions = turns
        .filter((turn) => turn.childInput && turn.childInput.trim().length > 0)
        .map((turn) => turn.childInput.trim());

      fullStoryContent = userContributions.join('\n\n');
      console.log(
        `📝 Collaborative story: ${userContributions.length} user turns`
      );
    } else {
      fullStoryContent =
        storySession.storyContent || storySession.content || '';
      userContributions = [fullStoryContent];
      console.log(`📝 Freestyle story: ${fullStoryContent.length} characters`);
    }

    if (!fullStoryContent || fullStoryContent.trim().length < 50) {
      return NextResponse.json(
        {
          error:
            'Story content too short for meaningful assessment (minimum 50 words)',
        },
        { status: 400 }
      );
    }

    console.log(
      '🤖 Starting comprehensive AI-powered assessment with advanced AI detection...'
    );

    // PERFORM COMPREHENSIVE ASSESSMENT WITH ADVANCED AI DETECTION
    const comprehensiveAssessment =
      await ComprehensiveAssessmentEngine.performCompleteAssessment(
        fullStoryContent,
        {
          childAge: userAge,
          storyTitle: storySession.title,
          expectedGenre: storySession.genre || 'creative',
          isCollaborativeStory: storySession.type === 'collaborative',
        }
      );

    console.log('✅ Advanced AI assessment completed');
    console.log(`📊 Overall Score: ${comprehensiveAssessment.overallScore}%`);
    console.log(`🔍 Status: ${comprehensiveAssessment.status}`);
    console.log(
      `🔒 Integrity: ${comprehensiveAssessment.integrityAnalysis.overallStatus}`
    );
    console.log(
      `🤖 AI Detection: ${comprehensiveAssessment.integrityAnalysis.aiDetection.aiLikelihood}`
    );
    console.log(
      `📝 Human-like Score: ${comprehensiveAssessment.integrityAnalysis.aiDetection.humanLikeScore}%`
    );

    const assessmentData = {
      comprehensiveAssessment: comprehensiveAssessment,
      overallScore: comprehensiveAssessment.overallScore,
      status: comprehensiveAssessment.status,
      statusMessage: comprehensiveAssessment.statusMessage,

      // Core scores
      grammarScore: comprehensiveAssessment.coreWritingSkills.grammar.score,
      creativityScore:
        comprehensiveAssessment.coreWritingSkills.creativity.score,
      vocabularyScore:
        comprehensiveAssessment.coreWritingSkills.vocabulary.score,
      structureScore: comprehensiveAssessment.coreWritingSkills.structure.score,
      characterDevelopmentScore:
        comprehensiveAssessment.storyDevelopment.characterDevelopment.score,
      plotDevelopmentScore:
        comprehensiveAssessment.storyDevelopment.plotDevelopment.score,

      // Feedback
      feedback: comprehensiveAssessment.comprehensiveFeedback.teacherAssessment,
      strengths: comprehensiveAssessment.comprehensiveFeedback.strengths,
      improvements:
        comprehensiveAssessment.comprehensiveFeedback.areasForEnhancement,
      nextSteps: comprehensiveAssessment.comprehensiveFeedback.nextSteps,

      // ADVANCED INTEGRITY ANALYSIS
      integrityAnalysis: {
        // AI Detection Results
        aiDetection: {
          humanLikeScore:
            comprehensiveAssessment.integrityAnalysis.aiDetection
              .humanLikeScore,
          aiLikelihood:
            comprehensiveAssessment.integrityAnalysis.aiDetection.aiLikelihood,
          confidenceLevel:
            comprehensiveAssessment.integrityAnalysis.aiDetection
              .confidenceLevel,
          analysis:
            comprehensiveAssessment.integrityAnalysis.aiDetection.analysis,
          riskLevel:
            comprehensiveAssessment.integrityAnalysis.aiDetection.riskLevel,
          indicators:
            comprehensiveAssessment.integrityAnalysis.aiDetection.indicators,
        },
        // Plagiarism Results
        plagiarismCheck: {
          originalityScore:
            comprehensiveAssessment.integrityAnalysis.plagiarismCheck
              .originalityScore,
          riskLevel:
            comprehensiveAssessment.integrityAnalysis.plagiarismCheck.riskLevel,
          violations:
            comprehensiveAssessment.integrityAnalysis.plagiarismCheck
              .violations,
          status:
            comprehensiveAssessment.integrityAnalysis.plagiarismCheck.status,
        },
        // Overall Integrity Status
        overallStatus: comprehensiveAssessment.integrityAnalysis.overallStatus,
        message: comprehensiveAssessment.integrityAnalysis.message,
        recommendation:
          comprehensiveAssessment.integrityAnalysis.recommendation,
      },

      // Assessment metadata
      assessmentVersion: '6.0-advanced-ai-detection',
      assessmentDate: new Date(),
      isReassessment,
      aiDetectionEnabled: true,
    };

    // Determine story status based on integrity analysis
    let storyStatus = 'completed';
    if (comprehensiveAssessment.integrityAnalysis.overallStatus === 'FAIL') {
      storyStatus = 'flagged'; // AI content or plagiarism detected
    } else if (
      comprehensiveAssessment.integrityAnalysis.overallStatus === 'WARNING'
    ) {
      storyStatus = 'review'; // Needs manual review
    }

    // Update story session
    const updateData = {
      assessment: assessmentData,
      overallScore: comprehensiveAssessment.overallScore,
      grammarScore: comprehensiveAssessment.coreWritingSkills.grammar.score,
      creativityScore:
        comprehensiveAssessment.coreWritingSkills.creativity.score,
      feedback: comprehensiveAssessment.comprehensiveFeedback.teacherAssessment,

      // Set status based on integrity analysis
      status: storyStatus,

      lastAssessedAt: new Date(),
      assessmentAttempts: (storySession.assessmentAttempts || 0) + 1,

      // Store integrity information at top level
      integrityStatus: comprehensiveAssessment.integrityAnalysis.overallStatus,
      aiDetectionScore:
        comprehensiveAssessment.integrityAnalysis.aiDetection.humanLikeScore,
      plagiarismScore:
        comprehensiveAssessment.integrityAnalysis.plagiarismCheck
          .originalityScore,

      // Flag for admin review if necessary
      ...(storyStatus === 'flagged' && {
        adminFlags: {
          aiDetected:
            comprehensiveAssessment.integrityAnalysis.aiDetection.riskLevel ===
            'CRITICAL RISK',
          plagiarismDetected:
            comprehensiveAssessment.integrityAnalysis.plagiarismCheck.status ===
            'VIOLATION',
          flaggedAt: new Date(),
          flagReason: comprehensiveAssessment.integrityAnalysis.message,
        },
      }),
    };

    const updatedSession = await StorySession.findByIdAndUpdate(
      sessionId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedSession) {
      throw new Error('Failed to update story session with assessment');
    }

    console.log('💾 Advanced assessment with AI detection saved successfully');

    // Log integrity results
    if (storyStatus === 'flagged') {
      console.log('🚨 INTEGRITY ISSUE DETECTED:');
      console.log(
        `   🤖 AI Detection: ${comprehensiveAssessment.integrityAnalysis.aiDetection.aiLikelihood} (${comprehensiveAssessment.integrityAnalysis.aiDetection.humanLikeScore}% human-like)`
      );
      console.log(
        `   📝 Plagiarism: ${comprehensiveAssessment.integrityAnalysis.plagiarismCheck.riskLevel} risk`
      );
      console.log(
        `   ⚠️  Status: ${comprehensiveAssessment.integrityAnalysis.overallStatus}`
      );
      console.log(
        `   💬 Message: ${comprehensiveAssessment.integrityAnalysis.message}`
      );
    } else {
      console.log('✅ INTEGRITY CHECK PASSED:');
      console.log(
        `   🤖 AI Detection: ${comprehensiveAssessment.integrityAnalysis.aiDetection.aiLikelihood}`
      );
      console.log(
        `   📝 Plagiarism: ${comprehensiveAssessment.integrityAnalysis.plagiarismCheck.riskLevel} risk`
      );
    }

    return NextResponse.json({
      success: true,
      assessment: assessmentData,
      message:
        'Advanced AI-powered assessment with integrity verification completed',
      session: {
        id: updatedSession._id,
        overallScore: updatedSession.overallScore,
        status: updatedSession.status,
        title: updatedSession.title,
      },
      integrityCheck: {
        status: comprehensiveAssessment.integrityAnalysis.overallStatus,
        aiDetection:
          comprehensiveAssessment.integrityAnalysis.aiDetection.aiLikelihood,
        humanLikeScore:
          comprehensiveAssessment.integrityAnalysis.aiDetection.humanLikeScore,
      },
    });
  } catch (error) {
    console.error('❌ Advanced Assessment failed:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);

    try {
      await StorySession.findByIdAndUpdate(params.sessionId, {
        'assessment.error': true,
        'assessment.errorMessage': errorMessage,
        'assessment.assessmentDate': new Date(),
        lastAssessedAt: new Date(),
        status: 'error',
      });
    } catch (dbError) {
      console.error('Failed to save error state:', dbError);
    }

    return NextResponse.json(
      {
        error: 'Advanced assessment failed',
        details:
          'Unable to complete AI-powered assessment with integrity verification.',
        errorType:
          error instanceof Error ? error.constructor.name : 'UnknownError',
      },
      { status: 500 }
    );
  }
}

// GET method remains the same
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const storySession = await StorySession.findById(params.sessionId);
    if (!storySession) {
      return NextResponse.json(
        { error: 'Story session not found' },
        { status: 404 }
      );
    }

    if (storySession.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (storySession.assessment && !storySession.assessment.error) {
      return NextResponse.json({
        success: true,
        assessment: storySession.assessment,
        session: {
          id: storySession._id,
          title: storySession.title,
          overallScore: storySession.overallScore,
          status: storySession.status,
        },
      });
    }

    return NextResponse.json(
      { error: 'No assessment found for this story' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error retrieving assessment:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve assessment' },
      { status: 500 }
    );
  }
}
