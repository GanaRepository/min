// app/api/stories/publish/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn, { ITurnLean } from '@/models/Turn';
import PublishedStory from '@/models/PublishedStory';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const { sessionId, assessment } = await request.json();

    if (!sessionId || !assessment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get story session
    const storySession = await StorySession.findOne({
      _id: sessionId,
      childId: session.user.id
    });

    if (!storySession) {
      return NextResponse.json(
        { error: 'Story session not found' },
        { status: 404 }
      );
    }

    // Get all turns to build the complete story with proper typing
    const turns = await Turn.find({ sessionId })
      .sort({ turnNumber: 1 })
      .lean() as ITurnLean[];

    const fullStoryContent = turns.map((turn) => turn.childInput).join('\n\n');

    // Create published story
    const publishedStory = await PublishedStory.create({
      sessionId: storySession._id,
      childId: session.user.id,
      title: storySession.title,
      content: fullStoryContent,
      totalWords: storySession.totalWords,
      grammarScore: assessment.grammarScore,
      creativityScore: assessment.creativityScore,
      overallScore: assessment.overallScore,
      aifeedback: assessment.feedback,
      publishedAt: new Date()
    });

    // Update session status
    await StorySession.findByIdAndUpdate(sessionId, {
      status: 'completed'
    });

    return NextResponse.json({
      success: true,
      story: {
        id: publishedStory._id,
        title: publishedStory.title,
        totalWords: publishedStory.totalWords,
        overallScore: publishedStory.overallScore
      }
    });

  } catch (error) {
    console.error('Error publishing story:', error);
    return NextResponse.json(
      { error: 'Failed to publish story' },
      { status: 500 }
    );
  }
}