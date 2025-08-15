// ========================================
// config/limits.ts - SIMPLIFIED & CLEAN (as discussed)
// ========================================

export interface UsageLimits {
  freestyleStories: number; // Collaborative AI stories
  assessmentRequests: number; // SIMPLIFIED: Any assessment request (upload OR re-assess)
  competitionEntries: number; // Competition submissions
}

export const USAGE_LIMITS: Record<string, UsageLimits> = {
  FREE: {
    freestyleStories: 3, // Create 3 collaborative stories
    assessmentRequests: 9, // Get 9 assessments (upload OR re-assess)
    competitionEntries: 3, // Submit 3 stories to competition
  },
  STORY_PACK: {
    freestyleStories: 8, // 3 + 5 additional
    assessmentRequests: 24, // 9 + 15 additional
    competitionEntries: 3, // Unchanged
  },
};

export const COMPETITION_LIMITS = {
  MAX_ENTRIES_PER_CHILD: 3, // FIXED: 3 entries per month
  SUBMISSION_DAYS: 25,
  JUDGING_DAYS: 5,
  RESULTS_DAY: 31,
  MIN_WORD_COUNT: 350,
  MAX_WORD_COUNT: 2000,
};

export const STORY_PACK_BENEFITS = {
  storiesAdded: 5, // 3 → 8 total
  assessmentRequestsAdded: 15, // 9 → 24 total (RENAMED from assessmentsAdded)
  competitionEntriesAdded: 0, // Competition stays at 3
};

// Keep other constants for compatibility
export const STORY_PACK_PRICE = 15.0;
export const STORY_PUBLICATION_PRICE = 0.0; // FREE (1 per month)
export const STORY_PURCHASE_PRICE = 10.0; // Physical anthology

export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB for all file types
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
  ASSESSMENT_REQUEST: {
    windowMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxRequests: 24, // Max with story pack
  },
  STORY_PUBLICATION: {
    windowMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxRequests: 1, // Only 1 free publication per month
  },
  COMPETITION_SUBMISSION: {
    windowMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxRequests: 3, // 3 competition entries
  },
};

export const FREE_TIER_LIMITS = USAGE_LIMITS.FREE;

// Helper function for calculating user limits with purchases
export function calculateUserLimits(
  baseLimits: UsageLimits,
  purchases: Array<{
    type: string;
    storiesAdded: number;
    assessmentRequestsAdded: number;
    competitionEntriesAdded?: number;
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
      acc.freestyleStories += purchase.storiesAdded || 0;
      acc.assessmentRequests += purchase.assessmentRequestsAdded || 0;
      acc.competitionEntries += purchase.competitionEntriesAdded || 0;
      return acc;
    },
    {
      freestyleStories: 0,
      assessmentRequests: 0,
      competitionEntries: 0,
    }
  );

  return {
    freestyleStories: baseLimits.freestyleStories + additionalLimits.freestyleStories,
    assessmentRequests: baseLimits.assessmentRequests + additionalLimits.assessmentRequests,
    competitionEntries: baseLimits.competitionEntries + additionalLimits.competitionEntries,
  };
}

export function validateUsageWithinLimits(
  usage: UsageLimits,
  limits: UsageLimits
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  if (usage.freestyleStories > limits.freestyleStories) {
    violations.push(`Freestyle Stories: ${usage.freestyleStories}/${limits.freestyleStories}`);
  }
  if (usage.assessmentRequests > limits.assessmentRequests) {
    violations.push(`Assessment Requests: ${usage.assessmentRequests}/${limits.assessmentRequests}`);
  }
  if (usage.competitionEntries > limits.competitionEntries) {
    violations.push(
      `Competition entries: ${usage.competitionEntries}/${limits.competitionEntries}`
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