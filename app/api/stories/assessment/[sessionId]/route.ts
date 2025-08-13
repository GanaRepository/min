//api/stories/assessment/[sessionId]/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import { AIAssessmentEngine } from '@/lib/ai/ai-assessment-engine';
import { UsageManager } from '@/lib/usage-manager';
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

    console.log('🔍 Assessment request for sessionId:', sessionId);

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'child') {
      console.log('❌ Unauthorized assessment attempt');
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    // Find the story session with flexible ID lookup
    let storySession = null;
    let actualSessionId = null;

    if (mongoose.Types.ObjectId.isValid(sessionId)) {
      storySession = await StorySession.findOne({
        _id: sessionId,
        childId: session.user.id,
      });
      actualSessionId = sessionId;
    } else if (!isNaN(Number(sessionId))) {
      storySession = await StorySession.findOne({
        storyNumber: Number(sessionId),
        childId: session.user.id,
      });
      actualSessionId = storySession?._id?.toString();
    }

    if (!storySession || !actualSessionId) {
      console.log('❌ Story session not found:', sessionId);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Only allow assessment if story is completed
    if (storySession.status !== 'completed') {
      console.log('❌ Story not completed:', storySession.status);
      return NextResponse.json(
        {
          error: 'Story not completed. Please finish writing before requesting assessment.',
        },
        { status: 400 }
      );
    }

    // Check if this is a re-assessment request
    // FIXED: Use optional chaining and type assertion
    const isReassessment = !!(storySession as any).assessment?.overallScore;

    if (isReassessment) {
      console.log('🔄 Re-assessment requested for session:', actualSessionId);

      // Check assessment attempts limit
      const currentAttempts = (storySession as any).assessmentAttempts || 0;
      if (currentAttempts >= 3) {
        return NextResponse.json(
          { 
            error: 'Maximum assessment attempts (3) reached. Create a new story or upload an improved version to continue.',
            maxAttemptsReached: true
          },
          { status: 400 }
        );
      }

      // FIXED: Use type assertion and safer checks for lastModifiedAt
      const lastAssessedAt = (storySession as any).lastAssessedAt;
      const lastModifiedAt = (storySession as any).lastModifiedAt;
      
      // For reassessment, check if story has been modified since last assessment
      if (lastAssessedAt && lastModifiedAt) {
        if (new Date(lastModifiedAt) <= new Date(lastAssessedAt)) {
          return NextResponse.json(
            { 
              error: 'Please modify your story based on the feedback before requesting reassessment.',
              requiresModification: true
            },
            { status: 400 }
          );
        }
      }
    }

    // Get story content based on story type
    let storyContent = '';

    // FIXED: Use type assertion for isUploadedForAssessment and aiOpening
    if ((storySession as any).isUploadedForAssessment && (storySession as any).aiOpening) {
      // For uploaded stories, content is in aiOpening
      storyContent = (storySession as any).aiOpening;
      console.log('📄 Processing uploaded story content');
    } else {
      // For collaborative stories, get all turns
      const turns = await Turn.find({ sessionId: actualSessionId })
        .sort({ turnNumber: 1 })
        .lean();

      console.log(`📚 Found ${turns.length} turns for collaborative story`);

      if (turns.length === 0) {
        return NextResponse.json(
          {
            error: 'No story content found. Please write some content before requesting assessment.',
          },
          { status: 400 }
        );
      }

      // For collaborative stories, use only child inputs
      const childInputs = turns
        .filter((turn: any) => turn.childInput?.trim())
        .map((turn: any) => turn.childInput.trim());

      if (childInputs.length === 0) {
        return NextResponse.json(
          { error: 'No user content found for assessment.' },
          { status: 400 }
        );
      }

      storyContent = childInputs.join('\n\n');
    }

    if (!storyContent.trim()) {
      return NextResponse.json(
        { error: 'No story content found for assessment' },
        { status: 400 }
      );
    }

    const wordCount = storyContent.trim().split(/\s+/).filter(Boolean).length;
    console.log(`📊 Story content: ${wordCount} words`);

    if (wordCount < 50) {
      return NextResponse.json(
        {
          error: 'Story must be at least 50 words long for meaningful assessment.',
        },
        { status: 400 }
      );
    }

    try {
      // Generate assessment using advanced AI engine
      console.log('🎯 Generating advanced AI assessment for story:', storySession.title);

      const assessment = await AIAssessmentEngine.assessStory(
        storyContent,
        actualSessionId,
        session.user.id
      );

      console.log('✅ Assessment completed successfully');
      console.log(`📈 Overall Score: ${assessment.overallScore}%`);
      console.log(`🔍 Plagiarism Score: ${assessment.integrityAnalysis.originalityScore}%`);
      console.log(`🤖 AI Detection Score: ${assessment.integrityAnalysis.aiDetectionResult.overallScore}%`);
      console.log(`⚠️ Integrity Risk: ${assessment.integrityAnalysis.integrityRisk}`);

      // Prepare assessment data for storage
      const assessmentData = {
        // Legacy fields for backward compatibility
        grammarScore: assessment.categoryScores.grammar,
        creativityScore: assessment.categoryScores.creativity,
        vocabularyScore: assessment.categoryScores.vocabulary,
        structureScore: assessment.categoryScores.structure,
        characterDevelopmentScore: assessment.categoryScores.characterDevelopment,
        plotDevelopmentScore: assessment.categoryScores.plotDevelopment,
        overallScore: assessment.overallScore,
        readingLevel: assessment.categoryScores.readingLevel,
        feedback: assessment.educationalFeedback.teacherComment,
        strengths: assessment.educationalFeedback.strengths,
        improvements: assessment.educationalFeedback.improvements,
        vocabularyUsed: [],
        suggestedWords: [],
        educationalInsights: assessment.educationalFeedback.encouragement,

        // Advanced fields
        integrityAnalysis: assessment.integrityAnalysis,
        recommendations: assessment.recommendations,
        progressTracking: assessment.progressTracking,
        assessmentVersion: '2.0',
        assessmentDate: new Date().toISOString(),
      };

      // Update story session with new assessment
      const updatedSession = await StorySession.findByIdAndUpdate(
        actualSessionId,
        {
          $set: {
            assessment: assessmentData,
            overallScore: assessment.overallScore,
            grammarScore: assessment.categoryScores.grammar,
            creativityScore: assessment.categoryScores.creativity,
            status: assessment.integrityAnalysis.integrityRisk === 'critical' ? 'flagged' : 'completed',
            lastAssessedAt: new Date(),
          },
          $inc: { assessmentAttempts: 1 },
        },
        { new: true }
      );

      // FIXED: Check if updatedSession is null
      if (!updatedSession) {
        return NextResponse.json(
          { error: 'Failed to update story session' },
          { status: 500 }
        );
      }

      // Increment user's assessment attempt counter
      await UsageManager.incrementAssessmentAttempt(session.user.id, actualSessionId);

      console.log('✅ Assessment generated and saved successfully!');

      // Prepare response
      const response = {
        success: true,
        assessment: {
          // Legacy format for existing frontend compatibility
          grammarScore: assessment.categoryScores.grammar,
          creativityScore: assessment.categoryScores.creativity,
          vocabularyScore: assessment.categoryScores.vocabulary,
          structureScore: assessment.categoryScores.structure,
          characterDevelopmentScore: assessment.categoryScores.characterDevelopment,
          plotDevelopmentScore: assessment.categoryScores.plotDevelopment,
          overallScore: assessment.overallScore,
          readingLevel: assessment.categoryScores.readingLevel,
          feedback: assessment.educationalFeedback.teacherComment,
          strengths: assessment.educationalFeedback.strengths,
          improvements: assessment.educationalFeedback.improvements,
          vocabularyUsed: [],
          suggestedWords: [],
          educationalInsights: assessment.educationalFeedback.encouragement,

          // NEW: Advanced fields
          plagiarismScore: assessment.integrityAnalysis.originalityScore,
          aiDetectionScore: assessment.integrityAnalysis.aiDetectionResult.overallScore,
          integrityRisk: assessment.integrityAnalysis.integrityRisk,
          integrityAnalysis: {
            originalityScore: assessment.integrityAnalysis.originalityScore,
            plagiarismScore: assessment.integrityAnalysis.plagiarismResult.overallScore,
            aiDetectionScore: assessment.integrityAnalysis.aiDetectionResult.overallScore,
            integrityRisk: assessment.integrityAnalysis.integrityRisk,
            plagiarismRiskLevel: assessment.integrityAnalysis.plagiarismResult.riskLevel,
            aiDetectionLikelihood: assessment.integrityAnalysis.aiDetectionResult.likelihood,
          },
          recommendations: assessment.recommendations,
          progressTracking: assessment.progressTracking,
          assessmentVersion: '2.0',
        },
        message: assessment.integrityAnalysis.integrityRisk === 'critical'
          ? 'Assessment completed but story flagged for review due to integrity concerns.'
          : isReassessment 
            ? 'Story reassessed successfully! Compare with previous feedback.'
            : 'Assessment completed successfully!',
        storySession: updatedSession,
        isReassessment,
        attemptsRemaining: 3 - ((updatedSession as any).assessmentAttempts || 0),
      };

      return NextResponse.json(response);

    } catch (error) {
      console.error('❌ Assessment generation failed:', error);
      return NextResponse.json(
        { 
          error: 'Failed to generate assessment. Please try again.',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Assessment request failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}