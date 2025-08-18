// // app/api/stripe/webhook/route.ts - COMPLETELY FIXED WITH IMPORTS
// import { NextRequest, NextResponse } from 'next/server';
// import Stripe from 'stripe';
// import mongoose from 'mongoose'; // ADD THIS IMPORT
// import { connectToDatabase } from '@/utils/db';
// import User from '@/models/User';
// import StorySession from '@/models/StorySession';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2025-07-30.basil',
// });

// const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// export async function POST(request: NextRequest) {
//   const body = await request.text();
//   const sig = request.headers.get('stripe-signature');

//   let event: Stripe.Event;

//   try {
//     event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
//   } catch (err: any) {
//     console.error('❌ Webhook signature verification failed:', err.message);
//     return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
//   }

//   console.log('🎉 Received webhook event:', event.type);

//   try {
//     switch (event.type) {
//       case 'checkout.session.completed':
//         await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
//         break;
      
//       case 'payment_intent.succeeded':
//         console.log('💰 Payment succeeded:', event.data.object.id);
//         break;
        
//       case 'payment_intent.payment_failed':
//         console.log('❌ Payment failed:', event.data.object.id);
//         break;

//       default:
//         console.log(`🔄 Unhandled event type: ${event.type}`);
//     }

//     return NextResponse.json({ received: true });
//   } catch (error) {
//     console.error('❌ Error processing webhook:', error);
//     return NextResponse.json(
//       { error: 'Webhook processing failed' },
//       { status: 500 }
//     );
//   }
// }

// async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
//   try {
//     console.log('🎯 Processing checkout completion:', session.id);

//     await connectToDatabase();

//     // Extract metadata
//     const userId = session.metadata?.userId;
//     const productType = session.metadata?.productType;
//     const storyId = session.metadata?.storyId;
//     const storyTitle = session.metadata?.storyTitle;

//     if (!userId) {
//       throw new Error('Missing userId in session metadata');
//     }

//     console.log('📋 Checkout metadata:', {
//       userId,
//       productType,
//       storyId,
//       storyTitle,
//       amount: session.amount_total
//     });

//     // Determine purchase details based on product type
//     let purchaseData;
//     if (productType === 'story_pack') {
//       purchaseData = {
//         type: 'story_pack' as const,
//         amount: 15.00,
//         itemDetails: {
//           storiesAdded: 5,
//           assessmentsAdded: 15,
//         },
//       };
//     } else if (productType === 'individual_story' || productType === 'story_purchase') {
//       purchaseData = {
//         type: 'individual_story' as const, // Always save as 'individual_story' for schema compatibility
//         amount: 10.00,
//         itemDetails: {
//           storyId: storyId ? new mongoose.Types.ObjectId(storyId) : undefined,
//           storyTitle: storyTitle || 'Unknown Story',
//           ...(productType === 'story_purchase' ? { physicalBookInclusion: true } : {}),
//         },
//       };
//     } else {
//       throw new Error(`Unknown product type: ${productType}`);
//     }

//     // Create purchase record in user's purchaseHistory
//     const user = await User.findByIdAndUpdate(
//       userId,
//       {
//         $push: {
//           purchaseHistory: {
//             ...purchaseData,
//             stripePaymentId: session.payment_intent as string,
//             stripeSessionId: session.id,
//             paymentStatus: 'completed',
//             purchaseDate: new Date(),
//           },
//         },
//       },
//       { new: true }
//     );

//     if (!user) {
//       throw new Error(`User not found: ${userId}`);
//     }

//     console.log('✅ Purchase added to user history:', userId);

//     // Handle specific product actions
//     if (productType === 'story_pack') {
//       console.log('📦 Story pack purchased: +5 stories, +15 assessments for user', userId);
//       // STACK monthlyLimits instead of overwriting
//       const currentUser = await User.findById(userId);
//       const currentLimits = currentUser?.monthlyLimits || { freestyleStories: 3, assessmentRequests: 9, competitionEntries: 3 };
//       const newLimits = {
//         freestyleStories: currentLimits.freestyleStories + 5,
//         assessmentRequests: currentLimits.assessmentRequests + 15,
//         competitionEntries: currentLimits.competitionEntries,
//       };
//       await User.findByIdAndUpdate(userId, {
//         $set: {
//           subscriptionTier: 'STORY_PACK',
//           monthlyLimits: newLimits,
//           billingPeriodStart: new Date(),
//           billingPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//         }
//       });
//     } else if (productType === 'individual_story' && storyId) {
//       console.log('📖 Individual story purchased for physical anthology:', storyId);
//       // Mark story for physical anthology
//       await StorySession.findByIdAndUpdate(storyId, {
//         physicalAnthology: {
//           purchased: true,
//           purchaseDate: new Date(),
//           stripeSessionId: session.id,
//           amount: 10.00,
//         },
//       });
//     } else if (productType === 'story_purchase' && storyId) {
//       console.log('📖 Physical book purchased for story:', storyId);
//       // Mark story as purchased for physical book
//       await StorySession.findByIdAndUpdate(storyId, {
//         purchasedForPhysicalBook: true,
//         physicalBookPurchaseDate: new Date(),
//         physicalBookStripeSessionId: session.id,
//       });
//     }

//     console.log('🎉 Checkout completed successfully for', userId);

//   } catch (error) {
//     console.error('❌ Error processing checkout completion:', error);
//     throw error;
//   }
// }

// app/api/stripe/webhook/route.ts - UPDATED FOR 30-DAY STORY PACK SYSTEM
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import mongoose from 'mongoose';
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
            purchaseDate: new Date(), // CRITICAL: 30-day timer starts from this date
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
      console.log('📦 Story pack purchased: 30-day benefits activated for user', userId);
      
      // NO LONGER SET monthlyLimits or subscriptionTier here
      // These are now calculated dynamically from purchaseHistory
      const purchaseDate = new Date();
      const expiryDate = new Date(purchaseDate.getTime() + (30 * 24 * 60 * 60 * 1000));
      
      console.log(`⏰ Story Pack active from ${purchaseDate.toISOString()} to ${expiryDate.toISOString()}`);
      
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

export const runtime = 'nodejs';