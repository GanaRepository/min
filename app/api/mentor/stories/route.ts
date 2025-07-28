export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import MentorAssignment from '@/models/MentorAssignment';
import StorySession from '@/models/StorySession';
import StoryComment from '@/models/StoryComment';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'mentor') {
      return NextResponse.json(
        { error: 'Mentor access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const student = searchParams.get('student');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    await connectToDatabase();

    const mentorId = session.user.id;

    // Get assigned students
    const assignments = await MentorAssignment.find({
      mentorId,
      isActive: { $ne: false },
    });
    const studentIds = assignments.map((a) => a.childId);

    // Build query for stories
    let query: any = { childId: { $in: studentIds } };

    if (status && status !== 'all') {
      if (status === 'pending') {
        // Stories that need mentor review
        query.$or = [
          { needsMentorReview: true },
          // Add other conditions for "needs review"
        ];
      } else {
        query.status = status;
      }
    }

    if (student && student !== 'all') {
      query.childId = student;
    }

    // Get stories with pagination
    const stories = await StorySession.find(query)
      .populate('childId', 'firstName lastName email')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get comment counts and additional data for each story
    const storiesWithMentorData = await Promise.all(
      stories.map(async (story) => {
        const [
          commentCount,
          mentorCommentCount,
          unresolvedComments,
          lastMentorComment,
        ] = await Promise.all([
          StoryComment.countDocuments({ storyId: story._id }),
          StoryComment.countDocuments({
            storyId: story._id,
            authorId: mentorId,
          }),
          StoryComment.countDocuments({
            storyId: story._id,
            isResolved: false,
          }),
          StoryComment.findOne({
            storyId: story._id,
            authorId: mentorId,
          })
            .sort({ createdAt: -1 })
            .select('comment'),
        ]);

        return {
          ...story.toObject(),
          child: story.childId,
          commentCount,
          mentorCommentCount,
          unresolvedComments,
          needsReview: unresolvedComments > 0 || story.needsMentorReview,
          lastMentorComment: lastMentorComment?.comment,
        };
      })
    );

    const totalStories = await StorySession.countDocuments(query);

    return NextResponse.json({
      success: true,
      stories: storiesWithMentorData,
      pagination: {
        page,
        limit,
        total: totalStories,
        pages: Math.ceil(totalStories / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching mentor stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}
