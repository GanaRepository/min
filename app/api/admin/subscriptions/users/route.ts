export const dynamic = 'force-dynamic';

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

    const users = await User.find({ role: 'child' })
      .select('firstName lastName email subscriptionTier subscriptionStartDate subscriptionEndDate createdAt')
      .sort({ createdAt: -1 });

    // Get usage stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [totalStories, apiCallsUsed] = await Promise.all([
          StorySession.countDocuments({ childId: user._id }),
          StorySession.aggregate([
            { $match: { childId: user._id } },
            { $group: { _id: null, total: { $sum: '$apiCallsUsed' } } }
          ])
        ]);

        return {
          ...user.toObject(),
          totalStories,
          apiCallsUsed: apiCallsUsed[0]?.total || 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      users: usersWithStats,
    });
  } catch (error) {
    console.error('Error fetching subscription users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription users' },
      { status: 500 }
    );
  }
}