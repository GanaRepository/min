// app/api/stories/create-from-token/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import { SUBSCRIPTION_TIERS } from '@/config/tiers';
import StorySession from '@/models/StorySession';
import User from '@/models/User';
import { collaborationEngine } from '@/lib/ai/collaboration';
import { checkRateLimit } from '@/lib/rate-limiter';

interface StoryCreationRequest {
  pendingToken: string;
}

// In-memory store for pending elements (same as store-pending-elements)
const pendingElements = new Map<string, { elements: any; timestamp: number }>();

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
    const { pendingToken } = body;

    if (!pendingToken) {
      return NextResponse.json(
        { error: 'Pending token required' },
        { status: 400 }
      );
    }

    // Retrieve pending elements
    const stored = pendingElements.get(pendingToken);

    if (!stored) {
      return NextResponse.json(
        { error: 'Token not found or expired' },
        { status: 404 }
      );
    }

    // Check if expired
    if (Date.now() > stored.timestamp) {
      pendingElements.delete(pendingToken);
      return NextResponse.json({ error: 'Token expired' }, { status: 410 });
    }

    const elements = stored.elements;

    // Validate required elements
    const requiredElements = [
      'genre',
      'character',
      'setting',
      'theme',
      'mood',
      'tone',
    ];
    for (const element of requiredElements) {
      if (!elements[element]) {
        return NextResponse.json(
          { error: `Missing required element: ${element}` },
          { status: 400 }
        );
      }
    }

    // Rate limiting check
    const rateCheck = checkRateLimit(session.user.id, 'story-create');
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: rateCheck.message,
          retryAfter: rateCheck.retryAfter,
        },
        { status: 429 }
      );
    }

    await connectToDatabase();

    // Check story limits
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Centralized limit check using config and user's subscription tier
    const tierKey = user.subscriptionTier?.toUpperCase() || 'FREE';
    const tierObj = SUBSCRIPTION_TIERS[tierKey] || SUBSCRIPTION_TIERS.FREE;
    const limit = tierObj.storyLimit;

    const userStoryCount = await StorySession.countDocuments({
      childId: user._id,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    if (userStoryCount >= limit) {
      return NextResponse.json(
        {
          error: `Monthly story limit reached (${limit} stories allowed, you have created ${userStoryCount}).`,
        },
        { status: 402 }
      );
    }

    // Generate story title
    const title = `${elements.character} and the ${elements.setting}`;

    // Generate AI opening
    const aiOpening = await collaborationEngine.generateOpeningPrompt(elements);

    // Create new story session
    const newSession = await StorySession.create({
      childId: session.user.id,
      title,
      elements,
      aiOpening,
      currentTurn: 1,
      totalWords: 0,
      childWords: 0,
      apiCallsUsed: 1, // Opening generation
      maxApiCalls: 7,
      status: 'active',
    });

    // Update user statistics
    await User.findByIdAndUpdate(session.user.id, {
      $inc: {
        totalStoriesCreated: 1,
        storiesCreatedThisMonth: 1,
      },
      $set: { lastActiveDate: new Date() },
    });

    // Clean up the token
    pendingElements.delete(pendingToken);

    return NextResponse.json({
      success: true,
      session: {
        id: newSession._id,
        title: newSession.title,
        elements: newSession.elements,
        currentTurn: newSession.currentTurn,
        totalWords: newSession.totalWords,
        childWords: newSession.childWords,
        apiCallsUsed: newSession.apiCallsUsed,
        maxApiCalls: newSession.maxApiCalls,
        status: newSession.status,
      },
      aiOpening,
    });
  } catch (error) {
    console.error('Error creating story from token:', error);
    return NextResponse.json(
      { error: 'Failed to create story session' },
      { status: 500 }
    );
  }
}
