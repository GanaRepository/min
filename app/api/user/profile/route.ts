// app/api/user/profile/route.ts (FINAL FIX)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';
import Achievement from '@/models/Achievement';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Get user data with proper casting
    const user = (await User.findById(userId).lean()) as unknown as any;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get story statistics with proper casting
    const completedSessions = (await StorySession.find({
      childId: userId,
      status: 'completed',
    }).lean()) as unknown as any[];

    const totalWords = completedSessions.reduce(
      (sum: number, session: any) => sum + (session.childWords || 0),
      0
    );
    const averageScore =
      completedSessions.length > 0
        ? Math.round(
            completedSessions.reduce(
              (sum: number, session: any) => sum + (session.overallScore || 0),
              0
            ) / completedSessions.length
          )
        : 0;

    // Calculate favorite genre
    const genreCounts: Record<string, number> = {};
    completedSessions.forEach((session: any) => {
      const genre = session.elements?.genre;
      if (genre) {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      }
    });
    const favoriteGenre =
      Object.keys(genreCounts).length > 0
        ? Object.keys(genreCounts).reduce((a, b) =>
            genreCounts[a] > genreCounts[b] ? a : b
          )
        : 'Adventure';

    // Get achievements with proper casting
    const achievements = (await Achievement.find({ userId })
      .sort({ earnedAt: -1 })
      .lean()) as unknown as any[];

    return NextResponse.json({
      success: true,
      profile: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          dateOfBirth: user.dateOfBirth,
          grade: user.grade,
          school: user.school,
          avatar: user.avatar,
          joinedAt: user.createdAt,
          lastActiveDate: user.lastActiveDate,
        },
        stats: {
          totalStoriesCreated: completedSessions.length,
          totalWordsWritten: totalWords,
          averageScore,
          writingStreak: user.writingStreak || 0,
          favoriteGenre,
          totalTimeWriting: user.totalTimeWriting || 0,
        },
        preferences: {
          theme: user.preferences?.theme || 'dark',
          language: user.preferences?.language || 'en',
          emailNotifications: user.preferences?.emailNotifications ?? true,
          soundEffects: user.preferences?.soundEffects ?? true,
          autoSave: user.preferences?.autoSave ?? true,
        },
        achievements: achievements.map((achievement: any) => ({
          id: achievement._id,
          title: achievement.title,
          earnedAt: achievement.earnedAt,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching profile data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile data' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, grade, school } = body;

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        ...(grade && { grade }),
        ...(school && { school: school.trim() }),
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
