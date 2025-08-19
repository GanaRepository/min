// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/utils/authOptions';
// import { UsageManager } from '@/lib/usage-manager';
// import { checkAndPerformMonthlyReset } from '@/utils/autoReset';

// export async function GET() {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     await checkAndPerformMonthlyReset();
//     const usageStats = await UsageManager.getUserUsageStats(session.user.id);
//     const limits = {
//       stories: usageStats.freestyleStories,
//       assessments: usageStats.assessmentRequests,
//       competitions: usageStats.competitionEntries,
//       resetDate: usageStats.resetDate,
//       subscriptionTier: usageStats.subscriptionTier,
//     };
//     return NextResponse.json({ success: true, limits });
//   } catch (error) {
//     console.error('Error fetching subscription limits:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch limits' },
//       { status: 500 }
//     );
//   }
// }

// app/api/user/subscription-limits/route.ts - ENHANCED FOR 30-DAY STORY PACK
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { UsageManager } from '@/lib/usage-manager';
import { checkAndPerformMonthlyReset } from '@/utils/autoReset';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Auto-reset preserves Story Pack purchases
    await checkAndPerformMonthlyReset();

    // Get enhanced usage stats with Story Pack info
    const usageStats = await UsageManager.getUserUsageStats(session.user.id);

    const limits = {
      stories: usageStats.freestyleStories,
      assessments: usageStats.assessmentRequests,
      competitions: usageStats.competitionEntries,
      resetDate: usageStats.resetDate,
      subscriptionTier: usageStats.subscriptionTier,
      // NEW: Story Pack specific info
      storyPackExpiry: usageStats.storyPackExpiry,
      daysRemaining: usageStats.daysRemaining,
    };

    return NextResponse.json({ success: true, limits });
  } catch (error) {
    console.error('Error fetching subscription limits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch limits' },
      { status: 500 }
    );
  }
}
