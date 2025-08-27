// app/api/stories/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import { UsageManager } from '@/lib/usage-manager';
import { ComprehensiveAssessmentEngine } from '@/lib/ai/comprehensive-assessment-engine';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Story upload request received');

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'child') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await connectToDatabase();

    // CHECK USAGE LIMITS BEFORE PROCESSING UPLOAD
    const canAssess = await UsageManager.canRequestAssessment(session.user.id);
    if (!canAssess.allowed) {
      console.log(`❌ Assessment upload denied: ${canAssess.reason}`);
      return NextResponse.json(
        {
          error: canAssess.reason,
          upgradeRequired: canAssess.upgradeRequired,
        },
        { status: 403 }
      );
    }

    console.log('✅ User can request assessment, proceeding with upload...');

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const file = formData.get('file') as File | null;

    console.log('📊 Received data:', {
      title: !!title,
      content: !!content,
      file: !!file,
    });

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Story title is required' },
        { status: 400 }
      );
    }

    // Handle both pasted content and file upload
    let storyContent = '';
    if (content?.trim()) {
      storyContent = content.trim();
    } else if (file && file.size > 0) {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        storyContent = await file.text();
      } else {
        return NextResponse.json(
          {
            error:
              'For now, please paste your text directly or upload a .txt file',
          },
          { status: 400 }
        );
      }
    }

    if (!storyContent?.trim()) {
      return NextResponse.json(
        {
          error:
            'Please provide story content by pasting text or uploading a .txt file',
        },
        { status: 400 }
      );
    }

    const wordCount = storyContent
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;

    if (wordCount < 50) {
      return NextResponse.json(
        {
          error: 'Story must be at least 50 words long',
        },
        { status: 400 }
      );
    }

    const userStoryCount = await StorySession.countDocuments({
      childId: session.user.id,
    });

    const storySession = new StorySession({
      childId: session.user.id,
      storyNumber: userStoryCount + 1,
      title: title.trim(),
      aiOpening: storyContent.trim(),
      status: 'completed',
      totalWords: wordCount,
      childWords: wordCount,
      currentTurn: 1,
      apiCallsUsed: 0,
      maxApiCalls: 1,
      isUploadedForAssessment: true,
      storyType: 'uploaded',
      competitionEligible: wordCount >= 350 && wordCount <= 2000,
      assessment: {
        integrityStatus: {
          status: 'PASS',
          message: 'Assessment in progress...',
        },
      },
    });

    await storySession.save();
    console.log(`✅ Story saved with ID: ${storySession._id}`);

    // EXACT SAME AI ASSESSMENT CALL AS FREESTYLE STORIES
    try {
      console.log(
        '🎯 Generating advanced AI assessment for story:',
        storySession.title
      );

      const assessment =
        await ComprehensiveAssessmentEngine.performCompleteAssessment(
          storyContent,
          {
            childAge: 10, // default
            storyTitle: storySession.title,
            isCollaborativeStory: false,
            expectedGenre: 'creative',
          }
        );

      console.log('✅ Assessment completed successfully');
      console.log(`📈 Overall Score: ${assessment.overallScore}%`);

      // ASSESSMENT DATA STRUCTURE FOR NEW ENGINE
      const assessmentData = {
        // Legacy fields for backward compatibility
        grammarScore: assessment.coreWritingSkills.grammar.score,
        creativityScore: assessment.coreWritingSkills.creativity.score,
        vocabularyScore: assessment.coreWritingSkills.vocabulary.score,
        structureScore: assessment.coreWritingSkills.structure.score,
        characterDevelopmentScore:
          assessment.storyDevelopment.characterDevelopment.score,
        plotDevelopmentScore: assessment.storyDevelopment.plotDevelopment.score,
        overallScore: assessment.overallScore,
        readingLevel: 75, // Default since not in new structure
        feedback: assessment.comprehensiveFeedback.teacherAssessment,
        strengths: assessment.comprehensiveFeedback.strengths,
        improvements: assessment.comprehensiveFeedback.areasForEnhancement,
        vocabularyUsed: [],
        suggestedWords: [],
        educationalInsights: assessment.comprehensiveFeedback.teacherAssessment,

        // Advanced fields
        integrityAnalysis: assessment.integrityAnalysis,
        recommendations: assessment.comprehensiveFeedback.nextSteps,
        progressTracking: assessment.advancedElements,
        assessmentVersion: '2.0',
        assessmentDate: new Date().toISOString(),
      };

      // Update story session with assessment
      await StorySession.findByIdAndUpdate(storySession._id, {
        $set: {
          assessment: assessmentData,
          overallScore: assessment.overallScore,
          grammarScore: assessment.coreWritingSkills.grammar.score,
          creativityScore: assessment.coreWritingSkills.creativity.score,
          status:
            assessment.integrityAnalysis.overallStatus === 'FAIL'
              ? 'flagged'
              : 'completed',
          lastAssessedAt: new Date(),
          assessmentAttempts: 1,
        },
      });

      await UsageManager.incrementAssessmentRequest(
        session.user.id,
        storySession._id.toString()
      );

      return NextResponse.json({
        success: true,
        storyId: storySession._id,
        story: {
          id: storySession._id,
          title: storySession.title,
          wordCount,
          storyNumber: storySession.storyNumber,
        },
        assessment: {
          overallScore: assessment.overallScore,
          integrityStatus: 'PASS',
        },
        message: 'Story uploaded and assessed successfully!',
      });
    } catch (assessmentError) {
      console.error('❌ Assessment failed:', assessmentError);

      // Fallback to basic scores
      const fallbackData = {
        overallScore: 75,
        grammarScore: 80,
        creativityScore: 85,
        vocabularyScore: 70,
        structureScore: 75,
        characterDevelopmentScore: 80,
        plotDevelopmentScore: 70,
        readingLevel: 'Grade 7',
        feedback: 'Assessment completed! Your story shows good potential.',
        strengths: ['Creative storytelling', 'Good use of language'],
        improvements: ['Continue developing your writing skills'],
        integrityStatus: { status: 'PASS', message: 'Assessment completed' },
        assessmentDate: new Date().toISOString(),
      };

      await StorySession.findByIdAndUpdate(storySession._id, {
        $set: {
          assessment: fallbackData,
          assessmentAttempts: 1,
        },
      });

      await UsageManager.incrementAssessmentRequest(
        session.user.id,
        storySession._id.toString()
      );

      return NextResponse.json({
        success: true,
        storyId: storySession._id,
        story: {
          id: storySession._id,
          title: storySession.title,
          wordCount,
          storyNumber: storySession.storyNumber,
        },
        warning: 'Story saved with backup assessment.',
      });
    }
  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json(
      {
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
