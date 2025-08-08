// app/api/admin/comments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StoryComment from '@/models/StoryComment';

export const dynamic = 'force-dynamic';

// GET single comment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = params;
    await connectToDatabase();

    const comment = await StoryComment.findById(id)
      .populate('authorId', 'firstName lastName email role')
      .populate({
        path: 'storyId',
        select: 'title storyNumber',
        populate: {
          path: 'childId',
          select: 'firstName lastName'
        }
      })
      .lean();

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Get replies if any (assuming you have a replies field or separate collection)
    const replies = await StoryComment.find({ 
      parentCommentId: id 
    })
    .populate('authorId', 'firstName lastName role')
    .sort({ createdAt: 1 })
    .lean();

    return NextResponse.json({
      success: true,
      comment: {
        ...comment,
        replies,
      },
    });
  } catch (error) {
    console.error('Error fetching comment:', error);
    return NextResponse.json({ error: 'Failed to fetch comment' }, { status: 500 });
  }
}

// PATCH - Update comment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = params;
    const updateData = await request.json();

    await connectToDatabase();

    const updatedComment = await StoryComment.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate('authorId', 'firstName lastName email role');

    if (!updatedComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      comment: updatedComment,
      message: 'Comment updated successfully',
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

// DELETE comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = params;
    await connectToDatabase();

    const comment = await StoryComment.findById(id);
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Also delete any replies to this comment
    await StoryComment.deleteMany({ parentCommentId: id });
    
    // Delete the main comment
    await StoryComment.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Comment and all replies deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}