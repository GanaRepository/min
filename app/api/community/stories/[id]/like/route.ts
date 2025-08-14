// app/api/community/stories/[id]/like/route.ts - LIKE FUNCTIONALITY
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    const userId = session.user.id;

    await connectToDatabase();

    const story = await StorySession.findById(id);
    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Initialize likes array if it doesn't exist
    if (!story.likes) {
      story.likes = [];
    }

    const isLiked = story.likes.includes(userId);
    
    if (isLiked) {
      // Remove like
      story.likes = story.likes.filter(like => like.toString() !== userId);
    } else {
      // Add like
      story.likes.push(userId);
    }

    await story.save();

    return NextResponse.json({
      success: true,
      isLiked: !isLiked,
      totalLikes: story.likes.length
    });

  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}