import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import CreativeContest, { ICreativeContest } from '@/models/CreativeContest';
import User from '@/models/User';
import { uploadFile } from '@/utils/gridfs';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const contest = await CreativeContest.findById(params.id);
    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    if (contest.status !== 'active') {
      return NextResponse.json(
        { error: 'Contest is not accepting submissions' },
        { status: 400 }
      );
    }

    if (new Date() > contest.endDate) {
      return NextResponse.json(
        { error: 'Submission deadline has passed' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!file || !title) {
      return NextResponse.json(
        { error: 'File and title are required' },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > contest.maxFileSize * 1024 * 1024) {
      return NextResponse.json(
        { error: `File size exceeds ${contest.maxFileSize}MB limit` },
        { status: 400 }
      );
    }

    // Check file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!contest.acceptedFormats.includes(fileExtension || '')) {
      return NextResponse.json(
        { error: 'File format not allowed' },
        { status: 400 }
      );
    }

    // Check submission limit
    const userSubmissions = contest.submissions.filter(
      (sub: ICreativeContest['submissions'][number]) =>
        sub.participantId.toString() === session.user.id
    );

    if (userSubmissions.length >= contest.maxSubmissionsPerUser) {
      return NextResponse.json(
        {
          error: `Maximum ${contest.maxSubmissionsPerUser} submissions allowed`,
        },
        { status: 400 }
      );
    }

    // Upload file to GridFS
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileId = await uploadFile(buffer, file.name, file.type);

    // Get user info
    const user = await User.findById(session.user.id);
    const participantName = `${user.firstName} ${user.lastName}`;

    // Create submission
    const submission = {
      participantId: session.user.id,
      participantName,
      fileId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      submissionTitle: title,
      description: description || '',
      submittedAt: new Date(),
      isWinner: false,
    };

    contest.submissions.push(submission);

    // Update stats
    const isNewParticipant = !contest.submissions
      .slice(0, -1)
      .some(
        (sub: ICreativeContest['submissions'][number]) =>
          sub.participantId.toString() === session.user.id
      );

    contest.stats.totalSubmissions += 1;
    if (isNewParticipant) {
      contest.stats.totalParticipants += 1;
    }

    await contest.save();

    return NextResponse.json({
      success: true,
      message: 'Entry submitted successfully',
      submission: {
        contestId: contest._id,
        contestTitle: contest.title,
        submissionTitle: title,
        submittedAt: submission.submittedAt,
      },
    });
  } catch (error) {
    console.error('Error submitting to contest:', error);
    return NextResponse.json(
      { error: 'Failed to submit entry' },
      { status: 500 }
    );
  }
}
