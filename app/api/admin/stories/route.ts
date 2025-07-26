// app/api/admin/stories/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import User from '@/models/User';
import StoryComment from '@/models/StoryComment';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    await connectToDatabase();

    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (userId) query.childId = userId;

    // Get stories with user info and comment counts
    const stories = await StorySession.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'childId',
          foreignField: '_id',
          as: 'child',
        },
      },
      {
        $lookup: {
          from: 'storycomments',
          localField: '_id',
          foreignField: 'storyId',
          as: 'comments',
        },
      },
      {
        $addFields: {
          child: { $arrayElemAt: ['$child', 0] },
          commentCount: { $size: '$comments' },
          unresolvedComments: {
            $size: {
              $filter: {
                input: '$comments',
                cond: { $eq: ['$$this.isResolved', false] },
              },
            },
          },
        },
      },
      {
        $project: {
          'child.password': 0,
          comments: 0,
        },
      },
      { $sort: { updatedAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    // Get total count
    const totalCount = await StorySession.countDocuments(query);

    return NextResponse.json({
      success: true,
      stories,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching admin stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}
