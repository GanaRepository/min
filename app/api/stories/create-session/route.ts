// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/utils/authOptions';
// import { connectToDatabase } from '@/utils/db';
// import { SUBSCRIPTION_TIERS } from '@/config/tiers';
// import { DEFAULT_TIER } from '@/config/tiers';
// import StorySession from '@/models/StorySession';
// import User from '@/models/User';
// import PendingStoryElements from '@/models/PendingStoryElements';
// import { collaborationEngine } from '@/lib/ai/collaboration';
// import { checkRateLimit } from '@/lib/rate-limiter';
// import type { StoryElements } from '@/config/story-elements';
// import crypto from 'crypto';

// interface StoryCreationRequest {
//   elements?: StoryElements;
//   pendingToken?: string;
//   storyMode?: 'guided' | 'freeform';
//   openingText?: string;
// }

// function validateElements(elements: any): boolean {
//   const requiredElements = [
//     'genre',
//     'character',
//     'setting',
//     'theme',
//     'mood',
//     'tone',
//   ];
//   return requiredElements.every((element) => elements[element]);
// }

// async function generateAIOpeningInBackground(
//   sessionId: string,
//   elements?: StoryElements,
//   userOpening?: string
// ) {
//   try {
//     console.log(`🤖 Starting AI opening generation for session: ${sessionId}`);

//     let aiOpening: string;
//     let apiCallsUsed = 0;

//     if (elements) {
//       // Guided story - use AI to generate opening
//       aiOpening = await collaborationEngine.generateOpeningPrompt(elements);
//       apiCallsUsed = 1;
//     } else {
//       // Freeform story - use child's text directly, no AI call
//       aiOpening = userOpening || 'Start writing your creative story...';
//       apiCallsUsed = 0;
//     }

//     await StorySession.findByIdAndUpdate(sessionId, {
//       aiOpening,
//       apiCallsUsed,
//     });

//     console.log(`✅ AI opening generated and saved for session: ${sessionId}`);
//   } catch (error) {
//     console.error(`❌ Failed to generate AI opening for ${sessionId}:`, error);

//     const fallbackOpening = elements
//       ? `Welcome to your ${elements.genre} adventure! Your character ${elements.character} is ready to explore ${elements.setting}. What happens first in this ${elements.mood} story?`
//       : userOpening || 'Start writing your creative story...';

//     await StorySession.findByIdAndUpdate(sessionId, {
//       aiOpening: fallbackOpening,
//       apiCallsUsed: 0,
//     });

//     console.log(`✅ Fallback opening saved for session: ${sessionId}`);
//   }
// }

// async function createStorySession(
//   userId: string,
//   elements?: StoryElements,
//   storyMode: 'guided' | 'freeform' = 'guided',
//   openingText?: string
// ) {
//   await connectToDatabase();

//   const user = await User.findById(userId);
//   if (!user) {
//     return NextResponse.json({ error: 'User not found' }, { status: 404 });
//   }

//   const userTier = user.subscriptionTier || 'FREE';
//   const tierConfig = SUBSCRIPTION_TIERS[userTier] || DEFAULT_TIER;

//   // Rate limiting check using centralized config
//   const rateCheck = checkRateLimit(userId, 'story-create', userTier);
//   if (!rateCheck.allowed) {
//     return NextResponse.json(
//       { error: rateCheck.message, retryAfter: rateCheck.retryAfter },
//       { status: 429 }
//     );
//   }

//   const lastSession = (await StorySession.findOne({ childId: userId })
//     .sort({ storyNumber: -1 })
//     .select('storyNumber')
//     .lean()) as { storyNumber: number } | null;

//   const nextStoryNumber = lastSession ? lastSession.storyNumber + 1 : 1;

//   const title = elements
//     ? `${elements.character}'s ${elements.genre} Adventure`
//     : `My Creative Story #${nextStoryNumber}`;

//   const sessionData: any = {
//     childId: userId,
//     storyNumber: nextStoryNumber,
//     title,
//     storyMode,
//     aiOpening: null,
//     currentTurn: 1,
//     totalWords: 0,
//     childWords: 0,
//     apiCallsUsed: 0,
//     maxApiCalls: tierConfig.aiCalls,
//     status: 'active',
//   };

