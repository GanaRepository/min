// // // app/api/stories/session/[sessionId]/route.ts (CREATE THIS FILE)
// // import { NextResponse } from 'next/server';
// // import { getServerSession } from 'next-auth';
// // import { authOptions } from '@/utils/authOptions';
// // import { connectToDatabase } from '@/utils/db';
// // import StorySession from '@/models/StorySession';
// // import Turn from '@/models/Turn';

// // export async function GET(
// //   request: Request,
// //   { params }: { params: { sessionId: string } }
// // ) {
// //   try {
// //     const session = await getServerSession(authOptions);
    
// //     if (!session || session.user.role !== 'child') {
// //       return NextResponse.json(
// //         { error: 'Access denied. Children only.' },
// //         { status: 403 }
// //       );
// //     }

// //     const { sessionId } = params;

// //     await connectToDatabase();

// //     // Get story session
// //     const storySession = await StorySession.findOne({
// //       _id: sessionId,
// //       childId: session.user.id
// //     }).lean() as any;

// //     if (!storySession) {
// //       return NextResponse.json(
// //         { error: 'Story session not found' },
// //         { status: 404 }
// //       );
// //     }

// //     // Get all turns for this session
// //     const turns = await Turn.find({ sessionId })
// //       .sort({ turnNumber: 1 })
// //       .lean();

// //     // ✅ Generate AI opening if no turns exist yet
// //     let aiOpening = null;
// //     if (turns.length === 0) {
// //       const { collaborationEngine } = await import('@/lib/ai/collaboration');
// //       aiOpening = await collaborationEngine.generateOpeningPrompt(storySession.elements);
// //     }

// //     return NextResponse.json({
// //       success: true,
// //       session: storySession,
// //       turns,
// //       aiOpening, // ✅ Include AI opening
// //       storyElements: storySession.elements // ✅ Include story elements
// //     });

// //   } catch (error) {
// //     console.error('Error fetching story session:', error);
// //     return NextResponse.json(
// //       { error: 'Failed to fetch story session' },
// //       { status: 500 }
// //     );
// //   }
// // }

// // app/api/stories/session/[sessionId]/route.ts (FIXED TO ALWAYS SHOW AI OPENING)
// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/utils/authOptions';
// import { connectToDatabase } from '@/utils/db';
// import StorySession from '@/models/StorySession';
// import Turn from '@/models/Turn';

// export async function GET(
//   request: Request,
//   { params }: { params: { sessionId: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
    
//     if (!session || session.user.role !== 'child') {
//       return NextResponse.json(
//         { error: 'Access denied. Children only.' },
//         { status: 403 }
//       );
//     }

//     const { sessionId } = params;

//     await connectToDatabase();

//     // Get story session
//     const storySession = await StorySession.findOne({
//       _id: sessionId,
//       childId: session.user.id
//     }).lean() as any;

//     if (!storySession) {
//       return NextResponse.json(
//         { error: 'Story session not found' },
//         { status: 404 }
//       );
//     }

//     // Get all turns for this session
//     const turns = await Turn.find({ sessionId })
//       .sort({ turnNumber: 1 })
//       .lean() as any;

//     // ✅ ALWAYS generate AI opening (even if turns exist - for display purposes)
//     let aiOpening = null;
//     try {
//       const { collaborationEngine } = await import('@/lib/ai/collaboration');
//       aiOpening = await collaborationEngine.generateOpeningPrompt(storySession.elements);
//       console.log('✅ AI Opening generated for display:', aiOpening?.substring(0, 100));
//     } catch (error) {
//       console.error('Error generating AI opening:', error);
//       // Fallback AI opening if generation fails
//       aiOpening = `Welcome to your ${storySession.elements.mood} adventure featuring a ${storySession.elements.character} in a ${storySession.elements.setting}! Your story of ${storySession.elements.theme} is about to begin. What happens first in your ${storySession.elements.tone} tale?`;
//     }

//     return NextResponse.json({
//       success: true,
//       session: storySession,
//       turns,
//       aiOpening, // ✅ Always include AI opening
//       storyElements: storySession.elements
//     });

//   } catch (error) {
//     console.error('Error fetching story session:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch story session' },
//       { status: 500 }
//     );
//   }
// }

// app/api/stories/session/[sessionId]/route.ts (FIXED TO ALWAYS SHOW AI OPENING)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const { sessionId } = params;

    await connectToDatabase();

    // Get story session
    const storySession = await StorySession.findOne({
      _id: sessionId,
      childId: session.user.id
    }).lean() as any;

    if (!storySession) {
      return NextResponse.json(
        { error: 'Story session not found' },
        { status: 404 }
      );
    }

    // Get all turns for this session
    const turns = await Turn.find({ sessionId })
      .sort({ turnNumber: 1 })
      .lean() as any;

    // ✅ ONLY generate AI opening if no turns exist (don't waste API calls!)
    let aiOpening = null;
    if (turns.length === 0) {
      try {
        const { collaborationEngine } = await import('@/lib/ai/collaboration');
        aiOpening = await collaborationEngine.generateOpeningPrompt(storySession.elements);
        console.log('✅ AI Opening generated for first time:', aiOpening?.substring(0, 100));
      } catch (error) {
        console.error('Error generating AI opening:', error);
        // Fallback AI opening if generation fails
        aiOpening = `Welcome to your ${storySession.elements.mood} adventure featuring a ${storySession.elements.character} in a ${storySession.elements.setting}! Your story of ${storySession.elements.theme} is about to begin. What happens first in your ${storySession.elements.tone} tale?`;
      }
    } else {
      // Use a static message when story is in progress
      aiOpening = `Welcome back to your ${storySession.elements.mood} adventure! Continue your story about a ${storySession.elements.character} in a ${storySession.elements.setting}.`;
    }

    return NextResponse.json({
      success: true,
      session: storySession,
      turns,
      aiOpening, // ✅ Always include AI opening
      storyElements: storySession.elements
    });

  } catch (error) {
    console.error('Error fetching story session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story session' },
      { status: 500 }
    );
  }
}