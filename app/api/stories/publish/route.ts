// app/api/stories/publish/route.ts - COMPLETE FIXED VERSION
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import PublishedStory from '@/models/PublishedStory';
import { UsageManager } from '@/lib/usage-manager';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { sessionId, assessment } = body;

    await connectToDatabase();

    // Check monthly publication limit (1 per month)
    const canPublish = await UsageManager.canPublishStory(session.user.id);
    if (!canPublish.allowed) {
      return NextResponse.json({ error: canPublish.reason }, { status: 400 });
    }

    // Get story session and turns
    const [storySession, turns] = await Promise.all([
      StorySession.findOne({
        _id: sessionId,
        childId: session.user.id,
      }),
      Turn.find({ sessionId }).sort({ turnNumber: 1 }),
    ]);

    if (!storySession) {
      return NextResponse.json(
        { error: 'Story session not found' },
        { status: 404 }
      );
    }

    // Create full story content
    const fullContent = [];

    if (storySession.aiOpening) {
      fullContent.push(storySession.aiOpening);
    }

    turns.forEach((turn) => {
      fullContent.push(turn.childInput);
      if (turn.aiResponse) {
        fullContent.push(turn.aiResponse);
      }
    });

    // Check if already published
    if (storySession.isPublished) {
      return NextResponse.json({
        success: true,
        message: 'Story already published',
        publishedStory: { _id: storySession._id, title: storySession.title },
      });
    }

    // FIXED: Use assessment data with fallbacks to existing story assessment or defaults
    const finalAssessment = assessment || storySession.assessment || {};

    // Create published story with proper null checks
    const publishedStory = await PublishedStory.create({
      sessionId,
      childId: session.user.id,
      title: storySession.title,
      content: fullContent.join('\n\n'),
      elements: storySession.elements,
      totalWords: storySession.totalWords,
      childWords: storySession.childWords,
      grammarScore: finalAssessment.grammarScore || 0,
      creativityScore: finalAssessment.creativityScore || 0,
      overallScore: finalAssessment.overallScore || 0,
      aiFeeback: finalAssessment.feedback || 'No feedback provided',
    });

    // ✅ FIXED: Set isPublished flag AND publishedAt timestamp
    await StorySession.findByIdAndUpdate(sessionId, {
      $set: {
        isPublished: true, // ✅ This was missing!
        publishedAt: new Date(), // ✅ This was missing!
        // Optional: also set these fields for community display
        views: 0,
        likes: [],
        bookmarks: [],
        tags: storySession.elements?.genre
          ? [storySession.elements.genre]
          : ['Adventure'],
      },
    });

    return NextResponse.json({
      success: true,
      publishedStory: {
        _id: publishedStory._id,
        title: publishedStory.title,
        publishedAt: publishedStory.publishedAt,
      },
    });
  } catch (error) {
    console.error('Error publishing story:', error);
    return NextResponse.json(
      { error: 'Failed to publish story' },
      { status: 500 }
    );
  }
}
