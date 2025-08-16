// // ========================================
// // lib/usage-manager.ts - SIMPLIFIED INTERFACE
// // ========================================

// import { connectToDatabase } from '@/utils/db';
// import User from '@/models/User';
// import StorySession from '@/models/StorySession';
// import {
//   FREE_TIER_LIMITS,
//   STORY_PACK_BENEFITS,
//   calculateUserLimits,
//   validateUsageWithinLimits,
// } from '@/config/limits';
// import type { UsageLimits } from '@/config/limits';

// export interface UserUsage {
//   freestyleStories: number;
//   assessmentRequests: number; // SIMPLIFIED: Total assessments used
//   competitionEntries: number;
// }

// export interface UsageCheckResult {
//   allowed: boolean;
//   reason?: string;
//   currentUsage: UserUsage;
//   limits: UsageLimits;
//   upgradeRequired?: boolean;
// }

// export class UsageManager {
//   /**
//    * Get current month's usage for a user - SIMPLIFIED COUNTING
//    */
//   static async getCurrentUsage(userId: string): Promise<UserUsage> {
//     await connectToDatabase();
    
//     // Get current month start date
//     const now = new Date();
//     const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

//     // Get all stories for current month
//     const stories = await StorySession.find({
//       childId: userId,
//       createdAt: { $gte: monthStart }
//     }).lean();

//     // Count freestyle stories (collaborative AI stories)
//     const freestyleStories = stories.filter(s => 
//       !s.isUploadedForAssessment && 
//       (!s.competitionEntries || s.competitionEntries.length === 0)
//     ).length;

//     // Count ALL assessment requests (uploads + re-assessments)
//     const assessmentRequests = stories.reduce((sum, story) => {
//       return sum + (story.assessmentAttempts || (story.assessment ? 1 : 0));
//     }, 0);

//     // Count competition entries
//     const competitionEntries = stories.filter(s => 
//       s.competitionEntries && s.competitionEntries.length > 0
//     ).length;

//     return {
//       freestyleStories,
//       assessmentRequests,
//       competitionEntries,
//     };
//   }

//   /**
//    * Get user's current limits (including purchases)
//    */
//   static async getUserLimits(userId: string): Promise<UsageLimits> {
//     await connectToDatabase();
//     const user = await User.findById(userId);
//     if (!user) {
//       throw new Error('User not found');
//     }

//     // Get current month start
//     const now = new Date();
//     const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

//     // Calculate limits including this month's purchases
//     return calculateUserLimits(
//       FREE_TIER_LIMITS,
//       user.purchaseHistory?.map((p: any) => ({
//         type: p.type,
//         storiesAdded: p.metadata?.storiesAdded || 0,
//         assessmentRequestsAdded: p.metadata?.assessmentRequestsAdded || p.metadata?.assessmentsAdded || 0,
//         competitionEntriesAdded: p.metadata?.competitionEntriesAdded || 0,
//         purchaseDate: p.purchaseDate,
//       })) || [],
//       currentMonthStart
//     );
//   }

//   /**
//    * Check if user can create a new freestyle story
//    */
//   static async canCreateStory(userId: string): Promise<UsageCheckResult> {
//     const [currentUsage, limits] = await Promise.all([
//       this.getCurrentUsage(userId),
//       this.getUserLimits(userId),
//     ]);

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

