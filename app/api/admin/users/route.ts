// app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Get all users with their story counts
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'storysessions',
          localField: '_id',
          foreignField: 'childId',
          as: 'stories'
        }
      },
      {
        $addFields: {
          totalStories: { $size: '$stories' },
          completedStories: {
            $size: {
              $filter: {
                input: '$stories',
                cond: { $eq: ['$$this.status', 'completed'] }
              }
            }
          },
          activeStories: {
            $size: {
              $filter: {
                input: '$stories',
                cond: { $eq: ['$$this.status', 'active'] }
              }
            }
          }
        }
      },
      {
        $project: {
          password: 0,
          stories: 0
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    return NextResponse.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}