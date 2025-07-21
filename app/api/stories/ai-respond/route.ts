// // // app/api/stories/ai-respond/route.ts (FIXED)
// // import { NextResponse } from 'next/server';
// // import { getServerSession } from 'next-auth';
// // import { authOptions } from '@/utils/authOptions';
// // import { connectToDatabase } from '@/utils/db';
// // import StorySession from '@/models/StorySession';
// // import Turn from '@/models/Turn';
// // import { collaborationEngine } from '@/lib/ai/collaboration';

// // export async function POST(request: Request) {
// //   try {
// //     const session = await getServerSession(authOptions);
    
// //     if (!session || session.user.role !== 'child') {
// //       return NextResponse.json(
// //         { error: 'Access denied. Children only.' },
// //         { status: 403 }
// //       );
// //     }

// //     const { sessionId, childInput, turnNumber } = await request.json();

// //     if (!sessionId || !childInput || !turnNumber) {
// //       return NextResponse.json(
// //         { error: 'Missing required fields' },
// //         { status: 400 }
// //       );
// //     }

// //     await connectToDatabase();

// //     // Get story session
// //     const storySession = await StorySession.findOne({
// //       _id: sessionId,
// //       childId: session.user.id
// //     }) as any;

// //     if (!storySession) {
// //       return NextResponse.json(
// //         { error: 'Story session not found' },
// //         { status: 404 }
// //       );
// //     }

// //     // Get previous turns for context
// //     const previousTurns = await Turn.find({ sessionId })
// //       .sort({ turnNumber: 1 })
// //       .lean() as any;

// //     // ✅ Use the simpler method that works
// //     const aiResponse = await collaborationEngine.generateContextualResponse(
// //       storySession.elements,
// //       previousTurns.map((turn: any) => ({
// //         childInput: turn.childInput,
// //         aiResponse: turn.aiResponse
// //       })),
// //       childInput,
// //       turnNumber
// //     );

// //     // Count words in child input
// //     const wordCount = childInput.trim().split(/\s+/).length;

// //     // Save the turn
// //     const turn = await Turn.create({
// //       sessionId,
// //       turnNumber,
// //       childInput,
// //       aiResponse,
// //       wordCount
// //     });

// //     // Update session word count and current turn
// //     const updatedSession = await StorySession.findByIdAndUpdate(sessionId, {
// //       $inc: { 
// //         totalWords: wordCount,
// //         apiCallsUsed: 1
// //       },
// //       $set: { 
// //         currentTurn: turnNumber + 1,
// //         updatedAt: new Date(),
// //         status: turnNumber >= 6 ? 'completed' : 'active'
// //       }
// //     }, { new: true });

// //     return NextResponse.json({
// //       success: true,
// //       turn: {
// //         id: turn._id,
// //         turnNumber: turn.turnNumber,
// //         childInput: turn.childInput,
// //         aiResponse: turn.aiResponse,
// //         wordCount: turn.wordCount
// //       },
// //       session: {
// //         currentTurn: updatedSession?.currentTurn,
// //         totalWords: updatedSession?.totalWords,
// //         apiCallsUsed: updatedSession?.apiCallsUsed,
// //         status: updatedSession?.status,
// //         completed: turnNumber >= 6
// //       }
// //     });

// //   } catch (error) {
// //     console.error('Error generating AI response:', error);
// //     return NextResponse.json(
// //       { error: 'Failed to generate AI response' },
// //       { status: 500 }
// //     );
// //   }
// // }

// // app/api/stories/ai-respond/route.ts (FIXED API CALLS UPDATE)
// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/utils/authOptions';
// import { connectToDatabase } from '@/utils/db';
// import StorySession from '@/models/StorySession';
// import Turn from '@/models/Turn';
// import { collaborationEngine } from '@/lib/ai/collaboration';

// export async function POST(request: Request) {
//   try {
//     const session = await getServerSession(authOptions);
    
//     if (!session || session.user.role !== 'child') {
//       return NextResponse.json(
//         { error: 'Access denied. Children only.' },
//         { status: 403 }
//       );
//     }

//     const { sessionId, childInput, turnNumber } = await request.json();

//     if (!sessionId || !childInput || !turnNumber) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     await connectToDatabase();

//     // Get story session
//     const storySession = await StorySession.findOne({
//       _id: sessionId,
//       childId: session.user.id
//     }) as any;

//     if (!storySession) {
//       return NextResponse.json(
//         { error: 'Story session not found' },
//         { status: 404 }
//       );
//     }

//     // Get previous turns for context
//     const previousTurns = await Turn.find({ sessionId })
//       .sort({ turnNumber: 1 })
//       .lean() as any;

