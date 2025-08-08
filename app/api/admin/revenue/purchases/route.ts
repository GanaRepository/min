//app/api/admin/revenue/purchases/route.ts
// app/api/admin/revenue/purchases/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');

    await connectToDatabase();

    const matchStage: any = { role: 'child' };
    
    const purchases = await User.aggregate([
      { $match: matchStage },
      { $unwind: '$purchaseHistory' },
      ...(type && type !== 'all' ? [{ $match: { 'purchaseHistory.type': type } }] : []),
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          purchase: '$purchaseHistory'
        }
      },
      { $sort: { 'purchase.purchaseDate': -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ]);

    const totalPurchases = await User.aggregate([
      { $match: matchStage },
      { $unwind: '$purchaseHistory' },
      ...(type && type !== 'all' ? [{ $match: { 'purchaseHistory.type': type } }] : []),
      { $count: 'total' }
    ]);

    const total = totalPurchases[0]?.total || 0;

    return NextResponse.json({
      success: true,
      purchases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
  }
}