//   if (storyMode === 'guided' && elements) {
//     sessionData.elements = elements;
//   }

//   const newSession = await StorySession.create(sessionData);

//   console.log(`✅ Created new ${storyMode} story session: ${newSession._id}`);

//   await User.findByIdAndUpdate(userId, {
//     $inc: {
//       totalStoriesCreated: 1,
//       storiesCreatedThisMonth: 1,
//     },
//     $set: { lastActiveDate: new Date() },
//   });

//   generateAIOpeningInBackground(
//     newSession._id.toString(),
//     elements,
//     openingText
//   );

//   return NextResponse.json({
//     success: true,
//     session: {
//       id: newSession._id,
//       storyNumber: newSession.storyNumber,
//       title: newSession.title,
//       elements: newSession.elements || null,
//       storyMode: newSession.storyMode,
//       currentTurn: newSession.currentTurn,
//       totalWords: newSession.totalWords,
//       childWords: newSession.childWords,
//       apiCallsUsed: newSession.apiCallsUsed,
//       maxApiCalls: newSession.maxApiCalls,
//       status: newSession.status,
//     },
//     aiOpening: null,
//   });
// }

// export async function POST(request: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     const body: StoryCreationRequest = await request.json();

//     console.log(`📝 Create-session API called:`, {
//       hasSession: !!session,
//       userRole: session?.user?.role,
//       hasElements: !!body.elements,
//       hasPendingToken: !!body.pendingToken,
//       storyMode: body.storyMode || 'freeform',
//       hasOpeningText: !!body.openingText,
//     });

//     await connectToDatabase();

//     if (body.pendingToken) {
//       if (!session || session.user.role !== 'child') {
//         return NextResponse.json(
//           { error: 'Access denied. Children only.' },
//           { status: 403 }
//         );
//       }

//       console.log(
//         `🔍 Processing pending token: ${body.pendingToken.substring(0, 8)}...`
//       );

//       const pendingElements = await PendingStoryElements.findOne({
//         sessionToken: body.pendingToken,
//         expiresAt: { $gt: new Date() },
//       });

//       if (!pendingElements) {
//         console.log(
//           `❌ Token not found or expired: ${body.pendingToken.substring(0, 8)}...`
//         );
//         return NextResponse.json(
//           { error: 'Token not found or expired. Please start over.' },
//           { status: 404 }
//         );
//       }

//       console.log(`✅ Token found, creating guided story from stored elements`);
//       await PendingStoryElements.findByIdAndDelete(pendingElements._id);
//       return await createStorySession(
//         session.user.id,
//         pendingElements.elements,
//         'guided'
//       );
//     }

//     if (body.elements) {
//       if (!validateElements(body.elements)) {
//         return NextResponse.json(
//           { error: 'Missing required story elements' },
//           { status: 400 }
//         );
//       }

//       if (!session || session.user.role !== 'child') {
//         console.log(`🔒 User not authenticated, storing elements in database`);

//         const token = crypto.randomBytes(32).toString('hex');
//         const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

//         await PendingStoryElements.create({
//           sessionToken: token,
//           elements: body.elements,
//           expiresAt,
//         });

//         console.log(
//           `📦 Stored elements in database with token: ${token.substring(0, 8)}...`
//         );

//         return NextResponse.json({
//           requiresAuth: true,
//           token,
//           message:
//             'Please log in to create your story. Your progress will be saved!',
//         });
//       }

//       console.log(`✅ User authenticated, creating guided story immediately`);
//       return await createStorySession(session.user.id, body.elements, 'guided');
//     }

//     if (
//       body.storyMode === 'freeform' ||
//       (!body.elements && !body.pendingToken)
//     ) {
//       if (!session || session.user.role !== 'child') {
//         return NextResponse.json(
//           { error: 'Access denied. Children only.' },
//           { status: 403 }
//         );
//       }

//       console.log(`✅ Creating freeform story for authenticated user`);
//       return await createStorySession(
//         session.user.id,
//         undefined,
//         'freeform',
//         body.openingText
//       );
//     }

//     return NextResponse.json(
//       {
//         error:
//           'Invalid request. Provide either elements, pendingToken, or specify freeform mode.',
//       },
//       { status: 400 }
//     );
//   } catch (error) {
//     console.error('❌ Error in create-session API:', error);
//     return NextResponse.json(
//       { error: 'Failed to process story creation request' },
//       { status: 500 }
//     );
//   }
// }


