// app/api/stories/ai-respond/route.ts

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
        {
          error: 'Maximum story turns reached. Story is ready for assessment!',
        },
        { status: 403 }
      );
    }

    const turnNumber = storySession.currentTurn;
    console.log(`Processing turn ${turnNumber} for story session ${sessionId}`);

    // Final turn: perform teacher-style 13-factor assessment
    if (turnNumber >= 7) {
      console.log(
        'Story has reached completion - triggering 13-factor teacher assessment'
      );

      try {
        const allTurns = await Turn.find({ sessionId }).sort({ turnNumber: 1 });
        let fullStoryContent = '';

        if (storySession.aiOpening) {
          fullStoryContent += `${storySession.aiOpening}\n\n`;
        }

        const allChildInputs = allTurns
          .map((turn) => turn.childInput)
          .filter(Boolean)
          .concat([childInput.trim()]);

        fullStoryContent += allChildInputs.join('\n\n');

        console.log(
          `Starting final 13-factor assessment for ${fullStoryContent.length} characters`
        );

        // Run simplified 13-factor assessment
        const assessment = await SingleCallAssessmentEngine.performAssessment(
          fullStoryContent,
          {
            childAge: 10,
            storyTitle: storySession.title || 'Collaborative Story',
          }
        );

        console.log('Final 13-factor assessment completed');

        const finalTurn = new Turn({
          sessionId: new mongoose.Types.ObjectId(sessionId),
          turnNumber,
          childInput: childInput.trim(),
          aiResponse:
            "Congratulations! You've completed your story! Let's see your detailed teacher-style feedback.",
          timestamp: new Date(),
        });

        await finalTurn.save();

        // Save the session with the 13-factor assessment
        await StorySession.findByIdAndUpdate(sessionId, {
          $set: {
            status: 'completed',
            completedAt: new Date(),
            currentTurn: turnNumber + 1,
            apiCallsUsed: storySession.apiCallsUsed + 1,
            assessment: {
              ...assessment,
              assessmentVersion: '1.0-13-factor',
              assessmentDate: new Date().toISOString(),
              assessmentType: 'teacher-style',
            },
            totalWords: fullStoryContent.split(/\s+/).filter(Boolean).length,
            childWords: allChildInputs.join(' ').split(/\s+/).filter(Boolean)
              .length,
          },
        });

        return NextResponse.json({
          success: true,
          storyCompleted: true,
          assessmentReady: true,
          turn: {
            turnNumber,
            childInput: childInput.trim(),
            aiResponse: finalTurn.aiResponse,
          },
          assessment: {
            message:
              'Your story has been completed and assessed with our 13-factor teacher feedback system!',
          },
        });
      } catch (assessmentError) {
        console.error(
          '13-factor assessment failed for story:',
          assessmentError
        );

        const finalTurn = new Turn({
          sessionId: new mongoose.Types.ObjectId(sessionId),
          turnNumber,
          childInput: childInput.trim(),
          aiResponse:
            "Congratulations! You've completed your story! Assessment will be available shortly.",
          timestamp: new Date(),
        });

        await finalTurn.save();

        await StorySession.findByIdAndUpdate(sessionId, {
          $set: {
            status: 'completed',
            completedAt: new Date(),
            currentTurn: turnNumber + 1,
            apiCallsUsed: storySession.apiCallsUsed + 1,
            assessment: {
              error: 'Assessment temporarily unavailable',
              message:
                'Story completed successfully. Assessment will be generated shortly.',
            },
          },
        });

        return NextResponse.json({
          success: true,
          storyCompleted: true,
          assessmentReady: false,
          turn: {
            turnNumber,
            childInput: childInput.trim(),
            aiResponse: finalTurn.aiResponse,
          },
          message: 'Story completed! Assessment will be available shortly.',
        });
      }
    }

    // ---- Normal non-final turn remains unchanged ----
    const childWords = childInput.trim().split(/\s+/).filter(Boolean);

    const previousTurns = await Turn.find({ sessionId })
      .sort({ turnNumber: 1 })
      .limit(6);

    let storyContext = storySession.aiOpening || '';
    previousTurns.forEach((turn) => {
      if (turn.childInput) storyContext += `\n\n${turn.childInput}`;
      if (turn.aiResponse) storyContext += `\n\n${turn.aiResponse}`;
    });

    const aiResponse = await collaborationEngine.generateFreeformResponse(
      childInput.trim(),
      storyContext,
      turnNumber
    );

    const newTurn = new Turn({
      sessionId: new mongoose.Types.ObjectId(sessionId),
      turnNumber,
      childInput: childInput.trim(),
      aiResponse,
      timestamp: new Date(),
    });

    await newTurn.save();

    await StorySession.findByIdAndUpdate(sessionId, {
      $set: {
        currentTurn: turnNumber + 1,
        totalWords:
          storySession.totalWords +
          childWords.length +
          aiResponse.split(/\s+/).filter(Boolean).length,
        childWords: storySession.childWords + childWords.length,
        apiCallsUsed: storySession.apiCallsUsed + 1,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      storyCompleted: false,
      turn: {
        turnNumber,
        childInput: childInput.trim(),
        aiResponse,
      },
      turnsRemaining: Math.max(0, 7 - (turnNumber + 1)),
    });
  } catch (error) {
    console.error('AI respond error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    );
  }
}
