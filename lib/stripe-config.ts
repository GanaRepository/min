// lib/stripe-config.ts - Stripe configuration and utilities
import Stripe from 'stripe';
import { PRICING_TIERS, STRIPE_CONFIG } from '@/config/pricing';

// Initialize Stripe
export const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: '2025-07-30.basil',
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
      STRIPE_CONFIG.webhookSecret
    );
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
