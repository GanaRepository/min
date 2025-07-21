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
    storyLimit: 50,
    price: 0,
    aiCalls: 7,
    assessmentType: 'ai',
    features: [
      'Up to 50 stories per month',
      'Full AI collaboration (7 calls per story)',
      'AI assessment and feedback',
      'Export to PDF and Word',
      'Basic progress tracking'
    ]
  },
  BASIC: {
    id: 'basic',
    name: 'Basic',
    storyLimit: 100,
    price: 9.99,
    aiCalls: 7,
    assessmentType: 'ai',
    features: [
      'Up to 100 stories per month',
      'Full AI collaboration (7 calls per story)',
      'AI assessment and feedback',
      'Mentor review and comments',
      'Export to PDF and Word',
      'Advanced progress tracking'
    ]
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    storyLimit: 200,
    price: 19.99,
    aiCalls: 7,
    assessmentType: 'ai',
    features: [
      'Up to 200 stories per month',
      'Full AI collaboration (7 calls per story)',
      'AI assessment and feedback',
      'Priority mentor review',
      'Export to PDF and Word',
      'Advanced analytics and insights',
      'Custom story elements'
    ]
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    storyLimit: 300,
    price: 39.99,
    aiCalls: 7,
    assessmentType: 'ai',
    features: [
      'Up to 300 stories per month',
      'Full AI collaboration (7 calls per story)',
      'AI assessment and feedback',
      'Dedicated mentor support',
      'Export to PDF and Word',
      'Comprehensive analytics',
      'Custom story elements',
      'Early access to new features'
    ]
  }
};

export const DEFAULT_TIER = SUBSCRIPTION_TIERS.FREE;