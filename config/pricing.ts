
// config/pricing.ts - CORRECTED FOR SIMPLIFIED SYSTEM
export interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: 'one_time' | 'recurring';
  benefits: string[];
  stripeProductId?: string;
  stripePriceId?: string;
  popular?: boolean;
}

export const PRICING_TIERS: Record<string, PricingTier> = {
  FREE: {
    id: 'free',
    name: 'Free Tier',
    description: 'Perfect for getting started with creative writing',
    price: 0,
    currency: 'USD',
    type: 'recurring',
    benefits: [
      '3 freestyle story creations per month',
      '9 AI assessment requests per month',
      '3 competition entries per month',
      '1 free publication per month',
      'Basic progress tracking',
    ],
  },

  STORY_PACK: {
    id: 'story_pack',
    name: 'Story Pack',
    description: 'Unlock more stories and assessments for the month',
    price: 15.0,
    currency: 'USD',
    type: 'one_time',
    benefits: [
      '+5 additional freestyle stories (8 total)',
      '+15 additional AI assessments (24 total)',
      'Competition entries stay at 3',
      'All free tier benefits included',
      'Priority AI assessment processing',
      'Advanced progress analytics',
    ],
    stripeProductId: process.env.STRIPE_STORY_PACK_PRODUCT_ID,
    stripePriceId: process.env.STRIPE_STORY_PACK_PRICE_ID,
    popular: true,
  },

  STORY_PUBLICATION: {
    id: 'story_publication',
    name: 'Story Publication',
    description: 'Share your story with the community (FREE)',
    price: 0.0,
    currency: 'USD',
    type: 'one_time',
    benefits: [
      'Publish story to community showcase',
      'Share with other young writers',
      'Get featured in monthly highlights',
      'Build your writing portfolio',
    ],
  },

  STORY_PURCHASE: {
    id: 'story_purchase',
    name: 'Physical Story Copy',
    description: 'Get a beautiful printed version of your story',
    price: 10.0,
    currency: 'USD',
    type: 'one_time',
    benefits: [
      'Professional printed anthology',
      'High-quality paper and binding',
      'Perfect keepsake or gift',
      'Ships within 2-3 weeks',
    ],
    stripeProductId: process.env.STRIPE_STORY_PURCHASE_PRODUCT_ID,
    stripePriceId: process.env.STRIPE_STORY_PURCHASE_PRICE_ID,
  },
};

// System limits and pricing
export const SYSTEM_LIMITS = {
  FREE_TIER: {
    freestyleStories: 3,
    assessmentRequests: 9, // SIMPLIFIED: Total pool, use however you want
    competitionEntries: 3,
    publications: 1,
  },
  STORY_PACK: {
    freestyleStories: 8, // 3 + 5
    assessmentRequests: 24, // 9 + 15
    competitionEntries: 3, // No upgrade
    publications: 1, // No upgrade
  },
};

export const FEATURE_FLAGS = {
  // REMOVED FEATURES
  perStoryAssessmentLimits: false, // No more per-story limits
  storyReassessment: false, // No more reassess button
  childStoryDeletion: false, // Children can't delete stories

  // ENABLED FEATURES
  poolBasedAssessments: true, // Use assessment pool however you want
  flaggedStoryPublishing: true, // Can publish flagged stories
  simplifiedInterface: true, // Fewer confusing buttons
};

export const USER_ACTIONS = {
  // ALLOWED ACTIONS FOR CHILDREN
  viewStory: true,
  publishStory: true, // For ALL completed stories
  purchaseStory: true, // For ALL completed stories
  uploadForAssessment: true, // Uses assessment pool
  createFreestyleStory: true,
  enterCompetition: true,

  // REMOVED ACTIONS FOR CHILDREN
  deleteStory: false, // Safety measure
  reassessStory: false, // Simplified - upload again instead

  // ADMIN ONLY ACTIONS
  adminDeleteStory: true,
  moderateContent: true,
  manageCompetitions: true,
};

export const PRICING_EXPLANATIONS = {
  assessmentSystem: {
    title: 'Simple Assessment Pool',
    description:
      'Use your 9 free assessments however you want - same story multiple times, or different stories. No confusing per-story limits!',
    examples: [
      'Upload 9 different stories for assessment',
      'Upload same story 9 times to see improvement',
      'Mix: 3 stories assessed twice each + 3 new stories',
    ],
  },
  storyPackValue: {
    title: '$15 Story Pack Benefits',
    breakdown: {
      freestyleStories: '5 more collaborative stories ($3 each)',
      assessments: '15 more AI assessments ($1 each)',
      total: 'Total value: $30 for just $15!',
    },
  },
  safetyFeatures: {
    title: 'Child Safety Measures',
    features: [
      'No delete buttons - prevents accidental loss',
      'No confusing reassess options',
      'Simple interface with clear actions',
      'Admin oversight for flagged content',
    ],
  },
};
