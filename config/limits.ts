// config/limits.ts - Add these missing exports to your existing file
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
    competitionEntries: 3,
    totalAssessmentAttempts: 9,
  },
  STORY_PACK: {
    stories: 8,
    assessments: 8,
    competitionEntries: 3,
    totalAssessmentAttempts: 24,
  },
};

export const MAX_ASSESSMENT_ATTEMPTS = 3;
export const STORY_PACK_PRICE = 15.00;
export const STORY_PUBLICATION_PRICE = 10.00;

export const COMPETITION_LIMITS = {
  MAX_ENTRIES_PER_CHILD: 3,
  SUBMISSION_DAYS: 25,
  JUDGING_DAYS: 5,
  RESULTS_DAY: 31,
  MIN_WORD_COUNT: 100,
  MAX_WORD_COUNT: 2000,
};

export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 1024 * 1024,
  ALLOWED_EXTENSIONS: ['.txt', '.docx', '.pdf'],
  ALLOWED_MIME_TYPES: [
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf'
  ],
};

export const RATE_LIMITS = {
  STORY_CREATION: {
    windowMs: 30 * 24 * 60 * 60 * 1000,
    maxRequests: 3,
  },
  ASSESSMENT_UPLOAD: {
    windowMs: 30 * 24 * 60 * 60 * 1000,
    maxRequests: 3,
  },
  ASSESSMENT_ATTEMPT: {
    windowMs: 5 * 60 * 1000,
    maxRequests: 1,
  },
  STORY_PUBLICATION: {
    windowMs: 60 * 1000,
    maxRequests: 1,
  },
  COMPETITION_SUBMISSION: {
    windowMs: 10 * 60 * 1000,
    maxRequests: 1,
  },
};

// ADD THESE MISSING EXPORTS THAT YOUR usage-manager.ts NEEDS:
export const FREE_TIER_LIMITS = USAGE_LIMITS.FREE;

export const STORY_PACK_BENEFITS = {
  storiesAdded: 5,
  assessmentsAdded: 5,
  attemptsAdded: 15,
};

export function calculateUserLimits(
  baseLimits: UsageLimits,
  purchases: Array<{
    type: string;
    storiesAdded: number;
    assessmentsAdded: number;
    attemptsAdded: number;
    purchaseDate: Date;
  }>,
  currentMonthStart: Date
): UsageLimits {
  const limits = { ...baseLimits };
  
  const currentMonthPurchases = purchases.filter(
    (p) => p.type === 'story_pack' && p.purchaseDate >= currentMonthStart
  );
  
  currentMonthPurchases.forEach((purchase) => {
    limits.stories += purchase.storiesAdded;
    limits.assessments += purchase.assessmentsAdded;
    limits.totalAssessmentAttempts += purchase.attemptsAdded;
  });
  
  return limits;
}

export function validateUsageWithinLimits(
  currentUsage: { stories: number; assessments: number; attempts: number; competition: number },
  limits: UsageLimits
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (currentUsage.stories >= limits.stories) {
    errors.push(`Story creation limit reached (${limits.stories} max)`);
  }
  
  if (currentUsage.assessments >= limits.assessments) {
    errors.push(`Assessment upload limit reached (${limits.assessments} max)`);
  }
  
  if (currentUsage.attempts >= limits.totalAssessmentAttempts) {
    errors.push(`Assessment attempt limit reached (${limits.totalAssessmentAttempts} max)`);
  }
  
  if (currentUsage.competition >= limits.competitionEntries) {
    errors.push(`Competition entry limit reached (${limits.competitionEntries} max)`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function getUserLimits(user: any): UsageLimits {
  const baseLimits = { ...USAGE_LIMITS.FREE };
  
  if (user.purchaseHistory && user.purchaseHistory.length > 0) {
    const thisMonth = new Date();
    const currentMonthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
    
    const storyPacksPurchased = user.purchaseHistory.filter((purchase: any) => 
      purchase.type === 'story_pack' && 
      new Date(purchase.purchaseDate) >= currentMonthStart
    ).length;
    
    if (storyPacksPurchased > 0) {
      baseLimits.stories += storyPacksPurchased * 5;
      baseLimits.assessments += storyPacksPurchased * 5;
      baseLimits.totalAssessmentAttempts += storyPacksPurchased * 15;
    }
  }
  
  return baseLimits;
}

export function canPerformAction(
  user: any, 
  action: 'story-create' | 'story-upload' | 'competition-submit'
): { allowed: boolean; used: number; limit: number; remaining: number } {
  const limits = getUserLimits(user);
  
  let used = 0;
  let limit = 0;
  
  switch (action) {
    case 'story-create':
      used = user.storiesCreatedThisMonth || 0;
      limit = limits.stories;
      break;
      
    case 'story-upload':
      used = user.assessmentUploadsThisMonth || 0;
      limit = limits.assessments;
      break;
      
    case 'competition-submit':
      used = user.competitionEntriesThisMonth || 0;
      limit = limits.competitionEntries;
      break;
  }
  
  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used)
  };
}

export const PRICING = {
  STORY_PACK: {
    name: 'Story Pack',
    price: STORY_PACK_PRICE,
    currency: 'USD',
    benefits: {
      stories: 5,
      assessments: 5,
      attempts: 15,
    },
    description: '5 additional story creations + 5 AI assessments',
    stripeProductId: process.env.STRIPE_STORY_PACK_PRODUCT_ID,
    stripePriceId: process.env.STRIPE_STORY_PACK_PRICE_ID,
  },
  
  STORY_PUBLICATION: {
    name: 'Story Publication',
    price: STORY_PUBLICATION_PRICE,
    currency: 'USD',
    benefits: {
      public: true,
      competition: true,
      sharing: true,
    },
    description: 'Make your story public and competition eligible',
    stripeProductId: process.env.STRIPE_PUBLICATION_PRODUCT_ID,
    stripePriceId: process.env.STRIPE_PUBLICATION_PRICE_ID,
  },
};

export function validateStoryLength(content: string, isCompetition = false): {
  valid: boolean;
  wordCount: number;
  message?: string;
} {
  const words = content.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  if (isCompetition) {
    if (wordCount < COMPETITION_LIMITS.MIN_WORD_COUNT) {
      return {
        valid: false,
        wordCount,
        message: `Competition entries must be at least ${COMPETITION_LIMITS.MIN_WORD_COUNT} words. Current: ${wordCount} words.`
      };
    }
    
    if (wordCount > COMPETITION_LIMITS.MAX_WORD_COUNT) {
      return {
        valid: false,
        wordCount,
        message: `Competition entries must not exceed ${COMPETITION_LIMITS.MAX_WORD_COUNT} words. Current: ${wordCount} words.`
      };
    }
  }
  
  return { valid: true, wordCount };
}

export function validateFileUpload(file: File): {
  valid: boolean;
  message?: string;
} {
  if (file.size > UPLOAD_LIMITS.MAX_FILE_SIZE) {
    return {
      valid: false,
      message: `File size must not exceed ${UPLOAD_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }
  
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!UPLOAD_LIMITS.ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      message: `File type not allowed. Supported: ${UPLOAD_LIMITS.ALLOWED_EXTENSIONS.join(', ')}`
    };
  }
  
  if (!UPLOAD_LIMITS.ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      message: 'Invalid file type detected'
    };
  }
  
  return { valid: true };
}