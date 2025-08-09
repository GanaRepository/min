//app/api/admin/comments/bulk-moderate/route.ts
// app/api/admin/comments/bulk-moderate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StoryComment from '@/models/StoryComment';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { commentIds, action } = await request.json();

    if (!commentIds || !Array.isArray(commentIds) || !action) {
      return NextResponse.json(
        {
          error: 'Comment IDs array and action are required',
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let updateData: any = {};
    let message = '';

    switch (action) {
      case 'resolve':
        updateData = { isResolved: true };
        message = `${commentIds.length} comments marked as resolved`;
        break;
      case 'unresolve':
        updateData = { isResolved: false };
        message = `${commentIds.length} comments marked as unresolved`;
        break;
      case 'delete':
        await StoryComment.deleteMany({ _id: { $in: commentIds } });
        return NextResponse.json({
          success: true,
          message: `${commentIds.length} comments deleted successfully`,
        });
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const result = await StoryComment.updateMany(
      { _id: { $in: commentIds } },
      updateData
    );

    return NextResponse.json({
      success: true,
      message,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error bulk moderating comments:', error);
    return NextResponse.json(
      { error: 'Failed to bulk moderate comments' },
      { status: 500 }
    );
  }
}
