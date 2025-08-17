// app/api/admin/competitions/route.ts - FIXED VERSION
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
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
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

    // Get competition stats
    const totalSubmissions = await Competition.aggregate([
      { $group: { _id: null, total: { $sum: '$totalSubmissions' } } }
    ]);

    const avgParticipants = await Competition.aggregate([
      { $group: { _id: null, avg: { $avg: '$totalParticipants' } } }
    ]);

    const activeCompetitions = await Competition.countDocuments({ isActive: true });

    const stats = {
      totalCompetitions,
      activeCompetitions,
      totalSubmissions: totalSubmissions[0]?.total || 0,
      avgParticipants: Math.round(avgParticipants[0]?.avg || 0),
    };

    return NextResponse.json({
      success: true,
      competitions,
      stats,
      pagination: {
        page,
        limit,
        total: totalCompetitions,
        pages: Math.ceil(totalCompetitions / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching competitions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competitions' },
      { status: 500 }
    );
  }
}

// POST - Create new competition (for admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { month, year, theme } = body;

    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and year are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if competition already exists for this month/year
    const existingCompetition = await Competition.findOne({ month, year });
    if (existingCompetition) {
      return NextResponse.json(
        { error: 'Competition already exists for this period' },
        { status: 400 }
      );
    }

    // Deactivate any active competitions
    await Competition.updateMany(
      { isActive: true },
      { isActive: false }
    );

    // Create new competition
    const competition = new Competition({
      month,
      year,
      theme: theme || `${month} ${year} Writing Challenge`,
      phase: 'submission',
      isActive: true,
      createdBy: session.user.id,
      submissionStart: new Date(),
      submissionEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
      judgingCriteria: {
        grammar: 12,
        creativity: 25,
        structure: 10,
        character: 12,
        plot: 15,
        vocabulary: 10,
        originality: 8,
        engagement: 5,
        aiDetection: 3
      }
    });

    await competition.save();

    return NextResponse.json({
      success: true,
      competition,
      message: 'Competition created successfully',
    });
  } catch (error) {
    console.error('Error creating competition:', error);
    return NextResponse.json(
      { error: 'Failed to create competition' },
      { status: 500 }
    );
  }
}