//app/api/admin/stories/moderate/route.ts
// app/api/admin/stories/moderate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';

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

    const { storyIds, action } = await request.json();

    if (!storyIds || !Array.isArray(storyIds) || !action) {
      return NextResponse.json(
        {
          error: 'Story IDs array and action are required',
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let updateData: any = {};
    let message = '';

    switch (action) {
      case 'publish':
        updateData = { isPublished: true };
        message = `${storyIds.length} stories published`;
        break;
      case 'unpublish':
        updateData = { isPublished: false };
        message = `${storyIds.length} stories unpublished`;
        break;
      case 'feature':
        updateData = { isFeatured: true };
        message = `${storyIds.length} stories featured`;
        break;
      case 'unfeature':
        updateData = { isFeatured: false };
        message = `${storyIds.length} stories unfeatured`;
        break;
      case 'delete':
        await StorySession.deleteMany({ _id: { $in: storyIds } });
        return NextResponse.json({
          success: true,
          message: `${storyIds.length} stories deleted successfully`,
        });
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const result = await StorySession.updateMany(
      { _id: { $in: storyIds } },
      updateData
    );

    return NextResponse.json({
      success: true,
      message,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error bulk moderating stories:', error);
    return NextResponse.json(
      { error: 'Failed to bulk moderate stories' },
      { status: 500 }
    );
  }
}
