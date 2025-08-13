// config/limits.ts - UPDATED FOR MINTOONS REQUIREMENTS
export interface UsageLimits {
  stories: number;
  assessments: number;
  competitionEntries: number;
  totalAssessmentAttempts: number;
}

export const USAGE_LIMITS: Record<string, UsageLimits> = {
  FREE: {
    stories: 3,
    assessments: 3,
    competitionEntries: 1, // UPDATED: Only 1 competition entry (best story)
    totalAssessmentAttempts: 9,
  },
  STORY_PACK: {
    stories: 8, // 3 + 5 additional
    assessments: 8, // 3 + 5 additional
    competitionEntries: 1, // UNCHANGED: Still only 1 competition entry
    totalAssessmentAttempts: 24, // 9 + 15 additional
  },
};

// REMOVED: MAX_ASSESSMENT_ATTEMPTS per story (now using total pool)
export const STORY_PACK_PRICE = 15.0;
export const STORY_PUBLICATION_PRICE = 0.0; // FREE (1 per month)
export const STORY_PURCHASE_PRICE = 10.0; // Physical anthology

export const COMPETITION_LIMITS = {
  MAX_ENTRIES_PER_CHILD: 1, // UPDATED: Only 1 entry per month (best story)
  SUBMISSION_DAYS: 25,
  JUDGING_DAYS: 5,
  RESULTS_DAY: 31,
  MIN_WORD_COUNT: 350, // UPDATED: Competition minimum
  MAX_WORD_COUNT: 2000,
};

export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // UPDATED: 10MB for all file types
  ALLOWED_EXTENSIONS: ['.txt', '.docx', '.pdf'],
  ALLOWED_MIME_TYPES: [
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
  ],
};

export const RATE_LIMITS = {
  STORY_CREATION: {
    windowMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxRequests: 8, // Max with story pack
  },
  ASSESSMENT_UPLOAD: {
    windowMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxRequests: 8, // Max with story pack
  },
  ASSESSMENT_ATTEMPT: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 1, // Prevent spam
  },
  STORY_PUBLICATION: {
    windowMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxRequests: 1, // Only 1 free publication per month
  },
  STORY_PURCHASE: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // Multiple purchases allowed
  },
  COMPETITION_SUBMISSION: {
    windowMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxRequests: 1, // UPDATED: Only 1 competition entry
  },
};

export const FREE_TIER_LIMITS = USAGE_LIMITS.FREE;

export const STORY_PACK_BENEFITS = {
  storiesAdded: 5, // 3 → 8 total
  assessmentsAdded: 5, // 3 → 8 total
  totalAssessmentAttemptsAdded: 15, // 9 → 24 total
  competitionEntriesAdded: 0, // Competition stays at 1
};

export function calculateUserLimits(
  baseLimits: UsageLimits,
  purchases: Array<{
    type: string;
    storiesAdded: number;
    assessmentsAdded: number;
    competitionEntriesAdded?: number;
    totalAssessmentAttemptsAdded?: number;
    purchaseDate: Date;
  }>,
  currentMonthStart: Date
): UsageLimits {
  // Filter purchases for current month
  const currentMonthPurchases = purchases.filter(
    (p) => p.purchaseDate >= currentMonthStart
  );

  // Calculate additional limits from purchases
  const additionalLimits = currentMonthPurchases.reduce(
    (acc, purchase) => {
      acc.stories += purchase.storiesAdded || 0;
      acc.assessments += purchase.assessmentsAdded || 0;
      acc.competitionEntries += purchase.competitionEntriesAdded || 0;
      acc.totalAssessmentAttempts += purchase.totalAssessmentAttemptsAdded || 0;
      return acc;
    },
    {
      stories: 0,
      assessments: 0,
      competitionEntries: 0,
      totalAssessmentAttempts: 0,
    }
  );

  return {
    stories: baseLimits.stories + additionalLimits.stories,
    assessments: baseLimits.assessments + additionalLimits.assessments,
    competitionEntries: baseLimits.competitionEntries + additionalLimits.competitionEntries,
    totalAssessmentAttempts: baseLimits.totalAssessmentAttempts + additionalLimits.totalAssessmentAttempts,
  };
}

export function validateUsageWithinLimits(
  usage: UsageLimits,
  limits: UsageLimits
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  if (usage.stories > limits.stories) {
    violations.push(`Stories: ${usage.stories}/${limits.stories}`);
  }
  if (usage.assessments > limits.assessments) {
    violations.push(`Assessments: ${usage.assessments}/${limits.assessments}`);
  }
  if (usage.competitionEntries > limits.competitionEntries) {
    violations.push(
      `Competition entries: ${usage.competitionEntries}/${limits.competitionEntries}`
    );
  }
  if (usage.totalAssessmentAttempts > limits.totalAssessmentAttempts) {
    violations.push(
      `Assessment attempts: ${usage.totalAssessmentAttempts}/${limits.totalAssessmentAttempts}`
    );
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

// Export getUserLimits for usage API
export function getUserLimits(tier: keyof typeof USAGE_LIMITS): UsageLimits {
  return USAGE_LIMITS[tier];
}

export const canPerformAction = async (userId: string, action: string) => {
  // Placeholder implementation
  return { allowed: true, reason: '', upgradeRequired: false };
};