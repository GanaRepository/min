// app/api/competitions/previous/route.ts - Get Previous Competitions
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import Competition from '@/models/Competition';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    await connectToDatabase();

    const competitions = await Competition.find({
      isActive: false,
      isArchived: true,
    })
      .sort({ year: -1, month: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('winners.childId', 'firstName lastName')
      .select(
        'month year phase totalSubmissions totalParticipants winners createdAt'
      );

    const totalCount = await Competition.countDocuments({
      isActive: false,
      isArchived: true,
    });

    return NextResponse.json({
      success: true,
      competitions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching previous competitions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch previous competitions' },
      { status: 500 }
    );
  }
}
