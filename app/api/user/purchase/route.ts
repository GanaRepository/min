import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User, { IUser } from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Add type assertion to fix TypeScript error
    const user = (await User.findById(session.user.id)
      .select('purchaseHistory')
      .lean()) as Pick<IUser, 'purchaseHistory'> | null;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate monthly spent
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlySpent = (user.purchaseHistory || [])
      .filter(
        (purchase: any) => new Date(purchase.purchaseDate) >= currentMonthStart
      )
      .reduce(
        (total: number, purchase: any) => total + (purchase.amount || 0),
        0
      );

    return NextResponse.json({
      purchases: user.purchaseHistory || [],
      monthlySpent,
    });
  } catch (error) {
    console.error('Error fetching user purchases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
}
