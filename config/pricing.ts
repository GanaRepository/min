// config/pricing.ts - Stripe pricing configuration
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
      '3 story creations per month',
      '3 story uploads for AI assessment',
      '9 total assessment attempts',
      '3 competition entries per month',
      'Free competition participation',
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
      '+5 additional story creations',
      '+5 additional assessment uploads',
      '+15 total assessment attempts',
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
    description: 'Make your story public and competition-ready',
    price: 10.0,
    currency: 'USD',
    type: 'one_time',
    benefits: [
      'Public story showcase',
      'Competition eligibility',
      'Author profile creation',
      'Social sharing features',
      'Potential book inclusion',
      'Winner recognition display',
    ],
    stripeProductId: process.env.STRIPE_PUBLICATION_PRODUCT_ID,
    stripePriceId: process.env.STRIPE_PUBLICATION_PRICE_ID,
  },

  PHYSICAL_BOOK: {
    id: 'physical_book',
    name: 'Physical Books',
    description: "Custom printed books with your child's stories",
    price: 0, // Variable pricing
    currency: 'USD',
    type: 'one_time',
    benefits: [
      'Professional book printing',
      'Custom cover design',
      'Multiple story collections',
      'Bulk order discounts',
      'Worldwide shipping available',
      'Perfect keepsake gifts',
    ],
  },
};

// STRIPE CONFIGURATION
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,

  // Product and Price IDs (set these in your .env file)
  products: {
    storyPack: {
      productId: process.env.STRIPE_STORY_PACK_PRODUCT_ID!,
      priceId: process.env.STRIPE_STORY_PACK_PRICE_ID!,
    },
    storyPublication: {
      productId: process.env.STRIPE_PUBLICATION_PRODUCT_ID!,
      priceId: process.env.STRIPE_PUBLICATION_PRICE_ID!,
    },
  },

  // Checkout session configuration
  checkoutSession: {
    mode: 'payment' as const,
    paymentMethodTypes: ['card'],
    billingAddressCollection: 'auto' as const,
    successUrl: `${process.env.NEXTAUTH_URL}/children-dashboard?purchase=success`,
    cancelUrl: `${process.env.NEXTAUTH_URL}/pricing?purchase=cancelled`,
  },
};

// PRICE FORMATTING UTILITIES
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export function getPricingTier(tierId: string): PricingTier | null {
  return PRICING_TIERS[tierId] || null;
}

export function getAllPricingTiers(): PricingTier[] {
  return Object.values(PRICING_TIERS);
}

// PURCHASE VALIDATION
export function validatePurchaseRequest(
  userId: string,
  productType: 'story_pack' | 'story_publication',
  storyId?: string
): {
  valid: boolean;
  errors: string[];
  tier: PricingTier | null;
} {
  const errors: string[] = [];

  if (!userId) {
    errors.push('User ID is required');
  }

  let tier: PricingTier | null = null;

  if (productType === 'story_pack') {
    tier = PRICING_TIERS.STORY_PACK;
  } else if (productType === 'story_publication') {
    tier = PRICING_TIERS.STORY_PUBLICATION;
    if (!storyId) {
      errors.push('Story ID is required for publication purchases');
    }
  } else {
    errors.push('Invalid product type');
  }

  return {
    valid: errors.length === 0,
    errors,
    tier,
  };
}
