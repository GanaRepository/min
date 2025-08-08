// lib/usage-manager.ts - Central usage tracking and enforcement
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';
import { FREE_TIER_LIMITS, STORY_PACK_BENEFITS, calculateUserLimits, validateUsageWithinLimits } from '@/config/limits';
import type { UsageLimits } from '@/config/limits';
import type { IUser } from '@/models/User';

export interface UserUsage {
  stories: number;
  assessments: number;
  attempts: number;
  competition: number;
  totalAssessmentAttempts: number;
}

export interface UsageCheckResult {
  allowed: boolean;
  reason?: string;
  currentUsage: UserUsage;
  limits: UsageLimits;
  upgradeRequired?: boolean;
}

export class UsageManager {
  /**
   * Get current month's usage for a user
   */
  static async getCurrentUsage(userId: string): Promise<UserUsage> {
    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    // Get current month start date
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    // Get assessment attempts for current month
    const assessmentStories = await StorySession.find({
      childId: userId,
      isUploadedForAssessment: true,
      createdAt: { $gte: currentMonthStart },
    }).select('assessmentAttempts');
    const totalAssessmentAttempts = assessmentStories.reduce(
      (sum, story) => sum + (story.assessmentAttempts || 0),
      0
    );
    return {
      stories: user.storiesCreatedThisMonth,
      assessments: user.assessmentUploadsThisMonth,
      attempts: totalAssessmentAttempts, // keep for backward compatibility
      competition: user.competitionEntriesThisMonth,
      totalAssessmentAttempts: totalAssessmentAttempts,
    };
  }
  
  /**
   * Get user's current limits (including purchases)
   */
  static async getUserLimits(userId: string): Promise<UsageLimits> {
    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    // Get current month start
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    // Calculate limits including this month's purchases
    return calculateUserLimits(
      FREE_TIER_LIMITS,
      user.purchaseHistory.map((p: any) => ({
        type: p.type,
        storiesAdded: p.metadata?.storiesAdded || 0,
        assessmentsAdded: p.metadata?.assessmentsAdded || 0,
        attemptsAdded: p.metadata?.attemptsAdded || 0,
        competitionEntriesAdded: p.metadata?.competitionEntriesAdded || 0,
        totalAssessmentAttemptsAdded: p.metadata?.totalAssessmentAttemptsAdded || 0,
        purchaseDate: p.purchaseDate,
      })),
      currentMonthStart
    );
  }
  
  /**
   * Check if user can create a new story
   */
  static async canCreateStory(userId: string): Promise<UsageCheckResult> {
    const [currentUsage, limits] = await Promise.all([
      this.getCurrentUsage(userId),
      this.getUserLimits(userId),
    ]);
    
    const allowed = currentUsage.stories < limits.stories;
    
    return {
      allowed,
      reason: allowed ? undefined : `Monthly story limit reached (${limits.stories} max)`,
      currentUsage,
      limits,
      upgradeRequired: !allowed,
    };
  }
  
  /**
   * Check if user can upload story for assessment
   */
  static async canUploadAssessment(userId: string): Promise<UsageCheckResult> {
    const [currentUsage, limits] = await Promise.all([
      this.getCurrentUsage(userId),
      this.getUserLimits(userId),
    ]);
    
    const allowed = currentUsage.assessments < limits.assessments;
    
    return {
      allowed,
      reason: allowed ? undefined : `Monthly assessment upload limit reached (${limits.assessments} max)`,
      currentUsage,
      limits,
      upgradeRequired: !allowed,
    };
  }
  
  /**
   * Check if user can attempt assessment for specific story
   */
  static async canAttemptAssessment(userId: string, storyId: string): Promise<UsageCheckResult> {
    const [currentUsage, limits] = await Promise.all([
      this.getCurrentUsage(userId),
      this.getUserLimits(userId),
    ]);
    // Check total attempts limit
    const totalAttemptsAllowed = currentUsage.totalAssessmentAttempts < limits.totalAssessmentAttempts;
    // Check per-story limit (3 attempts max per story)
    const story = await StorySession.findById(storyId);
    const storyAttemptsAllowed = story ? (story.assessmentAttempts || 0) < 3 : false;
    const allowed = totalAttemptsAllowed && storyAttemptsAllowed;
    let reason: string | undefined;
    if (!totalAttemptsAllowed) {
      reason = `Monthly assessment attempt limit reached (${limits.totalAssessmentAttempts} max)`;
    } else if (!storyAttemptsAllowed) {
      reason = `Story assessment limit reached (3 attempts max per story)`;
    }
    return {
      allowed,
      reason,
      currentUsage,
      limits,
      upgradeRequired: !totalAttemptsAllowed,
    };
  }
  
  /**
   * Check if user can enter competition
   */
  static async canEnterCompetition(userId: string): Promise<UsageCheckResult> {
    const [currentUsage, limits] = await Promise.all([
      this.getCurrentUsage(userId),
      this.getUserLimits(userId),
    ]);
    const allowed = currentUsage.competition < limits.competitionEntries;
    return {
      allowed,
      reason: allowed ? undefined : `Monthly competition entry limit reached (${limits.competitionEntries} max)`,
      currentUsage,
      limits,
      upgradeRequired: false, // Competition entries don't require upgrades
    };
  }
  
  /**
   * Increment story creation counter
   */
  static async incrementStoryCreation(userId: string): Promise<void> {
    await connectToDatabase();
    
    await User.findByIdAndUpdate(userId, {
      $inc: {
        storiesCreatedThisMonth: 1,
        totalStoriesCreated: 1,
      },
      $set: {
        lastActiveDate: new Date(),
      },
    });
  }
  