//     // ✅ Generate AI response using contextual method
//     const aiResponse = await collaborationEngine.generateContextualResponse(
//       storySession.elements,
//       previousTurns.map((turn: any) => ({
//         childInput: turn.childInput,
//         aiResponse: turn.aiResponse
//       })),
//       childInput,
//       turnNumber
//     );

//     // Count words in child input
//     const wordCount = childInput.trim().split(/\s+/).length;

//     // Save the turn
//     const turn = await Turn.create({
//       sessionId,
//       turnNumber,
//       childInput,
//       aiResponse,
//       wordCount
//     });

//     // ✅ FIXED: Update session with proper API call increment and session data
//     const updatedSession = await StorySession.findByIdAndUpdate(
//       sessionId, 
//       {
//         $inc: { 
//           totalWords: wordCount,
//           apiCallsUsed: 1  // ✅ INCREMENT API CALLS HERE!
//         },
//         $set: { 
//           currentTurn: turnNumber + 1,
//           updatedAt: new Date(),
//           status: turnNumber >= 6 ? 'completed' : 'active'
//         }
//       }, 
//       { new: true } // Return updated document
//     );

//     console.log('✅ Updated session API calls:', updatedSession?.apiCallsUsed);

//     return NextResponse.json({
//       success: true,
//       turn: {
//         id: turn._id,
//         turnNumber: turn.turnNumber,
//         childInput: turn.childInput,
//         aiResponse: turn.aiResponse,
//         wordCount: turn.wordCount
//       },
//       session: {
//         currentTurn: updatedSession?.currentTurn,
//         totalWords: updatedSession?.totalWords,
//         apiCallsUsed: updatedSession?.apiCallsUsed, // ✅ Return updated API calls
//         maxApiCalls: updatedSession?.maxApiCalls,
//         status: updatedSession?.status,
//         completed: turnNumber >= 6
//       }
//     });

//   } catch (error) {
//     console.error('Error generating AI response:', error);
//     return NextResponse.json(
//       { error: 'Failed to generate AI response' },
//       { status: 500 }
//     );
//   }
// }

// app/api/stories/ai-respond/route.ts (FIXED API CALLS UPDATE)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import { collaborationEngine } from '@/lib/ai/collaboration';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const { sessionId, childInput, turnNumber } = await request.json();

    if (!sessionId || !childInput || !turnNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get story session
    const storySession = await StorySession.findOne({
      _id: sessionId,
      childId: session.user.id
    }) as any;

    if (!storySession) {
      return NextResponse.json(
        { error: 'Story session not found' },
        { status: 404 }
      );
    }

    // Get previous turns for context
    const previousTurns = await Turn.find({ sessionId })
      .sort({ turnNumber: 1 })
      .lean() as any;

    // ✅ Generate AI response using contextual method
    const aiResponse = await collaborationEngine.generateContextualResponse(
      storySession.elements,
      previousTurns.map((turn: any) => ({
        childInput: turn.childInput,
        aiResponse: turn.aiResponse
      })),
      childInput,
      turnNumber
    );

    // Count words in child input
    const wordCount = childInput.trim().split(/\s+/).length;

    // Save the turn
    const turn = await Turn.create({
      sessionId,
      turnNumber,
      childInput,
      aiResponse,
      wordCount
    });

    // ✅ FIXED: Update session with proper API call increment and session data
    const updatedSession = await StorySession.findByIdAndUpdate(
      sessionId, 
      {
        $inc: { 
          totalWords: wordCount,
          apiCallsUsed: 1  // ✅ INCREMENT API CALLS HERE!
        },
        $set: { 
          currentTurn: turnNumber + 1,
          updatedAt: new Date(),
          status: turnNumber >= 6 ? 'completed' : 'active'
        }
      }, 
      { new: true } // Return updated document
    ) as any;

    console.log('✅ Updated session API calls:', updatedSession?.apiCallsUsed);
    console.log('✅ Updated session details:', {
      id: sessionId,
      apiCallsUsed: updatedSession?.apiCallsUsed,
      totalWords: updatedSession?.totalWords,
      currentTurn: updatedSession?.currentTurn
    });

    return NextResponse.json({
      success: true,
      turn: {
        id: turn._id,
        turnNumber: turn.turnNumber,
        childInput: turn.childInput,
        aiResponse: turn.aiResponse,
        wordCount: turn.wordCount
      },
      session: {
        currentTurn: updatedSession?.currentTurn,
        totalWords: updatedSession?.totalWords,
        apiCallsUsed: updatedSession?.apiCallsUsed, // ✅ Return updated API calls
        maxApiCalls: updatedSession?.maxApiCalls,
        status: updatedSession?.status,
        completed: turnNumber >= 6
      }
    });

  } catch (error) {
    console.error('Error generating AI response:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    );
  }
}