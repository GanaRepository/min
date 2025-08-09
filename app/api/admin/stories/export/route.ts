// app/api/admin/stories/export/route.ts - Export Stories
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';

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
    const status = searchParams.get('status');
    const author = searchParams.get('author');

    await connectToDatabase();

    let query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (author) {
      query.childId = author;
    }

    const stories = await StorySession.find(query)
      .populate('childId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    // Generate CSV
    let csv =
      'Title,Author Name,Author Email,Status,Total Words,Child Words,API Calls Used,Created Date,Completed Date,Published,Competition\n';

    stories.forEach((story: any) => {
      const author = story.childId;
      csv += `"${story.title}","${author.firstName} ${author.lastName}","${author.email}","${story.status}",${story.totalWords || 0},${story.childWords || 0},${story.apiCallsUsed || 0},"${new Date(story.createdAt).toLocaleDateString()}","${story.completedAt ? new Date(story.completedAt).toLocaleDateString() : 'Not completed'}",${story.isPublished ? 'Yes' : 'No'},${story.submittedToCompetition ? 'Yes' : 'No'}\n`;
    });

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="stories-export-${new Date().toISOString().split('T')[0]}.csv"`,
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
