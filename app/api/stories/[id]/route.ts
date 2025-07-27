export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import StoryComment from '@/models/StoryComment';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;

    await connectToDatabase();

    const story = await StorySession.findById(id)
      .populate('childId', 'firstName lastName email');

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Get comments for this story
    const comments = await StoryComment.find({ storyId: id })
      .populate('authorId', 'firstName lastName role')
      .sort({ createdAt: -1 });

    const storyWithComments = {
      ...story.toObject(),
      child: story.childId,
      comments,
    };

    return NextResponse.json({
      success: true,
      story: storyWithComments,
    });
  } catch (error) {
    console.error('Error fetching story details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story details' },
      { status: 500 }
    );
  }
}