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
//   const requiredElements = ['genre', 'character', 'setting', 'theme', 'mood', 'tone'];
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

//     if (elements) {
//       aiOpening = await collaborationEngine.generateOpeningPrompt(elements);
//     } else if (userOpening) {
//       aiOpening = userOpening;
//     } else {
//       aiOpening = await collaborationEngine.generateFreeformOpening();
//     }

//     await StorySession.findByIdAndUpdate(sessionId, {
//       aiOpening,
//       apiCallsUsed: elements ? 1 : 0,
//     });

//     console.log(`✅ AI opening generated and saved for session: ${sessionId}`);
//   } catch (error) {
//     console.error(`❌ Failed to generate AI opening for ${sessionId}:`, error);

//     const fallbackOpening = elements 
//       ? `Welcome to your ${elements.genre} adventure! Your character ${elements.character} is ready to explore ${elements.setting}. What happens first in this ${elements.mood} story?`
//       : userOpening || "Welcome to your creative writing adventure! What story would you like to tell today?";

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

//   generateAIOpeningInBackground(newSession._id.toString(), elements, openingText);

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

//       console.log(`🔍 Processing pending token: ${body.pendingToken.substring(0, 8)}...`);

//       const pendingElements = await PendingStoryElements.findOne({
//         sessionToken: body.pendingToken,
//         expiresAt: { $gt: new Date() },
//       });

//       if (!pendingElements) {
//         console.log(`❌ Token not found or expired: ${body.pendingToken.substring(0, 8)}...`);
//         return NextResponse.json(
//           { error: 'Token not found or expired. Please start over.' },
//           { status: 404 }
//         );
//       }

//       console.log(`✅ Token found, creating guided story from stored elements`);
//       await PendingStoryElements.findByIdAndDelete(pendingElements._id);
//       return await createStorySession(session.user.id, pendingElements.elements, 'guided');
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

//         console.log(`📦 Stored elements in database with token: ${token.substring(0, 8)}...`);

//         return NextResponse.json({
//           requiresAuth: true,
//           token,
//           message: 'Please log in to create your story. Your progress will be saved!',
//         });
//       }

//       console.log(`✅ User authenticated, creating guided story immediately`);
//       return await createStorySession(session.user.id, body.elements, 'guided');
//     }

//     if (body.storyMode === 'freeform' || (!body.elements && !body.pendingToken)) {
//       if (!session || session.user.role !== 'child') {
//         return NextResponse.json(
//           { error: 'Access denied. Children only.' },
//           { status: 403 }
//         );
//       }

//       console.log(`✅ Creating freeform story for authenticated user`);
//       return await createStorySession(session.user.id, undefined, 'freeform', body.openingText);
//     }

//     return NextResponse.json(
//       { error: 'Invalid request. Provide either elements, pendingToken, or specify freeform mode.' },
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

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import { SUBSCRIPTION_TIERS } from '@/config/tiers';
import { DEFAULT_TIER } from '@/config/tiers';
import StorySession from '@/models/StorySession';
import User from '@/models/User';
import PendingStoryElements from '@/models/PendingStoryElements';
import { collaborationEngine } from '@/lib/ai/collaboration';
import { checkRateLimit } from '@/lib/rate-limiter';
import type { StoryElements } from '@/config/story-elements';
import crypto from 'crypto';

interface StoryCreationRequest {
  elements?: StoryElements;
  pendingToken?: string;
  storyMode?: 'guided' | 'freeform';
  openingText?: string;
}

function validateElements(elements: any): boolean {
  const requiredElements = ['genre', 'character', 'setting', 'theme', 'mood', 'tone'];
  return requiredElements.every((element) => elements[element]);
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
      // Freeform story - use child's text directly, no AI call
      aiOpening = userOpening || "Start writing your creative story...";
      apiCallsUsed = 0;
    }

    await StorySession.findByIdAndUpdate(sessionId, {
      aiOpening,
      apiCallsUsed,
    });

    console.log(`✅ AI opening generated and saved for session: ${sessionId}`);
  } catch (error) {
    console.error(`❌ Failed to generate AI opening for ${sessionId}:`, error);

    const fallbackOpening = elements 
      ? `Welcome to your ${elements.genre} adventure! Your character ${elements.character} is ready to explore ${elements.setting}. What happens first in this ${elements.mood} story?`
      : userOpening || "Start writing your creative story...";

    await StorySession.findByIdAndUpdate(sessionId, {
      aiOpening: fallbackOpening,
      apiCallsUsed: 0,
    });

    console.log(`✅ Fallback opening saved for session: ${sessionId}`);
  }
}

