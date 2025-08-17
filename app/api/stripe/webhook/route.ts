// // app/api/stripe/webhook/route.ts - COMPLETELY FIXED
// import { NextRequest, NextResponse } from 'next/server';
// import Stripe from 'stripe';
// import { connectToDatabase } from '@/utils/db';
// import User from '@/models/User';
// import StorySession from '@/models/StorySession';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2025-07-30.basil',
// });

// const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.text();
//     const signature = req.headers.get('stripe-signature')!;

//     let event: Stripe.Event;

//     try {
//       event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
//     } catch (err: any) {
//       console.error('❌ Webhook signature verification failed:', err.message);
//       return NextResponse.json(
//         { error: 'Webhook signature verification failed' },
//         { status: 400 }
//       );
//     }

//     console.log(`📧 Stripe webhook received: ${event.type}`);

//     await connectToDatabase();

//     switch (event.type) {
//       case 'checkout.session.completed':
//         await handleCheckoutCompleted(
//           event.data.object as Stripe.Checkout.Session
//         );
//         break;

//       case 'payment_intent.succeeded':
//         await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
//         break;

//       case 'payment_intent.payment_failed':
//         await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
//         break;

//       default:
//         console.log(`ℹ️ Unhandled webhook event type: ${event.type}`);
//     }

//     return NextResponse.json({ received: true });
//   } catch (error) {
//     console.error('❌ Webhook processing error:', error);
//     return NextResponse.json(
//       { error: 'Webhook processing failed' },
//       { status: 500 }
//     );
//   }
// }

// async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
//   const { metadata } = session;
//   if (!metadata) {
//     console.error('❌ No metadata in checkout session');
//     return;
//   }

//   const {
//     userId,
//     productType,
//     storyId,
//     storiesAdded,
//     assessmentsAdded,
//     storyTitle,
//   } = metadata;

//   console.log(
//     `💳 Processing completed checkout: ${productType} for user ${userId}`
//   );

//   try {
//     // Update user based on product type
//     if (productType === 'story_pack') {
//       // Add purchase to user's purchase history
//       await User.findByIdAndUpdate(userId, {
//         $push: {
//           purchaseHistory: {
//             type: 'story_pack',
//             amount: session.amount_total ? session.amount_total / 100 : 15,
//             purchaseDate: new Date(),
//             stripeSessionId: session.id,
//             metadata: {
//               storiesAdded: parseInt(storiesAdded || '5'),
//               assessmentsAdded: parseInt(assessmentsAdded || '5'),
//               totalAssessmentAttemptsAdded: 15,
//             }
//           },
//         },
//       });

//       console.log(
//         `✅ Story pack purchased: +${storiesAdded} stories, +${assessmentsAdded} assessments for user ${userId}`
//       );

//     } else if (productType === 'story_publication') {
//       // Mark story as published
//       await StorySession.findByIdAndUpdate(storyId, {
//         isPublished: true,
//         publicationDate: new Date(),
//         publicationFee: session.amount_total ? session.amount_total / 100 : 10,
//       });

//       // Add purchase to user's purchase history
//       await User.findByIdAndUpdate(userId, {
//         $push: {
//           purchaseHistory: {
//             type: 'story_publication',
//             amount: session.amount_total ? session.amount_total / 100 : 10,
//             purchaseDate: new Date(),
//             stripeSessionId: session.id,
//             storyId,
//             metadata: {
//               storyTitle: storyTitle || 'Unknown Story',
//             }
//           },
//         },
//       });

//       console.log(`✅ Story "${storyTitle}" published and purchased for user ${userId}`);
//     }

//     console.log(`✅ Checkout completed successfully for ${userId}`);
//   } catch (error) {
//     console.error('❌ Error processing checkout completion:', error);
//   }
// }

// async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
//   console.log(
//     `💰 Payment succeeded: ${paymentIntent.id} - $${paymentIntent.amount / 100}`
//   );
// }

// async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
//   console.log(
//     `❌ Payment failed: ${paymentIntent.id} - ${paymentIntent.last_payment_error?.message}`
//   );
// }

// export const runtime = 'nodejs';

// app/api/stripe/webhook/route.ts - COMPLETELY FIXED WITH IMPORTS
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import mongoose from 'mongoose'; // ADD THIS IMPORT
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log('🎉 Received webhook event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'payment_intent.succeeded':
        console.log('💰 Payment succeeded:', event.data.object.id);
        break;
        
      case 'payment_intent.payment_failed':
        console.log('❌ Payment failed:', event.data.object.id);
        break;

      default:
        console.log(`🔄 Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('🎯 Processing checkout completion:', session.id);

    await connectToDatabase();

    // Extract metadata
    const userId = session.metadata?.userId;
    const productType = session.metadata?.productType;
    const storyId = session.metadata?.storyId;
    const storyTitle = session.metadata?.storyTitle;

    if (!userId) {
      throw new Error('Missing userId in session metadata');
    }

    console.log('📋 Checkout metadata:', {
      userId,
      productType,
      storyId,
      storyTitle,
      amount: session.amount_total
    });

    // Determine purchase details based on product type
    let purchaseData;
    if (productType === 'story_pack') {
      purchaseData = {
        type: 'story_pack' as const,
        amount: 15.00,
        itemDetails: {
          storiesAdded: 5,
          assessmentsAdded: 15,
        },
      };
    } else if (productType === 'individual_story' || productType === 'story_purchase') {
      purchaseData = {
        type: 'individual_story' as const, // Always save as 'individual_story' for schema compatibility
        amount: 10.00,
        itemDetails: {
          storyId: storyId ? new mongoose.Types.ObjectId(storyId) : undefined,
          storyTitle: storyTitle || 'Unknown Story',
          ...(productType === 'story_purchase' ? { physicalBookInclusion: true } : {}),
        },
      };
    } else {
      throw new Error(`Unknown product type: ${productType}`);
    }

    // Create purchase record in user's purchaseHistory
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          purchaseHistory: {
            ...purchaseData,
            stripePaymentId: session.payment_intent as string,
            stripeSessionId: session.id,
            paymentStatus: 'completed',
            purchaseDate: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    console.log('✅ Purchase added to user history:', userId);

    // Handle specific product actions
    if (productType === 'story_pack') {
      console.log('📦 Story pack purchased: +5 stories, +15 assessments for user', userId);
      // Update subscription tier
      await User.findByIdAndUpdate(userId, {
        subscriptionTier: 'STORY_PACK',
        billingPeriodStart: new Date(),
        billingPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });
    } else if (productType === 'individual_story' && storyId) {
      console.log('📖 Individual story purchased for physical anthology:', storyId);
      // Mark story for physical anthology
      await StorySession.findByIdAndUpdate(storyId, {
        physicalAnthology: {
          purchased: true,
          purchaseDate: new Date(),
          stripeSessionId: session.id,
          amount: 10.00,
        },
      });
    } else if (productType === 'story_purchase' && storyId) {
      console.log('📖 Physical book purchased for story:', storyId);
      // Mark story as purchased for physical book
      await StorySession.findByIdAndUpdate(storyId, {
        purchasedForPhysicalBook: true,
        physicalBookPurchaseDate: new Date(),
        physicalBookStripeSessionId: session.id,
      });
    }

    console.log('🎉 Checkout completed successfully for', userId);

  } catch (error) {
    console.error('❌ Error processing checkout completion:', error);
    throw error;
  }
}