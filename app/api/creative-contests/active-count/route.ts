import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import CreativeContest from '@/models/CreativeContest';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();

    const count = await CreativeContest.countDocuments({
      status: 'active',
    });

    return NextResponse.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('Error fetching active contest count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch count' },
      { status: 500 }
    );
  }
}
