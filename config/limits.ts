
// config/limits.ts - FINAL SIMPLIFIED ASSESSMENT SYSTEM
export interface UsageLimits {
  freestyleStories: number; // Collaborative AI stories per month
  assessmentRequests: number; // SIMPLIFIED: Total assessment pool (upload + any assessments)
  competitionEntries: number; // Competition submissions per month
}

export const USAGE_LIMITS: Record<string, UsageLimits> = {
  FREE: {
    freestyleStories: 3, // Create 3 collaborative stories per month
    assessmentRequests: 9, // Get 9 total assessments (any combination)
    competitionEntries: 3, // Submit 3 stories to competition per month
  },
  STORY_PACK: {
    freestyleStories: 8, // 3 base + 5 additional = 8 total
    assessmentRequests: 24, // 9 base + 15 additional = 24 total
    competitionEntries: 3, // Unchanged - always 3 per month
  },
};

export const COMPETITION_LIMITS = {
  MAX_ENTRIES_PER_CHILD: 3, // 3 entries per month (no upgrades)
  SUBMISSION_DAYS: 25, // Days available for submissions
  JUDGING_DAYS: 5, // Days for judging phase
  RESULTS_DAY: 31, // Results announced on last day of month
  MIN_WORD_COUNT: 350, // Minimum words for competition entry
  MAX_WORD_COUNT: 2000, // Maximum words for competition entry
};

export const STORY_PACK_BENEFITS = {
  storiesAdded: 5, // +5 freestyle stories (3 → 8 total)
  assessmentRequestsAdded: 15, // +15 assessment requests (9 → 24 total)
  competitionEntriesAdded: 0, // Competition limit stays at 3 (no upgrades)
};

// Pricing constants
export const STORY_PACK_PRICE = 15.0; // $15 for story pack upgrade
export const STORY_PUBLICATION_PRICE = 0.0; // FREE publication (3 per month)
export const STORY_PURCHASE_PRICE = 10.0; // $10 for physical anthology purchase

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB maximum file size
  ALLOWED_EXTENSIONS: ['.txt', '.docx', '.pdf'], // Supported file types
  ALLOWED_MIME_TYPES: [
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
  ],
};

// Rate limiting configuration
export const RATE_LIMITS = {
  STORY_CREATION: {
    windowMs: 30 * 24 * 60 * 60 * 1000, // 30 days rolling window
    maxRequests: 8, // Max stories with story pack
  },
  ASSESSMENT_REQUEST: {
    windowMs: 30 * 24 * 60 * 60 * 1000, // 30 days rolling window
    maxRequests: 24, // Max assessments with story pack
  },
  STORY_PUBLICATION: {
    windowMs: 30 * 24 * 60 * 60 * 1000, // 30 days rolling window
    maxRequests: 3, // Allow 3 free publications per month
  },
  COMPETITION_SUBMISSION: {
    windowMs: 30 * 24 * 60 * 60 * 1000, // 30 days rolling window
    maxRequests: 3, // 3 competition entries per month
  },
};

// Legacy support
export const FREE_TIER_LIMITS = USAGE_LIMITS.FREE;

/**
 * Helper function for calculating user limits with purchases
 * SIMPLIFIED: No more complex per-story tracking
 */
export function calculateUserLimits(
  baseLimits: UsageLimits,
  purchases: Array<{
    type: string;
    storiesAdded: number;
    assessmentRequestsAdded: number;
    competitionEntriesAdded?: number;
  }>
): UsageLimits {
  const storyPackPurchases = purchases.filter((p) => p.type === 'story_pack');

  return {
    freestyleStories:
      baseLimits.freestyleStories +
      storyPackPurchases.reduce((sum, p) => sum + (p.storiesAdded || 0), 0),

    assessmentRequests:
      baseLimits.assessmentRequests +
      storyPackPurchases.reduce(
        (sum, p) => sum + (p.assessmentRequestsAdded || 0),
        0
      ),

    competitionEntries: baseLimits.competitionEntries, // Always stays the same
  };
}

/**
 * Assessment system explanation for documentation
 */
export const ASSESSMENT_SYSTEM_INFO = {
  description: 'Simplified pool-based assessment system',
  rules: [
    'Users get 9 free assessment requests per month',
    'Story Pack adds 15 more requests (24 total)',
    'Requests can be used for ANY combination of:',
    '  - Uploading new stories for assessment',
    '  - Kids can upload same story multiple times if they want',
    'No per-story limits - use your pool however you want',
    'Pool resets monthly',
    'NO REASSESS BUTTON - kids upload story again if they want new assessment',
  ],
  examples: [
    'Upload 9 different stories for assessment (uses all 9 free requests)',
    'Upload same story 9 times for assessment (uses all 9 free requests)',
    'Upload 5 stories, then upload 4 more stories (uses all 9 free requests)',
    'Any combination that adds up to your total limit',
  ],
};

/**
 * Competition assessment display rules
 */
export const COMPETITION_ASSESSMENT_RULES = {
  forNonWinners: {
    showTabs: ['content', 'comments'],
    hideTabs: ['overview', 'assessment'],
    reason:
      'Competition stories go through filter mechanism first, only winners get full AI assessment',
  },
  forWinners: {
    showTabs: ['overview', 'assessment', 'content', 'comments'],
    hideTabs: [],
    reason: 'Winners receive full AI assessment and can see all details',
  },
  winnerCriteria: [
    'Rank 1, 2, or 3 in competition',
    'isWinner flag set to true',
    'Competition entry has rank <= 3',
  ],
};

/**
 * System requirements summary
 */
export const SYSTEM_REQUIREMENTS = {
  assessments: {
    free: 9,
    paid: 24,
    description: 'Total assessment pool - use on any story, any combination',
  },
  freestyleStories: {
    free: 3,
    paid: 8,
    description: 'Collaborative story writing sessions with AI',
  },
  competitions: {
    free: 3,
    paid: 3,
    description: 'Competition entries per month (no upgrade available)',
  },
  publish: {
    free: 1,
    paid: 1,
    description: 'Free story publication to community (1 per month)',
  },
  purchase: {
    price: 10,
    description: 'Physical anthology purchase for any completed story',
  },
  buttons: {
    removed: ['delete', 'reassess'],
    kept: ['view', 'publish', 'purchase'],
    description: 'Simplified interface - no delete or reassess buttons',
  },
};
