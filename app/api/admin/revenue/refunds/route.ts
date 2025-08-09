//app/api/admin/revenue/refunds/route.ts

// app/api/admin/revenue/refunds/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

// GET refund requests
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'pending';

    await connectToDatabase();

    // Mock refund requests - in real app, you'd have a Refund model
    const mockRefunds = [
      {
        _id: '1',
        user: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        amount: 15.0,
        reason: 'Accidental purchase',
        status: 'pending',
        requestDate: new Date(),
        transactionId: 'tx_123',
      },
    ];

    return NextResponse.json({
      success: true,
      refunds:
        status === 'all'
          ? mockRefunds
          : mockRefunds.filter((r) => r.status === status),
      pagination: {
        page,
        limit,
        total: mockRefunds.length,
        pages: 1,
      },
    });
  } catch (error) {
    console.error('Error fetching refunds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch refunds' },
      { status: 500 }
    );
  }
}

// POST process refund
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { refundId, action, reason } = await request.json();

    if (!refundId || !action) {
      return NextResponse.json(
        {
          error: 'Refund ID and action are required',
        },
        { status: 400 }
      );
    }

    // In real app, you'd process the refund through Stripe
    // and update your database accordingly

    return NextResponse.json({
      success: true,
      message: `Refund ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}
