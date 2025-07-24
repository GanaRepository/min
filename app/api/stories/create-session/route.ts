// app/api/stories/create-session/route.ts
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
}

// Helper function to validate elements
function validateElements(elements: any): boolean {
  const requiredElements = ['genre', 'character', 'setting', 'theme', 'mood', 'tone'];
  return requiredElements.every(element => elements[element]);
}

// Background AI generation function
async function generateAIOpeningInBackground(sessionId: string, elements: StoryElements) {
  try {
    console.log(`🤖 Starting AI opening generation for session: ${sessionId}`);
    
    const aiOpening = await collaborationEngine.generateOpeningPrompt(elements);
    
    await StorySession.findByIdAndUpdate(sessionId, {
      aiOpening,
      apiCallsUsed: 1,
    });
    
    console.log(`✅ AI opening generated and saved for session: ${sessionId}`);
  } catch (error) {
    console.error(`❌ Failed to generate AI opening for ${sessionId}:`, error);
    
    const fallbackOpening = `Welcome to your ${elements.genre} adventure! Your character ${elements.character} is ready to explore ${elements.setting}. What happens first in this ${elements.mood} story?`;
    
    await StorySession.findByIdAndUpdate(sessionId, {
      aiOpening: fallbackOpening,
      apiCallsUsed: 1,
    });
    
    console.log(`✅ Fallback opening saved for session: ${sessionId}`);
  }
}

// Helper function to create story session
async function createStorySession(userId: string, elements: StoryElements) {
  await connectToDatabase();

  // Rate limiting check
  const rateCheck = checkRateLimit(userId, 'story-create');
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: rateCheck.message, retryAfter: rateCheck.retryAfter },
      { status: 429 }
    );
  }

  // Check story limits
  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Get tier and check limits
  const userTier = user.subscriptionTier || 'FREE';
  const tierConfig = SUBSCRIPTION_TIERS[userTier] || DEFAULT_TIER;
  
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);

  const monthlyStoryCount = await StorySession.countDocuments({
    childId: userId,
    createdAt: { $gte: currentMonth },
  });

  if (monthlyStoryCount >= tierConfig.storyLimit) {
    return NextResponse.json(
      { error: `Monthly story limit reached (${tierConfig.storyLimit} stories for ${userTier} tier)` },
      { status: 429 }
    );
  }

  // Get next story number
  const lastSession = await StorySession.findOne({ childId: userId })
    .sort({ storyNumber: -1 })
    .select('storyNumber')
    .lean() as { storyNumber: number } | null;

  const nextStoryNumber = lastSession ? lastSession.storyNumber + 1 : 1;

  // Generate title
  const title = `${elements.character}'s ${elements.genre} Adventure`;

  // Create new story session IMMEDIATELY
  const newSession = await StorySession.create({
    childId: userId,
    storyNumber: nextStoryNumber,
    title,
    elements,
    aiOpening: null,
    currentTurn: 1,
    totalWords: 0,
    childWords: 0,
    apiCallsUsed: 0,
    maxApiCalls: tierConfig.aiCalls,
    status: 'active',
  });

  console.log(`✅ Created new story session: ${newSession._id}`);

  // Update user statistics
  await User.findByIdAndUpdate(userId, {
    $inc: {
      totalStoriesCreated: 1,
      storiesCreatedThisMonth: 1,
    },
    $set: { lastActiveDate: new Date() },
  });

  // Generate AI opening in background
  generateAIOpeningInBackground(newSession._id, elements);

  return NextResponse.json({
    success: true,
    session: {
      id: newSession._id,
      storyNumber: newSession.storyNumber,
      title: newSession.title,
      elements: newSession.elements,
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
    });

    await connectToDatabase();

    // ===== CASE 1: User has pendingToken (returning from login) =====
    if (body.pendingToken) {
      if (!session || session.user.role !== 'child') {
        return NextResponse.json(
          { error: 'Access denied. Children only.' },
          { status: 403 }
        );
      }

      console.log(`🔍 Processing pending token: ${body.pendingToken.substring(0, 8)}...`);

      // Retrieve elements from database
      const pendingElements = await PendingStoryElements.findOne({
        sessionToken: body.pendingToken,
        expiresAt: { $gt: new Date() }, // Not expired
      });

      if (!pendingElements) {
        console.log(`❌ Token not found or expired: ${body.pendingToken.substring(0, 8)}...`);
        return NextResponse.json(
          { error: 'Token not found or expired. Please start over.' },
          { status: 404 }
        );
      }

      // Clean up token and create story
      console.log(`✅ Token found, creating story from stored elements`);
      await PendingStoryElements.findByIdAndDelete(pendingElements._id);
      return await createStorySession(session.user.id, pendingElements.elements);
    }

    // ===== CASE 2: User provides elements directly =====
    if (body.elements) {
      // Validate elements first
      if (!validateElements(body.elements)) {
        return NextResponse.json(
          { error: 'Missing required story elements' },
          { status: 400 }
        );
      }

      // CASE 2A: Not authenticated - store elements in database
      if (!session || session.user.role !== 'child') {
        console.log(`🔒 User not authenticated, storing elements in database`);
        
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        await PendingStoryElements.create({
          sessionToken: token,
          elements: body.elements,
          expiresAt,
        });

        console.log(`📦 Stored elements in database with token: ${token.substring(0, 8)}...`);

        return NextResponse.json({
          requiresAuth: true,
          token,
          message: 'Please log in to create your story. Your progress will be saved!'
        });
      }

      // CASE 2B: Authenticated - create story immediately
      console.log(`✅ User authenticated, creating story immediately`);
      return await createStorySession(session.user.id, body.elements);
    }

    // Invalid request
    return NextResponse.json(
      { error: 'Invalid request. Provide either elements or pendingToken.' },
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