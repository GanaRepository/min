// app/api/user/stories/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
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

    // Get all story sessions for the user
    const storySessions = await StorySession.find({ childId: userId })
      .sort({ updatedAt: -1 })
      .lean();

    // Transform the data for frontend
    const stories = storySessions.map((session) => ({
      _id: session._id,
      storyNumber: session.storyNumber,
      title: session.title,
      elements: session.elements,
      status: session.status,
      currentTurn: session.currentTurn,
      totalWords: session.totalWords,
      childWords: session.childWords,
      apiCallsUsed: session.apiCallsUsed,
      maxApiCalls: session.maxApiCalls,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      // Add mock scores for completed stories (implement real scoring later)
      ...(session.status === 'completed' && {
        overallScore: Math.floor(Math.random() * 20) + 80, // 80-100
        grammarScore: Math.floor(Math.random() * 15) + 80, // 80-95
        creativityScore: Math.floor(Math.random() * 15) + 85, // 85-100
        publishedAt: session.updatedAt,
      }),
    }));

    return NextResponse.json({
      success: true,
      stories,
      stats: {
        total: stories.length,
        completed: stories.filter((s) => s.status === 'completed').length,
        active: stories.filter((s) => s.status === 'active').length,
        paused: stories.filter((s) => s.status === 'paused').length,
        totalWords: stories.reduce((sum, s) => sum + (s.childWords || 0), 0),
      },
    });
  } catch (error) {
    console.error('Error fetching user stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}
