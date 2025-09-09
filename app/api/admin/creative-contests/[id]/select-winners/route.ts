import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import CreativeContest from '@/models/CreativeContest';

export const dynamic = 'force-dynamic';

// GET - Get contest data for winner selection
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

    await connectToDatabase();

    const contest = await CreativeContest.findById(params.id)
      .populate('submissions.participantId', 'firstName lastName email')
      .lean();

    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    if (
      (contest as any).status !== 'ended' &&
      (contest as any).status !== 'results_published'
    ) {
      return NextResponse.json(
        { error: 'Contest must be ended before selecting winners' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      contest,
      submissions: (contest as any).submissions || [],
    });
  } catch (error) {
    console.error('Error fetching contest for winner selection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contest' },
      { status: 500 }
    );
  }
}

// POST - Select winners and publish results
export async function POST(
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

    const { winners } = await request.json();

    if (!winners || !Array.isArray(winners)) {
      return NextResponse.json(
        { error: 'Winners array is required' },
        { status: 400 }
      );
    }

    // Validate winners format
    for (const winner of winners) {
      if (!winner.submissionId || !winner.position) {
        return NextResponse.json(
          { error: 'Each winner must have submissionId and position' },
          { status: 400 }
        );
      }
    }

    await connectToDatabase();

    const contest = await CreativeContest.findById(params.id);
    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    if (
      (contest as any).status !== 'ended' &&
      (contest as any).status !== 'results_published'
    ) {
      return NextResponse.json(
        { error: 'Contest must be ended before selecting winners' },
        { status: 400 }
      );
    }

    // Reset all winners first
    (contest as any).submissions.forEach((submission: any) => {
      submission.isWinner = false;
      submission.position = undefined;
    });

    // Set new winners
    winners.forEach((winner: any) => {
      const submission = (contest as any).submissions.find(
        (sub: any) => sub._id.toString() === winner.submissionId
      );
      if (submission) {
        submission.isWinner = true;
        submission.position = winner.position;
      }
    });

    // Update contest status to results published
    (contest as any).status = 'results_published';
    await contest.save();

    return NextResponse.json({
      success: true,
      message: 'Winners selected and results published successfully',
      contest,
    });
  } catch (error) {
    console.error('Error selecting winners:', error);
    return NextResponse.json(
      { error: 'Failed to select winners' },
      { status: 500 }
    );
  }
}