async function createStorySession(
  userId: string, 
  elements?: StoryElements, 
  storyMode: 'guided' | 'freeform' = 'guided',
  openingText?: string
) {
  await connectToDatabase();

  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const userTier = user.subscriptionTier || 'FREE';
  const tierConfig = SUBSCRIPTION_TIERS[userTier] || DEFAULT_TIER;

  // Rate limiting check using centralized config
  const rateCheck = checkRateLimit(userId, 'story-create', userTier);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: rateCheck.message, retryAfter: rateCheck.retryAfter },
      { status: 429 }
    );
  }

  const lastSession = (await StorySession.findOne({ childId: userId })
    .sort({ storyNumber: -1 })
    .select('storyNumber')
    .lean()) as { storyNumber: number } | null;

  const nextStoryNumber = lastSession ? lastSession.storyNumber + 1 : 1;

  const title = elements 
    ? `${elements.character}'s ${elements.genre} Adventure`
    : `My Creative Story #${nextStoryNumber}`;

  const sessionData: any = {
    childId: userId,
    storyNumber: nextStoryNumber,
    title,
    storyMode,
    aiOpening: null,
    currentTurn: 1,
    totalWords: 0,
    childWords: 0,
    apiCallsUsed: 0,
    maxApiCalls: tierConfig.aiCalls,
    status: 'active',
  };

  if (storyMode === 'guided' && elements) {
    sessionData.elements = elements;
  }

  const newSession = await StorySession.create(sessionData);

  console.log(`✅ Created new ${storyMode} story session: ${newSession._id}`);

  await User.findByIdAndUpdate(userId, {
    $inc: {
      totalStoriesCreated: 1,
      storiesCreatedThisMonth: 1,
    },
    $set: { lastActiveDate: new Date() },
  });

  generateAIOpeningInBackground(newSession._id.toString(), elements, openingText);

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
    aiOpening: null,
  });
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body: StoryCreationRequest = await request.json();

    console.log(`📝 Create-session API called:`, {
      hasSession: !!session,
      userRole: session?.user?.role,
      hasElements: !!body.elements,
      hasPendingToken: !!body.pendingToken,
      storyMode: body.storyMode || 'freeform',
      hasOpeningText: !!body.openingText,
    });

    await connectToDatabase();

    if (body.pendingToken) {
      if (!session || session.user.role !== 'child') {
        return NextResponse.json(
          { error: 'Access denied. Children only.' },
          { status: 403 }
        );
      }

      console.log(`🔍 Processing pending token: ${body.pendingToken.substring(0, 8)}...`);

      const pendingElements = await PendingStoryElements.findOne({
        sessionToken: body.pendingToken,
        expiresAt: { $gt: new Date() },
      });

      if (!pendingElements) {
        console.log(`❌ Token not found or expired: ${body.pendingToken.substring(0, 8)}...`);
        return NextResponse.json(
          { error: 'Token not found or expired. Please start over.' },
          { status: 404 }
        );
      }

      console.log(`✅ Token found, creating guided story from stored elements`);
      await PendingStoryElements.findByIdAndDelete(pendingElements._id);
      return await createStorySession(session.user.id, pendingElements.elements, 'guided');
    }

    if (body.elements) {
      if (!validateElements(body.elements)) {
        return NextResponse.json(
          { error: 'Missing required story elements' },
          { status: 400 }
        );
      }

      if (!session || session.user.role !== 'child') {
        console.log(`🔒 User not authenticated, storing elements in database`);

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        await PendingStoryElements.create({
          sessionToken: token,
          elements: body.elements,
          expiresAt,
        });

        console.log(`📦 Stored elements in database with token: ${token.substring(0, 8)}...`);

        return NextResponse.json({
          requiresAuth: true,
          token,
          message: 'Please log in to create your story. Your progress will be saved!',
        });
      }

      console.log(`✅ User authenticated, creating guided story immediately`);
      return await createStorySession(session.user.id, body.elements, 'guided');
    }

    if (body.storyMode === 'freeform' || (!body.elements && !body.pendingToken)) {
      if (!session || session.user.role !== 'child') {
        return NextResponse.json(
          { error: 'Access denied. Children only.' },
          { status: 403 }
        );
      }

      console.log(`✅ Creating freeform story for authenticated user`);
      return await createStorySession(session.user.id, undefined, 'freeform', body.openingText);
    }

    return NextResponse.json(
      { error: 'Invalid request. Provide either elements, pendingToken, or specify freeform mode.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('❌ Error in create-session API:', error);
    return NextResponse.json(
      { error: 'Failed to process story creation request' },
      { status: 500 }
    );
  }
}