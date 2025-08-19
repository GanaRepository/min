//app/api/admin/stories/route.ts

// app/api/admin/stories/route.ts - Admin Stories Management
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import StoryComment from '@/models/StoryComment';

export const dynamic = 'force-dynamic';

// GET all stories for admin
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const status = searchParams.get('status');
    const author = searchParams.get('author');

    await connectToDatabase();

    // Build query
    let query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (author && author.trim()) {
      // Search by author email or name
      const users = await import('@/models/User');
      const User = users.default;
      const authorUsers = await User.find({
        $or: [
          { email: { $regex: author, $options: 'i' } },
          { firstName: { $regex: author, $options: 'i' } },
          { lastName: { $regex: author, $options: 'i' } },
        ],
      }).select('_id');
      query.childId = { $in: authorUsers.map((u) => u._id) };
    }

    console.log('Stories API Query:', query); // Debug log

    // Get stories with pagination
    const [stories, totalStories] = await Promise.all([
      StorySession.find(query)
        .populate('childId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      StorySession.countDocuments(query),
    ]);

    // Get comment counts for each story
    const storiesWithComments = await Promise.all(
      stories.map(async (story) => {
        const [commentCount, unresolvedComments] = await Promise.all([
          StoryComment.countDocuments({ storyId: story._id }),
          StoryComment.countDocuments({
            storyId: story._id,
            isResolved: false,
          }),
        ]);

        return {
          ...story,
          commentCount,
          unresolvedComments,
        };
      })
    );

    // Get stats
    const [
      totalStoriesCount,
      completedStoriesCount,
      activeStoriesCount,
      pausedStoriesCount,
      storiesWithCommentsCount,
      storiesWithUnresolvedCommentsCount,
      totalCommentsCount,
      totalUnresolvedCommentsCount,
    ] = await Promise.all([
      StorySession.countDocuments({}),
      StorySession.countDocuments({ status: 'completed' }),
      StorySession.countDocuments({ status: 'active' }),
      StorySession.countDocuments({ status: 'paused' }),
      StoryComment.distinct('storyId').then((ids) => ids.length),
      StoryComment.distinct('storyId', { isResolved: false }).then(
        (ids) => ids.length
      ),
      StoryComment.countDocuments({}),
      StoryComment.countDocuments({ isResolved: false }),
    ]);

    console.log('Stories found:', storiesWithComments.length); // Debug log
    console.log('Total stories count:', totalStories); // Debug log

    return NextResponse.json({
      success: true,
      stories: storiesWithComments,
      stats: {
        totalStories: totalStoriesCount,
        completedStories: completedStoriesCount,
        activeStories: activeStoriesCount,
        pausedStories: pausedStoriesCount,
        storiesWithComments: storiesWithCommentsCount,
        storiesWithUnresolvedComments: storiesWithUnresolvedCommentsCount,
        totalComments: totalCommentsCount,
        totalUnresolvedComments: totalUnresolvedCommentsCount,
      },
      pagination: {
        page,
        limit,
        total: totalStories,
        pages: Math.ceil(totalStories / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}
