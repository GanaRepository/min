export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';
import StoryComment from '@/models/StoryComment';
import MentorAssignment from '@/models/MentorAssignment';

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

    // Get current date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get REAL statistics from your actual database
    const [
      totalUsers,
      totalChildren,
      totalMentors,
      totalStories,
      activeStories,
      completedStories,
      totalComments,
      newUsersThisMonth,
      storiesThisMonth,
      assessmentsThisMonth,
      newUsersLastMonth,
      storiesLastMonth,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'child' }),
      User.countDocuments({ role: 'mentor' }),
      StorySession.countDocuments(),
      StorySession.countDocuments({ status: 'active' }),
      StorySession.countDocuments({ status: 'completed' }),
      StoryComment.countDocuments(),
      User.countDocuments({
        createdAt: { $gte: startOfMonth },
      }),
      StorySession.countDocuments({
        createdAt: { $gte: startOfMonth },
      }),
      StorySession.countDocuments({
        status: 'completed',
        completedAt: { $gte: startOfMonth },
      }),
      User.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth },
      }),
      StorySession.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth },
      }),
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const stats = {
      totalUsers,
      totalChildren,
      totalMentors,
      totalStories,
      activeStories,
      completedStories,
      monthlyStats: {
        newUsers: newUsersThisMonth,
        storiesCreated: storiesThisMonth,
        assessmentsCompleted: assessmentsThisMonth,
        usersGrowth: calculateGrowth(newUsersThisMonth, newUsersLastMonth),
        storiesGrowth: calculateGrowth(storiesThisMonth, storiesLastMonth),
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
