// // config/pricing.ts - UPDATED FOR MINTOONS REQUIREMENTS
// export interface PricingTier {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   currency: string;
//   type: 'one_time' | 'recurring';
//   benefits: string[];
//   stripeProductId?: string;
//   stripePriceId?: string;
//   popular?: boolean;
// }

// export const PRICING_TIERS: Record<string, PricingTier> = {
//   FREE: {
//     id: 'free',
//     name: 'Free Tier',
//     description: 'Perfect for getting started with creative writing',
//     price: 0,
//     currency: 'USD',
//     type: 'recurring',
//     benefits: [
//       '3 story creations per month',
//       '3 story uploads for AI assessment',
//       '9 total assessment attempts',
//       '1 competition entry per month', // UPDATED: Only 1 competition entry
//       '1 free publication per month',
//       'Basic progress tracking',
//     ],
//   },

//   STORY_PACK: {
//     id: 'story_pack',
//     name: 'Story Pack',
//     description: 'Unlock more stories and assessments for the month',
//     price: 15.0,
//     currency: 'USD',
//     type: 'one_time',
//     benefits: [
//       '+5 additional story creations (8 total)',
//       '+5 additional assessment uploads (8 total)',
//       '+15 total assessment attempts (24 total)',
//       'All free tier benefits included',
//       'Competition entry stays at 1', // CLARIFICATION: No change to competition
//       'Priority AI assessment processing',
//       'Advanced progress analytics',
//     ],
//     stripeProductId: process.env.STRIPE_STORY_PACK_PRODUCT_ID,
//     stripePriceId: process.env.STRIPE_STORY_PACK_PRICE_ID,
//     popular: true,
//   },

//   STORY_PUBLICATION: {
//     id: 'story_publication',
//     name: 'Story Publication',
//     description: 'Share your story with the community (FREE)',
//     price: 0.0, // UPDATED: Publication is FREE
//     currency: 'USD',
//     type: 'one_time',
//     benefits: [
//       'Public story showcase',
//       'Community comments enabled',
//       'Visible to other children, admin, mentors',
//       '1 free publication per month',
//       'Social sharing features',
//       'Author profile creation',
//     ],
//   },

//   STORY_PURCHASE: {
//     id: 'story_purchase',
//     name: 'Physical Anthology Purchase',
//     description: 'Reserve spot in physical book anthology',
//     price: 10.0, // UPDATED: $10 for physical anthology
//     currency: 'USD',
//     type: 'one_time',
//     benefits: [
//       'Physical book anthology inclusion',
//       'Premium story showcase',
//       'Professional book printing',
//       'Custom book pricing available',
//       'Contact admin for book details',
//       'Perfect keepsake gift',
//     ],
//     stripeProductId: process.env.STRIPE_PURCHASE_PRODUCT_ID,
//     stripePriceId: process.env.STRIPE_PURCHASE_PRICE_ID,
//   },

//   PHYSICAL_BOOK: {
//     id: 'physical_book',
//     name: 'Custom Physical Books',
//     description: "Custom printed books with your child's stories",
//     price: 0, // Variable pricing - contact admin
//     currency: 'USD',
//     type: 'one_time',
//     benefits: [
//       'Professional book printing',
//       'Custom cover design',
//       'Multiple story collections',
//       'Bulk order discounts',
//       'Worldwide shipping available',
//       'Contact admin via contact form for pricing',
//     ],
//   },
// };

// // STRIPE CONFIGURATION
// export const STRIPE_CONFIG = {
//   publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
//   secretKey: process.env.STRIPE_SECRET_KEY!,
//   webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,

//   // Product and Price IDs (set these in your .env file)
//   products: {
//     storyPack: {
//       productId: process.env.STRIPE_STORY_PACK_PRODUCT_ID!,
//       priceId: process.env.STRIPE_STORY_PACK_PRICE_ID!,
//     },
//     storyPurchase: { // UPDATED: For physical anthology
//       productId: process.env.STRIPE_PURCHASE_PRODUCT_ID!,
//       priceId: process.env.STRIPE_PURCHASE_PRICE_ID!,
//     },
//   },

