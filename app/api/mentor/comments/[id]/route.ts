import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StoryComment from '@/models/StoryComment';

// PATCH /api/mentor/comments/[id] - update a comment (resolve, edit)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'mentor') {
      return NextResponse.json(
        { error: 'Mentor access required' },
        { status: 403 }
      );
    }
    const commentId = params.id;
    if (!commentId || commentId.length < 10) {
      return NextResponse.json(
        { error: 'Invalid comment ID' },
        { status: 400 }
      );
    }
    const { isResolved, comment } = await request.json();
    await connectToDatabase();
    const update: any = {};
    if (typeof isResolved === 'boolean') {
      update.isResolved = isResolved;
      if (isResolved) update.resolvedAt = new Date();
      else update.resolvedAt = null;
    }
    if (typeof comment === 'string') {
      update.comment = comment;
    }
    const updated = await StoryComment.findOneAndUpdate(
      { _id: commentId, authorId: session.user.id },
      { $set: update },
      { new: true }
    );
    if (!updated) {
      return NextResponse.json(
        { error: 'Comment not found or not authorized' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, comment: updated });
  } catch (error) {
    console.error('Error updating mentor comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}
