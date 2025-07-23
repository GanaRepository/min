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
    storyLimit: 50, // per month
    price: 0,
    aiCalls: 7,
    assessmentType: 'ai',
    features: [
      'Up to 10 stories per month',
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
    storyLimit: 100, // per month
    price: 19.99,
    aiCalls: 7,
    assessmentType: 'ai',
    features: [
      'Up to 20 stories per month',
      'Full AI collaboration (7 calls per story)',
      'AI assessment and feedback',
      'Mentor review and comments',
      'Export to PDF and Word',
      'Advanced progress tracking',
      'Minimum 60 words per turn requirement',
    ],
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    storyLimit: 200, // per month
    price: 39.99,
    aiCalls: 7,
    assessmentType: 'ai',
    features: [
      'Up to 100 stories per month',
      'Full AI collaboration (7 calls per story)',
      'AI assessment and feedback',
      'Priority mentor review',
      'Export to PDF and Word',
      'Advanced analytics and insights',
      'Custom story elements',
      'Minimum 60 words per turn requirement',
    ],
  },
};

export const DEFAULT_TIER = SUBSCRIPTION_TIERS.FREE;
