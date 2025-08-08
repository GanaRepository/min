// app/api/admin/competitions/route.ts (Fixed)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import Competition from '@/models/Competition';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    await connectToDatabase();

    const [competitions, totalCompetitions] = await Promise.all([
      Competition.find()
        .populate('createdBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Competition.countDocuments(),
    ]);

    return NextResponse.json({
      success: true,
      competitions,
      pagination: {
        page,
        limit,
        total: totalCompetitions,
        pages: Math.ceil(totalCompetitions / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching competitions:', error);
    return NextResponse.json({ error: 'Failed to fetch competitions' }, { status: 500 });
  }
}