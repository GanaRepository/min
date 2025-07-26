// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/utils/authOptions';
// import { connectToDatabase } from '@/utils/db';
// import StoryComment from '@/models/StoryComment';
// import StorySession from '@/models/StorySession';

// // GET - Get comments for a specific story (children can see comments on their stories)
// export async function GET(
//   request: Request,
//   { params }: { params: { storyId: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session) {
//       return NextResponse.json(
//         { error: 'Authentication required' },
//         { status: 401 }
//       );
//     }

//     const { storyId } = params;

//     await connectToDatabase();

//     // Check if user has access to this story
//     const story = await StorySession.findById(storyId);
//     if (!story) {
//       return NextResponse.json(
//         { error: 'Story not found' },
//         { status: 404 }
//       );
//     }

//     // Children can only see comments on their own stories
//     // Admins and mentors can see comments on any story
//     if (
//       session.user.role === 'child' && 
//       story.childId.toString() !== session.user.id
//     ) {
//       return NextResponse.json(
//         { error: 'Access denied' },
//         { status: 403 }
//       );
//     }

//     // Get comments for this story
//     const comments = await StoryComment.find({ storyId })
//       .populate('authorId', 'firstName lastName role')
//       .populate('resolvedBy', 'firstName lastName')
//       .sort({ createdAt: 1 }); // Oldest first for reading flow

//     return NextResponse.json({
//       success: true,
//       comments
//     });

//   } catch (error) {
//     console.error('Error fetching story comments:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch comments' },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import User from '@/models/User';
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const role = searchParams.get('role'); // For filtering by user role
    const sortBy = searchParams.get('sortBy') || 'updatedAt'; // Default sort
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    await connectToDatabase();

    // Build match query
    const matchQuery: any = {};
    if (status) matchQuery.status = status;
    if (userId) matchQuery.childId = userId;

    // Build user match query for role filtering
    const userMatchQuery: any = {};
    if (role) userMatchQuery.role = role;

    // Get stories with user info, comment counts, and subscription details
    const stories = await StorySession.aggregate([
      // Match stories first
      { $match: matchQuery },
      
      // Lookup user information
      {
        $lookup: {
          from: 'users',
          localField: 'childId',
          foreignField: '_id',
          as: 'child'
        }
      },
      
      // Lookup comments for each story
      {
        $lookup: {
          from: 'storycomments',
          localField: '_id',
          foreignField: 'storyId',
          as: 'comments'
        }
      },
      
      // Add computed fields
      {
        $addFields: {
          child: { $arrayElemAt: ['$child', 0] },
          commentCount: { $size: '$comments' },
          unresolvedComments: {
            $size: {
              $filter: {
                input: '$comments',
                cond: { $eq: ['$$this.isResolved', false] }
              }
            }
          },
          hasAdminComments: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: '$comments',
                    cond: { $eq: ['$$this.authorRole', 'admin'] }
                  }
                }
              },
              0
            ]
          },
          hasMentorComments: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: '$comments',
                    cond: { $eq: ['$$this.authorRole', 'mentor'] }
                  }
                }
              },
              0
            ]
          },
          recentCommentDate: {
            $max: '$comments.createdAt'
          }
        }
      },
      
      // Filter by user role if specified
      ...(role ? [{ $match: { 'child.role': role } }] : []),
      
      // Remove sensitive data
      {
        $project: {
          'child.password': 0,
          'comments.comment': 0, // Don't include full comment text in list view
          'comments._id': 0
        }
      },
      
      // Sort based on parameters
      { 
        $sort: { 
          [sortBy === 'childName' ? 'child.firstName' : sortBy]: sortOrder,
          // Secondary sort by creation date for consistency
          createdAt: -1
        } 
      },
      
      // Pagination
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ]);

    // Get total count for pagination (separate aggregation)
    const totalCountPipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'childId',
          foreignField: '_id',
          as: 'child'
        }
      },
      {
        $addFields: {
          child: { $arrayElemAt: ['$child', 0] }
        }
      },
      ...(role ? [{ $match: { 'child.role': role } }] : []),
      { $count: 'total' }
    ];

    const totalCountResult = await StorySession.aggregate(totalCountPipeline);
    const totalCount = totalCountResult[0]?.total || 0;

    // Get summary statistics
    const summaryStats = await StorySession.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'childId',
          foreignField: '_id',
          as: 'child'
        }
      },
      {
        $lookup: {
          from: 'storycomments',
          localField: '_id',
          foreignField: 'storyId',
          as: 'comments'
        }
      },
      {
        $addFields: {
          child: { $arrayElemAt: ['$child', 0] },
          unresolvedComments: {
            $size: {
              $filter: {
                input: '$comments',
                cond: { $eq: ['$$this.isResolved', false] }
              }
            }
          }
        }
      },
      ...(role ? [{ $match: { 'child.role': role } }] : []),
      {
        $group: {
          _id: null,
          totalStories: { $sum: 1 },
          completedStories: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          activeStories: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          pausedStories: {
            $sum: { $cond: [{ $eq: ['$status', 'paused'] }, 1, 0] }
          },
          storiesWithComments: {
            $sum: { $cond: [{ $gt: [{ $size: '$comments' }, 0] }, 1, 0] }
          },
          storiesWithUnresolvedComments: {
            $sum: { $cond: [{ $gt: ['$unresolvedComments', 0] }, 1, 0] }
          },
          totalComments: { $sum: { $size: '$comments' } },
          totalUnresolvedComments: { $sum: '$unresolvedComments' }
        }
      }
    ]);

    const stats = summaryStats[0] || {
      totalStories: 0,
      completedStories: 0,
      activeStories: 0,
      pausedStories: 0,
      storiesWithComments: 0,
      storiesWithUnresolvedComments: 0,
      totalComments: 0,
      totalUnresolvedComments: 0
    };

    return NextResponse.json({
      success: true,
      stories,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      stats,
      filters: {
        status,
        userId,
        role,
        sortBy,
        sortOrder: sortOrder === 1 ? 'asc' : 'desc'
      }
    });

  } catch (error) {
    console.error('Error fetching admin stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}

// POST - Create a new story (admin creating story for a child)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      childId, 
      title, 
      elements, 
      maxApiCalls = 7,
      notes 
    } = body;

    if (!childId || !title || !elements) {
      return NextResponse.json(
        { error: 'Child ID, title, and story elements are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify the child exists
    const child = await User.findById(childId);
    if (!child || child.role !== 'child') {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      );
    }

    // Get the next story number for this child
    const lastStory = await StorySession.findOne({ childId })
      .sort({ storyNumber: -1 })
      .select('storyNumber');
    
    const storyNumber = (lastStory?.storyNumber || 0) + 1;

    // Create the story session
    const newStory = await StorySession.create({
      childId,
      storyNumber,
      title,
      elements,
      currentTurn: 1,
      totalWords: 0,
      childWords: 0,
      apiCallsUsed: 0,
      maxApiCalls,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Add admin note as initial comment if provided
    if (notes) {
      await StoryComment.create({
        storyId: newStory._id,
        authorId: session.user.id,
        authorRole: 'admin',
        comment: notes,
        commentType: 'general',
        isResolved: false
      });
    }

    // Populate the response
    const populatedStory = await StorySession.findById(newStory._id)
      .populate('childId', 'firstName lastName email subscriptionTier');

    return NextResponse.json({
      success: true,
      story: populatedStory,
      message: 'Story created successfully'
    });

  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 }
    );
  }
}