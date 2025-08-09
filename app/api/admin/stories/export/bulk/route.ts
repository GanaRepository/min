// app/api/admin/stories/export/bulk/route.ts (New)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import StoryComment from '@/models/StoryComment';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const includeContent = searchParams.get('includeContent') === 'true';
    const includeComments = searchParams.get('includeComments') === 'true';
    const includeAuthorInfo = searchParams.get('includeAuthorInfo') === 'true';
    const format = searchParams.get('format') || 'csv';

    await connectToDatabase();

    // Build query
    let query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Fetch stories with optional population
    const stories = await StorySession.find(query)
      .populate(includeAuthorInfo ? 'childId' : '', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch additional data if requested
    const storyData = await Promise.all(
      stories.map(async (story) => {
        const baseData = {
          id: String(story._id),
          title: story.title,
          status: story.status,
          totalWords: story.totalWords || 0,
          apiCallsUsed: story.apiCallsUsed || 0,
          createdAt: story.createdAt,
          completedAt: story.completedAt || null,
          isPublished: story.isPublished || false,
        };

        // Add author info if requested
        if (includeAuthorInfo && story.childId) {
          const child = story.childId as any;
          Object.assign(baseData, {
            authorName: `${child.firstName} ${child.lastName}`,
            authorEmail: child.email,
          });
        }

        // Add content if requested
        if (includeContent) {
          const turns = await Turn.find({ sessionId: story._id })
            .sort({ turnNumber: 1 })
            .lean();
          Object.assign(baseData, {
            content: turns.map((turn) => turn.content).join('\n\n'),
            turnCount: turns.length,
          });
        }

        // Add comments if requested
        if (includeComments) {
          const comments = await StoryComment.find({ storyId: story._id })
            .populate('authorId', 'firstName lastName role')
            .lean();
          Object.assign(baseData, {
            commentCount: comments.length,
            comments: comments.map((comment: any) => ({
              content: comment.content,
              type: comment.commentType,
              author: `${comment.authorId.firstName} ${comment.authorId.lastName}`,
              authorRole: comment.authorId.role,
              createdAt: comment.createdAt,
            })),
          });
        }

        return baseData;
      })
    );

    if (format === 'json') {
      return new NextResponse(JSON.stringify(storyData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="stories-bulk-export-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    }

    // Generate CSV
    const headers = [
      'ID',
      'Title',
      'Status',
      'Total Words',
      'API Calls Used',
      'Created At',
      'Completed At',
      'Published',
    ];

    if (includeAuthorInfo) {
      headers.push('Author Name', 'Author Email');
    }
    if (includeContent) {
      headers.push('Content', 'Turn Count');
    }
    if (includeComments) {
      headers.push('Comment Count');
    }

    let csv = headers.join(',') + '\n';

    storyData.forEach((story: any) => {
      const row = [
        story.id,
        `"${story.title.replace(/"/g, '""')}"`,
        story.status,
        story.totalWords,
        story.apiCallsUsed,
        new Date(story.createdAt).toLocaleDateString(),
        story.completedAt
          ? new Date(story.completedAt).toLocaleDateString()
          : 'Not completed',
        story.isPublished ? 'Yes' : 'No',
      ];

      if (includeAuthorInfo) {
        row.push(`"${story.authorName || 'N/A'}"`, story.authorEmail || 'N/A');
      }
      if (includeContent) {
        row.push(
          `"${(story.content || '').replace(/"/g, '""')}"`,
          story.turnCount || 0
        );
      }
      if (includeComments) {
        row.push(story.commentCount || 0);
      }

      csv += row.join(',') + '\n';
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="stories-bulk-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting stories:', error);
    return NextResponse.json(
      { error: 'Failed to export stories' },
      { status: 500 }
    );
  }
}
