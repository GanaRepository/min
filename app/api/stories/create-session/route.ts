// app/api/stories/create-session/route.ts - FIXED VERSION
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

    // Check if user can create a story using NEW system
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
    const lastSession = (await StorySession.findOne({
      childId: session.user.id,
    })
      .sort({ storyNumber: -1 })
      .select('storyNumber')) as { storyNumber?: number } | null;

    const nextStoryNumber =
      lastSession && lastSession.storyNumber ? lastSession.storyNumber + 1 : 1;

    const title = body.elements
      ? `${body.elements.character}'s ${body.elements.genre} Adventure`
      : `My Creative Story #${nextStoryNumber}`;

    const sessionData: any = {
      childId: session.user.id,
      storyNumber: nextStoryNumber,
      title,
      aiOpening: null,
      currentTurn: 1,
      totalWords: 0,
      childWords: 0,
      apiCallsUsed: 0,
      maxApiCalls: 7, // 7 calls for freeform mode
      status: 'active',
      isUploadedForAssessment: false, // This is a created story, not uploaded
    };

    if (body.elements) {
      sessionData.elements = body.elements;
    }

    const newSession = await StorySession.create(sessionData);

    // Increment user's story creation counter using NEW system
    await UsageManager.incrementStoryCreation(session.user.id);

    console.log(
      `✅ Created new story session: ${newSession._id} for user ${user.email}`
    );

    // Generate AI opening in background (don't await)
    generateAIOpeningInBackground(
      newSession._id.toString(),
      body.elements,
      body.openingText
    );

    return NextResponse.json({
      success: true,
      session: {
        id: newSession._id,
        storyNumber: newSession.storyNumber,
        title: newSession.title,
        elements: newSession.elements || null,
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
        details: error instanceof Error ? error.message : 'Unknown error',
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
      aiOpening =
        userOpening ||
        'Welcome to your creative writing adventure! What story would you like to tell today?';
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
      : userOpening || 'Start writing your creative story...';

    await StorySession.findByIdAndUpdate(sessionId, {
      aiOpening: fallbackOpening,
      apiCallsUsed: 0,
    });

    console.log(`✅ Fallback opening saved for session: ${sessionId}`);
  }
}
