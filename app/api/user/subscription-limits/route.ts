import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get user's current usage for this month
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Basic limits based on free tier
    const limits = {
      stories: {
        used: user.storiesCreatedThisMonth || 0,
        limit: 3,
        remaining: Math.max(0, 3 - (user.storiesCreatedThisMonth || 0)),
        canUse: (user.storiesCreatedThisMonth || 0) < 3,
      },
      assessments: {
        used: 0, // You'll need to calculate this from your assessment tracking
        limit: 3,
        remaining: 3,
        canUse: true,
      },
      competitions: {
        used: 0, // You'll need to calculate this from competition entries
        limit: 3,
        remaining: 3,
        canUse: true,
      },
      resetDate: getNextMonthFirstDay(),
    };

    return NextResponse.json({
      success: true,
      limits
    });

  } catch (error) {
    console.error('Error fetching subscription limits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch limits' },
      { status: 500 }
    );
  }
}

function getNextMonthFirstDay(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}