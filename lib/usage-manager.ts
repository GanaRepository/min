

//     const allowed = currentUsage.freestyleStories < limits.freestyleStories;

//     return {
//       allowed,
//       reason: allowed
//         ? `Can create story (${currentUsage.freestyleStories}/${limits.freestyleStories})`
//         : `Story limit reached (${currentUsage.freestyleStories}/${limits.freestyleStories}). Upgrade to Story Pack for 5 more stories!`,
//       currentUsage,
//       limits,
//       upgradeRequired: !allowed,
//     };
//   }

//   /**
//    * Check if user can request assessment (upload OR re-assess) - SIMPLIFIED
//    */
//   static async canRequestAssessment(userId: string): Promise<UsageCheckResult> {
//     const [currentUsage, limits] = await Promise.all([
//       this.getCurrentUsage(userId),
//       this.getUserLimits(userId),
//     ]);

//     const allowed = currentUsage.assessmentRequests < limits.assessmentRequests;

//     return {
//       allowed,
//       reason: allowed
//         ? `Can request assessment (${currentUsage.assessmentRequests}/${limits.assessmentRequests} used)`
//         : `Assessment requests exhausted (${currentUsage.assessmentRequests}/${limits.assessmentRequests})`,
//       currentUsage,
//       limits,
//       upgradeRequired: !allowed,
//     };
//   }

//   /**
//    * Check if user can enter competition
//    */
//   static async canEnterCompetition(userId: string): Promise<UsageCheckResult> {
//     const [currentUsage, limits] = await Promise.all([
//       this.getCurrentUsage(userId),
//       this.getUserLimits(userId),
//     ]);

//     const allowed = currentUsage.competitionEntries < limits.competitionEntries;

//     return {
//       allowed,
//       reason: allowed
//         ? `Can enter competition (${currentUsage.competitionEntries}/${limits.competitionEntries})`
//         : `Competition entry limit reached (${currentUsage.competitionEntries}/${limits.competitionEntries}).`,
//       currentUsage,
//       limits,
//       upgradeRequired: false, // Competition entries are not part of story pack
//     };
//   }

//   /**
//    * Increment usage counters after successful action
//    */
//   static async incrementStoryCreation(userId: string): Promise<void> {
//     // No need to increment anything - we count directly from stories
//     console.log(`✅ Story created for user ${userId}`);
//   }

//   static async incrementAssessmentRequest(
//     userId: string,
//     storyId: string
//   ): Promise<void> {
//     await connectToDatabase();
//     await StorySession.findByIdAndUpdate(storyId, {
//       $inc: { assessmentAttempts: 1 },
//     });
//     console.log(`✅ Assessment request incremented for story ${storyId}`);
//   }

//   static async incrementCompetitionEntry(userId: string): Promise<void> {
//     // No need to increment anything - we count directly from story competitionEntries
//     console.log(`✅ Competition entry created for user ${userId}`);
//   }

//   /**
//    * Reset monthly usage counters for all users (for cron job)
//    * With simplified system, this is less critical since we count from actual data
//    */
//   static async resetMonthlyUsage(): Promise<{
//     usersReset: number;
//     errors: string[];
//   }> {
//     await connectToDatabase();

//     let usersReset = 0;
//     const errors: string[] = [];

//     try {
//       // Optional: Clean up old assessment attempt counters if needed
//       const result = await User.updateMany(
//         { role: 'child', isActive: true },
//         {
//           $set: {
//             lastMonthlyReset: new Date(),
//           },
//         }
//       );

//       usersReset = result.modifiedCount;
//       console.log(`✅ Monthly reset completed for ${usersReset} users`);
//     } catch (error) {
//       const errorMsg = `Monthly reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
//       errors.push(errorMsg);
//       console.error('❌ Monthly reset error:', error);
//     }

//     return { usersReset, errors };
//   }

