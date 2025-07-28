export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import MentorAssignment from '@/models/MentorAssignment';
import StorySession from '@/models/StorySession';
import StoryComment from '@/models/StoryComment';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'mentor') {
      return NextResponse.json(
        { error: 'Mentor access required' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const mentorId = session.user.id;

    // Get current date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get assigned students
    const assignments = await MentorAssignment.find({
      mentorId,
      isActive: { $ne: false },
    });
    const studentIds = assignments.map((a) => a.childId);

    // Parallel data fetching
    const [
      assignedStudents,
      totalStories,
      totalComments,
      pendingReviews,
      newStoriesThisMonth,
      commentsThisMonth,
    ] = await Promise.all([
      assignments.length,
      StorySession.countDocuments({ childId: { $in: studentIds } }),
      StoryComment.countDocuments({ authorId: mentorId }),
      StorySession.countDocuments({
        childId: { $in: studentIds },
        status: { $in: ['active', 'completed'] },
        needsMentorReview: true,
      }),
      StorySession.countDocuments({
        childId: { $in: studentIds },
        createdAt: { $gte: startOfMonth },
      }),
      StoryComment.countDocuments({
        authorId: mentorId,
        createdAt: { $gte: startOfMonth },
      }),
    ]);

    const stats = {
      assignedStudents,
      totalStories,
      totalComments,
      pendingReviews,
      monthlyStats: {
        newStories: newStoriesThisMonth,
        commentsGiven: commentsThisMonth,
        assessmentsCompleted: Math.floor(commentsThisMonth * 0.3), // Placeholder
      },
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error fetching mentor dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
