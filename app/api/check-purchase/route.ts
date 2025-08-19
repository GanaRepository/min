// Create this file: app/api/check-purchase/route.ts
// To check if the webhook processed your purchase correctly

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storyId = searchParams.get('storyId');
    const userId = searchParams.get('userId');

    if (!storyId || !userId) {
      return NextResponse.json(
        { error: 'storyId and userId required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check story purchase status
    const story = await StorySession.findById(storyId);

    // Check user purchase history
    const user = await User.findById(userId);
    const purchases = user?.purchaseHistory || [];

    // Find recent purchases for this story
    const storyPurchases = purchases.filter(
      (p: any) => p.itemDetails?.storyId?.toString() === storyId
    );

    return NextResponse.json({
      story: {
        id: story?._id,
        title: story?.title,
        purchasedForPhysicalBook: story?.purchasedForPhysicalBook || false,
        physicalBookPurchaseDate: story?.physicalBookPurchaseDate,
        physicalBookStripeSessionId: story?.physicalBookStripeSessionId,
      },
      user: {
        totalPurchases: purchases.length,
        storyPurchases: storyPurchases.length,
        latestPurchase: purchases[purchases.length - 1],
      },
      webhookProcessed:
        storyPurchases.length > 0 && story?.purchasedForPhysicalBook,
    });
  } catch (error) {
    console.error('Error checking purchase:', error);
    return NextResponse.json(
      { error: 'Failed to check purchase status' },
      { status: 500 }
    );
  }
}
