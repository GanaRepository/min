// ========================================
// lib/usage-manager.ts - SIMPLIFIED INTERFACE
// ========================================

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

export interface UserUsage {
  freestyleStories: number;
  assessmentRequests: number; // SIMPLIFIED: Total assessments used
  competitionEntries: number;
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
   * Get current month's usage for a user - SIMPLIFIED COUNTING
   */
  static async getCurrentUsage(userId: string): Promise<UserUsage> {
    await connectToDatabase();
    
    // Get current month start date
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all stories for current month
    const stories = await StorySession.find({
      childId: userId,
      createdAt: { $gte: monthStart }
    }).lean();

    // Count freestyle stories (collaborative AI stories)
    const freestyleStories = stories.filter(s => 
      !s.isUploadedForAssessment && 
      (!s.competitionEntries || s.competitionEntries.length === 0)
    ).length;

    // Count ALL assessment requests (uploads + re-assessments)
    const assessmentRequests = stories.reduce((sum, story) => {
      return sum + (story.assessmentAttempts || (story.assessment ? 1 : 0));
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
        assessmentRequestsAdded: p.metadata?.assessmentRequestsAdded || p.metadata?.assessmentsAdded || 0,
        competitionEntriesAdded: p.metadata?.competitionEntriesAdded || 0,
        purchaseDate: p.purchaseDate,
      })) || [],
      currentMonthStart
    );
  }

  /**
   * Check if user can create a new freestyle story
   */
  static async canCreateStory(userId: string): Promise<UsageCheckResult> {
    const [currentUsage, limits] = await Promise.all([
      this.getCurrentUsage(userId),
      this.getUserLimits(userId),
    ]);

    const allowed = currentUsage.freestyleStories < limits.freestyleStories;

    return {
      allowed,
      reason: allowed
        ? `Can create story (${currentUsage.freestyleStories}/${limits.freestyleStories})`
        : `Story limit reached (${currentUsage.freestyleStories}/${limits.freestyleStories}). Upgrade to Story Pack for 5 more stories!`,
      currentUsage,
      limits,
      upgradeRequired: !allowed,
    };
  }

  /**
   * Check if user can request assessment (upload OR re-assess) - SIMPLIFIED
   */
  static async canRequestAssessment(userId: string): Promise<UsageCheckResult> {
    const [currentUsage, limits] = await Promise.all([
      this.getCurrentUsage(userId),
      this.getUserLimits(userId),
    ]);

    const allowed = currentUsage.assessmentRequests < limits.assessmentRequests;

    return {
      allowed,
      reason: allowed
        ? `Can request assessment (${currentUsage.assessmentRequests}/${limits.assessmentRequests} used)`
        : `Assessment requests exhausted (${currentUsage.assessmentRequests}/${limits.assessmentRequests})`,
      currentUsage,
      limits,
      upgradeRequired: !allowed,
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

    const allowed = currentUsage.competitionEntries < limits.competitionEntries;

    return {
      allowed,
      reason: allowed
        ? `Can enter competition (${currentUsage.competitionEntries}/${limits.competitionEntries})`
        : `Competition entry limit reached (${currentUsage.competitionEntries}/${limits.competitionEntries}).`,
      currentUsage,
      limits,
      upgradeRequired: false, // Competition entries are not part of story pack
    };
  }

  /**
   * Increment usage counters after successful action
   */
  static async incrementStoryCreation(userId: string): Promise<void> {
    // No need to increment anything - we count directly from stories
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
    // No need to increment anything - we count directly from story competitionEntries
    console.log(`✅ Competition entry created for user ${userId}`);
  }

  /**
   * Reset monthly usage counters for all users (for cron job)
   * With simplified system, this is less critical since we count from actual data
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
   * Validate and enforce limits before any action
   */
  static async enforceLimit(
    userId: string,
    action:
      | 'create_story'
      | 'request_assessment'
      | 'enter_competition'
  ): Promise<{ allowed: boolean; message: string; needsUpgrade: boolean }> {
    let result: UsageCheckResult;

    switch (action) {
      case 'create_story':
        result = await this.canCreateStory(userId);
        break;
      case 'request_assessment':
        result = await this.canRequestAssessment(userId);
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