// app/api/user/stories/upload-competition/route.ts - FIXED (Text Only)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Competition from '@/models/Competition';
import User from '@/models/User';
import { UsageManager } from '@/lib/usage-manager';
import { competitionManager } from '@/lib/competition-manager';
import { SingleCallAssessmentEngine } from '@/lib/ai/SingleCallAssessmentEngine';

export async function POST(request: NextRequest) {
  try {
    console.log('🏆 Competition story upload request received');

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Check competition eligibility
    const competitionCheck = await UsageManager.canEnterCompetition(
      session.user.id
    );
    if (!competitionCheck.allowed) {
      return NextResponse.json(
        { error: competitionCheck.reason },
        { status: 403 }
      );
    }

    // Get current competition
    const currentCompetition = await competitionManager.getCurrentCompetition();
    if (!currentCompetition || currentCompetition.phase !== 'submission') {
      return NextResponse.json(
        { error: 'No active competition or submission phase has ended' },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Story title is required' },
        { status: 400 }
      );
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Please provide story content by pasting text' },
        { status: 400 }
      );
    }

    const storyContent = content.trim();

    if (!storyContent) {
      return NextResponse.json(
        { error: 'Story content cannot be empty' },
        { status: 400 }
      );
    }

    // Word count validation for competition
    const wordCount = storyContent.split(/\s+/).filter(Boolean).length;

    if (wordCount < 100) {
      return NextResponse.json(
        { error: 'Competition stories must be at least 100 words' },
        { status: 400 }
      );
    }

    if (wordCount > 2000) {
      return NextResponse.json(
        { error: 'Competition stories must be less than 2000 words' },
        { status: 400 }
      );
    }

    // Get user for story number generation
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get next story number
    const userStoryCount = await StorySession.countDocuments({
      childId: session.user.id,
    });
    const nextStoryNumber = userStoryCount + 1;

    // ✅ CRITICAL: Run AI Assessment BEFORE allowing competition entry
    console.log('🤖 Running ADVANCED AI Assessment for competition entry...');

    let assessmentResult;
    try {
      assessmentResult =
        await SingleCallAssessmentEngine.performCompleteAssessment(
          storyContent,
          {
            childAge: 10, // default
            isCollaborativeStory: false,
            storyTitle: title,
            expectedGenre: 'creative',
          }
        );

      console.log(
        `📊 Competition Assessment - Overall: ${assessmentResult.overallScore}%`
      );
      console.log(
        `🔍 AI Detection: ${assessmentResult.integrityAnalysis.aiDetection.aiLikelihood}`
      );
      console.log(
        `⚠️ Integrity Risk: ${assessmentResult.integrityAnalysis.aiDetection.riskLevel}`
      );

      // ✅ ASSESSMENT COMPLETE: Save with full assessment data
      // No blocking - let competition-manager filter later through tier system
    } catch (error) {
      console.error('❌ AI Assessment failed for competition entry:', error);

      // For competition entries, we should fail safely rather than allow potentially problematic content
      return NextResponse.json(
        {
          error: 'Unable to verify story quality and integrity',
          details:
            'Please try submitting again. If the problem persists, contact support.',
        },
        { status: 500 }
      );
    }

    // ✅ CREATE STORY SESSION WITH FULL ASSESSMENT DATA
    const storySession = await StorySession.create({
      childId: session.user.id,
      storyNumber: nextStoryNumber,
      title: title.trim(),
      currentTurn: 7, // Mark as complete
      totalWords: wordCount,
      childWords: wordCount,
      apiCallsUsed: 0,
      maxApiCalls: 0,
      status: 'completed',
      aiOpening: storyContent,
      completedAt: new Date(),
      isUploadedForAssessment: false,
      storyType: 'competition',
      competitionEligible: true,

      // ✅ STORE COMPLETE 42-FACTOR ASSESSMENT DATA
      assessment: {
        overallScore: assessmentResult.overallScore,
        status: assessmentResult.status,
        statusMessage: assessmentResult.statusMessage,
        // All 42 factors, always included
        coreWritingMechanics: assessmentResult.coreWritingSkills,
        storyElements: assessmentResult.storyDevelopment,
        creativeSkills: assessmentResult.creativeSkills,
        structureOrganization: assessmentResult.structureOrganization,
        advancedElements: assessmentResult.advancedElements,
        aiDetectionAnalysis: assessmentResult.integrityAnalysis?.aiDetection,
        educationalFeedback: assessmentResult.educationalFeedback,
        assessmentVersion: '3.0-42-factor-competition',
        assessmentDate: new Date().toISOString(),
        assessmentType: 'competition',
        note: 'Complete 42-factor analysis provided regardless of content status - admin/mentors handle flagged content separately',
      },

      competitionEntries: [
        {
          competitionId: currentCompetition._id,
          submittedAt: new Date(),
          phase: 'submission',
        },
      ],
    });

    // ✅ USE COMPETITION MANAGER for stats update
    await competitionManager.updateCompetitionStats(currentCompetition._id);

    return NextResponse.json({
      success: true,
      storyId: storySession._id,
      story: {
        id: storySession._id,
        title: storySession.title,
        storyNumber: storySession.storyNumber,
        wordCount,
        submittedToCompetition: true,
        competitionId: currentCompetition._id,
        isPublished: false,
        competitionEligible: true,
        assessmentScore: assessmentResult.overallScore,
        integrityStatus: assessmentResult.integrityAnalysis.overallStatus,
      },
      competition: {
        id: currentCompetition._id,
        month: currentCompetition.month,
        phase: currentCompetition.phase,
      },
      assessment: {
        overallScore: assessmentResult.overallScore,
        integrityStatus: {
          status: assessmentResult.integrityAnalysis.overallStatus,
          message: assessmentResult.integrityAnalysis.message,
        },
        feedback: assessmentResult.comprehensiveFeedback.teacherAssessment,
      },
      message: 'Story assessed and submitted to competition successfully!',
    });
  } catch (error) {
    console.error('Competition upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload story for competition',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
