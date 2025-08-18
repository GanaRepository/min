// app/api/user/usage/route.ts - COMPLETE WORKING VERSION RESTORED
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import PublishedStory from '@/models/PublishedStory';
import { UsageManager } from '@/lib/usage-manager';

export async function GET(request: NextRequest) {
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


    // 🌟 AUTOMATIC MONTHLY RESET - Check internet date and reset if needed
    const { checkAndPerformMonthlyReset } = await import('@/utils/autoReset');
    const resetPerformed = await checkAndPerformMonthlyReset();
    if (resetPerformed) {
      console.log('🎉 Monthly reset completed automatically via internet date');
    }

    console.log('📊 Fetching usage statistics for user:', session.user.id);
    await connectToDatabase();
    // Get current month dates
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    // Get user data
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Use existing UsageManager logic but include monthlyLimits
    const usageStats = await UsageManager.getUserUsageStats(session.user.id);
    // If user has monthlyLimits, override the calculated limits
    if (user.monthlyLimits) {
      usageStats.freestyleStories.limit = user.monthlyLimits.freestyleStories;
      usageStats.assessmentRequests.limit = user.monthlyLimits.assessmentRequests;
      usageStats.competitionEntries.limit = user.monthlyLimits.competitionEntries;
      usageStats.freestyleStories.remaining = Math.max(0, user.monthlyLimits.freestyleStories - usageStats.freestyleStories.used);
      usageStats.freestyleStories.canUse = usageStats.freestyleStories.used < user.monthlyLimits.freestyleStories;
      usageStats.assessmentRequests.remaining = Math.max(0, user.monthlyLimits.assessmentRequests - usageStats.assessmentRequests.used);
      usageStats.assessmentRequests.canUse = usageStats.assessmentRequests.used < user.monthlyLimits.assessmentRequests;
      usageStats.competitionEntries.remaining = Math.max(0, user.monthlyLimits.competitionEntries - usageStats.competitionEntries.used);
      usageStats.competitionEntries.canUse = usageStats.competitionEntries.used < user.monthlyLimits.competitionEntries;
    }
    // Add reset info if it just happened
    if (resetPerformed) {
      usageStats.resetInfo = {
        performed: true,
        message: 'Monthly limits have been reset to FREE tier'
      };
    }
    // Count publications this month
    const monthlyPublications = await PublishedStory.countDocuments({
      childId: session.user.id,
      publishedAt: { $gte: currentMonthStart }
    });
    // Add publications to the usage stats
    const completeUsageStats = {
      ...usageStats,
      publications: {
        used: monthlyPublications,
        limit: 1, // Always 1 free publication per month
        remaining: Math.max(0, 1 - monthlyPublications),
        canUse: monthlyPublications < 1
      },
      currentPeriod: now.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
    };
    console.log('✅ Complete usage statistics:', completeUsageStats);
    return NextResponse.json({
      success: true,
      usage: completeUsageStats,
      message: 'Usage statistics retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching usage statistics:', error);
    
    // Return safe defaults for new users if error occurs
    const defaultStats = {
      freestyleStories: { used: 0, limit: 3, remaining: 3, canUse: true },
      assessmentRequests: { used: 0, limit: 9, remaining: 9, canUse: true },
      competitionEntries: { used: 0, limit: 3, remaining: 3, canUse: true },
      publications: { used: 0, limit: 1, remaining: 1, canUse: true },
      subscriptionTier: 'FREE',
      resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
      currentPeriod: new Date().toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
    };

    return NextResponse.json({
      success: true,
      usage: defaultStats,
      message: 'Default usage statistics (error occurred)',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}