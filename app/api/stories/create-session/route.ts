// app/api/stories/create-session/route.ts - FREESTYLE ONLY
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import { UsageManager } from '@/lib/usage-manager';
import StorySession from '@/models/StorySession';
import User from '@/models/User';

interface StoryCreationRequest {
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
    const lastSession = await StorySession.findOne({
      childId: session.user.id,
    }).sort({ storyNumber: -1 }).select('storyNumber');

    const nextStoryNumber = (lastSession?.storyNumber || 0) + 1;
    const title = `My Creative Story #${nextStoryNumber}`;

    const sessionData = {
      childId: session.user.id,
      storyNumber: nextStoryNumber,
      title,
      aiOpening: body.openingText || 'Welcome to your creative writing adventure! What story would you like to tell today?',
      currentTurn: 1,
      totalWords: 0,
      childWords: 0,
      apiCallsUsed: 0,
      maxApiCalls: 7,
      status: 'active',
      isUploadedForAssessment: false,
    };

    const newSession = await StorySession.create(sessionData);

    // Increment user's story creation counter
    await UsageManager.incrementStoryCreation(session.user.id);

    console.log(`✅ Created freestyle story session: ${newSession._id}`);

    return NextResponse.json({
      success: true,
      session: {
        id: newSession._id,
        storyNumber: newSession.storyNumber,
        title: newSession.title,
        currentTurn: newSession.currentTurn,
        totalWords: newSession.totalWords,
        childWords: newSession.childWords,
        apiCallsUsed: newSession.apiCallsUsed,
        maxApiCalls: newSession.maxApiCalls,
        status: newSession.status,
      },
      aiOpening: newSession.aiOpening,
    });
  } catch (error) {
    console.error('❌ Error in create-session API:', error);
    return NextResponse.json(
      { error: 'Failed to create story session' },
      { status: 500 }
    );
  }
}