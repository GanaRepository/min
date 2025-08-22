// // // app/api/user/usage/route.ts - UPDATED FOR 30-DAY STORY PACK SYSTEM
// // import { NextRequest, NextResponse } from 'next/server';
// // import { getServerSession } from 'next-auth';
// // import { authOptions } from '@/utils/authOptions';
// // import { connectToDatabase } from '@/utils/db';
// // import User from '@/models/User';
// // import PublishedStory from '@/models/PublishedStory';
// // import { UsageManager } from '@/lib/usage-manager';

// // export async function GET(request: NextRequest) {
// //   try {
// //     const session = await getServerSession(authOptions);

// //     if (!session?.user?.id) {
// //       return NextResponse.json(
// //         { error: 'Authentication required' },
// //         { status: 401 }
// //       );
// //     }

// //     if (session.user.role !== 'child') {
// //       return NextResponse.json(
// //         { error: 'Access denied. Children only.' },
// //         { status: 403 }
// //       );
// //     }

// //     // 🌟 AUTOMATIC MONTHLY RESET - Check internet date and reset if needed
// //     // This only resets FREE tier counters, preserves Story Pack purchases
// //     const { checkAndPerformMonthlyReset } = await import('@/utils/autoReset');
// //     const resetPerformed = await checkAndPerformMonthlyReset();
// //     if (resetPerformed) {
// //       console.log('🎉 Monthly reset completed automatically via internet date (Story Packs preserved)');
// //     }

// //     console.log('📊 Fetching usage statistics for user:', session.user.id);
// //     await connectToDatabase();

// //     // Get current month dates
// //     const now = new Date();
// //     const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

// //     // Get user data
// //     const user = await User.findById(session.user.id);
// //     if (!user) {
// //       return NextResponse.json({ error: 'User not found' }, { status: 404 });
// //     }

// //     // Use NEW enhanced UsageManager that calculates limits from 30-day purchases
// //     const usageStats = await UsageManager.getUserUsageStats(session.user.id);

// //     // Add reset info if it just happened
// //     if (resetPerformed) {
// //       usageStats.resetInfo = {
// //         performed: true,
// //         message: 'Monthly limits reset complete (Story Pack purchases preserved)'
// //       };
// //     }

// //     // Count publications this month
// //     const monthlyPublications = await PublishedStory.countDocuments({
// //       childId: session.user.id,
// //       publishedAt: { $gte: currentMonthStart }
// //     });

// //     // Add publications to the usage stats
// //     const completeUsageStats = {
// //       ...usageStats,
// //       publications: {
// //         used: monthlyPublications,
// //         limit: 1, // Always 1 free publication per month
// //         remaining: Math.max(0, 1 - monthlyPublications),
// //         canUse: monthlyPublications < 1
// //       },
// //       currentPeriod: now.toLocaleDateString('en-US', {
// //         month: 'long',
// //         year: 'numeric'
// //       })
// //     };

// //     console.log('✅ Complete usage statistics:', completeUsageStats);
// //     return NextResponse.json({
// //       success: true,
// //       usage: completeUsageStats,
// //       message: 'Usage statistics retrieved successfully'
// //     });

// //   } catch (error) {
// //     console.error('❌ Error fetching usage statistics:', error);

// //     // Return safe defaults for new users if error occurs
// //     const defaultStats = {
// //       freestyleStories: { used: 0, limit: 3, remaining: 3, canUse: true },
// //       assessmentRequests: { used: 0, limit: 9, remaining: 9, canUse: true },
// //       competitionEntries: { used: 0, limit: 3, remaining: 3, canUse: true },
// //       publications: { used: 0, limit: 1, remaining: 1, canUse: true },
// //       subscriptionTier: 'FREE',
// //       resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
// //       currentPeriod: new Date().toLocaleDateString('en-US', {
// //         month: 'long',
// //         year: 'numeric'
// //       })
// //     };

// //     return NextResponse.json({
// //       success: true,
// //       usage: defaultStats,
// //       message: 'Default usage statistics (error occurred)',
// //       error: error instanceof Error ? error.message : 'Unknown error'
// //     });
// //   }
// // }

