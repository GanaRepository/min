// app/api/stripe/create-products/route.ts - Setup Stripe Products (Run once)
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(req: NextRequest) {
  try {
    // Verify admin access
    const { searchParams } = new URL(req.url);
    const adminKey = searchParams.get('admin_key');
    
    if (adminKey !== process.env.ADMIN_SETUP_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Setting up Stripe products...');

    // Create Story Pack Product
    const storyPackProduct = await stripe.products.create({
      name: 'Story Pack - 5 Stories + 5 Assessments',
      description: 'Unlock 5 additional story creations and 5 assessment uploads for the current month',
      images: [`${process.env.NEXTAUTH_URL}/images/story-pack-icon.png`],
      metadata: {
        type: 'story_pack',
        stories_added: '5',
        assessments_added: '5',
        attempts_added: '15',
      },
    });

    const storyPackPrice = await stripe.prices.create({
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

    // Create Story Publication Product
    const publicationProduct = await stripe.products.create({
      name: 'Story Publication Fee',
      description: 'Publish your story publicly and make it eligible for monthly competitions',
      images: [`${process.env.NEXTAUTH_URL}/images/publication-icon.png`],
      metadata: {
        type: 'story_publication',
      },
    });

    const publicationPrice = await stripe.prices.create({
      product: publicationProduct.id,
      unit_amount: 1000, // $10.00 in cents
      currency: 'usd',
      metadata: {
        type: 'story_publication',
      },
    });

    console.log('✅ Created Story Publication:', {
      productId: publicationProduct.id,
      priceId: publicationPrice.id,
    });

    return NextResponse.json({
      success: true,
      products: {
        storyPack: {
          productId: storyPackProduct.id,
          priceId: storyPackPrice.id,
        },
        publication: {
          productId: publicationProduct.id,
          priceId: publicationPrice.id,
        },
      },
      message: 'Add these IDs to your environment variables',
      envVars: {
        STRIPE_STORY_PACK_PRODUCT_ID: storyPackProduct.id,
        STRIPE_STORY_PACK_PRICE_ID: storyPackPrice.id,
        STRIPE_PUBLICATION_PRODUCT_ID: publicationProduct.id,
        STRIPE_PUBLICATION_PRICE_ID: publicationPrice.id,
      },
    });

  } catch (error) {
    console.error('Stripe setup error:', error);
    return NextResponse.json(
      { error: 'Failed to create Stripe products', details: error },
      { status: 500 }
    );
  }
}