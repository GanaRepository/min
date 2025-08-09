import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    await connectToDatabase();
    
    const user = await User.findById(session.user.id).select('purchaseHistory');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const purchases = (user.purchaseHistory || [])
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
      .slice(0, limit)
      .map(purchase => ({
        id: purchase._id || purchase.id,
        type: purchase.type,
        amount: purchase.amount,
        date: purchase.purchaseDate,
        description: purchase.description || (purchase.type === 'story_pack' ? 'Story Pack Purchase' : 'Story Publication'),
        stripeSessionId: purchase.stripeSessionId,
      }));

    return NextResponse.json({
      success: true,
      purchases
    });

  } catch (error) {
    console.error('Error fetching purchase history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase history' },
      { status: 500 }
    );
  }
}