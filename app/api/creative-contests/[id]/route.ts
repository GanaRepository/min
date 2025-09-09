import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';

import CreativeContest, { ICreativeContest } from '@/models/CreativeContest';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const contest = await CreativeContest.findById(params.id).lean();

    // Defensive: If contest is an array (shouldn't be), treat as not found
    if (!contest || Array.isArray(contest)) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    // Build contestData as a plain object
    let contestData = { ...contest } as any;
    if (session?.user && session.user.role === 'child') {
      const userSubmissions =
        contest.submissions?.filter(
          (sub: any) => sub.participantId?.toString() === session.user.id
        ) || [];

      contestData.userStats = {
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
      };
    }

    // For public view, hide sensitive submission data
    if (contest.status !== 'results_published') {
      contestData.submissions =
        contest.submissions?.map((sub: any) => ({
          submissionTitle: sub.submissionTitle,
          submittedAt: sub.submittedAt,
          participantName: sub.participantName,
        })) || [];
    } else {
      // Show winners for completed contests
      contestData.winners =
        contest.submissions
          ?.filter((sub: any) => sub.isWinner)
          ?.sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
          ?.map((sub: any) => ({
            position: sub.position,
            participantName: sub.participantName,
            submissionTitle: sub.submissionTitle,
            fileId: sub.fileId, // Only show file for winners
          })) || [];
    }

    return NextResponse.json({
      success: true,
      contest: contestData,
    });
  } catch (error) {
    console.error('Error fetching contest:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contest' },
      { status: 500 }
    );
  }
}