//   /**
//    * Validate and enforce limits before any action
//    */
//   static async enforceLimit(
//     userId: string,
//     action:
//       | 'create_story'
//       | 'request_assessment'
//       | 'enter_competition'
//   ): Promise<{ allowed: boolean; message: string; needsUpgrade: boolean }> {
//     let result: UsageCheckResult;

//     switch (action) {
//       case 'create_story':
//         result = await this.canCreateStory(userId);
//         break;
//       case 'request_assessment':
//         result = await this.canRequestAssessment(userId);
//         break;
//       case 'enter_competition':
//         result = await this.canEnterCompetition(userId);
//         break;
//       default:
//         return {
//           allowed: false,
//           message: 'Invalid action',
//           needsUpgrade: false,
//         };
//     }

//     return {
//       allowed: result.allowed,
//       message: result.reason || 'Action allowed',
//       needsUpgrade: result.upgradeRequired || false,
//     };
//   }
// }

// lib/usage-manager.ts - COMPLETE FIXED VERSION
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';
import UserPurchase from '@/models/Purchase';
import { USAGE_LIMITS } from '@/config/limits';

export interface UsageStats {
  freestyleStories: { used: number; limit: number; remaining: number; canUse: boolean };
  assessmentRequests: { used: number; limit: number; remaining: number; canUse: boolean };
  competitionEntries: { used: number; limit: number; remaining: number; canUse: boolean };
  subscriptionTier: 'FREE' | 'STORY_PACK';
  resetDate: string;
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
   * Check if user can publish a story (1 per month, by publishedAt)
   */
  static async canPublishStory(userId: string): Promise<UsageCheckResult> {
    try {
      await connectToDatabase();

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      // Check publishedAt field instead of publicationDate
      const publishedCount = await StorySession.countDocuments({
        childId: userId,
        isPublished: true,
        publishedAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      const canPublish = publishedCount < 1;

      return {
        allowed: canPublish,
        reason: canPublish ? undefined : 'You can only publish 1 story per month for free. Limit resets next month.',
        currentUsage: { publications: publishedCount },
        limits: { publications: 1 }
      };
    } catch (error) {
      console.error('❌ Error checking publication usage:', error);
      return { allowed: false, reason: 'Failed to check publication limits' };
    }
  }
  /**
   * Get current month's usage for a user
   */
  static async getCurrentUsage(userId: string): Promise<{
    freestyleStories: number;
    assessmentRequests: number;
    competitionEntries: number;
  }> {
    await connectToDatabase();
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get all stories for current month
    const stories = await StorySession.find({
      childId: userId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    }).lean();

    // Count freestyle stories (collaborative AI stories, not uploaded for assessment, not competition)
    const freestyleStories = stories.filter(s => 
      !s.isUploadedForAssessment && 
      (!s.competitionEntries || s.competitionEntries.length === 0)
    ).length;

    // Count assessment requests (uploaded stories + assessment attempts)
    const assessmentRequests = stories.reduce((sum, story) => {
      if (story.isUploadedForAssessment || story.assessment) {
        return sum + (story.assessmentAttempts || 1);
      }
      return sum;
    }, 0);

    // Count competition entries
    const competitionEntries = stories.filter(s => 
      s.competitionEntries && s.competitionEntries.length > 0
    ).length;

    return {
      freestyleStories,
      assessmentRequests,
      competitionEntries,
    };
  }

  /**
   * Get user's current limits (including purchases)
   */
  static async getUserLimits(userId: string): Promise<{
    freestyleStories: number;
    assessmentRequests: number;
    competitionEntries: number;
  }> {
    await connectToDatabase();
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Check for story pack purchases this month
    const purchases = await UserPurchase.find({
      userId,
      purchaseType: 'story_pack',
      purchaseDate: { $gte: startOfMonth, $lte: endOfMonth },
      status: 'completed'
    }).lean();

    const hasPurchases = purchases.length > 0;

    return {
      freestyleStories: hasPurchases ? 8 : 3,  // 3 + 5 with story pack
      assessmentRequests: hasPurchases ? 24 : 9, // 9 + 15 with story pack
      competitionEntries: 3, // Always 3, no upgrades
    };
  }

  /**
   * Check if user can create freestyle story
   */
  static async canCreateStory(userId: string): Promise<UsageCheckResult> {
    try {
      await connectToDatabase();

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      // Get limits
      const limits = await this.getUserLimits(userId);
      const freestyleLimit = limits.freestyleStories;

      // FIXED: Count freestyle stories this month with CORRECT query
      const freestyleCount = await StorySession.countDocuments({
        childId: userId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        isUploadedForAssessment: { $ne: true },
        $or: [
          { competitionEntries: { $exists: false } },
          { competitionEntries: { $size: 0 } }
        ]
      });

      const canUse = freestyleCount < freestyleLimit;

      return {
        allowed: canUse,
        reason: canUse 
          ? undefined 
          : `Freestyle story limit reached (${freestyleCount}/${freestyleLimit}). Upgrade to get 5 more stories.`,
        upgradeRequired: !canUse,
        currentUsage: { freestyleStories: freestyleCount },
        limits: { freestyleStories: freestyleLimit }
      };

    } catch (error) {
      console.error('❌ Error checking freestyle usage:', error);
      return { allowed: false, reason: 'Failed to check usage limits' };
    }
  }

  /**
   * Check if user can request assessment
   */
  static async canRequestAssessment(userId: string): Promise<UsageCheckResult> {
    try {
      await connectToDatabase();

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      // Get limits
      const limits = await this.getUserLimits(userId);
      const assessmentLimit = limits.assessmentRequests;

      // Count assessment requests this month
      const assessmentStats = await StorySession.aggregate([
        {
          $match: {
            childId: userId,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
            $or: [
              { isUploadedForAssessment: true },
              { assessment: { $exists: true } }
            ]
          }
        },
        {
          $group: {
            _id: null,
            totalAttempts: { $sum: { $ifNull: ['$assessmentAttempts', 1] } }
          }
        }
      ]);

      const assessmentUsed = assessmentStats[0]?.totalAttempts || 0;
      const canUse = assessmentUsed < assessmentLimit;

      return {
        allowed: canUse,
        reason: canUse 
          ? undefined 
          : `Assessment requests exhausted (${assessmentUsed}/${assessmentLimit}). Upgrade for 15 more assessments.`,
        upgradeRequired: !canUse,
        currentUsage: { assessmentRequests: assessmentUsed },
        limits: { assessmentRequests: assessmentLimit }
      };

    } catch (error) {
      console.error('❌ Error checking assessment usage:', error);
      return { allowed: false, reason: 'Failed to check usage limits' };
    }
  }

  /**
   * Check if user can enter competitions
   */
  static async canEnterCompetition(userId: string): Promise<UsageCheckResult> {
    try {
      await connectToDatabase();

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      // Competition limit is ALWAYS 3 (no upgrades)
      const competitionLimit = USAGE_LIMITS.FREE.competitionEntries; // 3

      // FIXED: Count competition entries with CORRECT query
      const competitionCount = await StorySession.countDocuments({
        childId: userId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        competitionEntries: { $exists: true, $not: { $size: 0 } }
      });

      const canUse = competitionCount < competitionLimit;

      return {
        allowed: canUse,
        reason: canUse ? undefined : `Competition entry limit reached (${competitionCount}/${competitionLimit}). Limit resets next month.`,
        upgradeRequired: false, // No upgrade available for competitions
        currentUsage: { competitionEntries: competitionCount },
        limits: { competitionEntries: competitionLimit }
      };

    } catch (error) {
      console.error('❌ Error checking competition usage:', error);
      return { allowed: false, reason: 'Failed to check usage limits' };
    }
  }

  /**
   * Get comprehensive usage statistics for dashboard - COMPLETE METHOD
   */
  static async getUserUsageStats(userId: string): Promise<UsageStats> {
    try {
      await connectToDatabase();

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      // Get story pack purchases this month
      const purchases = await UserPurchase.find({
        userId,
        purchaseType: 'story_pack',
        purchaseDate: { $gte: startOfMonth, $lte: endOfMonth },
        status: 'completed'
      }).lean();

      const hasPurchases = purchases.length > 0;
      const subscriptionTier = hasPurchases ? 'STORY_PACK' : 'FREE';

      // Calculate limits
      const limits = {
        freestyleStories: USAGE_LIMITS.FREE.freestyleStories + (purchases.length * 5),
        assessmentRequests: USAGE_LIMITS.FREE.assessmentRequests + (purchases.length * 15),
        competitionEntries: USAGE_LIMITS.FREE.competitionEntries // Always 3
      };

      // Count actual usage
      const [freestyleCount, competitionCount] = await Promise.all([
        // Freestyle stories
        StorySession.countDocuments({
          childId: userId,
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          isUploadedForAssessment: { $ne: true },
          competitionEntries: { $not: { $exists: true, $ne: [] } }
        }),
        
        // Competition entries
        StorySession.countDocuments({
          childId: userId,
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          competitionEntries: { $exists: true, $ne: [] }
        })
      ]);

      // Count assessment requests (any story upload or assessment)
      const assessmentStats = await StorySession.aggregate([
        {
          $match: {
            childId: userId,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
            $or: [
              { isUploadedForAssessment: true },
              { assessment: { $exists: true } }
            ]
          }
        },
        {
          $group: {
            _id: null,
            totalAssessments: { $sum: 1 },
            totalAttempts: { $sum: { $ifNull: ['$assessmentAttempts', 1] } }
          }
        }
      ]);

      const assessmentUsed = Math.max(
        assessmentStats[0]?.totalAssessments || 0,
        assessmentStats[0]?.totalAttempts || 0
      );

      // Return complete UsageStats object
      return {
        freestyleStories: {
          used: freestyleCount,
          limit: limits.freestyleStories,
          remaining: Math.max(0, limits.freestyleStories - freestyleCount),
          canUse: freestyleCount < limits.freestyleStories
        },
        assessmentRequests: {
          used: assessmentUsed,
          limit: limits.assessmentRequests,
          remaining: Math.max(0, limits.assessmentRequests - assessmentUsed),
          canUse: assessmentUsed < limits.assessmentRequests
        },
        competitionEntries: {
          used: competitionCount,
          limit: limits.competitionEntries,
          remaining: Math.max(0, limits.competitionEntries - competitionCount),
          canUse: competitionCount < limits.competitionEntries
        },
        subscriptionTier,
        resetDate: nextMonth.toISOString()
      };

    } catch (error) {
      console.error('❌ Error getting usage stats:', error);
      // Return safe defaults for new users
      return {
        freestyleStories: { used: 0, limit: 3, remaining: 3, canUse: true },
        assessmentRequests: { used: 0, limit: 9, remaining: 9, canUse: true },
        competitionEntries: { used: 0, limit: 3, remaining: 3, canUse: true },
        subscriptionTier: 'FREE',
        resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
      };
    }
  }

  /**
   * Reset monthly usage counters for all users (for cron job)
   */
  static async resetMonthlyUsage(): Promise<{
    usersReset: number;
    errors: string[];
  }> {
    await connectToDatabase();

    let usersReset = 0;
    const errors: string[] = [];

    try {
      // Optional: Clean up old assessment attempt counters if needed
      const result = await User.updateMany(
        { role: 'child', isActive: true },
        {
          $set: {
            lastMonthlyReset: new Date(),
          },
        }
      );

      usersReset = result.modifiedCount;
      console.log(`✅ Monthly reset completed for ${usersReset} users`);
    } catch (error) {
      const errorMsg = `Monthly reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      console.error('❌ Monthly reset error:', error);
    }

    return { usersReset, errors };
  }

  /**
   * Increment usage counters after successful action
   */
  static async incrementStoryCreation(userId: string): Promise<void> {
    console.log(`✅ Story created for user ${userId}`);
  }

  static async incrementAssessmentRequest(userId: string, storyId: string): Promise<void> {
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