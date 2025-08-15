// app/api/user/usage/route.ts - SIMPLIFIED USAGE API
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';
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

    console.log('📊 Fetching usage statistics for user:', session.user.id);

    await connectToDatabase();

    // Get current month dates
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Get user data
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get usage and limits using simplified UsageManager
    const userLimits = await UsageManager.getUserLimits(session.user.id);
    const currentUsage = await UsageManager.getCurrentUsage(session.user.id);

    console.log('📈 Current usage:', currentUsage);
    console.log('📋 User limits:', userLimits);

    // Count publications this month
    const monthlyPublications = await PublishedStory.countDocuments({
      childId: session.user.id,
      publishedAt: { $gte: currentMonthStart }
    });

    // Determine subscription tier
    const hasStoryPack = user.purchaseHistory?.some((purchase: any) => 
      purchase.type === 'story_pack' && 
      purchase.purchaseDate >= currentMonthStart &&
      purchase.purchaseDate < nextMonthStart
    ) || false;

    const subscriptionTier = hasStoryPack ? 'STORY_PACK' : 'FREE';

    // Build simplified usage response
    const usageStats = {
      // Freestyle Stories (Collaborative AI stories)
      freestyleStories: {
        used: currentUsage.freestyleStories,
        limit: userLimits.freestyleStories,
        remaining: Math.max(0, userLimits.freestyleStories - currentUsage.freestyleStories),
        canUse: currentUsage.freestyleStories < userLimits.freestyleStories
      },

      // Assessment Requests (uploads + re-assessments combined)
      assessmentRequests: {
        used: currentUsage.assessmentRequests,
        limit: userLimits.assessmentRequests,
        remaining: Math.max(0, userLimits.assessmentRequests - currentUsage.assessmentRequests),
        canUse: currentUsage.assessmentRequests < userLimits.assessmentRequests
      },

      // Competition entries
      competitionEntries: {
        used: currentUsage.competitionEntries,
        limit: userLimits.competitionEntries,
        remaining: Math.max(0, userLimits.competitionEntries - currentUsage.competitionEntries),
        canUse: currentUsage.competitionEntries < userLimits.competitionEntries
      },

      // Free publications (unchanged)
      publications: {
        used: monthlyPublications,
        limit: 1, // Always 1 free publication per month
        remaining: Math.max(0, 1 - monthlyPublications),
        canUse: monthlyPublications < 1
      },

      // Additional metadata
      resetDate: nextMonthStart.toISOString(),
      subscriptionTier: subscriptionTier,
      currentPeriod: now.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      }),

      // Detailed breakdown for admin/debugging
      breakdown: {
        freestyleStories: currentUsage.freestyleStories,
        assessmentRequests: currentUsage.assessmentRequests,
        competitionEntries: currentUsage.competitionEntries,
        monthlyPublications,
        hasStoryPack,
      }
    };

    console.log('✅ Usage statistics calculated:', usageStats);

    return NextResponse.json({
      success: true,
      usage: usageStats,
      message: 'Usage statistics retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching usage statistics:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch usage statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}