// app/api/stories/collaborate/route.ts - Updated for 13-Factor Assessment

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { collaborationEngine } from '@/lib/ai/collaboration';
import { SingleCallAssessmentEngine } from '@/lib/ai/SingleCallAssessmentEngine';
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

    const { sessionId, childInput } = await req.json();

    if (!sessionId || !childInput?.trim()) {
      return NextResponse.json(
        { error: 'Session ID and child input are required' },
        { status: 400 }
      );
    }

    const storySession = await StorySession.findOne({
      _id: sessionId,
      childId: session.user.id,
      status: 'active',
    });

    if (!storySession) {
      return NextResponse.json(
        { error: 'Story session not found or not active' },
        { status: 404 }
      );
    }

    if (storySession.apiCallsUsed >= storySession.maxApiCalls) {
      return NextResponse.json(
        { error: 'Maximum story turns reached' },
        { status: 403 }
      );
    }

    const turnNumber = storySession.currentTurn;
    const childWords = childInput.trim().split(/\s+/).filter(Boolean);

    // Build story context for AI
    const previousTurns = await Turn.find({ sessionId })
      .sort({ turnNumber: 1 })
      .limit(6);

    let storyContext = storySession.aiOpening || '';
    previousTurns.forEach((turn) => {
      if (turn.childInput) storyContext += `\n\n${turn.childInput}`;
      if (turn.aiResponse) storyContext += `\n\n${turn.aiResponse}`;
    });

    // Generate AI response
    const aiResponse = await collaborationEngine.generateFreeformResponse(
      childInput.trim(),
      storyContext,
      turnNumber
    );

    // Save the turn
    const newTurn = new Turn({
      sessionId: new mongoose.Types.ObjectId(sessionId),
      turnNumber,
      childInput: childInput.trim(),
      aiResponse: aiResponse,
      timestamp: new Date(),
    });

    await newTurn.save();

    // Update session
    const updateData: any = {
      currentTurn: turnNumber + 1,
      totalWords:
        storySession.totalWords +
        childWords.length +
        (aiResponse ? aiResponse.split(/\s+/).filter(Boolean).length : 0),
      childWords: storySession.childWords + childWords.length,
      apiCallsUsed: storySession.apiCallsUsed + 1,
      updatedAt: new Date(),
    };

    // If this is the final turn, trigger 13-factor teacher assessment
    if (turnNumber >= 7) {
      updateData.status = 'completed';
      updateData.completedAt = new Date();
      console.log(
        `Story completed after ${turnNumber} turns - starting 13-factor assessment`
      );

      try {
        // Get full story content for assessment
        const allTurns = await Turn.find({ sessionId }).sort({ turnNumber: 1 });
        let fullStoryContent = '';

        if (storySession.aiOpening) {
          fullStoryContent += `${storySession.aiOpening}\n\n`;
        }

        const userTurns = allTurns
          .filter((turn) => turn.childInput)
          .map((turn) => turn.childInput.trim());

        fullStoryContent += userTurns.join('\n\n');

        console.log(
          `Starting 13-factor assessment for ${fullStoryContent.length} characters`
        );

        // ✅ Perform 13-factor assessment
        const assessment = await SingleCallAssessmentEngine.performAssessment(
          fullStoryContent,
          {
            childAge: 10,
            storyTitle: storySession.title || 'Collaborative Story',
          }
        );

        console.log(
          `13-factor assessment completed for "${storySession.title}"`
        );

        // Save teacher-style assessment
        updateData.assessment = {
          version: '1.0-13-factor',
          date: new Date().toISOString(),
          type: 'collaborative',
          fullFeedback: assessment, // full JSON with all 13 categories
        };
        updateData.overallScore = null; // no numeric scoring in 13-factor
      } catch (assessmentError) {
        let message = 'Story completed but assessment could not be generated';
        if (
          assessmentError &&
          typeof assessmentError === 'object' &&
          'message' in assessmentError
        ) {
          message = (assessmentError as any).message;
        }
        console.error(
          '13-factor assessment failed for collaborative story:',
          assessmentError
        );
        updateData.assessment = {
          error: 'Assessment failed',
          message,
          version: 'error',
        };
      }
    }

    await StorySession.findByIdAndUpdate(sessionId, { $set: updateData });

    return NextResponse.json({
      success: true,
      turn: {
        turnNumber,
        childInput: childInput.trim(),
        aiResponse: aiResponse,
      },
      storyCompleted: turnNumber >= 7,
      assessmentReady: turnNumber >= 7,
    });
  } catch (error) {
    console.error('Collaboration error:', error);
    return NextResponse.json(
      { error: 'Failed to process story collaboration' },
      { status: 500 }
    );
  }
}
