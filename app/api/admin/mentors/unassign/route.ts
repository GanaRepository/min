// app/api/admin/mentors/unassign/route.ts - NEW API FOR UNASSIGNING STUDENTS
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import MentorAssignment from '@/models/MentorAssignment';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

// POST - Unassign student from mentor
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { childId } = await request.json();

    if (!childId) {
      return NextResponse.json(
        { error: 'Child ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify child exists
    const child = await User.findOne({ _id: childId, role: 'child' });
    if (!child) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Find and deactivate current assignment
    const assignment = await MentorAssignment.findOne({
      childId,
      isActive: true,
    }).populate('mentorId', 'firstName lastName');

    if (!assignment) {
      return NextResponse.json(
        { error: 'Student is not currently assigned to any mentor' },
        { status: 400 }
      );
    }

    // Deactivate the assignment
    assignment.isActive = false;
    assignment.unassignedDate = new Date();
    assignment.unassignedBy = session.user.id;
    await assignment.save();

    console.log(
      `✅ Student ${child.firstName} ${child.lastName} unassigned from mentor ${assignment.mentorId.firstName} ${assignment.mentorId.lastName}`
    );

    return NextResponse.json({
      success: true,
      message: `${child.firstName} ${child.lastName} unassigned from ${assignment.mentorId.firstName} ${assignment.mentorId.lastName}`,
    });
  } catch (error) {
    console.error('Error unassigning student from mentor:', error);
    return NextResponse.json(
      { error: 'Failed to unassign student from mentor' },
      { status: 500 }
    );
  }
}
