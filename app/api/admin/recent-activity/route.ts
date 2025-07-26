import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';
import StoryComment from '@/models/StoryComment';

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: Date;
  userId?: string;
  storyId?: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Get recent activities from different sources
    const [recentUsers, recentStories, recentComments] = await Promise.all([
      // Recent user registrations
      User.find({ role: 'child' })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('firstName lastName createdAt'),
      
      // Recent story completions
      StorySession.find({ status: 'completed' })
        .sort({ completedAt: -1 })
        .limit(10)
        .populate('childId', 'firstName lastName')
        .select('title completedAt childId'),
      
      // Recent comments
      StoryComment.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('authorId', 'firstName lastName role')
        .populate('storyId', 'title')
        .select('comment createdAt authorId storyId commentType')
    ]);

    // Combine and format activities
    const activities: Activity[] = [];

    // Add user registrations
    recentUsers.forEach((user: any) => {
      activities.push({
        id: `user-${user._id}`,
        type: 'user_registered',
        description: `${user.firstName} ${user.lastName} joined as a new writer`,
        createdAt: user.createdAt,
        userId: user._id.toString()
      });
    });

    // Add story completions
    recentStories.forEach((story: any) => {
      if (story.childId) {
        activities.push({
          id: `story-${story._id}`,
          type: 'story_completed',
          description: `${story.childId.firstName} ${story.childId.lastName} completed "${story.title}"`,
          createdAt: story.completedAt || story.updatedAt,
          userId: story.childId._id.toString(),
          storyId: story._id.toString()
        });
      }
    });

    // Add comments
    recentComments.forEach((comment: any) => {
      if (comment.authorId && comment.storyId) {
        activities.push({
          id: `comment-${comment._id}`,
          type: 'comment_added',
          description: `${comment.authorId.firstName} ${comment.authorId.lastName} (${comment.authorId.role}) added a ${comment.commentType} comment`,
          createdAt: comment.createdAt,
          userId: comment.authorId._id.toString(),
          storyId: comment.storyId._id?.toString() || comment.storyId.toString()
        });
      }
    });

    // Sort by date and limit to recent 20
    activities.sort((a: Activity, b: Activity) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const recentActivities = activities.slice(0, 20);

    return NextResponse.json({
      success: true,
      activities: recentActivities
    });

  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}