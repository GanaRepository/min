// lib/usage-manager.ts - UPDATED FOR MINTOONS REQUIREMENTS
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';
import {
  FREE_TIER_LIMITS,
  STORY_PACK_BENEFITS,
  calculateUserLimits,
  validateUsageWithinLimits,
} from '@/config/limits';
import type { UsageLimits } from '@/config/limits';
import type { IUser } from '@/models/User';

export interface UserUsage {
  stories: number;
  assessments: number;
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

    // Get assessment attempts for current month (SIMPLIFIED - NO PER-STORY LIMITS)
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
      stories: user.storiesCreatedThisMonth || 0,
      assessments: user.assessmentUploadsThisMonth || 0,
      competition: user.competitionEntriesThisMonth || 0,
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
      user.purchaseHistory?.map((p: any) => ({
        type: p.type,
        storiesAdded: p.metadata?.storiesAdded || 0,
        assessmentsAdded: p.metadata?.assessmentsAdded || 0,
        competitionEntriesAdded: p.metadata?.competitionEntriesAdded || 0,
        totalAssessmentAttemptsAdded: p.metadata?.totalAssessmentAttemptsAdded || 0,
        purchaseDate: p.purchaseDate,
      })) || [],
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
      reason: allowed
        ? `Can create story (${currentUsage.stories}/${limits.stories})`
        : `Story limit reached (${currentUsage.stories}/${limits.stories}). Upgrade to Story Pack for 5 more stories!`,
      currentUsage,
      limits,
      upgradeRequired: !allowed,
    };
  }

  /**
   * Check if user can upload a story for assessment
   */
  static async canUploadAssessment(userId: string): Promise<UsageCheckResult> {
    const [currentUsage, limits] = await Promise.all([
      this.getCurrentUsage(userId),
      this.getUserLimits(userId),
    ]);

    const allowed = currentUsage.assessments < limits.assessments;

    return {
      allowed,
      reason: allowed
        ? `Can upload assessment (${currentUsage.assessments}/${limits.assessments})`
        : `Assessment upload limit reached (${currentUsage.assessments}/${limits.assessments}). Upgrade to Story Pack for 5 more assessments!`,
      currentUsage,
      limits,
      upgradeRequired: !allowed,
    };
  }

  /**
   * Check if user can attempt assessment (SIMPLIFIED - NO PER-STORY LIMITS)
   */
  static async canAttemptAssessment(userId: string): Promise<UsageCheckResult> {
    const [currentUsage, limits] = await Promise.all([
      this.getCurrentUsage(userId),
      this.getUserLimits(userId),
    ]);

    // ONLY check total monthly attempts (no per-story limit)
    const allowed = currentUsage.totalAssessmentAttempts < limits.totalAssessmentAttempts;

    return {
      allowed,
      reason: allowed
        ? `Can attempt assessment (${currentUsage.totalAssessmentAttempts}/${limits.totalAssessmentAttempts} used)`
        : `Assessment attempts limit reached (${currentUsage.totalAssessmentAttempts}/${limits.totalAssessmentAttempts}). Upgrade to Story Pack for 15 more attempts!`,
      currentUsage,
      limits,
      upgradeRequired: !allowed,
    };
  }

  /**
   * Check if user can enter competition (UPDATED: Only 1 entry)
   */
  static async canEnterCompetition(userId: string): Promise<UsageCheckResult> {
    const [currentUsage, limits] = await Promise.all([
      this.getCurrentUsage(userId),
      this.getUserLimits(userId),
    ]);

    const allowed = currentUsage.competition < limits.competitionEntries;

    return {
      allowed,
      reason: allowed
        ? `Can enter competition (${currentUsage.competition}/${limits.competitionEntries})`
        : `Competition entry limit reached (${currentUsage.competition}/${limits.competitionEntries}). You can submit 1 best story per month.`,
      currentUsage,
      limits,
      upgradeRequired: false, // Competition entries are not part of story pack
    };
  }

  /**
   * Increment usage counters after successful action
   */
  static async incrementStoryCreation(userId: string): Promise<void> {
    await connectToDatabase();
    await User.findByIdAndUpdate(userId, {
      $inc: { storiesCreatedThisMonth: 1 },
    });
  }

  static async incrementAssessmentUpload(userId: string): Promise<void> {
    await connectToDatabase();
    await User.findByIdAndUpdate(userId, {
      $inc: { assessmentUploadsThisMonth: 1 },
    });
  }

  static async incrementAssessmentAttempt(
    userId: string,
    storyId: string
  ): Promise<void> {
    await connectToDatabase();
    await StorySession.findByIdAndUpdate(storyId, {
      $inc: { assessmentAttempts: 1 },
    });
  }

  static async incrementCompetitionEntry(userId: string): Promise<void> {
    await connectToDatabase();
    await User.findByIdAndUpdate(userId, {
      $inc: { competitionEntriesThisMonth: 1 },
    });
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

      usersReset = result.modifiedCount;
      console.log(`✅ Monthly usage reset for ${usersReset} users`);
    } catch (error) {
      const errorMsg = `Monthly reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      console.error('❌ Monthly reset error:', error);
    }

    return { usersReset, errors };
  }

  /**
   * Validate and enforce limits before any action (SIMPLIFIED)
   */
  static async enforceLimit(
    userId: string,
    action:
      | 'create_story'
      | 'upload_assessment'
      | 'attempt_assessment'
      | 'enter_competition'
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
        result = await this.canAttemptAssessment(userId);
        break;
      case 'enter_competition':
        result = await this.canEnterCompetition(userId);
        break;
      default:
        return {
          allowed: false,
          message: 'Invalid action',
          needsUpgrade: false,
        };
    }

    return {
      allowed: result.allowed,
      message: result.reason || 'Action allowed',
      needsUpgrade: result.upgradeRequired || false,
    };
  }
}