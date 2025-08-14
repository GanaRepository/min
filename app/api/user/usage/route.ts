// app/api/user/usage/route.ts - COMPLETE UPDATE FOR MINTOONS REQUIREMENTS
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import { UsageManager } from '@/lib/usage-manager';
import User from '@/models/User';
import StorySession from '@/models/StorySession';
import PublishedStory from '@/models/PublishedStory';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'child') {
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

    // Calculate user's current limits (including any Story Pack purchases)
    const userLimits = await UsageManager.getUserLimits(session.user.id);
    const currentUsage = await UsageManager.getCurrentUsage(session.user.id);

    console.log('📈 Current usage:', currentUsage);
    console.log('📋 User limits:', userLimits);

    // Get detailed story breakdown for this month
    const monthlyStories = await StorySession.find({
      childId: session.user.id,
      createdAt: { $gte: currentMonthStart }
    }).select('isUploadedForAssessment competitionEntries assessmentAttempts createdAt');

    // Count freestyle stories (not uploaded, not just created)
    const freestyleStories = monthlyStories.filter(story => 
      !story.isUploadedForAssessment && 
      (!story.competitionEntries || story.competitionEntries.length === 0)
    ).length;

    // Count uploaded stories for assessment
    const uploadedStories = monthlyStories.filter(story => 
      story.isUploadedForAssessment === true
    ).length;

    // Count competition entries from user's monthly tracking
    const competitionEntries = user.competitionEntriesThisMonth || 0;

    // Count total assessment attempts (across all stories)
    const totalAssessmentAttempts = monthlyStories.reduce(
      (sum, story) => sum + (story.assessmentAttempts || 0), 
      0
    );

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

    // Build comprehensive usage response
    const usageStats = {
      // Freestyle story creation
      stories: {
        used: freestyleStories,
        limit: userLimits.stories,
        remaining: Math.max(0, userLimits.stories - freestyleStories),
        canUse: freestyleStories < userLimits.stories
      },

      // Story uploads for assessment
      assessments: {
        used: uploadedStories,
        limit: userLimits.assessments,
        remaining: Math.max(0, userLimits.assessments - uploadedStories),
        canUse: uploadedStories < userLimits.assessments
      },

      // Assessment attempts (total pool)
      assessmentAttempts: {
        used: totalAssessmentAttempts,
        limit: userLimits.totalAssessmentAttempts,
        remaining: Math.max(0, userLimits.totalAssessmentAttempts - totalAssessmentAttempts),
        canUse: totalAssessmentAttempts < userLimits.totalAssessmentAttempts
      },

      // Competition entries
      competitions: {
        used: competitionEntries,
        limit: userLimits.competitionEntries,
        remaining: Math.max(0, userLimits.competitionEntries - competitionEntries),
        canUse: competitionEntries < userLimits.competitionEntries
      },

      // Free publications
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
        freestyleStories,
        uploadedStories,
        competitionEntries,
        totalAssessmentAttempts,
        monthlyPublications,
        hasStoryPack,
        totalMonthlyStories: monthlyStories.length
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

// POST endpoint for manual usage updates (admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'child')) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, userId } = body;

    const targetUserId = userId || session.user.id;

    // Only allow children to update their own usage, admins can update anyone
    if (session.user.role === 'child' && targetUserId !== session.user.id) {
      return NextResponse.json(
        { error: 'Cannot update other users usage' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    let result;
    switch (action) {
      case 'increment_story':
        await UsageManager.incrementStoryCreation(targetUserId);
        result = 'Story creation incremented';
        break;
        
      case 'increment_assessment_upload':
        await UsageManager.incrementAssessmentUpload(targetUserId);
        result = 'Assessment upload incremented';
        break;
        
      case 'increment_assessment_attempt':
        const { storyId } = body;
        if (!storyId) {
          return NextResponse.json(
            { error: 'Story ID required for assessment attempt' },
            { status: 400 }
          );
        }
        await UsageManager.incrementAssessmentAttempt(targetUserId, storyId);
        result = 'Assessment attempt incremented';
        break;
        
      case 'increment_competition':
        await UsageManager.incrementCompetitionEntry(targetUserId);
        result = 'Competition entry incremented';
        break;
        
      case 'reset_monthly':
        if (session.user.role !== 'admin') {
          return NextResponse.json(
            { error: 'Admin access required for monthly reset' },
            { status: 403 }
          );
        }
        const resetResult = await UsageManager.resetMonthlyUsage();
        result = `Monthly usage reset for ${resetResult.usersReset} users`;
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }

    console.log(`✅ Usage action completed: ${action} for user ${targetUserId}`);

    return NextResponse.json({
      success: true,
      message: result,
      action,
      userId: targetUserId
    });

  } catch (error) {
    console.error('❌ Error updating usage:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update usage',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}