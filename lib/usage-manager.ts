// lib/usage-manager.ts - COMPLETE WITH ALL EXISTING METHODS + 30-DAY SYSTEM
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';
import { USAGE_LIMITS } from '@/config/limits';

export interface UsageStats {
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
  subscriptionTier: 'FREE' | 'STORY_PACK';
  resetDate: string;
  storyPackExpiry?: string; // NEW: When current story pack expires
  daysRemaining?: number; // NEW: Days left on story pack
  resetInfo?: {
    performed: boolean;
    message: string;
  };
}

export interface UsageCheckResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: boolean;
  currentUsage?: any;
  limits?: any;
}

export class UsageManager {
  /**
   * NEW: Calculate user's current limits based on active 30-day Story Pack purchases
   */
  static async calculateUserLimits(userId: string): Promise<{
    limits: {
      freestyleStories: number;
      assessmentRequests: number;
      competitionEntries: number;
    };
    tier: 'FREE' | 'STORY_PACK';
    storyPackExpiry?: Date;
    daysRemaining?: number;
  }> {
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
      return {
        limits: {
          freestyleStories: 3,
          assessmentRequests: 9,
          competitionEntries: 3,
        },
        tier: 'FREE',
      };
    }

    // Start with FREE tier limits
    let limits = {
      freestyleStories: 3,
      assessmentRequests: 9,
      competitionEntries: 3,
    };
    let tier: 'FREE' | 'STORY_PACK' = 'FREE';
    let storyPackExpiry: Date | undefined;
    let daysRemaining: number | undefined;

    // Check for active Story Pack purchases (30-day rolling)
    const now = new Date();
    const activePurchases =
      user.purchaseHistory?.filter((purchase: any) => {
        if (
          purchase.type !== 'story_pack' ||
          purchase.paymentStatus !== 'completed'
        ) {
          return false;
        }

        // Check if this purchase is still active (within 30 days)
        const purchaseDate = new Date(purchase.purchaseDate);
        const expiryDate = new Date(
          purchaseDate.getTime() + 30 * 24 * 60 * 60 * 1000
        ); // +30 days

        return now <= expiryDate;
      }) || [];

    // If any active Story Pack purchases exist, apply benefits
    if (activePurchases.length > 0) {
      // Find the purchase that expires latest (most recent or stacked)
      const latestPurchase = activePurchases.reduce(
        (latest: any, current: any) => {
          const currentExpiry = new Date(
            new Date(current.purchaseDate).getTime() + 30 * 24 * 60 * 60 * 1000
          );
          const latestExpiry = new Date(
            new Date(latest.purchaseDate).getTime() + 30 * 24 * 60 * 60 * 1000
          );
          return currentExpiry > latestExpiry ? current : latest;
        }
      );

      storyPackExpiry = new Date(
        new Date(latestPurchase.purchaseDate).getTime() +
          30 * 24 * 60 * 60 * 1000
      );
      daysRemaining = Math.ceil(
        (storyPackExpiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      );

      // Apply Story Pack benefits for each active purchase
      activePurchases.forEach((purchase: any) => {
        limits.freestyleStories += purchase.itemDetails?.storiesAdded || 5;
        limits.assessmentRequests +=
          purchase.itemDetails?.assessmentsAdded || 15;
        // Competition entries don't get upgraded
      });

      tier = 'STORY_PACK';
    }

    return { limits, tier, storyPackExpiry, daysRemaining };
  }

  /**
   * PRESERVED: Alias for backward compatibility
   */
  static async canCreateFreestyleStory(
    userId: string
  ): Promise<UsageCheckResult> {
    return this.canCreateStory(userId);
  }

  /**
   * PRESERVED: Check if user can publish a story (1 per month, by publishedAt)
   */
  static async canPublishStory(userId: string): Promise<UsageCheckResult> {
    try {
      await connectToDatabase();

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      // Check publishedAt field instead of publicationDate
      const publishedCount = await StorySession.countDocuments({
        childId: userId,
        isPublished: true,
        publishedAt: { $gte: startOfMonth, $lte: endOfMonth },
      });

      const canPublish = publishedCount < 3;

      return {
        allowed: canPublish,
        reason: canPublish
          ? undefined
          : 'You can only publish 3 stories per month for free. Limit resets next month.',
        currentUsage: { publications: publishedCount },
        limits: { publications: 3 },
      };
    } catch (error) {
      console.error('❌ Error checking publication usage:', error);
      return { allowed: false, reason: 'Failed to check publication limits' };
    }
  }

