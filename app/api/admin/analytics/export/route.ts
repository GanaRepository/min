import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';
import StoryComment from '@/models/StoryComment';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    await connectToDatabase();

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get comprehensive data for export
    const [users, stories, comments] = await Promise.all([
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            email: 1,
            role: 1,
            subscriptionTier: 1,
            isVerified: 1,
            createdAt: 1,
            lastLoginAt: 1,
          },
        },
      ]),
      StorySession.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'childId',
            foreignField: '_id',
            as: 'author',
          },
        },
        {
          $project: {
            title: 1,
            status: 1,
            totalWords: 1,
            childWords: 1,
            apiCallsUsed: 1,
            createdAt: 1,
            completedAt: 1,
            'author.firstName': 1,
            'author.lastName': 1,
            'author.email': 1,
          },
        },
      ]),
      StoryComment.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'authorId',
            foreignField: '_id',
            as: 'author',
          },
        },
        {
          $lookup: {
            from: 'storysessions',
            localField: 'storyId',
            foreignField: '_id',
            as: 'story',
          },
        },
        {
          $project: {
            comment: 1,
            commentType: 1,
            isResolved: 1,
            createdAt: 1,
            'author.firstName': 1,
            'author.lastName': 1,
            'author.role': 1,
            'story.title': 1,
          },
        },
      ]),
    ]);

    // Create CSV content
    const csvData = generateCSV({ users, stories, comments });

    // Return CSV file
    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="mintoons-analytics-${timeRange}-${now.toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting analytics:', error);
    return NextResponse.json(
      { error: 'Failed to export analytics' },
      { status: 500 }
    );
  }
}

function generateCSV(data: any) {
  const { users, stories, comments } = data;

  let csv = '';

  // Users section
  csv += 'USERS\n';
  csv +=
    'First Name,Last Name,Email,Role,Subscription Tier,Verified,Created At,Last Login\n';
  users.forEach((user: any) => {
    csv += `${user.firstName},${user.lastName},${user.email},${user.role},${user.subscriptionTier || 'free'},${user.isVerified},${user.createdAt},${user.lastLoginAt || 'Never'}\n`;
  });

  csv += '\n\nSTORIES\n';
  csv +=
    'Title,Author Name,Author Email,Status,Total Words,Child Words,API Calls,Created At,Completed At\n';
  stories.forEach((story: any) => {
    const author = story.author[0];
    csv += `"${story.title}","${author?.firstName} ${author?.lastName}",${author?.email},${story.status},${story.totalWords},${story.childWords},${story.apiCallsUsed},${story.createdAt},${story.completedAt || 'Not completed'}\n`;
  });

  csv += '\n\nCOMMENTS\n';
  csv +=
    'Comment,Type,Author Name,Author Role,Story Title,Resolved,Created At\n';
  comments.forEach((comment: any) => {
    const author = comment.author[0];
    const story = comment.story[0];
    csv += `"${comment.comment}",${comment.commentType},"${author?.firstName} ${author?.lastName}",${author?.role},"${story?.title}",${comment.isResolved},${comment.createdAt}\n`;
  });

  return csv;
}
