// app/api/stories/create-session/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import { SUBSCRIPTION_TIERS } from '@/config/tiers';
import { DEFAULT_TIER } from '@/config/tiers';
import StorySession from '@/models/StorySession';
import User from '@/models/User';
import { collaborationEngine } from '@/lib/ai/collaboration';
import { checkRateLimit } from '@/lib/rate-limiter';
import type { StoryElements } from '@/config/story-elements';

interface StoryCreationRequest {
  elements: StoryElements;
}

// Add better duplicate prevention and logging:
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

    const body: StoryCreationRequest = await request.json();
    const { elements } = body;

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
      if (!elements[element as keyof StoryElements]) {
        return NextResponse.json(
          { error: `Missing required element: ${element}` },
          { status: 400 }
        );
      }
    }

    console.log(`📝 Creating story session for user: ${session.user.id}`);
    console.log(`📋 Story elements:`, elements);

    await connectToDatabase();

    // Check story limits
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Centralized limit check using config
    const tierKey = user.subscriptionTier?.toUpperCase() || 'FREE';
    const tierObj = SUBSCRIPTION_TIERS[tierKey] || DEFAULT_TIER;
    const limit = tierObj.storyLimit;

    const userStoryCount = await StorySession.countDocuments({
      childId: user._id,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    console.log(
      `📊 User ${session.user.id} has ${userStoryCount}/${limit} stories this month`
    );

    if (userStoryCount >= limit) {
      return NextResponse.json(
        {
          error: `Monthly story limit reached (${limit} stories allowed, you have created ${userStoryCount}).`,
        },
        { status: 402 }
      );
    }

    // FIXED: Prevent duplicate active stories with same elements
    const existingSession = await StorySession.findOne({
      childId: user._id,
      'elements.genre': elements.genre,
      'elements.character': elements.character,
      'elements.setting': elements.setting,
      'elements.theme': elements.theme,
      'elements.mood': elements.mood,
      'elements.tone': elements.tone,
      status: { $in: ['active', 'paused'] }, // Include paused stories
    });

    if (existingSession) {
      console.log(
        `♻️ Returning existing session for user ${session.user.id}:`,
        existingSession._id
      );
      return NextResponse.json({
        success: true,
        session: {
          id: existingSession._id,
          storyNumber: existingSession.storyNumber,
          title: existingSession.title,
          elements: existingSession.elements,
          currentTurn: existingSession.currentTurn,
          totalWords: existingSession.totalWords,
          childWords: existingSession.childWords,
          apiCallsUsed: existingSession.apiCallsUsed,
          maxApiCalls: existingSession.maxApiCalls,
          status: existingSession.status,
        },
        aiOpening: existingSession.aiOpening,
      });
    }

    // Generate story title
    const title = `${elements.character} and the ${elements.setting}`;

    // Generate AI opening
    console.log(`🤖 Generating AI opening for story: ${title}`);
    const aiOpening = await collaborationEngine.generateOpeningPrompt(elements);

    // Find next available storyNumber for this child
    const lastSession = await StorySession.findOne({ childId: user._id })
      .sort({ storyNumber: -1 })
      .select('storyNumber');
    const nextStoryNumber = lastSession?.storyNumber
      ? lastSession.storyNumber + 1
      : 1;

    // Create new story session
    const newSession = await StorySession.create({
      childId: session.user.id,
      storyNumber: nextStoryNumber,
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

    console.log(`✅ Created new story session:`, newSession._id);

    // Update user statistics
    await User.findByIdAndUpdate(session.user.id, {
      $inc: {
        totalStoriesCreated: 1,
        storiesCreatedThisMonth: 1,
      },
      $set: { lastActiveDate: new Date() },
    });

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
      aiOpening,
    });
  } catch (error) {
    console.error('❌ Error creating story session:', error);
    return NextResponse.json(
      { error: 'Failed to create story session' },
      { status: 500 }
    );
  }
}
