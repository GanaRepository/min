import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import CreativeContest from '@/models/CreativeContest';

export const dynamic = 'force-dynamic';

// GET - Get all submissions for a contest
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const sortBy = searchParams.get('sortBy') || 'newest';

    await connectToDatabase();

    const contest = await CreativeContest.findById(params.id)
      .populate('submissions.participantId', 'firstName lastName email')
      .lean();

    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    let submissions = (contest as any).submissions || [];

    // Sort submissions
    switch (sortBy) {
      case 'newest':
        submissions.sort(
          (a: any, b: any) =>
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime()
        );
        break;
      case 'oldest':
        submissions.sort(
          (a: any, b: any) =>
            new Date(a.submittedAt).getTime() -
            new Date(b.submittedAt).getTime()
        );
        break;
      case 'participant':
        submissions.sort((a: any, b: any) =>
          a.participantName.localeCompare(b.participantName)
        );
        break;
      case 'winners':
        submissions.sort((a: any, b: any) => {
          if (a.isWinner && !b.isWinner) return -1;
          if (!a.isWinner && b.isWinner) return 1;
          if (a.isWinner && b.isWinner)
            return (a.position || 999) - (b.position || 999);
          return 0;
        });
        break;
    }

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSubmissions = submissions.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      submissions: paginatedSubmissions,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(submissions.length / limit),
        totalCount: submissions.length,
      },
      contest: {
        _id: (contest as any)._id,
        title: (contest as any).title,
        status: (contest as any).status,
        stats: (contest as any).stats,
      },
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
