// app/api/admin/dashboard-stats/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';

export const dynamic = 'force-dynamic';

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

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalChildren,
      totalMentors,
      totalStories,
      activeStories,
      completedStories,
      monthlyNewUsers,
      monthlyStories,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'child' }),
      User.countDocuments({ role: 'mentor' }),
      StorySession.countDocuments(),
      StorySession.countDocuments({ status: 'active' }),
      StorySession.countDocuments({ status: 'completed' }),
      User.countDocuments({ createdAt: { $gte: monthStart } }),
      StorySession.countDocuments({ createdAt: { $gte: monthStart } }),
    ]);

    const stats = {
      totalUsers,
      totalChildren,
      totalMentors,
      totalStories,
      activeStories,
      completedStories,
      monthlyStats: {
        newUsers: monthlyNewUsers,
        storiesCreated: monthlyStories,
        assessmentsCompleted: completedStories,
      },
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
