// export const dynamic = 'force-dynamic';

// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/utils/authOptions';
// import { connectToDatabase } from '@/utils/db';
// import StorySession from '@/models/StorySession';
// import StoryComment from '@/models/StoryComment';

// export async function GET(request: Request) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || session.user.role !== 'admin') {
//       return NextResponse.json(
//         { error: 'Admin access required' },
//         { status: 403 }
//       );
//     }

//     const { searchParams } = new URL(request.url);
//     const status = searchParams.get('status');
//     const author = searchParams.get('author');
//     const page = parseInt(searchParams.get('page') || '1');
//     const limit = parseInt(searchParams.get('limit') || '20');

//     await connectToDatabase();

//     // Build query for REAL story sessions from your database
//     let query: any = {};
//     if (status && status !== 'all') {
//       query.status = status;
//     }
//     if (author) {
//       query.childId = author;
//     }

//     // Get REAL stories from your StorySession collection
//     const stories = await StorySession.find(query)
//       .populate('childId', 'firstName lastName email subscriptionTier')
//       .sort({ updatedAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(limit);

//     // Get REAL comment counts for each story
//     const storiesWithComments = await Promise.all(
//       stories.map(async (story) => {
//         const [commentCount, unresolvedComments] = await Promise.all([
//           StoryComment.countDocuments({ storyId: story._id }),
//           StoryComment.countDocuments({
//             storyId: story._id,
//             isResolved: false,
//           }),
//         ]);

//         return {
//           _id: story._id,
//           title: story.title,
//           status: story.status,
//           storyNumber: story.storyNumber,
//           totalWords: story.totalWords || 0,
//           childWords: story.childWords || 0,
//           apiCallsUsed: story.apiCallsUsed || 0,
//           maxApiCalls: story.maxApiCalls || 7,
//           createdAt: story.createdAt,
//           updatedAt: story.updatedAt,
//           completedAt: story.completedAt,
//           child: story.childId,
//           commentCount,
//           unresolvedComments,
//         };
//       })
//     );

//     const totalStories = await StorySession.countDocuments(query);

//     return NextResponse.json({
//       success: true,
//       stories: storiesWithComments,
//       pagination: {
//         page,
//         limit,
//         total: totalStories,
//         pages: Math.ceil(totalStories / limit),
//       },
//     });
//   } catch (error) {
//     console.error('Error fetching admin stories:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch stories' },
//       { status: 500 }
//     );
//   }
// }

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import StoryComment from '@/models/StoryComment';

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
    const status = searchParams.get('status');
    const author = searchParams.get('author');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    await connectToDatabase();

    // Build query for REAL story sessions from your database
    let query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (author) {
      query.childId = author;
    }

    // Get REAL stories from your StorySession collection
    const stories = await StorySession.find(query)
      .populate('childId', 'firstName lastName email subscriptionTier')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get REAL comment counts for each story
    const storiesWithComments = await Promise.all(
      stories.map(async (story) => {
        const [commentCount, unresolvedComments] = await Promise.all([
          StoryComment.countDocuments({ storyId: story._id }),
          StoryComment.countDocuments({ 
            storyId: story._id, 
            isResolved: false 
          }),
        ]);

        return {
          _id: story._id,
          title: story.title,
          status: story.status,
          storyNumber: story.storyNumber,
          totalWords: story.totalWords || 0,
          childWords: story.childWords || 0,
          apiCallsUsed: story.apiCallsUsed || 0,
          maxApiCalls: story.maxApiCalls || 7,
          createdAt: story.createdAt,
          updatedAt: story.updatedAt,
          completedAt: story.completedAt,
          child: story.childId,
          commentCount,
          unresolvedComments,
        };
      })
    );

    // Get stats only if not filtering by specific author
    let stats = null;
    if (!author) {
      const [
        totalStories,
        completedStories,
        activeStories,
        pausedStories,
        storiesWithComments,
        storiesWithUnresolvedComments,
        totalComments,
        totalUnresolvedComments,
      ] = await Promise.all([
        StorySession.countDocuments(),
        StorySession.countDocuments({ status: 'completed' }),
        StorySession.countDocuments({ status: 'active' }),
        StorySession.countDocuments({ status: 'paused' }),
        StoryComment.distinct('storyId').then(ids => ids.length),
        StoryComment.distinct('storyId', { isResolved: false }).then(ids => ids.length),
        StoryComment.countDocuments(),
        StoryComment.countDocuments({ isResolved: false }),
      ]);

      stats = {
        totalStories,
        completedStories,
        activeStories,
        pausedStories,
        storiesWithComments,
        storiesWithUnresolvedComments,
        totalComments,
        totalUnresolvedComments,
      };
    }

    const totalStoriesCount = await StorySession.countDocuments(query);

    return NextResponse.json({
      success: true,
      stories: storiesWithComments,
      stats,
      pagination: {
        page,
        limit,
        total: totalStoriesCount,
        pages: Math.ceil(totalStoriesCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching admin stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}
