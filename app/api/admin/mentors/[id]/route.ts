// app/api/admin/mentors/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import MentorAssignment from '@/models/MentorAssignment';
import StoryComment from '@/models/StoryComment';
import StorySession from '@/models/StorySession';

export const dynamic = 'force-dynamic';

// GET single mentor
export async function GET(
  request: NextRequest,
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

    const mentor = await User.findById(id).select('-password');
    if (!mentor || mentor.role !== 'mentor') {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    // Get mentor's assigned children with their story counts
    const assignments = await MentorAssignment.find({
      mentorId: id,
      isActive: true,
    })
      .populate('childId', 'firstName lastName email')
      .lean();

    const assignedChildren = await Promise.all(
      assignments.map(async (assignment) => {
        const storiesCount = await StorySession.countDocuments({
          childId: assignment.childId._id,
        });

        const child = assignment.childId as any;
        return {
          _id: child._id,
          firstName: child.firstName,
          lastName: child.lastName,
          email: child.email,
          storiesCount,
          lastActive: child.lastActiveDate || child.updatedAt,
        };
      })
    );

    // Get mentor's comment activity
    const totalComments = await StoryComment.countDocuments({ authorId: id });

    // Get total stories by assigned students
    const studentIds = assignments.map((a) => a.childId._id);
    const totalStories = await StorySession.countDocuments({
      childId: { $in: studentIds },
    });

    // Get recent activity
    const recentComments = await StoryComment.find({ authorId: id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('storyId', 'title')
      .lean();

    const recentActivity = recentComments.map((comment: any) => ({
      type: 'comment',
      description: `Commented on "${comment.storyId.title}"`,
      date: comment.createdAt,
    }));

    return NextResponse.json({
      success: true,
      mentor: {
        ...mentor.toObject(),
        assignedStudents: assignments.length,
        totalComments,
        totalStories,
        assignedChildren,
        recentActivity,
      },
    });
  } catch (error) {
    console.error('Error fetching mentor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mentor' },
      { status: 500 }
    );
  }
}

// PATCH - Update mentor
export async function PATCH(
  request: NextRequest,
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
    const updateData = await request.json();

    await connectToDatabase();

    // Validate email uniqueness if email is being updated
    if (updateData.email) {
      const existingUser = await User.findOne({
        email: updateData.email.toLowerCase(),
        _id: { $ne: id },
      });
      if (existingUser) {
        return NextResponse.json(
          {
            error: 'Email already exists',
            errors: { email: 'This email is already in use' },
          },
          { status: 400 }
        );
      }
    }

    const updatedMentor = await User.findOneAndUpdate(
      { _id: id, role: 'mentor' },
      {
        ...updateData,
        email: updateData.email?.toLowerCase(),
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedMentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      mentor: updatedMentor,
      message: 'Mentor updated successfully',
    });
  } catch (error) {
    console.error('Error updating mentor:', error);
    return NextResponse.json(
      { error: 'Failed to update mentor' },
      { status: 500 }
    );
  }
}

// DELETE mentor
export async function DELETE(
  request: NextRequest,
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

    const mentor = await User.findById(id);
    if (!mentor || mentor.role !== 'mentor') {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    // Deactivate all mentor assignments (don't delete to preserve history)
    await MentorAssignment.updateMany(
      { mentorId: id, isActive: true },
      { isActive: false, unassignedDate: new Date() }
    );

    // Delete the mentor account
    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message:
        'Mentor deleted successfully. All student assignments have been deactivated.',
    });
  } catch (error) {
    console.error('Error deleting mentor:', error);
    return NextResponse.json(
      { error: 'Failed to delete mentor' },
      { status: 500 }
    );
  }
}
