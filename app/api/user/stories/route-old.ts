// app/api/user/stories/route.ts 
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import PublishedStory from '@/models/PublishedStory';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import mongoose from 'mongoose';

// GET endpoint for fetching user's stories
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const recent = searchParams.get('recent') === 'true';

    await connectToDatabase();

    // Build query
    const query: any = { childId: session.user.id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (type && type !== 'all') {
      if (type === 'uploaded') {
        query.isUploadedForAssessment = true;
      } else if (type === 'freestyle') {
        query.isUploadedForAssessment = { $ne: true };
        query.storyType = 'freestyle';
      } else if (type === 'competition') {
        query.competitionEntries = { $exists: true, $ne: [] };
      }
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Count total documents
    const totalCount = await StorySession.countDocuments(query);

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch stories
    let storiesQuery = StorySession.find(query)
      .sort(recent ? { createdAt: -1 } : { updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const stories = await storiesQuery;

    console.log(
      `📚 Found ${stories.length} stories for user ${session.user.id}`
    );

    // Format stories for response
    const formattedStories = stories.map((story) => {
      const storyObj = story as any;

      return {
        _id: storyObj._id.toString(),
        title: storyObj.title || 'Untitled Story',
        totalWords: storyObj.totalWords || 0,
        childWords: storyObj.childWords || 0,
        aiWords: storyObj.aiWords || 0,
        status: storyObj.status || 'active',
        storyType: storyObj.storyType || 'freestyle',
        isUploadedForAssessment: storyObj.isUploadedForAssessment || false,
        isPublished: storyObj.isPublished || false,
        publishedAt: storyObj.publishedAt || null,
        competitionEligible: storyObj.competitionEligible || false,
        competitionEntries: storyObj.competitionEntries || [],
        assessment: storyObj.assessment || null,
        assessmentAttempts: storyObj.assessmentAttempts || 0,
        maxAssessmentAttempts: 999, // SIMPLIFIED: No per-story limits
        createdAt: storyObj.createdAt,
        updatedAt: storyObj.updatedAt,
        canDelete: false, // UPDATED: Children can no longer delete stories
        canReassess: false, // UPDATED: No more reassess functionality
      };
    });

    // Calculate summary statistics
    const summary = {
      total: totalCount,
      completed: formattedStories.filter((s) => s.status === 'completed')
        .length,
      active: formattedStories.filter((s) => s.status === 'active').length,
      flagged: formattedStories.filter((s) => s.status === 'flagged').length,
      review: formattedStories.filter((s) => s.status === 'review').length,
      published: formattedStories.filter((s) => s.isPublished).length,
      freestyle: formattedStories.filter((s) => s.storyType === 'freestyle')
        .length,
      uploaded: formattedStories.filter((s) => s.storyType === 'uploaded')
        .length,
      competition: formattedStories.filter((s) => s.storyType === 'competition')
        .length,
      totalWords: formattedStories.reduce((sum, s) => sum + s.totalWords, 0),
      totalChildWords: formattedStories.reduce(
        (sum, s) => sum + s.childWords,
        0
      ),
      averageScore:
        formattedStories.length > 0 &&
        formattedStories.some((s) => s.assessment?.overallScore)
          ? Math.round(
              formattedStories
                .filter((s) => s.assessment?.overallScore)
                .reduce(
                  (sum, s) => sum + (s.assessment?.overallScore || 0),
                  0
                ) /
                formattedStories.filter((s) => s.assessment?.overallScore)
                  .length
            )
          : null,
    };

    console.log('📊 Story summary:', summary);

    return NextResponse.json({
      success: true,
      stories: formattedStories,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasNext: skip + limit < totalCount,
        hasPrev: page > 1,
      },
      summary,
      filters: {
        status,
        type,
        recent,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching user stories:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch stories',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST endpoint - SIMPLIFIED: Remove reassess and delete actions
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, storyId } = body;

    if (!action || !storyId) {
      return NextResponse.json(
        { error: 'Action and story ID are required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(storyId)) {
      return NextResponse.json({ error: 'Invalid story ID' }, { status: 400 });
    }

    await connectToDatabase();

    // Get the story and verify ownership
    const story = await StorySession.findOne({
      _id: storyId,
      childId: session.user.id,
    });

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found or access denied' },
        { status: 404 }
      );
    }

    let result: any;

    switch (action) {
      case 'toggle_competition_eligibility':
        story.competitionEligible = !story.competitionEligible;
        await story.save();

        result = {
          success: true,
          message: `Story ${story.competitionEligible ? 'marked as' : 'removed from'} competition eligible`,
          competitionEligible: story.competitionEligible,
        };
        break;

      // REMOVED: request_reassessment action
      case 'request_reassessment':
        return NextResponse.json(
          {
            error:
              'Reassessment functionality has been simplified. Please upload your story again for a new assessment.',
            message:
              'To get a new assessment, go to Create Stories > Upload for Assessment and submit your story again.',
          },
          { status: 400 }
        );

      // REMOVED: delete_story action
      case 'delete_story':
        return NextResponse.json(
          {
            error:
              "Story deletion is not allowed for children's safety. Contact an admin if you need assistance.",
            message:
              'Delete functionality has been disabled to protect your creative work.',
          },
          { status: 403 }
        );

      default:
        return NextResponse.json(
          {
            error:
              'Invalid action specified. Only toggle_competition_eligibility is supported.',
          },
          { status: 400 }
        );
    }

    console.log(`✅ Story action completed: ${action} for story ${storyId}`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Error processing story action:', error);
    return NextResponse.json(
      {
        error: 'Failed to process story action',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint - ADMIN ONLY (children can't access this)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // UPDATED: Only admins can delete stories now
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        {
          error:
            'Admin access required. Children cannot delete stories for safety.',
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const storyIds = searchParams.get('storyIds')?.split(',');
    const deleteType = searchParams.get('type'); // 'flagged', 'incomplete', 'all'

    await connectToDatabase();

    let deleteQuery: any = {};

    if (userId) {
      deleteQuery.childId = new mongoose.Types.ObjectId(userId);
    }

    if (storyIds && storyIds.length > 0) {
      deleteQuery._id = {
        $in: storyIds.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    if (deleteType) {
      switch (deleteType) {
        case 'flagged':
          deleteQuery.status = 'flagged';
          break;
        case 'incomplete':
          deleteQuery.status = 'active';
          deleteQuery.currentTurn = 1;
          break;
        case 'all':
          // No additional filter
          break;
        default:
          return NextResponse.json(
            { error: 'Invalid delete type' },
            { status: 400 }
          );
      }
    }

    // Safety check - don't allow deletion without proper filters
    if (!userId && !storyIds && !deleteType) {
      return NextResponse.json(
        { error: 'Deletion requires specific filters for safety' },
        { status: 400 }
      );
    }

    // Get stories to be deleted
    const storiesToDelete = await StorySession.find(deleteQuery).select('_id');
    const storyIdsToDelete = storiesToDelete.map((s) => s._id);

    if (storyIdsToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No stories found matching deletion criteria',
        deletedCount: 0,
      });
    }

    // Delete associated turns
    await Turn.deleteMany({ sessionId: { $in: storyIdsToDelete } });

    // Delete published story entries
    await PublishedStory.deleteMany({ sessionId: { $in: storyIdsToDelete } });

    // Delete the stories
    const deleteResult = await StorySession.deleteMany(deleteQuery);

    console.log(`🗑️ Admin bulk deleted ${deleteResult.deletedCount} stories`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deleteResult.deletedCount} stories`,
      deletedCount: deleteResult.deletedCount,
      deletedStoryIds: storyIdsToDelete,
    });
  } catch (error) {
    console.error('❌ Error in admin story deletion:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete stories',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