// // app/api/user/usage/route.ts - FIXED TO INCLUDE STORY PACK DATA
// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/utils/authOptions';
// import { connectToDatabase } from '@/utils/db';
// import User from '@/models/User';
// import PublishedStory from '@/models/PublishedStory';
// import { UsageManager } from '@/lib/usage-manager';

// export async function GET(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { error: 'Authentication required' },
//         { status: 401 }
//       );
//     }

//     if (session.user.role !== 'child') {
//       return NextResponse.json(
//         { error: 'Access denied. Children only.' },
//         { status: 403 }
//       );
//     }

//     // 🌟 AUTOMATIC MONTHLY RESET - Check internet date and reset if needed
//     const { checkAndPerformMonthlyReset } = await import('@/utils/autoReset');
//     const resetPerformed = await checkAndPerformMonthlyReset();
//     if (resetPerformed) {
//       console.log('🎉 Monthly reset completed automatically via internet date (Story Packs preserved)');
//     }

//     console.log('📊 Fetching usage statistics for user:', session.user.id);
//     await connectToDatabase();

//     // Get current month dates
//     const now = new Date();
//     const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

//     // Get user data
//     const user = await User.findById(session.user.id);
//     if (!user) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }

//     // Use ENHANCED UsageManager that calculates limits from 30-day purchases
//     const usageStats = await UsageManager.getUserUsageStats(session.user.id);

//     // Add reset info if it just happened
//     if (resetPerformed) {
//       usageStats.resetInfo = {
//         performed: true,
//         message: 'Monthly limits reset complete (Story Pack purchases preserved)'
//       };
//     }

//     // Count publications this month
//     const monthlyPublications = await PublishedStory.countDocuments({
//       childId: session.user.id,
//       publishedAt: { $gte: currentMonthStart }
//     });

//     // Add publications to the usage stats
//     const completeUsageStats = {
//       ...usageStats,
//       publications: {
//         used: monthlyPublications,
//         limit: 3, // Allow 3 free publications per month
//         remaining: Math.max(0, 3 - monthlyPublications),
//         canUse: monthlyPublications < 3
//       },
//       currentPeriod: now.toLocaleDateString('en-US', {
//         month: 'long',
//         year: 'numeric'
//       })
//     };

//     console.log('✅ Complete usage statistics:', completeUsageStats);
//     return NextResponse.json({
//       success: true,
//       usage: completeUsageStats,
//       message: 'Usage statistics retrieved successfully'
//     });

//   } catch (error) {
//     console.error('❌ Error fetching usage statistics:', error);

//     // Return safe defaults for new users if error occurs
//     const defaultStats = {
//       freestyleStories: { used: 0, limit: 3, remaining: 3, canUse: true },
//       assessmentRequests: { used: 0, limit: 9, remaining: 9, canUse: true },
//       competitionEntries: { used: 0, limit: 3, remaining: 3, canUse: true },
//   publications: { used: 0, limit: 3, remaining: 3, canUse: true },
//       subscriptionTier: 'FREE',
//       resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
//       currentPeriod: new Date().toLocaleDateString('en-US', {
//         month: 'long',
//         year: 'numeric'
//       })
//     };

//     return NextResponse.json({
//       success: true,
//       usage: defaultStats,
//       message: 'Default usage statistics (error occurred)',
//       error: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// }

// app/api/user/usage/route.ts - OPTIMIZED FOR SPEED (2-3 seconds instead of 10+ seconds)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';

export const dynamic = 'force-dynamic';

// Simple, fast interface
interface UsageStats {
  freestyleStories: {
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  };
  assessmentRequests: {
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  };
  competitionEntries: {
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  };
  publications: {
    used: number;
    limit: number;
    remaining: number;
    canUse: boolean;
  };
  subscriptionTier: 'FREE' | 'STORY_PACK';
  resetDate: string;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log('🚀 Starting usage API call...');

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // OPTIMIZED: Get current month dates once
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    console.log('⚡ Connected to DB in', Date.now() - startTime, 'ms');

    // OPTIMIZED: Single user query with lean() for speed and type assertion
    const user = (await User.findById(session.user.id).lean()) as any;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('⚡ Got user in', Date.now() - startTime, 'ms');