  /**
   * PRESERVED: Get current month's usage for a user
   */
  static async getCurrentUsage(userId: string): Promise<{
    freestyleStories: number;
    assessmentRequests: number;
    competitionEntries: number;
  }> {
    await connectToDatabase();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    // Get all stories for current month
    const stories = await StorySession.find({
      childId: userId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    }).lean();

    // Count freestyle stories (collaborative AI stories, not uploaded for assessment, not competition)
    const freestyleStories = stories.filter(
      (s) =>
        !s.isUploadedForAssessment &&
        (!s.competitionEntries || s.competitionEntries.length === 0)
    ).length;

    // Count assessment requests (uploaded stories + assessment attempts)
    const assessmentRequests = stories.filter(
      (story) => story.isUploadedForAssessment
    ).length;

    // Count competition entries
    const competitionEntries = stories.filter(
      (s) => s.competitionEntries && s.competitionEntries.length > 0
    ).length;

    return {
      freestyleStories,
      assessmentRequests,
      competitionEntries,
    };
  }

  /**
   * PRESERVED: Get user's current limits (including purchases) - ENHANCED WITH 30-DAY SYSTEM
   */
  static async getUserLimits(userId: string): Promise<{
    freestyleStories: number;
    assessmentRequests: number;
    competitionEntries: number;
  }> {
    // Use the new 30-day calculation system
    const { limits } = await this.calculateUserLimits(userId);
    return limits;
  }

  /**
   * ENHANCED: Check if user can create a story (with 30-day support)
   */
  static async canCreateStory(userId: string): Promise<UsageCheckResult> {
    try {
      const { limits } = await this.calculateUserLimits(userId);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      // Count freestyle stories this month
      const freestyleCount = await StorySession.countDocuments({
        childId: userId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        isUploadedForAssessment: { $ne: true },
        $or: [
          { competitionEntries: { $exists: false } },
          { competitionEntries: { $size: 0 } },
        ],
      });

      const canUse = freestyleCount < limits.freestyleStories;

      return {
        allowed: canUse,
        reason: canUse
          ? undefined
          : `Freestyle story limit reached (${freestyleCount}/${limits.freestyleStories}). ${limits.freestyleStories <= 3 ? 'Upgrade to get 5 more stories.' : 'Limit resets next month.'}`,
        upgradeRequired: !canUse && limits.freestyleStories <= 3,
        currentUsage: { freestyleStories: freestyleCount },
        limits: { freestyleStories: limits.freestyleStories },
      };
    } catch (error) {
      console.error('❌ Error checking freestyle usage:', error);
      return { allowed: false, reason: 'Failed to check usage limits' };
    }
  }

  /**
   * ENHANCED: Check if user can request assessment (with 30-day support)
   */
  static async canRequestAssessment(userId: string): Promise<UsageCheckResult> {
    try {
      const { limits } = await this.calculateUserLimits(userId);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      // FIXED: Count assessment requests this month - count every uploaded story as 1 assessment
      const assessmentUsed = await StorySession.countDocuments({
        childId: userId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        isUploadedForAssessment: true, // Only count uploaded stories for assessments
      });

      const canUse = assessmentUsed < limits.assessmentRequests;

      return {
        allowed: canUse,
        reason: canUse
          ? undefined
          : `Assessment requests exhausted (${assessmentUsed}/${limits.assessmentRequests}). ${limits.assessmentRequests <= 9 ? 'Upgrade for 15 more assessments.' : 'Limit resets next month.'}`,
        upgradeRequired: !canUse && limits.assessmentRequests <= 9,
        currentUsage: { assessmentRequests: assessmentUsed },
        limits: { assessmentRequests: limits.assessmentRequests },
      };
    } catch (error) {
      console.error('❌ Error checking assessment usage:', error);
      return { allowed: false, reason: 'Failed to check usage limits' };
    }
  }

  /**
   * ENHANCED: Check if user can enter competitions (with 30-day support)
   */
  static async canEnterCompetition(userId: string): Promise<UsageCheckResult> {
    try {
      const { limits } = await this.calculateUserLimits(userId);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      // Count competition entries with CORRECT query
      const competitionCount = await StorySession.countDocuments({
        childId: userId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        competitionEntries: { $exists: true, $not: { $size: 0 } },
      });

      const canUse = competitionCount < limits.competitionEntries;

      return {
        allowed: canUse,
        reason: canUse
          ? undefined
          : `Competition entry limit reached (${competitionCount}/${limits.competitionEntries}). Limit resets next month.`,
        upgradeRequired: false, // No upgrade available for competitions
        currentUsage: { competitionEntries: competitionCount },
        limits: { competitionEntries: limits.competitionEntries },
      };
    } catch (error) {
      console.error('❌ Error checking competition usage:', error);
      return { allowed: false, reason: 'Failed to check usage limits' };
    }
  }

