// app/api/stories/published/[storyId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import PublishedStory from '@/models/PublishedStory';

export async function GET(
  request: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const { storyId } = params;

    await connectToDatabase();

    const story = await PublishedStory.findOne({
      _id: storyId,
      childId: session.user.id
    }).lean();

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Add mock elements (in real app, store these with the story)
    const storyWithElements = {
      ...story,
      elements: {
        genre: 'Fantasy',
        character: 'Wise Wizard',
        setting: 'Magical Forest',
        theme: 'Friendship',
        mood: 'Exciting',
        tone: 'Brave'
      }
    };

    return NextResponse.json({
      success: true,
      story: storyWithElements
    });

  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story' },
      { status: 500 }
    );
  }
}