import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import CreativeContest from '@/models/CreativeContest';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    await connectToDatabase();

    let query: any = {};

    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['active', 'ended', 'results_published'] };
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    const contests = await CreativeContest.find(query)
      .select('-submissions.participantId -submissions.fileId')
      .sort({ status: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const session = await getServerSession(authOptions);

    // Add user-specific data if logged in
    let enrichedContests = contests;
    if (session?.user && session.user.role === 'child') {
      enrichedContests = contests.map((contest) => {
        const userSubmissions =
          contest.submissions?.filter(
            (sub: any) => sub.participantId?.toString() === session.user.id
          ) || [];

        return {
          ...contest,
          userStats: {
            hasSubmitted: userSubmissions.length > 0,
            submissionCount: userSubmissions.length,
            canSubmit:
              contest.status === 'active' &&
              userSubmissions.length < contest.maxSubmissionsPerUser,
            submittedEntries: userSubmissions.map((sub: any) => ({
              submissionId: sub._id,
              title: sub.submissionTitle,
              submittedAt: sub.submittedAt,
              isWinner: sub.isWinner,
              position: sub.position,
            })),
          },
        };
      });
    }

    return NextResponse.json({
      success: true,
      contests: enrichedContests,
    });
  } catch (error) {
    console.error('Error fetching creative contests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contests' },
      { status: 500 }
    );
  }
}
