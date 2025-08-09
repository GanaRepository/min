// app/api/admin/stories/[id]/route.ts - Individual Story CRUD
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import StoryComment from '@/models/StoryComment';

export const dynamic = 'force-dynamic';

// GET single story
export async function GET(
  request: NextRequest,
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

    const [story, turns, comments] = await Promise.all([
      StorySession.findById(id)
        .populate('childId', 'firstName lastName email')
        .lean(),
      Turn.find({ sessionId: id }).sort({ turnNumber: 1 }).lean(),
      StoryComment.find({ storyId: id })
        .populate('authorId', 'firstName lastName role')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      story: {
        ...story,
        turns,
        comments,
      },
    });
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story' },
      { status: 500 }
    );
  }
}

// PATCH - Update story
export async function PATCH(
  request: NextRequest,
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
    const updateData = await request.json();

    await connectToDatabase();

    const updatedStory = await StorySession.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate('childId', 'firstName lastName email');

    if (!updatedStory) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      story: updatedStory,
      message: 'Story updated successfully',
    });
  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json(
      { error: 'Failed to update story' },
      { status: 500 }
    );
  }
}

// DELETE story
export async function DELETE(
  request: NextRequest,
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

    const story = await StorySession.findById(id);
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Cascading delete - remove all related data
    await Promise.all([
      Turn.deleteMany({ sessionId: id }),
      StoryComment.deleteMany({ storyId: id }),
      StorySession.findByIdAndDelete(id),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Story and all related data deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json(
      { error: 'Failed to delete story' },
      { status: 500 }
    );
  }
}