//   // Checkout session configuration
//   checkoutSession: {
//     mode: 'payment' as const,
//     paymentMethodTypes: ['card'],
//     billingAddressCollection: 'auto' as const,
//     successUrl: `${process.env.NEXTAUTH_URL}/children-dashboard?purchase=success`,
//     cancelUrl: `${process.env.NEXTAUTH_URL}/pricing?purchase=cancelled`,
//   },
// };

// // PRICE FORMATTING UTILITIES
// export function formatPrice(price: number, currency: string = 'USD'): string {
//   if (price === 0) {
//     return 'FREE';
//   }
  
//   return new Intl.NumberFormat('en-US', {
//     style: 'currency',
//     currency: currency,
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 2,
//   }).format(price);
// }

// export function getPricingTier(tierId: string): PricingTier | null {
//   return PRICING_TIERS[tierId] || null;
// }

// export function getAllPricingTiers(): PricingTier[] {
//   return Object.values(PRICING_TIERS);
// }

// // PURCHASE VALIDATION
// export function validatePurchaseRequest(
//   userId: string,
//   productType: 'story_pack' | 'story_purchase',
//   storyId?: string
// ): {
//   valid: boolean;
//   errors: string[];
//   tier: PricingTier | null;
// } {
//   const errors: string[] = [];

//   if (!userId) {
//     errors.push('User ID is required');
//   }

//   let tier: PricingTier | null = null;

//   if (productType === 'story_pack') {
//     tier = PRICING_TIERS.STORY_PACK;
//   } else if (productType === 'story_purchase') {
//     tier = PRICING_TIERS.STORY_PURCHASE;
//     if (!storyId) {
//       errors.push('Story ID is required for physical anthology purchases');
//     }
//   } else {
//     errors.push('Invalid product type');
//   }

//   return {
//     valid: errors.length === 0,
//     errors,
//     tier,
//   };
// }

// // MINTOONS SPECIFIC UTILITIES
// export function getStoryPackBenefits(): {
//   storiesAdded: number;
//   assessmentsAdded: number;
//   totalAssessmentAttemptsAdded: number;
//   competitionEntriesAdded: number;
// } {
//   return {
//     storiesAdded: 5,           // 3 → 8 total
//     assessmentsAdded: 5,       // 3 → 8 total  
//     totalAssessmentAttemptsAdded: 15, // 9 → 24 total
//     competitionEntriesAdded: 0 // Competition stays at 1
//   };
// }

// // File upload limits
// export const FILE_UPLOAD_LIMITS = {
//   MAX_SIZE: 10 * 1024 * 1024, // 10MB for all file types
//   ALLOWED_TYPES: ['.txt', '.pdf', '.docx'],
//   ALLOWED_MIME_TYPES: [
//     'text/plain',
//     'application/pdf', 
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
//   ]
// };

// // Competition limits
// export const COMPETITION_CONFIG = {
//   MAX_ENTRIES: 1, // Only 1 entry per month (best story)
//   MIN_WORDS: 350,
//   MAX_WORDS: 2000,
//   SUBMISSION_DEADLINE: 25, // Day of month
//   JUDGING_PERIOD: 5, // Days 26-30
//   RESULTS_DAY: 31
// };


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
    title: "Simple Assessment Pool",
    description: "Use your 9 free assessments however you want - same story multiple times, or different stories. No confusing per-story limits!",
    examples: [
      "Upload 9 different stories for assessment",
      "Upload same story 9 times to see improvement",
      "Mix: 3 stories assessed twice each + 3 new stories",
    ]
  },
  storyPackValue: {
    title: "$15 Story Pack Benefits",
    breakdown: {
      freestyleStories: "5 more collaborative stories ($3 each)",
      assessments: "15 more AI assessments ($1 each)", 
      total: "Total value: $30 for just $15!"
    }
  },
  safetyFeatures: {
    title: "Child Safety Measures",
    features: [
      "No delete buttons - prevents accidental loss",
      "No confusing reassess options", 
      "Simple interface with clear actions",
      "Admin oversight for flagged content"
    ]
  }
};