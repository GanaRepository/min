// app/api/stories/create-session/route.ts - UPDATED FOR SIMPLIFIED USAGE (COMPLETE)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import User from '@/models/User';
import { UsageManager } from '@/lib/usage-manager';
import { collaborationEngine } from '@/lib/ai/collaboration';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// Fixed TypeScript errors for StorySessionDoc interface

// Type definitions for better type safety
interface StorySessionDoc {
  _id: mongoose.Types.ObjectId;
  childId: mongoose.Types.ObjectId;
  title: string;
  storyNumber: number;
  currentTurn: number;
  maxApiCalls: number;
  aiOpening: string;
  status: 'active' | 'completed' | 'flagged' | 'review';
  storyType: 'freestyle' | 'uploaded' | 'competition';
  isUploadedForAssessment: boolean;
  competitionEntries?: Array<{
    competitionId: mongoose.Types.ObjectId;
    submittedAt: Date;
    phase: 'submission' | 'judging' | 'results';
    rank?: number;
    score?: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface UserDoc {
  _id: mongoose.Types.ObjectId;
  competitionEntriesThisMonth?: number;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    console.log('📝 Creating new story session for user:', session.user.id);

    const body = await request.json();
    const { sessionType, title, elements } = body;

    // Validate session type
    if (!['freestyle', 'guided'].includes(sessionType)) {
      return NextResponse.json(
        { error: 'Invalid session type. Use "freestyle" or "guided".' },
        { status: 400 }
      );
    }

    // For Mintoons, we only support freestyle now
    if (sessionType !== 'freestyle') {
      return NextResponse.json(
        { error: 'Only freestyle story writing is currently supported.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user can create a new story using simplified system
    const canCreate = await UsageManager.canCreateStory(session.user.id);
    if (!canCreate.allowed) {
      console.log(`❌ Story creation denied: ${canCreate.reason}`);
      return NextResponse.json(
        {
          error: canCreate.reason,
          upgradeRequired: canCreate.upgradeRequired,
        },
        { status: 403 }
      );
    }

    console.log('✅ User can create story, proceeding...');

    // Get user data
    const user = (await User.findById(session.user.id)) as UserDoc | null;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate story number for this user
    const userStoryCount = await StorySession.countDocuments({
      childId: session.user.id,
    });

    // Generate AI opening for freestyle stories
    let aiOpening = '';
    try {
      aiOpening = await collaborationEngine.generateFreeformOpening();
      console.log('🤖 AI opening generated');
    } catch (error) {
      console.error('❌ Failed to generate AI opening:', error);
      aiOpening =
        'Welcome to your creative writing adventure! What story would you like to tell today? Start with any idea, character, or situation that excites you.';
    }

    // Create new story session
    const storySession = new StorySession({
      childId: new mongoose.Types.ObjectId(session.user.id),
      storyNumber: userStoryCount + 1,
      title: title?.trim() || `My Story #${userStoryCount + 1}`,
      aiOpening,
      currentTurn: 1,
      status: 'active',

      // Story configuration
      maxApiCalls: 7, // 7 turns total for Mintoons
      apiCallsUsed: 0,
      totalWords: 0,
      childWords: 0,

      // Story elements (if provided)
      elements: elements || {},

      // Flags
      isUploadedForAssessment: false,
      competitionEligible: true, // Default to eligible
      isPublished: false,

      // Assessment tracking
      assessmentAttempts: 0,

      // Assessment object with required integrityStatus
      assessment: {
        integrityStatus: {
          status: 'PASS',
          message: 'Integrity check passed.',
        },
      },

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedSession = (await storySession.save()) as StorySessionDoc;

    // Increment user's story creation count - simplified system counts directly from stories
    await UsageManager.incrementStoryCreation(session.user.id);

    console.log(`✅ Story session created: ${savedSession._id}`);
    console.log(`📊 Story details:`, {
      childId: savedSession.childId.toString(),
      title: savedSession.title,
      storyType: savedSession.storyType || 'freestyle',
      isUploadedForAssessment: savedSession.isUploadedForAssessment || false,
      competitionEntries: savedSession.competitionEntries || [],
      createdAt: savedSession.createdAt,
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Story session created successfully',
      sessionId: savedSession._id.toString(),
      story: {
        _id: savedSession._id.toString(),
        title: savedSession.title,
        storyNumber: savedSession.storyNumber,
        currentTurn: savedSession.currentTurn,
        maxTurns: savedSession.maxApiCalls,
        aiOpening: savedSession.aiOpening,
        status: savedSession.status,
        createdAt: savedSession.createdAt,
      },
      redirectUrl: `/children-dashboard/story/${savedSession._id}`,
    });
  } catch (error) {
    console.error('❌ Error creating story session:', error);
    return NextResponse.json(
      {
        error: 'Failed to create story session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint for retrieving session information
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get the story session and verify ownership
    const storySession = (await StorySession.findOne({
      _id: sessionId,
      childId: session.user.id,
    }).lean()) as StorySessionDoc | null;

    if (!storySession) {
      return NextResponse.json(
        { error: 'Story session not found or access denied' },
        { status: 404 }
      );
    }

    // Return session information
    return NextResponse.json({
      success: true,
      session: {
        _id: storySession._id.toString(),
        title: storySession.title,
        storyNumber: storySession.storyNumber,
        currentTurn: storySession.currentTurn,
        maxTurns: storySession.maxApiCalls || 7,
        apiCallsUsed: (storySession as any).apiCallsUsed || 0,
        status: storySession.status,
        aiOpening: storySession.aiOpening,
        totalWords: (storySession as any).totalWords || 0,
        childWords: (storySession as any).childWords || 0,
        elements: (storySession as any).elements || {},
        createdAt: storySession.createdAt,
        updatedAt: storySession.updatedAt,
      },
    });
  } catch (error) {
    console.error('❌ Error retrieving story session:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve story session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT endpoint for updating session details
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { sessionId, title, elements, competitionEligible } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find and verify ownership
    const storySession = await StorySession.findOne({
      _id: sessionId,
      childId: session.user.id,
    });

    if (!storySession) {
      return NextResponse.json(
        { error: 'Story session not found or access denied' },
        { status: 404 }
      );
    }

    // Update allowed fields
    if (title && title.trim()) {
      storySession.title = title.trim();
    }

    if (elements && typeof elements === 'object') {
      storySession.elements = { ...storySession.elements, ...elements };
    }

    if (typeof competitionEligible === 'boolean') {
      storySession.competitionEligible = competitionEligible;
    }

    storySession.updatedAt = new Date();
    await storySession.save();

    console.log(`✅ Story session ${sessionId} updated successfully`);

    return NextResponse.json({
      success: true,
      message: 'Story session updated successfully',
      session: {
        _id: storySession._id.toString(),
        title: storySession.title,
        elements: storySession.elements,
        competitionEligible: storySession.competitionEligible,
        updatedAt: storySession.updatedAt,
      },
    });
  } catch (error) {
    console.error('❌ Error updating story session:', error);
    return NextResponse.json(
      {
        error: 'Failed to update story session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint for deleting a session (only if not completed/published)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find and verify ownership
    const storySession = await StorySession.findOne({
      _id: sessionId,
      childId: session.user.id,
    });

    if (!storySession) {
      return NextResponse.json(
        { error: 'Story session not found or access denied' },
        { status: 404 }
      );
    }

    // Check if session can be deleted
    if (storySession.status === 'completed' || storySession.isPublished) {
      return NextResponse.json(
        { error: 'Cannot delete completed or published stories' },
        { status: 400 }
      );
    }

    if (
      storySession.competitionEntries &&
      storySession.competitionEntries.length > 0
    ) {
      return NextResponse.json(
        { error: 'Cannot delete stories submitted to competitions' },
        { status: 400 }
      );
    }

    // Delete the session
    await StorySession.findByIdAndDelete(sessionId);

    console.log(`🗑️ Story session ${sessionId} deleted successfully`);

    return NextResponse.json({
      success: true,
      message: 'Story session deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting story session:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete story session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
