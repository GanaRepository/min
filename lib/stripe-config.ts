// lib/stripe-config.ts - UPDATED FOR Digiverse Story REQUIREMENTS
import Stripe from 'stripe';

// Validate environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('❌ STRIPE_SECRET_KEY is required');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('❌ STRIPE_WEBHOOK_SECRET is required');
}

// Initialize Stripe with error handling
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
});

// Stripe webhook signature verification
export function verifyWebhookSignature(
  body: string,
  signature: string
): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    throw new Error(
      `Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Digiverse Story PRICING CONFIGURATION
export const Digiverse Story_PRODUCTS = {
  STORY_PACK: {
    id: 'story_pack',
    name: 'Story Pack',
    description: 'Unlock more stories and assessments for the month',
    price: 15.0,
    currency: 'USD',
    benefits: {
      storiesAdded: 5, // 3 + 5 = 8 total
      assessmentsAdded: 5, // 3 + 5 = 8 total
      totalAssessmentAttemptsAdded: 15, // 9 + 15 = 24 total
      competitionEntriesAdded: 0, // Competition limit stays 1
    },
    stripeProductId: process.env.STRIPE_STORY_PACK_PRODUCT_ID,
    stripePriceId: process.env.STRIPE_STORY_PACK_PRICE_ID,
  },

  STORY_PUBLICATION: {
    id: 'story_publication',
    name: 'Story Publication',
    description: 'Publish story to community showcase',
    price: 0.0, // FREE - 1 per month
    currency: 'USD',
    benefits: {
      communityShowcase: true,
      commentsEnabled: true,
      publicVisibility: true,
    },
  },

  STORY_PURCHASE: {
    id: 'story_purchase',
    name: 'Physical Anthology Purchase',
    description: 'Reserve spot in physical book anthology',
    price: 10.0,
    currency: 'USD',
    benefits: {
      physicalBookInclusion: true,
      premiumShowcase: true,
      customBookPricing: true, // Contact admin for pricing
    },
    stripeProductId: process.env.STRIPE_PURCHASE_PRODUCT_ID,
    stripePriceId: process.env.STRIPE_PURCHASE_PRICE_ID,
  },
};

// Create Stripe checkout session for Story Pack
export async function createStoryPackCheckout(
  userId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  return await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: undefined, // Will be filled in checkout
    line_items: [
      {
        price: Digiverse Story_PRODUCTS.STORY_PACK.stripePriceId,
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      productType: 'story_pack',
      storiesAdded:
        Digiverse Story_PRODUCTS.STORY_PACK.benefits.storiesAdded.toString(),
      assessmentsAdded:
        Digiverse Story_PRODUCTS.STORY_PACK.benefits.assessmentsAdded.toString(),
      totalAssessmentAttemptsAdded:
        Digiverse Story_PRODUCTS.STORY_PACK.benefits.totalAssessmentAttemptsAdded.toString(),
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

// Create Stripe checkout session for Story Purchase (Physical Anthology)
export async function createStoryPurchaseCheckout(
  userId: string,
  storyId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  return await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: undefined,
    line_items: [
      {
        price: Digiverse Story_PRODUCTS.STORY_PURCHASE.stripePriceId,
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      storyId,
      productType: 'story_purchase',
      physicalBookInclusion: 'true',
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

// Process successful payment webhook
export async function processSuccessfulPayment(
  session: Stripe.Checkout.Session
) {
  const { userId, productType, storyId } = session.metadata || {};

  if (!userId) {
    throw new Error('Missing userId in session metadata');
  }

  // Import here to avoid circular dependency
  const { connectToDatabase } = await import('@/utils/db');
  const User = (await import('@/models/User')).default;

  await connectToDatabase();

  if (productType === 'story_pack') {
    // Add Story Pack benefits to user
    await User.findByIdAndUpdate(userId, {
      $push: {
        purchaseHistory: {
          type: 'story_pack',
          amount: Digiverse Story_PRODUCTS.STORY_PACK.price,
          purchaseDate: new Date(),
          stripeSessionId: session.id,
          metadata: {
            storiesAdded: Digiverse Story_PRODUCTS.STORY_PACK.benefits.storiesAdded,
            assessmentsAdded:
              Digiverse Story_PRODUCTS.STORY_PACK.benefits.assessmentsAdded,
            totalAssessmentAttemptsAdded:
              Digiverse Story_PRODUCTS.STORY_PACK.benefits
                .totalAssessmentAttemptsAdded,
          },
        },
      },
    });
  } else if (productType === 'story_purchase' && storyId) {
    // Mark story for physical book inclusion
    const StorySession = (await import('@/models/StorySession')).default;

    await Promise.all([
      StorySession.findByIdAndUpdate(storyId, {
        $set: {
          purchasedForPhysicalBook: true,
          physicalBookPurchaseDate: new Date(),
          physicalBookStripeSessionId: session.id,
        },
      }),
      User.findByIdAndUpdate(userId, {
        $push: {
          purchaseHistory: {
            type: 'story_purchase',
            amount: Digiverse Story_PRODUCTS.STORY_PURCHASE.price,
            purchaseDate: new Date(),
            stripeSessionId: session.id,
            storyId,
            metadata: {
              physicalBookInclusion: true,
            },
          },
        },
      }),
    ]);
  }
}

// Price formatting utility
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

console.log('✅ Stripe initialized successfully with Digiverse Story configuration');
