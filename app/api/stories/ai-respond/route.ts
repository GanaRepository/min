// // app/api/stories/ai-respond/route.ts
// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/utils/authOptions';
// import { connectToDatabase } from '@/utils/db';
// import StorySession from '@/models/StorySession';
// import Turn from '@/models/Turn';
// import { collaborationEngine } from '@/lib/ai/collaboration';
// import { checkRateLimit } from '@/lib/rate-limiter';

// interface TurnRequest {
//   sessionId: string;
//   childInput: string;
//   turnNumber: number;
// }

// export async function POST(request: Request) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || session.user.role !== 'child') {
//       return NextResponse.json(
//         { error: 'Access denied. Children only.' },
//         { status: 403 }
//       );
//     }

//     // Rate limiting check
//     const rateCheck = checkRateLimit(session.user.id, 'story-submit');
//     if (!rateCheck.allowed) {
//       return NextResponse.json(
//         {
//           error: rateCheck.message,
//           retryAfter: rateCheck.retryAfter,
//         },
//         { status: 429 }
//       );
//     }

//     const body: TurnRequest = await request.json();
//     const { sessionId, childInput, turnNumber } = body;

//     if (!sessionId || !childInput || !turnNumber) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     // Validate word count
//     const wordCount = childInput.trim().split(/\s+/).filter(Boolean).length;

//     if (wordCount < 60) {
//       return NextResponse.json(
//         {
//           error: 'Minimum 60 words required',
//           currentWords: wordCount,
//           minimumWords: 60,
//         },
//         { status: 400 }
//       );
//     }

//     if (wordCount > 100) {
//       return NextResponse.json(
//         {
//           error: 'Maximum 100 words allowed',
//           currentWords: wordCount,
//           maximumWords: 100,
//         },
//         { status: 400 }
//       );
//     }

//     await connectToDatabase();

//     // Get story session
//     const storySession = await StorySession.findOne({
//       _id: sessionId,
//       childId: session.user.id,
//       status: 'active',
//     });

//     if (!storySession) {
//       return NextResponse.json(
//         { error: 'Story session not found or not active' },
//         { status: 404 }
//       );
//     }

//     // Check API call limit
//     if (storySession.apiCallsUsed >= storySession.maxApiCalls) {
//       return NextResponse.json(
//         { error: 'API call limit reached' },
//         { status: 400 }
//       );
//     }

//     // Get previous turns for context
//     const previousTurns = await Turn.find({ sessionId })
//       .sort({ turnNumber: 1 })
//       .lean();

//     // Generate AI response
//     const aiResponse = await collaborationEngine.generateContextualResponse(
//       storySession.elements,
//       previousTurns.map((turn: any) => ({
//         childInput: turn.childInput,
//         aiResponse: turn.aiResponse,
//       })),
//       childInput,
//       turnNumber
//     );

//     const aiWordCount = aiResponse.trim().split(/\s+/).filter(Boolean).length;

//     // Save the turn
//     const turn = await Turn.create({
//       sessionId,
//       turnNumber,
//       childInput,
//       aiResponse,
//       childWordCount: wordCount,
//       aiWordCount: aiWordCount,
//     });

//     // Check if story is complete
//     const isStoryComplete = turnNumber >= 6;

//     // Update session with completion status
//     const updatedSession = await StorySession.findByIdAndUpdate(
//       sessionId,
//       {
//         $inc: {
//           totalWords: wordCount + aiWordCount,
//           childWords: wordCount,
//           apiCallsUsed: 1,
//         },
//         $set: {
//           currentTurn: turnNumber + 1,
//           status: isStoryComplete ? 'completed' : 'active',
//           ...(isStoryComplete && { completedAt: new Date() }),
//         },
//       },
//       { new: true }
//     );

