import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import MentorAssignment from '@/models/MentorAssignment';
import StorySession from '@/models/StorySession';
import StoryComment from '@/models/StoryComment';

export const dynamic = 'force-dynamic';

// Define proper types for the populated documents
interface PopulatedComment {
  _id: string;
  createdAt: Date;
  storyId: {
    _id: string;
    title: string;
    childId: {
      _id: string;
      firstName: string;
      lastName: string;
    } | null;
  } | null;
}

interface PopulatedStory {
  _id: string;
  title: string;
  createdAt: Date;
  childId: {
    _id: string;
    firstName: string;
    lastName: string;
  } | null;
}

interface RecentActivity {
  id: string;
  type: 'comment_added' | 'story_reviewed';
  description: string;
  createdAt: Date;
  studentName: string;
  storyTitle: string;
}

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

    // Get assigned students
    const assignments = await MentorAssignment.find({
      mentorId,
      isActive: { $ne: false },
    });
    const studentIds = assignments.map((a) => a.childId);

    // Get recent comments
    const recentComments = await StoryComment.find({ authorId: mentorId })
      .populate({
        path: 'storyId',
        select: 'title childId',
        populate: {
          path: 'childId',
          select: 'firstName lastName',
        },
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get recent stories
    const recentStories = await StorySession.find({
      childId: { $in: studentIds },
    })
      .populate('childId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    const activities: RecentActivity[] = [];

    // Add comment activities with proper type checking
    recentComments.forEach((comment: any) => {
      if (comment.storyId && comment.storyId.childId) {
        activities.push({
          id: comment._id.toString(),
          type: 'comment_added',
          description: `Added comment to "${comment.storyId.title}"`,
          createdAt: comment.createdAt,
          studentName: `${comment.storyId.childId.firstName} ${comment.storyId.childId.lastName}`,
          storyTitle: comment.storyId.title,
        });
      }
    });

    // Add story activities with proper type checking
    recentStories.forEach((story: any) => {
      if (story.childId) {
        activities.push({
          id: story._id.toString(),
          type: 'story_reviewed',
          description: `Student ${story.childId.firstName} created "${story.title}"`,
          createdAt: story.createdAt,
          studentName: `${story.childId.firstName} ${story.childId.lastName}`,
          storyTitle: story.title,
        });
      }
    });

    // Sort by date and limit
    activities.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      activities: activities.slice(0, 10),
    });
  } catch (error) {
    console.error('Error fetching mentor recent activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}
