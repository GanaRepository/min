// app/api/user/usage/route.ts - COMPLETE FIXED VERSION
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

    // Get usage statistics using the fixed UsageManager
    const usageStats = await UsageManager.getUserUsageStats(session.user.id);

    console.log('📈 Usage stats retrieved:', usageStats);

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