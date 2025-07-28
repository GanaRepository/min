export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import MentorAssignment from '@/models/MentorAssignment';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { mentorId, childId } = await request.json();

    if (!mentorId || !childId) {
      return NextResponse.json(
        { error: 'Mentor ID and Child ID are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify mentor and child exist
    const [mentor, child] = await Promise.all([
      User.findById(mentorId),
      User.findById(childId),
    ]);

    if (!mentor || mentor.role !== 'mentor') {
      return NextResponse.json({ error: 'Invalid mentor' }, { status: 400 });
    }

    if (!child || child.role !== 'child') {
      return NextResponse.json({ error: 'Invalid child' }, { status: 400 });
    }

    // Check if assignment already exists
    const existingAssignment = await MentorAssignment.findOne({
      mentorId,
      childId,
      isActive: { $ne: false },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'This mentor is already assigned to this child' },
        { status: 400 }
      );
    }

    // Create new assignment
    const assignment = await MentorAssignment.create({
      mentorId,
      childId,
      assignedAt: new Date(),
      assignedBy: session.user.id,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      assignment,
      message: 'Mentor assigned successfully',
    });
  } catch (error) {
    console.error('Error assigning mentor:', error);
    return NextResponse.json(
      { error: 'Failed to assign mentor' },
      { status: 500 }
    );
  }
}
