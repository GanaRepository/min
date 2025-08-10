import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { collaborationEngine } from '@/lib/ai/collaboration';
import { AssessmentEngine } from '@/lib/ai/assessment-engine';
import mongoose from 'mongoose';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { sessionId, childInput, turnNumber } = body;

    if (!sessionId || !childInput?.trim() || !turnNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let actualSessionId = sessionId;
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      const sessionByNumber = await StorySession.findOne({
        storyNumber: Number(sessionId),
        childId: session.user.id,
      });
      if (!sessionByNumber) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      actualSessionId = sessionByNumber._id.toString();
    }

    const storySession = await StorySession.findOne({
      _id: actualSessionId,
      childId: session.user.id,
      status: 'active',
    });

    if (!storySession) {
      return NextResponse.json(
        { error: 'Active story session not found' },
        { status: 404 }
      );
    }

    if (storySession.currentTurn !== turnNumber) {
      return NextResponse.json(
        { error: 'Turn number mismatch' },
        { status: 400 }
      );
    }

    if (storySession.apiCallsUsed >= storySession.maxApiCalls) {
      return NextResponse.json(
        { error: 'API call limit reached for this session' },
        { status: 429 }
      );
    }

    const childWords = childInput.trim().split(/\s+/).filter(Boolean).length;

    // Check if this completes the story (6 turns)
    const isStoryComplete = turnNumber >= 6;

    // Generate AI response
    let aiResponse = '';
    if (!isStoryComplete) {
      const allTurns = await Turn.find({ sessionId: actualSessionId })
        .sort({ turnNumber: 1 })
        .lean();

      const storyContext = allTurns
        .map((turn) => turn.childInput || turn.aiResponse || '')
        .filter((content) => content.trim())
        .join('\n\n');

      try {
        aiResponse = await collaborationEngine.generateFreeformResponse(
          childInput.trim(),
          storyContext,
          turnNumber
        );
      } catch (error) {
        console.error('AI response generation failed:', error);
        aiResponse = "That's a wonderful addition to your story! What happens next?";
      }
    }

    // Create the turn record
    const newTurn = await Turn.create({
      sessionId: actualSessionId,
      turnNumber,
      childInput: childInput.trim(),
      aiResponse: !isStoryComplete ? aiResponse : '',
      wordCount: childWords,
      createdAt: new Date(),
    });

    // Update session with lastModifiedAt
    const updatedSession = await StorySession.findByIdAndUpdate(
      actualSessionId,
      {
        $set: {
          currentTurn: isStoryComplete ? turnNumber : turnNumber + 1,
          totalWords: storySession.totalWords + childWords,
          childWords: storySession.childWords + childWords,
          apiCallsUsed: storySession.apiCallsUsed + (isStoryComplete ? 0 : 1),
          status: isStoryComplete ? 'completed' : 'active',
          lastModifiedAt: new Date(), // Added this line
          ...(isStoryComplete && { completedAt: new Date() }),
        },
      },
      { new: true }
    );

    if (!updatedSession) {
      return NextResponse.json(
        { error: 'Failed to update story session' },
        { status: 500 }
      );
    }

    let assessment = null;
    if (isStoryComplete) {
      try {
        console.log('🎯 Story completed! Auto-generating detailed assessment...');

        const allTurns = await Turn.find({ sessionId: actualSessionId })
          .sort({ turnNumber: 1 })
          .lean();

        const storyContent = allTurns
          .filter((turn) => turn.childInput)
          .map((turn) => turn.childInput)
          .join(' ');

        // Use the advanced assessment engine
        assessment = await AssessmentEngine.assessStory(
          storyContent,
          actualSessionId,
          session.user.id
        );

        await StorySession.findByIdAndUpdate(actualSessionId, {
          $set: {
            assessment: {
              // Legacy fields for backward compatibility
              grammarScore: assessment.categoryScores.grammar,
              creativityScore: assessment.categoryScores.creativity,
              overallScore: assessment.overallScore,
              vocabularyScore: assessment.categoryScores.vocabulary,
              structureScore: assessment.categoryScores.structure,
              characterDevelopmentScore: assessment.categoryScores.characterDevelopment,
              plotDevelopmentScore: assessment.categoryScores.plotDevelopment,
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
            },
            status: assessment.integrityAnalysis.integrityRisk === 'critical' ? 'flagged' : 'completed',
            lastAssessedAt: new Date(),
            assessmentAttempts: 1,
          },
        });

        console.log('✅ Assessment saved to database successfully!');

        // Return assessment in legacy format for frontend compatibility
        assessment = {
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
          integrityAnalysis: assessment.integrityAnalysis,
        };
      } catch (error) {
        console.error('❌ Auto-assessment failed:', error);
      }
    }

    return NextResponse.json({
      success: true,
      turn: newTurn,
      session: updatedSession,
      assessment,
      message: isStoryComplete 
        ? 'Story completed! Assessment generated.' 
        : 'Turn submitted successfully!',
    });

  } catch (error) {
    console.error('Story submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}