//     return NextResponse.json({
//       success: true,
//       turn: {
//         id: turn._id,
//         turnNumber: turn.turnNumber,
//         childInput: turn.childInput,
//         aiResponse: turn.aiResponse,
//         childWordCount: turn.childWordCount,
//         aiWordCount: turn.aiWordCount,
//       },
//       session: {
//         currentTurn: updatedSession?.currentTurn,
//         totalWords: updatedSession?.totalWords,
//         childWords: updatedSession?.childWords,
//         apiCallsUsed: updatedSession?.apiCallsUsed,
//         maxApiCalls: updatedSession?.maxApiCalls,
//         status: updatedSession?.status,
//         completed: isStoryComplete,
//       },
//     });
//   } catch (error) {
//     console.error('Error generating AI response:', error);
//     return NextResponse.json(
//       { error: 'Failed to generate AI response' },
//       { status: 500 }
//     );
//   }
// }

// app/api/stories/ai-respond/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import { collaborationEngine } from '@/lib/ai/collaboration';
import { checkRateLimit } from '@/lib/rate-limiter';
import mongoose from 'mongoose';

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

    // FIXED: More robust session lookup
    let storySession = null;

    console.log('Looking for story session with ID:', sessionId, 'for user:', session.user.id);

    // Try to find by MongoDB ObjectId first
    if (mongoose.Types.ObjectId.isValid(sessionId)) {
      storySession = await StorySession.findOne({
        _id: sessionId,
        childId: session.user.id,
        status: { $in: ['active', 'paused'] } // Allow both active and paused
      });
      console.log('Found by ObjectId:', !!storySession, storySession?.status);
    }

    // If not found by ObjectId, try by storyNumber
    if (!storySession && !isNaN(Number(sessionId))) {
      storySession = await StorySession.findOne({
        storyNumber: Number(sessionId),
        childId: session.user.id,
        status: { $in: ['active', 'paused'] } // Allow both active and paused
      });
      console.log('Found by storyNumber:', !!storySession, storySession?.status);
    }

    if (!storySession) {
      console.log('No story session found for:', sessionId);
      return NextResponse.json(
        { error: 'Story session not found or not accessible' },
        { status: 404 }
      );
    }

    // If session is paused, automatically resume it
    if (storySession.status === 'paused') {
      storySession = await StorySession.findByIdAndUpdate(
        storySession._id,
        {
          status: 'active',
          resumedAt: new Date(),
        },
        { new: true }
      );
      
      console.log('Auto-resumed paused story session:', storySession._id);
    }

    // Check API call limit
    if (storySession.apiCallsUsed >= storySession.maxApiCalls) {
      return NextResponse.json(
        { error: 'API call limit reached' },
        { status: 400 }
      );
    }

    // Get previous turns for context using the actual MongoDB _id
    const actualSessionId = storySession._id.toString();
    const previousTurns = await Turn.find({ sessionId: actualSessionId })
      .sort({ turnNumber: 1 })
      .lean();

    console.log('Found previous turns:', previousTurns.length);

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

    // Save the turn using the actual MongoDB _id
    const turn = await Turn.create({
      sessionId: actualSessionId,
      turnNumber,
      childInput,
      aiResponse,
      childWordCount: wordCount,
      aiWordCount: aiWordCount,
    });

    console.log('Created turn:', turn._id, 'for session:', actualSessionId);

    // Check if story is complete
    const isStoryComplete = turnNumber >= 6;

    // Update session with completion status
    const updatedSession = await StorySession.findByIdAndUpdate(
      storySession._id,
      {
        $inc: {
          totalWords: wordCount + aiWordCount,
          childWords: wordCount,
          apiCallsUsed: 1,
        },
        $set: {
          currentTurn: turnNumber + 1,
          status: isStoryComplete ? 'completed' : 'active',
          ...(isStoryComplete && { completedAt: new Date() }),
        },
      },
      { new: true }
    );

    console.log('Updated session:', updatedSession?._id, 'status:', updatedSession?.status);

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