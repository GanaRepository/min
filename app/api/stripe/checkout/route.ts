// app/api/stripe/checkout/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import Stripe from 'stripe';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(req: NextRequest) {
  try {
    // Check environment variables first
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY not configured');
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { productType, storyId, userId } = body;

    console.log('🔍 Checkout request:', { productType, storyId, userId });
    console.log('🔍 Environment variables check:', {
      STRIPE_STORY_PACK_PRICE_ID: process.env.STRIPE_STORY_PACK_PRICE_ID
        ? '✅ Set'
        : '❌ Missing',
      STRIPE_PURCHASE_PRICE_ID: process.env.STRIPE_PURCHASE_PRICE_ID
        ? '✅ Set'
        : '❌ Missing',
    });

    if (!productType || !userId) {
      return NextResponse.json(
        { error: 'Product type and user ID are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Configure product based on type
    let priceId: string;
    let productName: string;
    let metadata: Record<string, string> = {
      userId,
      productType,
    };

    switch (productType) {
      case 'story_pack':
        if (!process.env.STRIPE_STORY_PACK_PRICE_ID) {
          console.error('❌ STRIPE_STORY_PACK_PRICE_ID not configured');
          return NextResponse.json(
            { error: 'Story pack not configured' },
            { status: 500 }
          );
        }
        priceId = process.env.STRIPE_STORY_PACK_PRICE_ID;
        productName = 'Story Pack - 5 Stories + 5 Assessments';
        metadata.storiesAdded = '5';
        metadata.assessmentsAdded = '5';
        metadata.attemptsAdded = '15';
        break;

      case 'story_purchase': // THIS WAS THE BUG - Missing case!
        if (!process.env.STRIPE_PURCHASE_PRICE_ID) {
          console.error('❌ STRIPE_PURCHASE_PRICE_ID not configured');
          return NextResponse.json(
            { error: 'Physical anthology purchase not configured' },
            { status: 500 }
          );
        }

        if (!storyId) {
          return NextResponse.json(
            { error: 'Story ID required for physical anthology purchase' },
            { status: 400 }
          );
        }

        // Verify story exists and belongs to user
        const purchaseStory = await StorySession.findById(storyId);
        if (!purchaseStory || purchaseStory.childId.toString() !== userId) {
          return NextResponse.json(
            { error: 'Story not found or access denied' },
            { status: 404 }
          );
        }

        priceId = process.env.STRIPE_PURCHASE_PRICE_ID;
        productName = 'Physical Anthology Purchase';
        metadata.storyId = storyId;
        metadata.storyTitle = purchaseStory.title;
        break;

      case 'story_publication':
        // FREE FEATURE - No Stripe payment needed
        // This should be handled directly in your app, not through Stripe
        return NextResponse.json(
          { error: 'Story publication is free - no payment required' },
          { status: 400 }
        );

      default:
        console.error('❌ Invalid product type:', productType);
        return NextResponse.json(
          { error: 'Invalid product type' },
          { status: 400 }
        );
    }

    console.log('🎯 Creating Stripe session with:', { priceId, productName });

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata,
      customer_email: user.email,
      success_url: `${process.env.NEXTAUTH_URL}/children-dashboard?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?purchase=cancelled`,
      billing_address_collection: 'required',
      shipping_address_collection:
        productType === 'story_purchase' // Only physical books need shipping
          ? {
              allowed_countries: ['US', 'CA', 'GB', 'AU'],
            }
          : undefined,
    });

    console.log(
      `✅ Stripe checkout session created: ${checkoutSession.id} for ${productName}`
    );

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error('❌ Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
