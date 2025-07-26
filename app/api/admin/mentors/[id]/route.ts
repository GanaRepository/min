import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import MentorAssignment from '@/models/MentorAssignment';
import StorySession from '@/models/StorySession';
import StoryComment from '@/models/StoryComment';

// GET - Get mentor details with assigned students
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;

    await connectToDatabase();

    // Get mentor basic info
    const mentor = await User.findById(id).select('-password');

    if (!mentor || mentor.role !== 'mentor') {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    // Get mentor assignments with student details
    const assignments = await MentorAssignment.find({ mentorId: id })
      .populate('childId', 'firstName lastName email')
      .sort({ assignedAt: -1 });

    // Get mentor statistics
    const [totalComments, totalStories] = await Promise.all([
      StoryComment.countDocuments({ authorId: id }),
      StorySession.countDocuments({
        childId: { $in: assignments.map((a) => a.childId._id) },
      }),
    ]);

    // Get assigned students with their story counts
    const studentsWithStats = await Promise.all(
      assignments.map(async (assignment) => {
        const studentStories = await StorySession.countDocuments({
          childId: assignment.childId._id,
        });

        return {
          _id: assignment.childId._id,
          firstName: assignment.childId.firstName,
          lastName: assignment.childId.lastName,
          email: assignment.childId.email,
          totalStories: studentStories,
          assignedAt: assignment.assignedAt,
        };
      })
    );

    const mentorWithDetails = {
      ...mentor.toObject(),
      assignedStudents: assignments.length,
      totalStories,
      totalComments,
      activeAssignments: assignments.filter((a) => a.isActive !== false).length,
      students: studentsWithStats,
    };

    return NextResponse.json({
      success: true,
      mentor: mentorWithDetails,
    });
  } catch (error) {
    console.error('Error fetching mentor details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mentor details' },
      { status: 500 }
    );
  }
}

// PUT - Update mentor details
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { firstName, lastName, email, isVerified } = body;

    await connectToDatabase();

    const mentor = await User.findByIdAndUpdate(
      id,
      {
        firstName,
        lastName,
        email,
        isVerified,
        updatedAt: new Date(),
      },
      { new: true }
    ).select('-password');

    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      mentor,
    });
  } catch (error) {
    console.error('Error updating mentor:', error);
    return NextResponse.json(
      { error: 'Failed to update mentor' },
      { status: 500 }
    );
  }
}

// DELETE - Delete mentor (and reassign students)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;

    await connectToDatabase();

    // Check if mentor exists
    const mentor = await User.findById(id);
    if (!mentor || mentor.role !== 'mentor') {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    // Remove all mentor assignments
    await MentorAssignment.deleteMany({ mentorId: id });

    // Delete the mentor user
    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Mentor deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting mentor:', error);
    return NextResponse.json(
      { error: 'Failed to delete mentor' },
      { status: 500 }
    );
  }
}
