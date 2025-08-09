// app/api/admin/users/[id]/route.ts - Individual User CRUD
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';
import MentorAssignment from '@/models/MentorAssignment';

export const dynamic = 'force-dynamic';

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

    const user = await User.findById(id).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get additional data for child users
    let additionalData = {};
    if (user.role === 'child') {
      const [
        totalStoriesCreated,
        totalWordsWritten,
        assignedMentor,
        recentStories,
      ] = await Promise.all([
        StorySession.countDocuments({ childId: id }),
        StorySession.aggregate([
          { $match: { childId: user._id } },
          { $group: { _id: null, total: { $sum: '$totalWords' } } },
        ]),
        MentorAssignment.findOne({ childId: id, isActive: true }).populate(
          'mentorId',
          'firstName lastName email'
        ),
        StorySession.find({ childId: id })
          .sort({ createdAt: -1 })
          .limit(10)
          .select('title status createdAt totalWords'),
      ]);

      additionalData = {
        totalStoriesCreated,
        totalWordsWritten: totalWordsWritten[0]?.total || 0,
        assignedMentor: assignedMentor?.mentorId || null,
        recentStories,
      };
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user.toObject(),
        ...additionalData,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH - Update user
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

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        ...updateData,
        email: updateData.email?.toLowerCase(),
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE user
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

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot delete admin users' },
        { status: 400 }
      );
    }

    // Cascading delete - remove all related data
    await Promise.all([
      // Delete user's stories
      StorySession.deleteMany({ childId: id }),
      // Delete mentor assignments
      MentorAssignment.deleteMany({
        $or: [{ childId: id }, { mentorId: id }],
      }),
      // Delete comments by this user
      // Add other related data deletion as needed
    ]);

    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'User and all related data deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
