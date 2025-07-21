
// // app/api/stories/create-session/route.ts (SAVE AI OPENING TO DATABASE)
// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/utils/authOptions';
// import { connectToDatabase } from '@/utils/db';
// import StorySession from '@/models/StorySession';
// import { collaborationEngine } from '@/lib/ai/collaboration';
// import { StoryCreationRequest } from '@/types/story';

// export async function POST(request: Request) {
//   try {
//     const session = await getServerSession(authOptions);
    
//     if (!session || session.user.role !== 'child') {
//       return NextResponse.json(
//         { error: 'Access denied. Children only.' },
//         { status: 403 }
//       );
//     }

//     const body: StoryCreationRequest = await request.json();
//     const { elements } = body;

//     // Validate all required elements are present
//     const requiredElements = ['genre', 'character', 'setting', 'theme', 'mood', 'tone'];
//     for (const element of requiredElements) {
//       if (!elements[element as keyof typeof elements]) {
//         return NextResponse.json(
//           { error: `Missing required element: ${element}` },
//           { status: 400 }
//         );
//       }
//     }

//     await connectToDatabase();

//     // Generate story title based on elements
//     const title = `${elements.character} and the ${elements.setting}`;

//     // ✅ GENERATE AI OPENING ONCE AND SAVE IT
//     console.log('Generating AI opening prompt with elements:', elements);
//     const aiOpening = await collaborationEngine.generateOpeningPrompt(elements);
//     console.log('AI Opening generated:', aiOpening);

//     // ✅ Create new story session WITH AI OPENING SAVED
//     const newSession = await StorySession.create({
//       childId: session.user.id,
//       title,
//       elements,
//       aiOpening, // ✅ Save AI opening so it never changes
//       currentTurn: 1,
//       totalWords: 0,
//       apiCallsUsed: 1, // Used 1 for the opening
//       maxApiCalls: 7,
//       status: 'active'
//     });

//     console.log('Story session created successfully:', newSession._id);

//     return NextResponse.json({
//       success: true,
//       session: {
//         id: newSession._id,
//         title: newSession.title,
//         elements: newSession.elements,
//         currentTurn: newSession.currentTurn,
//         totalWords: newSession.totalWords,
//         apiCallsUsed: newSession.apiCallsUsed,
//         maxApiCalls: newSession.maxApiCalls,
//         status: newSession.status
//       },
//       aiOpening // Return the saved opening
//     });

//   } catch (error) {
//     console.error('Error creating story session:', error);
//     return NextResponse.json(
//       { error: 'Failed to create story session' },
//       { status: 500 }
//     );
//   }
// }

// app/api/stories/create-session/route.ts (SAVE AI OPENING TO DATABASE)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import { collaborationEngine } from '@/lib/ai/collaboration';
import { StoryCreationRequest } from '@/types/story';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const body: StoryCreationRequest = await request.json();
    const { elements } = body;

    // Validate all required elements are present
    const requiredElements = ['genre', 'character', 'setting', 'theme', 'mood', 'tone'];
    for (const element of requiredElements) {
      if (!elements[element as keyof typeof elements]) {
        return NextResponse.json(
          { error: `Missing required element: ${element}` },
          { status: 400 }
        );
      }
    }

    await connectToDatabase();

    // Generate story title based on elements
    const title = `${elements.character} and the ${elements.setting}`;

    // ✅ GENERATE AI OPENING ONCE AND SAVE IT
    console.log('Generating AI opening prompt with elements:', elements);
    const aiOpening = await collaborationEngine.generateOpeningPrompt(elements);
    console.log('AI Opening generated:', aiOpening);

    // ✅ Create new story session WITH AI OPENING SAVED
    const newSession = await StorySession.create({
      childId: session.user.id,
      title,
      elements,
      aiOpening, // ✅ Save AI opening so it never changes
      currentTurn: 1,
      totalWords: 0,
      apiCallsUsed: 1, // ✅ IMPORTANT: Start with 1 for the opening
      maxApiCalls: 7,
      status: 'active'
    });

    console.log('✅ Story session created with API calls:', newSession.apiCallsUsed);

    return NextResponse.json({
      success: true,
      session: {
        id: newSession._id,
        title: newSession.title,
        elements: newSession.elements,
        currentTurn: newSession.currentTurn,
        totalWords: newSession.totalWords,
        apiCallsUsed: newSession.apiCallsUsed,
        maxApiCalls: newSession.maxApiCalls,
        status: newSession.status
      },
      aiOpening // Return the saved opening
    });

  } catch (error) {
    console.error('Error creating story session:', error);
    return NextResponse.json(
      { error: 'Failed to create story session' },
      { status: 500 }
    );
  }
}