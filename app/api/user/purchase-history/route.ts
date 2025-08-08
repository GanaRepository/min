// app/api/user/purchase-history/route.ts - User Purchase History
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import Purchase from '@/models/Purchase';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get user's purchase history
    const purchases = await Purchase.find({
      userId: session.user.id,
    })
    .sort({ purchaseDate: -1 })
    .limit(50); // Limit to last 50 purchases

    // Get user's purchase history from User model (legacy)
    const user = await User.findById(session.user.id).select('purchaseHistory');
    
    const formattedPurchases = purchases.map(purchase => ({
      id: purchase._id,
      type: purchase.type,
      amount: purchase.amount,
      status: purchase.status,
      date: purchase.purchaseDate,
      metadata: purchase.metadata,
      stripePaymentId: purchase.stripePaymentIntentId,
    }));

    return NextResponse.json({
      success: true,
      purchases: formattedPurchases,
      totalSpent: purchases
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0),
      totalPurchases: purchases.length,
    });

  } catch (error) {
    console.error('Error fetching purchase history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase history' },
      { status: 500 }
    );
  }
}