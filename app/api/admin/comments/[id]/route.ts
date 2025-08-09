import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StoryComment from '@/models/StoryComment';

export const dynamic = 'force-dynamic';

// GET single comment with pagination info
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

    // Get the current comment
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

    // Get pagination info (prev/next comments)
    const allComments = (await StoryComment.find({})
      .sort({ createdAt: -1 })
      .select('_id')
      .lean()) as Array<{ _id: any }>;

    const currentIndex = allComments.findIndex(c => String(c._id) === id);
    const pagination = currentIndex !== -1 ? {
      current: (currentIndex + 1).toString(),
      prev: currentIndex > 0 ? String(allComments[currentIndex - 1]._id) : null,
      next: currentIndex < allComments.length - 1 ? String(allComments[currentIndex + 1]._id) : null,
      total: allComments.length
    } : null;

    // Get replies if any
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
      pagination,
    });
  } catch (error) {
    console.error('Error fetching comment:', error);
    return NextResponse.json({ error: 'Failed to fetch comment' }, { status: 500 });
  }
}

// PATCH - Update comment (status, content, etc.)
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

    // Find the comment first to check ownership for content edits
    const existingComment = await StoryComment.findById(id);
    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // If updating comment content, check if user is the author
    if (updateData.comment !== undefined) {
      if (existingComment.authorId.toString() !== session.user.id) {
        return NextResponse.json({ 
          error: 'You can only edit your own comments' 
        }, { status: 403 });
      }
      
      updateData.comment = updateData.comment.trim();
      if (!updateData.comment) {
        return NextResponse.json({ 
          error: 'Comment content cannot be empty' 
        }, { status: 400 });
      }
    }

    const updatedComment = await StoryComment.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate('authorId', 'firstName lastName email role');

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

    // Delete any replies to this comment
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