    // OPTIMIZED: Simple default limits (no complex calculations)
    const defaultLimits = {
      freestyleStories: 3,
      assessmentRequests: 9,
      competitionEntries: 3,
      publications: 1,
    };

    // OPTIMIZED: Check for story pack purchases this month (simple filter)
    let hasStoryPack = false;
    if (user.purchaseHistory && Array.isArray(user.purchaseHistory)) {
      hasStoryPack = user.purchaseHistory.some(
        (purchase: any) =>
          purchase.type === 'story_pack' &&
          new Date(purchase.purchaseDate) >= currentMonthStart
      );
    }

    // OPTIMIZED: Apply story pack bonus if applicable
    const limits = hasStoryPack
      ? {
          freestyleStories: defaultLimits.freestyleStories + 10, // Story pack adds 10
          assessmentRequests: defaultLimits.assessmentRequests + 30, // Story pack adds 30
          competitionEntries: defaultLimits.competitionEntries,
          publications: defaultLimits.publications + 2, // Story pack adds 2
        }
      : defaultLimits;

    console.log('⚡ Calculated limits in', Date.now() - startTime, 'ms');

    // OPTIMIZED: Single aggregation query instead of multiple separate queries
    const usageData = await StorySession.aggregate([
      {
        $match: {
          childId: session.user.id,
          createdAt: { $gte: currentMonthStart },
        },
      },
      {
        $group: {
          _id: null,
          // Count freestyle stories (not uploaded for assessment)
          freestyleCount: {
            $sum: {
              $cond: [{ $ne: ['$isUploadedForAssessment', true] }, 1, 0],
            },
          },
          // Count assessment requests (uploaded or has assessment)
          assessmentCount: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$isUploadedForAssessment', true] },
                    { $ne: ['$assessment', null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          // Count competition entries
          competitionCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$competitionEntries', null] },
                    {
                      $gt: [
                        { $size: { $ifNull: ['$competitionEntries', []] } },
                        0,
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    console.log('⚡ Got usage data in', Date.now() - startTime, 'ms');

    // Extract counts (default to 0 if no data)
    const counts = usageData[0] || {
      freestyleCount: 0,
      assessmentCount: 0,
      competitionCount: 0,
    };

    // OPTIMIZED: Count published stories (simple query)
    const publishedCount = await StorySession.countDocuments({
      childId: session.user.id,
      createdAt: { $gte: currentMonthStart },
      isPublished: true,
    });

    console.log('⚡ Got published count in', Date.now() - startTime, 'ms');

    // Build response
    const usageStats: UsageStats = {
      freestyleStories: {
        used: counts.freestyleCount,
        limit: limits.freestyleStories,
        remaining: Math.max(0, limits.freestyleStories - counts.freestyleCount),
        canUse: counts.freestyleCount < limits.freestyleStories,
      },
      assessmentRequests: {
        used: counts.assessmentCount,
        limit: limits.assessmentRequests,
        remaining: Math.max(
          0,
          limits.assessmentRequests - counts.assessmentCount
        ),
        canUse: counts.assessmentCount < limits.assessmentRequests,
      },
      competitionEntries: {
        used: counts.competitionCount,
        limit: limits.competitionEntries,
        remaining: Math.max(
          0,
          limits.competitionEntries - counts.competitionCount
        ),
        canUse: counts.competitionCount < limits.competitionEntries,
      },
      publications: {
        used: publishedCount,
        limit: limits.publications,
        remaining: Math.max(0, limits.publications - publishedCount),
        canUse: publishedCount < limits.publications,
      },
      subscriptionTier: hasStoryPack ? 'STORY_PACK' : 'FREE',
      resetDate: nextMonth.toISOString(),
    };

    const totalTime = Date.now() - startTime;
    console.log('✅ Usage API completed in', totalTime, 'ms');

    return NextResponse.json({
      success: true,
      usage: usageStats,
      debug: {
        responseTime: totalTime,
        counts,
        hasStoryPack,
        limits,
      },
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('❌ Usage API error after', totalTime, 'ms:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch usage statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
