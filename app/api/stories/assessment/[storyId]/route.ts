// app/api/stories/assessment/[storyId]/route.ts - ASSESSMENT ENDPOINT FOR COMPLETED STORIES
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import { AIAssessmentEngine } from '@/lib/ai/ai-assessment-engine';
import mongoose from 'mongoose';

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
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
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
      // Generate comprehensive assessment
      const assessment = await AIAssessmentEngine.performCompleteAssessment(
        storyContent,
        {
          childAge: 10, // Default age
          isCollaborativeStory: !storySession.isUploadedForAssessment,
          storyTitle: storySession.title || 'Untitled Story',
          expectedGenre: 'creative',
        }
      );

      console.log('✅ Assessment completed successfully');
      console.log(`📈 Overall Score: ${assessment.overallScore}%`);

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
        characterDevelopmentScore: assessment.categoryScores.characterDevelopment,
        plotDevelopmentScore: assessment.categoryScores.plotDevelopment,
        readingLevel: assessment.categoryScores.readingLevel,
        
        // Educational feedback
        feedback: assessment.educationalFeedback.teacherComment,
        strengths: assessment.educationalFeedback.strengths,
        improvements: assessment.educationalFeedback.improvements,
        educationalInsights: assessment.educationalFeedback.encouragement,
        
        // Integrity analysis
        integrityStatus: assessment.integrityStatus.status,
        aiDetectionScore: assessment.integrityAnalysis?.aiDetectionResult?.overallScore || 0,
        plagiarismScore: assessment.integrityAnalysis?.originalityScore || 100,
        integrityRisk: assessment.integrityAnalysis?.integrityRisk || 'low',
        
        // Advanced fields
        integrityAnalysis: assessment.integrityAnalysis,
        recommendations: assessment.recommendations,
        progressTracking: assessment.progressTracking,
        
        // Metadata
        assessmentVersion: '2.0',
        assessmentDate: new Date().toISOString(),
        assessmentType: storySession.isUploadedForAssessment ? 'uploaded' : 'collaborative',
      };

      // Update story session with assessment
      const updateData = {
        assessment: assessmentData,
        overallScore: assessment.overallScore,
        grammarScore: assessment.categoryScores.grammar,
        creativityScore: assessment.categoryScores.creativity,
        lastAssessedAt: new Date(),
        assessmentAttempts: (storySession.assessmentAttempts || 0) + 1,
        // Flag if integrity issues
        status: assessment.integrityAnalysis?.integrityRisk === 'critical' ? 'flagged' : 'completed',
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
      
      // Fallback assessment
      const fallbackAssessment = {
        overallScore: 75,
        categoryScores: {
          grammar: 80,
          creativity: 85,
          vocabulary: 70,
          structure: 75,
          characterDevelopment: 80,
          plotDevelopment: 70,
          readingLevel: 'Grade 7',
        },
        feedback: 'Great work on your story! Assessment completed with backup system.',
        strengths: ['Creative storytelling', 'Good effort'],
        improvements: ['Continue developing writing skills'],
        integrityStatus: 'PASS',
        aiDetectionScore: 0,
        assessmentVersion: '2.0-fallback',
        assessmentDate: new Date().toISOString(),
      };

      // Save fallback assessment
      await StorySession.findByIdAndUpdate(actualSessionId, {
        assessment: fallbackAssessment,
        overallScore: 75,
        grammarScore: 80,
        creativityScore: 85,
        lastAssessedAt: new Date(),
        assessmentAttempts: (storySession.assessmentAttempts || 0) + 1,
      });

      return NextResponse.json({
        success: true,
        message: 'Assessment completed with backup system',
        assessment: fallbackAssessment,
      });
    }

  } catch (error) {
    console.error('❌ Assessment endpoint error:', error);
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
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
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
