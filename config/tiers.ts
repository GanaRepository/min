// config/tiers.ts
export interface SubscriptionTier {
  id: string;
  name: string;
  storyLimit: number;
  price: number;
  aiCalls: number;
  assessmentType: 'ai';
  features: string[];
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  FREE: {
    id: 'free',
    name: 'Free',
    storyLimit: 10, // per month
    price: 0,
    aiCalls: 7,
    assessmentType: 'ai',
    features: [
      'Up to 5 stories per month',
      'Full AI collaboration (7 calls per story)',
      'AI assessment and feedback',
      'Export to PDF and Word',
      'Basic progress tracking',
      'Minimum 60 words per turn requirement',
    ],
  },
  BASIC: {
    id: 'basic',
    name: 'Basic',
    storyLimit: 30, // per month
    price: 19.99,
    aiCalls: 7,
    assessmentType: 'ai',
    features: [
      'Up to 30 stories per month',
      'Full AI collaboration (7 calls per story)',
      'AI assessment and feedback',
      'Mentor review and comments',
      'Export to PDF and Word',
      'Minimum 60 words per turn requirement',
    ],
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    storyLimit: 60, // per month
    price: 39.99,
    aiCalls: 7,
    assessmentType: 'ai',
    features: [
      'Up to 60 stories per month',
      'Full AI collaboration (7 calls per story)',
      'AI assessment and feedback',
      'Priority mentor review',
      'Export to PDF and Word',
      'Minimum 60 words per turn requirement',
    ],
  },
};

export const DEFAULT_TIER = SUBSCRIPTION_TIERS.FREE;