  /**
   * Increment assessment upload counter
   */
  static async incrementAssessmentUpload(userId: string): Promise<void> {
    await connectToDatabase();
    
    await User.findByIdAndUpdate(userId, {
      $inc: {
        assessmentUploadsThisMonth: 1,
      },
      $set: {
        lastActiveDate: new Date(),
      },
    });
  }
  
  /**
   * Increment assessment attempt for specific story
   */
  static async incrementAssessmentAttempt(userId: string, storyId: string): Promise<void> {
    await connectToDatabase();
    
    // Update story's attempt counter
    await StorySession.findByIdAndUpdate(storyId, {
      $inc: { assessmentAttempts: 1 },
    });
    
    // Update user's last active date
    await User.findByIdAndUpdate(userId, {
      $set: { lastActiveDate: new Date() },
    });
  }
  
  /**
   * Increment competition entry counter
   */
  static async incrementCompetitionEntry(userId: string): Promise<void> {
    await connectToDatabase();
    
    await User.findByIdAndUpdate(userId, {
      $inc: { competitionEntriesThisMonth: 1 },
      $set: { lastActiveDate: new Date() },
    });
  }
  
  /**
   * Add story pack benefits to user (called from Stripe webhook)
   */
  static async addStoryPack(userId: string, purchaseId: string): Promise<void> {
    await connectToDatabase();
    
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Add story pack benefits to current month
    await User.findByIdAndUpdate(userId, {
      $inc: {
        storiesCreatedThisMonth: STORY_PACK_BENEFITS.storiesAdded,
        assessmentUploadsThisMonth: STORY_PACK_BENEFITS.assessmentsAdded,
      },
      $push: {
        purchaseHistory: {
          type: 'story_pack',
          amount: 15.00,
          stripePaymentId: purchaseId,
          purchaseDate: new Date(),
          itemsAdded: STORY_PACK_BENEFITS.storiesAdded,
          metadata: {
            storiesAdded: STORY_PACK_BENEFITS.storiesAdded,
            assessmentsAdded: STORY_PACK_BENEFITS.assessmentsAdded,
          },
        },
      },
    });
  }
  
  /**
   * Monthly reset for all users (called by cron job)
   */
  static async resetMonthlyUsage(): Promise<{ usersReset: number; errors: string[] }> {
    await connectToDatabase();
    
    const errors: string[] = [];
    let usersReset = 0;
    
    try {
      // Reset all users' monthly counters
      const result = await User.updateMany(
        { role: 'child', isActive: true },
        {
          $set: {
            storiesCreatedThisMonth: 0,
            assessmentUploadsThisMonth: 0,
            competitionEntriesThisMonth: 0,
            lastMonthlyReset: new Date(),
          },
        }
      );
      
      usersReset = result.modifiedCount || 0;
      
      // Reset assessment attempts for all stories
      await StorySession.updateMany(
        { isUploadedForAssessment: true },
        { $set: { assessmentAttempts: 0 } }
      );
      
      console.log(`✅ Monthly reset completed: ${usersReset} users reset`);
      
    } catch (error) {
      const errorMsg = `Monthly reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      console.error('❌ Monthly reset error:', error);
    }
    
    return { usersReset, errors };
  }
  
  /**
   * Get detailed usage report for admin dashboard
   */
  static async getUsageReport(startDate: Date, endDate: Date) {
    await connectToDatabase();
    
    const [users, stories, assessments, purchases] = await Promise.all([
      // Active users count
      User.countDocuments({
        role: 'child',
        isActive: true,
        lastActiveDate: { $gte: startDate, $lte: endDate },
      }),
      
      // Stories created in period
      StorySession.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
      }),
      
      // Assessment stories in period
      StorySession.countDocuments({
        isUploadedForAssessment: true,
        createdAt: { $gte: startDate, $lte: endDate },
      }),
      
      // Purchase data
      User.aggregate([
        { $unwind: '$purchaseHistory' },
        {
          $match: {
            'purchaseHistory.purchaseDate': { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: '$purchaseHistory.type',
            count: { $sum: 1 },
            revenue: { $sum: '$purchaseHistory.amount' },
          },
        },
      ]),
    ]);
    
    const revenue = purchases.reduce(
      (acc, curr) => {
        acc.total += curr.revenue;
        if (curr._id === 'story_pack') {
          acc.storyPacks = curr.revenue;
        } else if (curr._id === 'story_publication') {
          acc.publications = curr.revenue;
        }
        return acc;
      },
      { total: 0, storyPacks: 0, publications: 0 }
    );
    
    return {
      period: { startDate, endDate },
      activeUsers: users,
      storiesCreated: stories,
      assessmentStories: assessments,
      revenue,
      purchases: purchases.reduce((acc, curr) => acc + curr.count, 0),
    };
  }
  
  /**
   * Validate and enforce limits before any action
   */
  static async enforceLimit(
    userId: string,
    action: 'create_story' | 'upload_assessment' | 'attempt_assessment' | 'enter_competition',
    storyId?: string
  ): Promise<{ allowed: boolean; message: string; needsUpgrade: boolean }> {
    let result: UsageCheckResult;
    
    switch (action) {
      case 'create_story':
        result = await this.canCreateStory(userId);
        break;
      case 'upload_assessment':
        result = await this.canUploadAssessment(userId);
        break;
      case 'attempt_assessment':
        if (!storyId) {
          return { allowed: false, message: 'Story ID required for assessment', needsUpgrade: false };
        }
        result = await this.canAttemptAssessment(userId, storyId);
        break;
      case 'enter_competition':
        result = await this.canEnterCompetition(userId);
        break;
      default:
        return { allowed: false, message: 'Invalid action', needsUpgrade: false };
    }
    
    return {
      allowed: result.allowed,
      message: result.reason || 'Action allowed',
      needsUpgrade: result.upgradeRequired || false,
    };
  }
}