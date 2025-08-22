// app/api/debug/all-user-stories/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const currentUserId = session.user.id;
    const objectId = new mongoose.Types.ObjectId(currentUserId);

    // Get all stories for current user
    const allUserStories = await db
      .collection('storysessions')
      .find({
        childId: objectId,
      })
      .toArray();

    // Get stories by creation method
    const freestyleStories = allUserStories.filter(
      (story) => !story.isUploadedForAssessment && story.currentTurn > 1
    );

    const uploadedStories = allUserStories.filter(
      (story) => story.isUploadedForAssessment === true
    );

    const newStories = allUserStories.filter(
      (story) => story.currentTurn === 1 && !story.isUploadedForAssessment
    );

    return NextResponse.json({
      currentUser: {
        id: currentUserId,
        email: session.user.email,
      },
      totalStories: allUserStories.length,
      breakdown: {
        freestyle: freestyleStories.length,
        uploaded: uploadedStories.length,
        new: newStories.length,
      },
      allStories: allUserStories.map((story) => ({
        id: story._id.toString(),
        title: story.title,
        currentTurn: story.currentTurn,
        isUploadedForAssessment: story.isUploadedForAssessment,
        status: story.status,
        totalWords: story.totalWords,
        childWords: story.childWords,
        createdAt: story.createdAt,
        type: story.isUploadedForAssessment
          ? 'uploaded'
          : story.currentTurn > 1
            ? 'freestyle'
            : 'new',
      })),
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
