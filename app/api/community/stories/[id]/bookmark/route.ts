// app/api/community/stories/[id]/bookmark/route.ts - BOOKMARK FUNCTIONALITY
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/authOptions';
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

    // Initialize bookmarks array if it doesn't exist
    if (!story.bookmarks) {
      story.bookmarks = [];
    }

    const isBookmarked = story.bookmarks.includes(userId);
    
    if (isBookmarked) {
      // Remove bookmark
      story.bookmarks = story.bookmarks.filter((bookmark: string) => bookmark.toString() !== userId);
    } else {
      // Add bookmark
      story.bookmarks.push(userId);
    }

    await story.save();

    return NextResponse.json({
      success: true,
      isBookmarked: !isBookmarked,
      totalBookmarks: story.bookmarks.length
    });

  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to toggle bookmark' },
      { status: 500 }
    );
  }
}