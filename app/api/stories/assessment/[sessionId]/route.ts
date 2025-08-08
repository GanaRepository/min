// app/api/stories/assessment/[sessionId]/route.ts - REPLACE YOUR EXISTING FILE
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import { UsageManager } from '@/lib/usage-manager';
import { AssessmentEngine } from '@/lib/ai/assessment-engine';
import mongoose from 'mongoose';

interface AssessmentRouteProps {
  params: { sessionId: string };
}

export async function POST(request: Request, { params }: AssessmentRouteProps) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Check if user can attempt assessment - FIXED METHOD NAME
    const usageCheck = await UsageManager.canAttemptAssessment(session.user.id, params.sessionId);
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { 
          error: usageCheck.reason,
          needsUpgrade: usageCheck.upgradeRequired,
          currentUsage: usageCheck.currentUsage,
          limits: usageCheck.limits,
        },
        { status: 429 }
      );
    }

    // Find the story session with flexible ID lookup
    let storySession = null;
    let actualSessionId = null;

    if (mongoose.Types.ObjectId.isValid(params.sessionId)) {
      storySession = await StorySession.findOne({
        _id: params.sessionId,
        childId: session.user.id,
      });
      actualSessionId = params.sessionId;
    } else if (!isNaN(Number(params.sessionId))) {
      storySession = await StorySession.findOne({
        storyNumber: Number(params.sessionId),
        childId: session.user.id,
      });
      actualSessionId = storySession?._id?.toString();
    }

    if (!storySession || !actualSessionId) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Check if story is completed
    if (storySession.status !== 'completed') {
      return NextResponse.json(
        { error: 'Story not completed. Please finish writing before requesting assessment.' },
        { status: 400 }
      );
    }

    // Check if already has assessment and if re-assessment is allowed
    const isReassessment = !!storySession.assessment?.overallScore;
    if (isReassessment) {
      const currentAttempts = storySession.assessmentAttempts || 0;
      if (currentAttempts >= 3) {
        return NextResponse.json(
          { error: 'Maximum assessment attempts (3) reached for this story.' },
          { status: 400 }
        );
      }
    }

    // Get story content based on story type
    let storyContent = '';
    
    if (storySession.isUploadedForAssessment && storySession.aiOpening) {
      // For uploaded stories, content is in aiOpening
      storyContent = storySession.aiOpening;
      console.log('📄 Processing uploaded story content');
    } else {
      // For collaborative stories, get all turns
      const turns = await Turn.find({ sessionId: actualSessionId })
        .sort({ turnNumber: 1 })
        .lean();

      console.log(`📚 Found ${turns.length} turns for collaborative story`);

      if (turns.length === 0) {
        return NextResponse.json(
          { error: 'No story content found. Please write some content before requesting assessment.' },
          { status: 400 }
        );
      }

      // For collaborative stories, use only child inputs
      const childInputs = turns
        .filter((turn) => turn.childInput?.trim())
        .map((turn) => turn.childInput.trim());

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
        { error: 'Story must be at least 50 words long for meaningful assessment.' },
        { status: 400 }
      );
    }

    try {
      // Generate assessment using advanced AI engine
      console.log('🎯 Generating advanced AI assessment for story:', storySession.title);
      
      const assessment = await AssessmentEngine.assessStory(
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
        vocabularyUsed: [], // Legacy field
        suggestedWords: [], // Legacy field
        educationalInsights: assessment.educationalFeedback.encouragement,
        
        // NEW: Advanced integrity fields
        plagiarismScore: assessment.integrityAnalysis.originalityScore,
        aiDetectionScore: assessment.integrityAnalysis.aiDetectionResult.overallScore,
        integrityRisk: assessment.integrityAnalysis.integrityRisk,
        
        // Store detailed analysis for admin review
        integrityAnalysis: {
          plagiarismResult: {
            score: assessment.integrityAnalysis.plagiarismResult.overallScore,
            riskLevel: assessment.integrityAnalysis.plagiarismResult.riskLevel,
            violationCount: assessment.integrityAnalysis.plagiarismResult.violations?.length || 0,
            detailedAnalysis: assessment.integrityAnalysis.plagiarismResult.detailedAnalysis,
          },
          aiDetectionResult: {
            score: assessment.integrityAnalysis.aiDetectionResult.overallScore,
            likelihood: assessment.integrityAnalysis.aiDetectionResult.likelihood,
            confidence: assessment.integrityAnalysis.aiDetectionResult.confidence,
            indicatorCount: assessment.integrityAnalysis.aiDetectionResult.indicators?.length || 0,
            detailedAnalysis: assessment.integrityAnalysis.aiDetectionResult.detailedAnalysis,
          },
        },
        
        // Educational enhancements
        recommendations: assessment.recommendations,
        progressTracking: assessment.progressTracking,
        
        // Assessment metadata
        assessmentVersion: '2.0', // Mark as advanced assessment
        assessmentDate: new Date(),
        isReassessment,
      };

      // Update story session with assessment
      const updatedSession = await StorySession.findByIdAndUpdate(
        actualSessionId,
        {
          $set: {
            assessment: assessmentData,
            // Legacy fields for backward compatibility
            overallScore: assessment.overallScore,
            grammarScore: assessment.categoryScores.grammar,
            creativityScore: assessment.categoryScores.creativity,
            feedback: assessment.educationalFeedback.teacherComment,
            status: assessment.integrityAnalysis.integrityRisk === 'critical' ? 'flagged' : 'completed',
            lastAssessedAt: new Date(),
          },
          $inc: { assessmentAttempts: 1 },
        },
        { new: true }
      );

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
          vocabularyUsed: [], // Legacy
          suggestedWords: [], // Legacy
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
          : 'Assessment completed successfully!',
        attemptsRemaining: 3 - (updatedSession?.assessmentAttempts || 0),
      };

      // Add warnings for integrity issues
      if (assessment.integrityAnalysis.integrityRisk !== 'low') {
        (response as any).warnings = [];
        if (assessment.integrityAnalysis.plagiarismResult.riskLevel !== 'low') {
          (response as any).warnings.push({
            type: 'plagiarism',
            message: 'Potential plagiarism detected. Please ensure all content is original.',
            severity: assessment.integrityAnalysis.plagiarismResult.riskLevel,
            score: assessment.integrityAnalysis.plagiarismResult.overallScore,
          });
        }
        if (assessment.integrityAnalysis.aiDetectionResult.likelihood !== 'very_low' && 
            assessment.integrityAnalysis.aiDetectionResult.likelihood !== 'low') {
          (response as any).warnings.push({
            type: 'ai_content',
            message: 'Content may be AI-generated. Please submit only your own original writing.',
            severity: assessment.integrityAnalysis.aiDetectionResult.likelihood,
            score: assessment.integrityAnalysis.aiDetectionResult.overallScore,
          });
        }
      }

      return NextResponse.json(response);

    } catch (assessmentError) {
      console.error('❌ Assessment generation failed:', assessmentError);
      
      // Save error state to session
      await StorySession.findByIdAndUpdate(
        actualSessionId,
        {
          $set: {
            assessment: {
              overallScore: 0,
              feedback: 'Assessment temporarily unavailable. Please try again later.',
              error: true,
              errorMessage: assessmentError instanceof Error ? assessmentError.message : 'Unknown error',
              assessmentDate: new Date(),
            },
          },
          $inc: { assessmentAttempts: 1 },
        }
      );

      return NextResponse.json(
        { 
          error: 'Assessment generation failed',
          details: assessmentError instanceof Error ? assessmentError.message : 'Unknown error',
          retryable: true,
          attemptsRemaining: Math.max(0, 3 - ((storySession.assessmentAttempts || 0) + 1)),
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error generating assessment:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate assessment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve existing assessment
export async function GET(request: Request, { params }: AssessmentRouteProps) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Find the story session
    let storySession = null;

    if (mongoose.Types.ObjectId.isValid(params.sessionId)) {
      storySession = await StorySession.findOne({
        _id: params.sessionId,
        childId: session.user.id,
      });
    } else if (!isNaN(Number(params.sessionId))) {
      storySession = await StorySession.findOne({
        storyNumber: Number(params.sessionId),
        childId: session.user.id,
      });
    }

    if (!storySession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (!storySession.assessment) {
      return NextResponse.json({ 
        error: 'No assessment available for this story',
        canAssess: storySession.status === 'completed' && (storySession.assessmentAttempts || 0) < 3,
        attemptsRemaining: Math.max(0, 3 - (storySession.assessmentAttempts || 0)),
      }, { status: 404 });
    }

    // Return existing assessment in legacy format for compatibility
    const response = {
      success: true,
      assessment: {
        grammarScore: storySession.assessment.grammarScore || 0,
        creativityScore: storySession.assessment.creativityScore || 0,
        vocabularyScore: storySession.assessment.vocabularyScore || 0,
        structureScore: storySession.assessment.structureScore || 0,
        characterDevelopmentScore: storySession.assessment.characterDevelopmentScore || 0,
        plotDevelopmentScore: storySession.assessment.plotDevelopmentScore || 0,
        overallScore: storySession.assessment.overallScore || 0,
        readingLevel: storySession.assessment.readingLevel || 'Not assessed',
        feedback: storySession.assessment.feedback || '',
        strengths: storySession.assessment.strengths || [],
        improvements: storySession.assessment.improvements || [],
        vocabularyUsed: storySession.assessment.vocabularyUsed || [],
        suggestedWords: storySession.assessment.suggestedWords || [],
        educationalInsights: storySession.assessment.educationalInsights || '',
        
        // NEW: Advanced fields if available
        plagiarismScore: storySession.assessment.plagiarismScore || 0,
        aiDetectionScore: storySession.assessment.aiDetectionScore || 0,
        integrityRisk: storySession.assessment.integrityRisk || 'unknown',
        integrityAnalysis: storySession.assessment.integrityAnalysis || null,
        recommendations: storySession.assessment.recommendations || null,
        progressTracking: storySession.assessment.progressTracking || null,
        assessmentVersion: storySession.assessment.assessmentVersion || '1.0',
      },
      storyInfo: {
        id: storySession._id,
        title: storySession.title,
        storyNumber: storySession.storyNumber,
        status: storySession.status,
        wordCount: storySession.totalWords || 0,
        userWordCount: storySession.childWords || 0,
        attemptsRemaining: Math.max(0, 3 - (storySession.assessmentAttempts || 0)),
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Get assessment error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve assessment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}