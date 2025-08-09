// app/api/admin/recent-activity/route.ts (Fixed)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';
import StoryComment from '@/models/StoryComment';

export const dynamic = 'force-dynamic';

interface Activity {
  type: string;
  description: string;
  timestamp: Date;
  icon: string;
  color: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectToDatabase();

    const activities: Activity[] = [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get recent user registrations
    const recentUsers = await User.find({
      createdAt: { $gte: sevenDaysAgo },
      role: { $in: ['child', 'mentor'] }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('firstName lastName role createdAt')
    .lean();

    recentUsers.forEach(user => {
      activities.push({
        type: 'user_registered',
        description: `${user.firstName} ${user.lastName} registered as ${user.role}`,
        timestamp: user.createdAt,
        icon: 'user-plus',
        color: user.role === 'child' ? 'green' : 'purple',
      });
    });

    // Get recent story completions
    const recentStories = await StorySession.find({
      completedAt: { $gte: sevenDaysAgo },
      status: 'completed'
    })
    .sort({ completedAt: -1 })
    .limit(10)
    .populate('childId', 'firstName lastName')
    .select('title completedAt childId totalWords')
    .lean();

    recentStories.forEach(story => {
      if (story.childId && typeof story.childId === 'object' && 'firstName' in story.childId) {
        const child = story.childId as unknown as { firstName: string; lastName: string };
        activities.push({
          type: 'story_completed',
          description: `${child.firstName} ${child.lastName} completed "${story.title}" (${story.totalWords || 0} words)`,
          timestamp: story.completedAt || story.createdAt,
          icon: 'book-open',
          color: 'blue',
        });
      }
    });

    // Get recent comments
    const recentComments = await StoryComment.find({
      createdAt: { $gte: sevenDaysAgo }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('authorId', 'firstName lastName role')
    .populate('storyId', 'title')
    .select('createdAt authorId storyId commentType')
    .lean();

    recentComments.forEach(comment => {
      if (comment.authorId && typeof comment.authorId === 'object' && 'firstName' in comment.authorId &&
          comment.storyId && typeof comment.storyId === 'object' && 'title' in comment.storyId) {
        const author = comment.authorId as { firstName: string; lastName: string; role: string };
        const story = comment.storyId as { title: string };
        activities.push({
          type: 'comment_added',
          description: `${author.firstName} ${author.lastName} (${author.role}) commented on "${story.title}"`,
          timestamp: comment.createdAt,
          icon: 'message-square',
          color: 'orange',
        });
      }
    });

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      activities: activities.slice(0, 20), // Return top 20 most recent
    });

  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json({ error: 'Failed to fetch recent activity' }, { status: 500 });
  }
}