// app/api/stories/ai-respond/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import { collaborationEngine } from '@/lib/ai/collaboration';
import { checkRateLimit } from '@/lib/rate-limiter';

interface TurnRequest {
  sessionId: string;
  childInput: string;
  turnNumber: number;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    // Rate limiting check
    const rateCheck = checkRateLimit(session.user.id, 'story-submit');
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: rateCheck.message,
          retryAfter: rateCheck.retryAfter,
        },
        { status: 429 }
      );
    }

    const body: TurnRequest = await request.json();
    const { sessionId, childInput, turnNumber } = body;

    if (!sessionId || !childInput || !turnNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate word count
    const wordCount = childInput.trim().split(/\s+/).filter(Boolean).length;

    if (wordCount < 60) {
      return NextResponse.json(
        {
          error: 'Minimum 60 words required',
          currentWords: wordCount,
          minimumWords: 60,
        },
        { status: 400 }
      );
    }

    if (wordCount > 100) {
      return NextResponse.json(
        {
          error: 'Maximum 100 words allowed',
          currentWords: wordCount,
          maximumWords: 100,
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get story session
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

    // Check API call limit
    if (storySession.apiCallsUsed >= storySession.maxApiCalls) {
      return NextResponse.json(
        { error: 'API call limit reached' },
        { status: 400 }
      );
    }

    // Get previous turns for context
    const previousTurns = await Turn.find({ sessionId })
      .sort({ turnNumber: 1 })
      .lean();

    // Generate AI response
    const aiResponse = await collaborationEngine.generateContextualResponse(
      storySession.elements,
      previousTurns.map((turn: any) => ({
        childInput: turn.childInput,
        aiResponse: turn.aiResponse,
      })),
      childInput,
      turnNumber
    );

    const aiWordCount = aiResponse.trim().split(/\s+/).filter(Boolean).length;

    // Save the turn
    const turn = await Turn.create({
      sessionId,
      turnNumber,
      childInput,
      aiResponse,
      childWordCount: wordCount,
      aiWordCount: aiWordCount,
    });

    // Update session
    const isStoryComplete = turnNumber >= 6;
    const updatedSession = await StorySession.findByIdAndUpdate(
      sessionId,
      {
        $inc: {
          totalWords: wordCount + aiWordCount,
          childWords: wordCount,
          apiCallsUsed: 1,
        },
        $set: {
          currentTurn: turnNumber + 1,
          status: isStoryComplete ? 'completed' : 'active',
        },
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      turn: {
        id: turn._id,
        turnNumber: turn.turnNumber,
        childInput: turn.childInput,
        aiResponse: turn.aiResponse,
        childWordCount: turn.childWordCount,
        aiWordCount: turn.aiWordCount,
      },
      session: {
        currentTurn: updatedSession?.currentTurn,
        totalWords: updatedSession?.totalWords,
        childWords: updatedSession?.childWords,
        apiCallsUsed: updatedSession?.apiCallsUsed,
        maxApiCalls: updatedSession?.maxApiCalls,
        status: updatedSession?.status,
        completed: isStoryComplete,
      },
    });
  } catch (error) {
    console.error('Error generating AI response:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    );
  }
}
