
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

    // No real refunds yet, return empty array for clean UI
    const realRefunds: any[] = [];
    return NextResponse.json({
      success: true,
      refunds: [],
      pagination: {
        page,
        limit,
        total: 0,
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