// app/api/stories/create-session/route.ts - UPDATED with usage checking
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import { UsageManager } from '@/lib/usage-manager';
import StorySession from '@/models/StorySession';
import User from '@/models/User';
import { collaborationEngine } from '@/lib/ai/collaboration';
import type { StoryElements } from '@/config/story-elements';

interface StoryCreationRequest {
  elements?: StoryElements;
  storyMode?: 'guided' | 'freeform';
  openingText?: string;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body: StoryCreationRequest = await request.json();

    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Check if user can create a story
    const usageCheck = await UsageManager.canCreateStory(session.user.id);
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

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get next story number
    const lastSession = await StorySession.findOne({ childId: session.user.id })
      .sort({ storyNumber: -1 })
      .select('storyNumber') as { storyNumber?: number } | null;

    const nextStoryNumber = lastSession && lastSession.storyNumber ? lastSession.storyNumber + 1 : 1;

    // Default to freeform mode for new pay-per-use system
    const storyMode = body.storyMode || 'freeform';
    
    const title = body.elements 
      ? `${body.elements.character}'s ${body.elements.genre} Adventure`
      : `My Creative Story #${nextStoryNumber}`;

    const sessionData: any = {
      childId: session.user.id,
      storyNumber: nextStoryNumber,
      title,
      storyMode,
      aiOpening: null,
      currentTurn: 1,
      totalWords: 0,
      childWords: 0,
      apiCallsUsed: 0,
      maxApiCalls: 7, // 7 calls for freeform mode
      status: 'active',
      isUploadedForAssessment: false, // This is a created story, not uploaded
    };

    if (storyMode === 'guided' && body.elements) {
      sessionData.elements = body.elements;
    }

    const newSession = await StorySession.create(sessionData);

    // Increment user's story creation counter
    await UsageManager.incrementStoryCreation(session.user.id);

    console.log(`✅ Created new ${storyMode} story session: ${newSession._id} for user ${user.email}`);

    // Generate AI opening in background (don't await)
    generateAIOpeningInBackground(newSession._id.toString(), body.elements, body.openingText);

    return NextResponse.json({
      success: true,
      session: {
        id: newSession._id,
        storyNumber: newSession.storyNumber,
        title: newSession.title,
        elements: newSession.elements || null,
        storyMode: newSession.storyMode,
        currentTurn: newSession.currentTurn,
        totalWords: newSession.totalWords,
        childWords: newSession.childWords,
        apiCallsUsed: newSession.apiCallsUsed,
        maxApiCalls: newSession.maxApiCalls,
        status: newSession.status,
      },
      aiOpening: null, // Will be updated via background process
    });

  } catch (error) {
    console.error('❌ Error in create-session API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create story session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function generateAIOpeningInBackground(
  sessionId: string,
  elements?: StoryElements,
  userOpening?: string
) {
  try {
    console.log(`🤖 Starting AI opening generation for session: ${sessionId}`);

    let aiOpening: string;
    let apiCallsUsed = 0;

    if (elements) {
      // Guided story - use AI to generate opening
      aiOpening = await collaborationEngine.generateOpeningPrompt(elements);
      apiCallsUsed = 1;
    } else {
      // Freeform story - use child's text or default prompt
      aiOpening = userOpening || "Welcome to your creative writing adventure! What story would you like to tell today?";
      apiCallsUsed = 0;
    }

    await StorySession.findByIdAndUpdate(sessionId, {
      aiOpening,
      apiCallsUsed,
    });

    console.log(`✅ AI opening generated and saved for session: ${sessionId}`);
  } catch (error) {
    console.error(`❌ Failed to generate AI opening for ${sessionId}:`, error);

    // Fallback opening
    const fallbackOpening = elements 
      ? `Welcome to your ${elements.genre} adventure! Your character ${elements.character} is ready to explore ${elements.setting}. What happens first in this ${elements.mood} story?`
      : userOpening || "Start writing your creative story here...";

    await StorySession.findByIdAndUpdate(sessionId, {
      aiOpening: fallbackOpening,
      apiCallsUsed: 0,
    });

    console.log(`✅ Fallback opening saved for session: ${sessionId}`);
  }
}