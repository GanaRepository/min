// app/api/stripe/webhook/route.ts (FIXED)
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';
import Purchase from '@/models/Purchase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    console.log(`📧 Stripe webhook received: ${event.type}`);

    await connectToDatabase();

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`ℹ️ Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { metadata } = session;
  if (!metadata) {
    console.error('❌ No metadata in checkout session');
    return;
  }

  const {
    userId,
    productType,
    storyId,
    storiesAdded,
    assessmentsAdded,
    storyTitle,
  } = metadata;

  console.log(
    `💳 Processing completed checkout: ${productType} for user ${userId}`
  );

  try {
    // Create purchase record
    const purchaseRecord = new Purchase({
      userId,
      type: productType,
      amount: session.amount_total ? session.amount_total / 100 : 0,
      stripePaymentIntentId: session.payment_intent as string,
      stripeSessionId: session.id,
      status: 'completed',
      metadata: {
        storiesAdded: storiesAdded ? parseInt(storiesAdded) : 0,
        assessmentsAdded: assessmentsAdded ? parseInt(assessmentsAdded) : 0,
        storyId: storyId || null,
      },
      purchaseDate: new Date(),
    });

    await purchaseRecord.save();

    // Update user based on product type
    if (productType === 'story_pack') {
      await User.findByIdAndUpdate(userId, {
        $inc: {
          'limits.stories': parseInt(storiesAdded || '5'),
          'limits.assessments': parseInt(assessmentsAdded || '5'),
        },
        $push: {
          purchaseHistory: {
            type: 'story_pack',
            amount: session.amount_total ? session.amount_total / 100 : 15,
            stripePaymentId: session.payment_intent as string,
            purchaseDate: new Date(),
            itemsAdded: parseInt(storiesAdded || '5'),
          },
        },
      });

      console.log(
        `✅ Story pack benefits added: +${storiesAdded} stories, +${assessmentsAdded} assessments`
      );
    } else if (productType === 'story_publication') {
      await StorySession.findByIdAndUpdate(storyId, {
        isPublished: true,
        publicationDate: new Date(),
        competitionEligible: true,
        publicationFee: session.amount_total ? session.amount_total / 100 : 10,
      });

      console.log(`✅ Story "${storyTitle}" published successfully`);
    }

    console.log(`✅ Checkout completed successfully for ${userId}`);
  } catch (error) {
    console.error('❌ Error processing checkout completion:', error);
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(
    `💰 Payment succeeded: ${paymentIntent.id} - $${paymentIntent.amount / 100}`
  );

  await Purchase.findOneAndUpdate(
    { stripePaymentIntentId: paymentIntent.id },
    { status: 'completed' }
  );
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(
    `❌ Payment failed: ${paymentIntent.id} - ${paymentIntent.last_payment_error?.message}`
  );

  const purchase = await Purchase.findOneAndUpdate(
    { stripePaymentIntentId: paymentIntent.id },
    { status: 'failed' },
    { new: true }
  );

  if (purchase) {
    const user = await User.findById(purchase.userId);
    if (user) {
      console.log(`📧 Should send payment failure email to ${user.email}`);
    }
  }
}

export const runtime = 'nodejs';
