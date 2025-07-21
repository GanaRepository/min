// app/api/stories/user-stories/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import PublishedStory from '@/models/PublishedStory';
import StorySession from '@/models/StorySession';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Get published stories
    const publishedStories = await PublishedStory.find({ childId: session.user.id })
      .sort({ publishedAt: -1 })
      .lean();

    // Get active story sessions
    const activeSessions = await StorySession.find({ 
      childId: session.user.id,
      status: 'active'
    })
      .sort({ updatedAt: -1 })
      .lean();

    // Combine and format stories
    const allStories = [
      ...publishedStories.map(story => ({
        _id: story._id,
        title: story.title,
        content: story.content,
        totalWords: story.totalWords,
        grammarScore: story.grammarScore,
        creativityScore: story.creativityScore,
        overallScore: story.overallScore,
        publishedAt: story.publishedAt,
        elements: {
          genre: 'Fantasy', // You might want to store this in the published story
          character: 'Explorer',
          setting: 'Forest'
        },
        status: 'published' as const
      })),
      ...activeSessions.map(session => ({
        _id: session._id,
        title: session.title,
        content: '',
        totalWords: session.totalWords,
        grammarScore: 0,
        creativityScore: 0,
        overallScore: 0,
        publishedAt: session.updatedAt,
        elements: session.elements,
        status: 'in_progress' as const
      }))
    ];

    return NextResponse.json({
      success: true,
      stories: allStories
    });

  } catch (error) {
    console.error('Error fetching user stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}