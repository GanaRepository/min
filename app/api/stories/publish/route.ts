import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
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

    const body = await request.json();
    const { sessionId, assessment } = body;

    await connectToDatabase();

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

    turns.forEach(turn => {
      fullContent.push(turn.childInput);
      if (turn.aiResponse) {
        fullContent.push(turn.aiResponse);
      }
    });

    // Check if already published
    const existingPublished = await PublishedStory.findOne({ sessionId });
    
    if (existingPublished) {
      return NextResponse.json({
        success: true,
        publishedStory: existingPublished,
        message: 'Story already published',
      });
    }

    // Create published story
    const publishedStory = await PublishedStory.create({
      sessionId,
      childId: session.user.id,
      title: storySession.title,
      content: fullContent.join('\n\n'),
      elements: storySession.elements,
      totalWords: storySession.totalWords,
      childWords: storySession.childWords,
      grammarScore: assessment.grammarScore,
      creativityScore: assessment.creativityScore,
      overallScore: assessment.overallScore,
      aifeedback: assessment.feedback,
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