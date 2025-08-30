// app/api/admin/mentors/assaign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import MentorAssignment from '@/models/MentorAssignment';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

// POST - Assign student to mentor
export async function POST(request: NextRequest) {
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
        {
          error: 'Mentor ID and Child ID are required',
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify mentor and child exist
    const [mentor, child] = await Promise.all([
      User.findOne({ _id: mentorId, role: 'mentor' }),
      User.findOne({ _id: childId, role: 'child' }),
    ]);

    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Check if assignment already exists
    const existingAssignment = await MentorAssignment.findOne({
      mentorId,
      childId,
      isActive: true,
    });

    if (existingAssignment) {
      return NextResponse.json(
        {
          error: 'Child is already assigned to this mentor',
        },
        { status: 400 }
      );
    }

    // Deactivate any existing assignment for this child
    await MentorAssignment.updateMany(
      { childId, isActive: true },
      {
        isActive: false,
        unassignedDate: new Date(),
        unassignedBy: session.user.id, // ✅ ADDED: Track who unassigned
      }
    );

    // ✅ FIXED: Create new assignment with all required fields
    const assignment = new MentorAssignment({
      mentorId,
      childId,
      assignedBy: session.user.id, // ✅ FIXED: Added the missing required field
      assignmentDate: new Date(),
      isActive: true,
    });

    await assignment.save();

    console.log(
      `✅ Assignment created: ${child.firstName} ${child.lastName} → ${mentor.firstName} ${mentor.lastName} (by Admin: ${session.user.id})`
    );

    return NextResponse.json({
      success: true,
      assignment,
      message: `${child.firstName} ${child.lastName} assigned to ${mentor.firstName} ${mentor.lastName}`,
    });
  } catch (error) {
    console.error('Error assigning student to mentor:', error);
    return NextResponse.json(
      { error: 'Failed to assign student to mentor' },
      { status: 500 }
    );
  }
}

// GET - Get all assignments
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const assignments = await MentorAssignment.find({ isActive: true })
      .populate('mentorId', 'firstName lastName email')
      .populate('childId', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName') // ✅ ADDED: Populate assignedBy
      .sort({ assignmentDate: -1 });

    return NextResponse.json({
      success: true,
      assignments,
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

// DELETE - Remove assignment
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');

    if (!assignmentId) {
      return NextResponse.json(
        {
          error: 'Assignment ID is required',
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const assignment = await MentorAssignment.findByIdAndUpdate(
      assignmentId,
      {
        isActive: false,
        unassignedDate: new Date(),
        unassignedBy: session.user.id, // ✅ ADDED: Track who unassigned
      },
      { new: true }
    );

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Assignment removed successfully',
    });
  } catch (error) {
    console.error('Error removing assignment:', error);
    return NextResponse.json(
      { error: 'Failed to remove assignment' },
      { status: 500 }
    );
  }
}
