// app/api/stripe/create-products/route.ts (COMPLETE & FIXED)
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Validate environment variables first
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('❌ STRIPE_SECRET_KEY is required in environment variables');
}

if (!process.env.ADMIN_SETUP_KEY) {
  throw new Error('❌ ADMIN_SETUP_KEY is required in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(req: NextRequest) {
  try {
    // Verify admin access
    const { searchParams } = new URL(req.url);
    const adminKey = searchParams.get('admin_key');

    if (!adminKey || adminKey !== process.env.ADMIN_SETUP_KEY) {
      console.error('❌ Unauthorized access attempt to create products');
      return NextResponse.json(
        { error: 'Unauthorized - Invalid admin key' },
        { status: 401 }
      );
    }

    console.log('🔄 Setting up Stripe products...');

    // Check if products already exist to avoid duplicates
    const existingProducts = await stripe.products.list({ limit: 100 });
    const storyPackExists = existingProducts.data.find(
      (p) => p.metadata?.type === 'story_pack'
    );
    const publicationExists = existingProducts.data.find(
      (p) => p.metadata?.type === 'story_publication'
    );

    let storyPackProduct, storyPackPrice, publicationProduct, publicationPrice;

    // Create Story Pack Product (if it doesn't exist)
    if (storyPackExists) {
      console.log('ℹ️ Story Pack product already exists, using existing one');
      storyPackProduct = storyPackExists;
      const existingPrices = await stripe.prices.list({
        product: storyPackProduct.id,
      });
      storyPackPrice = existingPrices.data[0];
    } else {
      storyPackProduct = await stripe.products.create({
        name: 'Story Pack - 5 Stories + 5 Assessments',
        description:
          'Unlock 5 additional story creations and 5 assessment uploads for the current month',
        images: [`${process.env.NEXTAUTH_URL}/images/story-pack-icon.png`],
        metadata: {
          type: 'story_pack',
          stories_added: '5',
          assessments_added: '5',
          attempts_added: '15',
        },
      });

      storyPackPrice = await stripe.prices.create({
        product: storyPackProduct.id,
        unit_amount: 1500, // $15.00 in cents
        currency: 'usd',
        metadata: {
          type: 'story_pack',
        },
      });

      console.log('✅ Created Story Pack:', {
        productId: storyPackProduct.id,
        priceId: storyPackPrice.id,
      });
    }

    // Create Story Publication Product (if it doesn't exist)
    if (publicationExists) {
      console.log(
        'ℹ️ Story Publication product already exists, using existing one'
      );
      publicationProduct = publicationExists;
      const existingPrices = await stripe.prices.list({
        product: publicationProduct.id,
      });
      publicationPrice = existingPrices.data[0];
    } else {
      publicationProduct = await stripe.products.create({
        name: 'Story Publication Fee',
        description:
          'Publish your story publicly and make it eligible for monthly competitions',
        images: [`${process.env.NEXTAUTH_URL}/images/publication-icon.png`],
        metadata: {
          type: 'story_publication',
        },
      });

      publicationPrice = await stripe.prices.create({
        product: publicationProduct.id,
        unit_amount: 1000, // $10.00 in cents
        currency: 'usd',
        metadata: {
          type: 'story_publication', // ← This was the incomplete line!
        },
      });

      console.log('✅ Created Story Publication:', {
        productId: publicationProduct.id,
        priceId: publicationPrice.id,
      });
    }

    // Return success response with clear instructions
    return NextResponse.json({
      success: true,
      message: '🎉 Stripe products setup completed successfully!',
      instructions: {
        step1: 'Copy the IDs below to your .env file',
        step2: 'Restart your development server',
        step3: 'Test the payment flow on /pricing page',
      },
      products: {
        storyPack: {
          productId: storyPackProduct.id,
          priceId: storyPackPrice.id,
          price: '$15.00',
          description: 'Story Pack - 5 Stories + 5 Assessments',
        },
        publication: {
          productId: publicationProduct.id,
          priceId: publicationPrice.id,
          price: '$10.00',
          description: 'Story Publication Fee',
        },
      },
      envVars: {
        STRIPE_STORY_PACK_PRODUCT_ID: storyPackProduct.id,
        STRIPE_STORY_PACK_PRICE_ID: storyPackPrice.id,
        STRIPE_PUBLICATION_PRODUCT_ID: publicationProduct.id,
        STRIPE_PUBLICATION_PRICE_ID: publicationPrice.id,
      },
      nextSteps: [
        '1. Add the above environment variables to your .env file',
        '2. Restart your Next.js development server',
        '3. Set up webhook endpoint in Stripe Dashboard',
        '4. Test payments using Stripe test cards',
      ],
    });
  } catch (error: any) {
    console.error('❌ Stripe setup error:', error);

    // More detailed error handling
    let errorMessage = 'Failed to create Stripe products';
    let errorDetails = error.message || 'Unknown error';

    if (error.type === 'StripeInvalidRequestError') {
      errorMessage = 'Invalid Stripe request - check your API keys';
    } else if (error.type === 'StripeAPIError') {
      errorMessage = 'Stripe API error - try again later';
    } else if (error.type === 'StripeAuthenticationError') {
      errorMessage = 'Stripe authentication failed - check your secret key';
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        type: error.type || 'unknown',
        help: 'Check your Stripe API keys and try again',
      },
      { status: 500 }
    );
  }
}

// Add a GET method for testing
export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Stripe Product Setup Endpoint',
    usage: 'POST /api/stripe/create-products?admin_key=your-admin-key',
    note: 'This endpoint creates Stripe products and prices for your application',
  });
}
