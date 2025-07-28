export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';
import StoryComment from '@/models/StoryComment';

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

    const user = await User.findById(id).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user statistics
    const [
      totalStories,
      completedStories,
      activeStories,
      totalComments,
      stories,
    ] = await Promise.all([
      StorySession.countDocuments({ childId: id }),
      StorySession.countDocuments({ childId: id, status: 'completed' }),
      StorySession.countDocuments({ childId: id, status: 'active' }),
      StoryComment.countDocuments({ authorId: id }),
      StorySession.find({ childId: id })
        .select('title status createdAt totalWords')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    const userWithStats = {
      ...user.toObject(),
      totalStories,
      completedStories,
      activeStories,
      totalComments,
      stories,
    };

    return NextResponse.json({
      success: true,
      user: userWithStats,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}

// Update the PATCH method to handle verification properly
export async function PATCH(
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
    const { isVerified, subscriptionTier } = body;

    await connectToDatabase();

    const updateData: any = { updatedAt: new Date() };
    
    if (typeof isVerified === 'boolean') {
      updateData.isVerified = isVerified;
      // If verifying user, also set verification date
      if (isVerified) {
        updateData.emailVerifiedAt = new Date();
      } else {
        updateData.emailVerifiedAt = null;
      }
    }
    
    if (subscriptionTier) {
      updateData.subscriptionTier = subscriptionTier;
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
      message: `User ${isVerified ? 'verified' : 'unverified'} successfully`,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