  /**
   * ENHANCED: Get comprehensive usage statistics with 30-day Story Pack support
   */
  static async getUserUsageStats(userId: string): Promise<UsageStats> {
    try {
      await connectToDatabase();

      const { limits, tier, storyPackExpiry, daysRemaining } =
        await this.calculateUserLimits(userId);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      // Count actual usage this CALENDAR MONTH
      const [freestyleCount, competitionCount] = await Promise.all([
        // Freestyle stories
        StorySession.countDocuments({
          childId: userId,
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          isUploadedForAssessment: { $ne: true },
          $or: [
            { competitionEntries: { $exists: false } },
            { competitionEntries: { $size: 0 } },
          ],
        }),

        // Competition entries
        StorySession.countDocuments({
          childId: userId,
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          competitionEntries: { $exists: true, $ne: [] },
        }),
      ]);

      // Count assessment requests (any story upload or assessment)
      const assessmentUsed = await StorySession.countDocuments({
        childId: userId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        isUploadedForAssessment: true, // Only count uploaded stories for assessments
      });

      const result: UsageStats = {
        freestyleStories: {
          used: freestyleCount,
          limit: limits.freestyleStories,
          remaining: Math.max(0, limits.freestyleStories - freestyleCount),
          canUse: freestyleCount < limits.freestyleStories,
        },
        assessmentRequests: {
          used: assessmentUsed,
          limit: limits.assessmentRequests,
          remaining: Math.max(0, limits.assessmentRequests - assessmentUsed),
          canUse: assessmentUsed < limits.assessmentRequests,
        },
        competitionEntries: {
          used: competitionCount,
          limit: limits.competitionEntries,
          remaining: Math.max(0, limits.competitionEntries - competitionCount),
          canUse: competitionCount < limits.competitionEntries,
        },
        subscriptionTier: tier,
        resetDate: nextMonth.toISOString(),
      };

      // Add Story Pack specific info
      if (storyPackExpiry && daysRemaining) {
        result.storyPackExpiry = storyPackExpiry.toISOString();
        result.daysRemaining = daysRemaining;
      }

      return result;
    } catch (error) {
      console.error('❌ Error getting usage stats:', error);
      // Return safe defaults for new users
      return {
        freestyleStories: { used: 0, limit: 3, remaining: 3, canUse: true },
        assessmentRequests: { used: 0, limit: 9, remaining: 9, canUse: true },
        competitionEntries: { used: 0, limit: 3, remaining: 3, canUse: true },
        subscriptionTier: 'FREE',
        resetDate: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          1
        ).toISOString(),
      };
    }
  }

  /**
   * PRESERVED: Monthly reset for FREE tier limits (NO LONGER AFFECTS STORY PACKS)
   */
  static async resetMonthlyUsage(): Promise<{
    usersReset: number;
    errors: string[];
  }> {
    await connectToDatabase();

    let usersReset = 0;
    const errors: string[] = [];

    try {
      console.log(
        '🔄 Starting calendar month reset (preserving Story Pack purchases)...'
      );

      // Only reset monthly tracking, DO NOT TOUCH Story Pack purchases
      const result = await User.updateMany(
        { role: 'child', isActive: true },
        {
          $set: {
            lastMonthlyReset: new Date(),
          },
        }
      );

      usersReset = result.modifiedCount;
      console.log(
        `✅ Monthly reset completed for ${usersReset} users (Story Packs preserved)`
      );
    } catch (error) {
      const errorMsg = `Monthly reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      console.error('❌ Monthly reset error:', error);
    }

    return { usersReset, errors };
  }

  /**
   * PRESERVED: Increment usage counters after successful action
   */
  static async incrementStoryCreation(userId: string): Promise<void> {
    console.log(`✅ Story created for user ${userId}`);
  }

  static async incrementAssessmentRequest(
    userId: string,
    storyId: string
  ): Promise<void> {
    await connectToDatabase();
    await StorySession.findByIdAndUpdate(storyId, {
      $inc: { assessmentAttempts: 1 },
    });
    console.log(`✅ Assessment request incremented for story ${storyId}`);
  }

  static async incrementCompetitionEntry(userId: string): Promise<void> {
    console.log(`✅ Competition entry created for user ${userId}`);
  }
}