// lib/usage-manager.ts - FIXED TYPESCRIPT ERRORS
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
   * SIMPLIFIED POOL SYSTEM: Check if user can request ANY assessment (upload OR re-assess)
   * 9 free assessments + 15 more for $15 - use on ANY story in ANY combination
   * No per-story limits - just a total pool of assessment credits
   */
  static async canRequestAssessment(userId: string): Promise<UsageCheckResult> {
    try {
      await connectToDatabase();

      // Get current month boundaries
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      // Get user's tier and limits
      const user = await User.findById(userId).lean();
      if (!user) {
        return { allowed: false, reason: 'User not found' };
      }

      // Calculate user's assessment limit (base + purchases)
      let assessmentLimit = USAGE_LIMITS.FREE.assessmentRequests; // 9 base
      
      // Check for story pack purchases this month
      const purchases = await UserPurchase.find({
        userId,
        purchaseType: 'story_pack',
        purchaseDate: { $gte: startOfMonth, $lte: endOfMonth },
        status: 'completed'
      }).lean();

      // Add 15 more assessments per story pack
      assessmentLimit += purchases.length * 15;

      // Count ALL assessment requests this month (uploads + any story assessments)
      const assessmentCount = await StorySession.countDocuments({
        childId: userId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        $or: [
          { isUploadedForAssessment: true }, // Uploaded stories
          { assessment: { $exists: true } }   // Stories that have been assessed
        ]
      });

      // Also count total assessment attempts from all stories
      const totalAttempts = await StorySession.aggregate([
        {
          $match: {
            childId: userId,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
            assessment: { $exists: true }
          }
        },
        {
          $group: {
            _id: null,
            totalAttempts: { $sum: { $ifNull: ['$assessmentAttempts', 1] } }
          }
        }
      ]);

      const usedAssessments = Math.max(
        assessmentCount,
        totalAttempts[0]?.totalAttempts || 0
      );

      const canUse = usedAssessments < assessmentLimit;

      return {
        allowed: canUse,
        reason: canUse ? undefined : `Assessment limit reached (${usedAssessments}/${assessmentLimit}). Upgrade to get 15 more assessments.`,
        upgradeRequired: !canUse,
        currentUsage: {
          assessmentRequests: usedAssessments,
          freestyleStories: 0, // Will be calculated separately
          competitionEntries: 0 // Will be calculated separately
        },
        limits: {
          assessmentRequests: assessmentLimit,
          freestyleStories: USAGE_LIMITS.FREE.freestyleStories + purchases.length * 5,
          competitionEntries: USAGE_LIMITS.FREE.competitionEntries // Always 3
        }
      };

    } catch (error) {
      console.error('❌ Error checking assessment usage:', error);
      return { 
        allowed: false, 
        reason: 'Failed to check usage limits' 
      };
    }
  }

  /**
   * Check if user can create freestyle stories
   */
  static async canCreateFreestyleStory(userId: string): Promise<UsageCheckResult> {
    try {
      await connectToDatabase();

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      // Calculate user's freestyle limit
      let freestyleLimit = USAGE_LIMITS.FREE.freestyleStories; // 3 base
      
      const purchases = await UserPurchase.find({
        userId,
        purchaseType: 'story_pack',
        purchaseDate: { $gte: startOfMonth, $lte: endOfMonth },
        status: 'completed'
      }).lean();

      freestyleLimit += purchases.length * 5; // +5 per pack

      // Count freestyle stories this month
      const freestyleCount = await StorySession.countDocuments({
        childId: userId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        storyType: 'freestyle',
        isUploadedForAssessment: { $ne: true }
      });

      const canUse = freestyleCount < freestyleLimit;

      return {
        allowed: canUse,
        reason: canUse ? undefined : `Freestyle story limit reached (${freestyleCount}/${freestyleLimit}). Upgrade to get 5 more stories.`,
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

      // Count competition entries this month
      const competitionCount = await StorySession.countDocuments({
        childId: userId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        competitionEntries: { $exists: true, $ne: [] }
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
   * Get comprehensive usage statistics for dashboard
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
        freestyleStories: USAGE_LIMITS.FREE.freestyleStories + purchases.length * 5,
        assessmentRequests: USAGE_LIMITS.FREE.assessmentRequests + purchases.length * 15,
        competitionEntries: USAGE_LIMITS.FREE.competitionEntries // Always 3
      };

      // Count actual usage
      const [freestyleCount, competitionCount] = await Promise.all([
        // Freestyle stories
        StorySession.countDocuments({
          childId: userId,
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          storyType: 'freestyle',
          isUploadedForAssessment: { $ne: true }
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
      // Return safe defaults
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
   * POOL SYSTEM: Record assessment request (any type - upload or any assessment)
   */
  static async recordAssessmentRequest(sessionId: string): Promise<boolean> {
    try {
      await connectToDatabase();

      // Just increment the assessment attempts counter
      await StorySession.findByIdAndUpdate(
        sessionId,
        { 
          $inc: { assessmentAttempts: 1 },
          lastAssessedAt: new Date()
        }
      );

      return true;
    } catch (error) {
      console.error('❌ Error recording assessment request:', error);
      return false;
    }
  }

  /**
   * Check if user can publish story (always free, 1 per month)
   */
  static async canPublishStory(userId: string): Promise<UsageCheckResult> {
    try {
      await connectToDatabase();

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

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
   * FIXED: Add missing incrementAssessmentRequest method
   */
  static async incrementAssessmentRequest(userId: string, storyId: string): Promise<void> {
    try {
      await connectToDatabase();
      await StorySession.findByIdAndUpdate(storyId, {
        $inc: { assessmentAttempts: 1 },
        lastAssessedAt: new Date()
      });
      console.log(`✅ Assessment request incremented for story ${storyId}`);
    } catch (error) {
      console.error('❌ Error incrementing assessment request:', error);
    }
  }
}