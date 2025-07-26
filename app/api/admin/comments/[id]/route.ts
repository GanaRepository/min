import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StoryComment from '@/models/StoryComment';

// PATCH - Update comment status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      (session.user.role !== 'admin' && session.user.role !== 'mentor')
    ) {
      return NextResponse.json(
        { error: 'Admin or mentor access required' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { isResolved } = body;

    await connectToDatabase();

    const updateData: any = {
      isResolved,
      updatedAt: new Date(),
    };

    if (isResolved) {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = session.user.id;
    } else {
      updateData.resolvedAt = null;
      updateData.resolvedBy = null;
    }

    const comment = await StoryComment.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate('resolvedBy', 'firstName lastName');

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

// DELETE - Delete comment
export async function DELETE(
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

    const comment = await StoryComment.findByIdAndDelete(id);

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
