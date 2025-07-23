// app/api/user/subscription-limits/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import StorySession from '@/models/StorySession';
import User from '@/models/User';
import { SUBSCRIPTION_TIERS } from '@/config/tiers';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { canCreateStory: false, message: 'Access denied. Children only.' },
        { status: 403 }
      );
    }
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { canCreateStory: false, message: 'User not found.' },
        { status: 404 }
      );
    }
    // Get tier limit from config
    const tier = user.tier?.toUpperCase() || 'FREE';
    const limit = SUBSCRIPTION_TIERS[tier]?.storyLimit ?? 25;
    const userStoryCount = await StorySession.countDocuments({
      childId: session.user.id,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });
    if (userStoryCount >= limit) {
      let upgradePrompt = '';
      if (tier === 'FREE') {
        upgradePrompt =
          'Upgrade to BASIC or PREMIUM for more stories per month.';
      } else if (tier === 'BASIC') {
        upgradePrompt = 'Upgrade to PREMIUM for the highest story limit.';
      }
      return NextResponse.json(
        {
          canCreateStory: false,
          message: 'Monthly story limit reached.',
          remaining: 0,
          upgradePrompt,
        },
        { status: 200 }
      );
    }
    return NextResponse.json(
      {
        canCreateStory: true,
        message: 'You can create a story.',
        remaining: limit - userStoryCount,
        upgradePrompt: '',
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { canCreateStory: false, message: 'Error checking limits.' },
      { status: 500 }
    );
  }
}
