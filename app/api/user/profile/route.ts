// app/api/user/profile/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User, { IUserLean } from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const userRaw = await User.findById(session.user.id).lean() as IUserLean;
    
    if (!userRaw) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Transform to our expected type
    const user: IUserLean = {
      _id: userRaw._id,
      firstName: userRaw.firstName,
      lastName: userRaw.lastName,
      email: userRaw.email,
      password: userRaw.password,
      role: userRaw.role,
      age: userRaw.age,
      school: userRaw.school,
      isActive: userRaw.isActive,
      createdAt: userRaw.createdAt,
      updatedAt: userRaw.updatedAt,
      __v: userRaw.__v || 0
    };

    // Build profile data with proper typing
    const profileData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      age: user.age,
      school: user.school,
      joinedDate: user.createdAt,
      subscription: {
        tier: 'free' as const,
        storiesThisMonth: 8,
        storyLimit: 50
      },
      preferences: {
        theme: 'dark' as const,
        fontSize: 'medium' as const,
        notifications: {
          mentorComments: true,
          dailyReminders: true,
          achievements: true,
          weeklyReports: false
        },
        privacy: {
          allowMentorView: true,
          includeInExamples: false,
          shareProgressWithParents: false
        }
      }
    };

    return NextResponse.json({
      success: true,
      profile: profileData
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const updates = await request.json();

    await connectToDatabase();

    // Only allow updating certain fields with proper typing
    const allowedUpdates: Record<string, any> = {};
    
    if (updates.firstName !== undefined) allowedUpdates.firstName = updates.firstName;
    if (updates.lastName !== undefined) allowedUpdates.lastName = updates.lastName;
    if (updates.age !== undefined) allowedUpdates.age = updates.age;
    if (updates.school !== undefined) allowedUpdates.school = updates.school;

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      allowedUpdates,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}