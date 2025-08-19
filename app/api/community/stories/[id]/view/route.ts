// app/api/community/stories/[id]/view/route.ts - VIEW TRACKING
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await connectToDatabase();

    // Find and update the story to increment views
    const story = await StorySession.findOneAndUpdate(
      {
        _id: id,
        isPublished: true,
      },
      {
        $inc: { views: 1 },
      },
      {
        new: true,
      }
    );

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found or not published' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      views: story.views || 1,
    });
  } catch (error) {
    console.error('Error tracking view:', error);
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    );
  }
}
