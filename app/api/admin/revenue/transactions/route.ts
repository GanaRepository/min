
// app/api/admin/revenue/transactions/route.ts
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
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    await connectToDatabase();

    const matchConditions: any = { role: 'child' };

    let purchaseMatch: any = {};
    if (startDate || endDate) {
      purchaseMatch['purchaseHistory.purchaseDate'] = {};
      if (startDate)
        purchaseMatch['purchaseHistory.purchaseDate'].$gte = new Date(
          startDate
        );
      if (endDate)
        purchaseMatch['purchaseHistory.purchaseDate'].$lte = new Date(endDate);
    }

    const transactions = await User.aggregate([
      { $match: matchConditions },
      { $unwind: '$purchaseHistory' },
      ...(Object.keys(purchaseMatch).length > 0
        ? [{ $match: purchaseMatch }]
        : []),
      {
        $project: {
          customer: {
            id: '$_id',
            name: { $concat: ['$firstName', ' ', '$lastName'] },
            email: '$email',
          },
          transaction: '$purchaseHistory',
        },
      },
      { $sort: { 'transaction.purchaseDate': -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    // Get total count for pagination
    const totalTransactions = await User.aggregate([
      { $match: matchConditions },
      { $unwind: '$purchaseHistory' },
      ...(Object.keys(purchaseMatch).length > 0
        ? [{ $match: purchaseMatch }]
        : []),
      { $count: 'total' },
    ]);

    const total = totalTransactions[0]?.total || 0;

    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
