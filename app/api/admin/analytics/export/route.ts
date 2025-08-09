//app/api/admin/analytics/export/route.ts
// app/api/admin/analytics/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';
import StoryComment from '@/models/StoryComment';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30'; // days

    await connectToDatabase();

    const now = new Date();
    const startDate = new Date(
      now.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000
    );

    const [users, stories, comments] = await Promise.all([
      User.aggregate([
        {
          $match: {
            role: { $in: ['child', 'mentor'] },
            createdAt: { $gte: startDate },
          },
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            email: 1,
            role: 1,
            isVerified: 1,
            createdAt: 1,
            lastActiveDate: 1,
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
          $project: {
            content: 1,
            commentType: 1,
            isResolved: 1,
            createdAt: 1,
            'author.firstName': 1,
            'author.lastName': 1,
            'author.role': 1,
          },
        },
      ]),
    ]);

    // Generate CSV
    const csvData = generateAnalyticsCSV({ users, stories, comments });

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-export-${timeRange}days-${now.toISOString().split('T')[0]}.csv"`,
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

function generateAnalyticsCSV(data: any) {
  const { users, stories, comments } = data;
  let csv = '';

  // Users section
  csv += 'USERS\n';
  csv += 'First Name,Last Name,Email,Role,Verified,Created At,Last Active\n';
  users.forEach((user: any) => {
    csv += `${user.firstName},${user.lastName},${user.email},${user.role},${user.isVerified},${user.createdAt},${user.lastActiveDate || 'Never'}\n`;
  });

  csv += '\n\nSTORIES\n';
  csv +=
    'Title,Author Name,Author Email,Status,Total Words,Created At,Completed At\n';
  stories.forEach((story: any) => {
    const author = story.author[0];
    csv += `"${story.title}","${author?.firstName} ${author?.lastName}",${author?.email},${story.status},${story.totalWords},${story.createdAt},${story.completedAt || 'Not completed'}\n`;
  });

  csv += '\n\nCOMMENTS\n';
  csv += 'Content,Type,Author Name,Author Role,Resolved,Created At\n';
  comments.forEach((comment: any) => {
    const author = comment.author[0];
    csv += `"${comment.content}",${comment.commentType},"${author?.firstName} ${author?.lastName}",${author?.role},${comment.isResolved},${comment.createdAt}\n`;
  });

  return csv;
}
