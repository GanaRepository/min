// 4. Fix app/api/stripe/webhook/route.ts - Fix emailService import
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';
import Purchase from '@/models/Purchase';
// Fix the import - use the specific function instead of emailService
import { sendCompetitionSubmissionConfirmation } from '@/lib/mailer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil', // Fix API version
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
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    console.log(`📧 Stripe webhook received: ${event.type}`);

    await connectToDatabase();

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { metadata } = session;
  if (!metadata) return;

  const { userId, productType, storyId, storiesAdded, assessmentsAdded, storyTitle } = metadata;

  console.log(`💳 Processing completed checkout: ${productType} for user ${userId}`);

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

    // Update user and records based on product type
    if (productType === 'story_pack') {
      // Add story pack benefits to user
      await User.findByIdAndUpdate(userId, {
        $inc: {
          storiesCreatedThisMonth: -parseInt(storiesAdded), // Add to available count
          assessmentUploadsThisMonth: -parseInt(assessmentsAdded), // Add to available count
        },
        $push: {
          purchaseHistory: {
            type: 'story_pack',
            amount: session.amount_total ? session.amount_total / 100 : 15,
            stripePaymentId: session.payment_intent as string,
            purchaseDate: new Date(),
            itemsAdded: parseInt(storiesAdded),
          },
        },
      });

      console.log(`✅ Story pack benefits added: +${storiesAdded} stories, +${assessmentsAdded} assessments`);

      // Send purchase confirmation email (implement if needed)
      console.log(`📧 Should send story pack purchase confirmation to user ${userId}`);

    } else if (productType === 'story_publication') {
      // Publish the story
      await StorySession.findByIdAndUpdate(storyId, {
        isPublished: true,
        publicationDate: new Date(),
        competitionEligible: true,
        publicationFee: session.amount_total ? session.amount_total / 100 : 10,
      });

      console.log(`✅ Story "${storyTitle}" published successfully`);

      // Send publication confirmation email (implement if needed)
      console.log(`📧 Should send publication confirmation to user ${userId}`);
    }

    console.log(`✅ Checkout completed successfully for ${userId}`);

  } catch (error) {
    console.error('Error processing checkout completion:', error);
    // Log error but don't throw - we don't want to cause webhook retries for our internal errors
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`💰 Payment succeeded: ${paymentIntent.id} - ${paymentIntent.amount / 100}`);
  
  // Update purchase record status if exists
  await Purchase.findOneAndUpdate(
    { stripePaymentIntentId: paymentIntent.id },
    { status: 'completed' }
  );
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`❌ Payment failed: ${paymentIntent.id} - ${paymentIntent.last_payment_error?.message}`);
  
  // Update purchase record status and send notification
  const purchase = await Purchase.findOneAndUpdate(
    { stripePaymentIntentId: paymentIntent.id },
    { status: 'failed' },
    { new: true }
  );

  if (purchase) {
    // Send payment failure notification email
    const user = await User.findById(purchase.userId);
    if (user) {
      console.log(`📧 Should send payment failure email to ${user.email}`);
    }
  }
}