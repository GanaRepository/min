import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import CreativeContest from '@/models/CreativeContest';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
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
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    await connectToDatabase();

    let query: any = {};
    if (status && status !== 'all') query.status = status;
    if (type && type !== 'all') query.type = type;

    const [contests, totalCount] = await Promise.all([
      CreativeContest.find(query)
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CreativeContest.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      contests,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching creative contests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contests' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const data = await request.json();

    const {
      title,
      description,
      type,
      startDate,
      endDate,
      resultsDate,
      acceptedFormats,
      maxFileSize,
      maxSubmissionsPerUser,
      rules,
      prizes,
      showPrizes,
      status = 'draft',
    } = data;

    if (
      !title ||
      !description ||
      !type ||
      !startDate ||
      !endDate ||
      !resultsDate
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const results = new Date(resultsDate);

    if (end <= start) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    if (results <= end) {
      return NextResponse.json(
        { error: 'Results date must be after end date' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const contest = new CreativeContest({
      title,
      description,
      type,
      createdBy: session.user.id,
      status,
      showPrizes: showPrizes || true,
      startDate: start,
      endDate: end,
      resultsDate: results,
      acceptedFormats: acceptedFormats || [],
      maxFileSize: maxFileSize || 25,
      maxSubmissionsPerUser: maxSubmissionsPerUser || 3,
      rules: rules || '',
      prizes: prizes || [],
      submissions: [],
      stats: {
        totalParticipants: 0,
        totalSubmissions: 0,
      },
    });

    await contest.save();
    await contest.populate('createdBy', 'firstName lastName email');

    return NextResponse.json({
      success: true,
      message: 'Creative contest created successfully',
      contest,
    });
  } catch (error) {
    console.error('Error creating creative contest:', error);
    return NextResponse.json(
      { error: 'Failed to create contest' },
      { status: 500 }
    );
  }
}
