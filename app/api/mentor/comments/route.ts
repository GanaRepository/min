// PATCH method for updating a comment (e.g., mark as resolved)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'mentor') {
      return NextResponse.json(
        { error: 'Mentor access required' },
        { status: 403 }
      );
    }

    // Extract commentId from URL (e.g., /api/mentor/comments/[id])
    const url = new URL(request.url);
    const paths = url.pathname.split('/');
    const commentId = paths[paths.length - 1];
    if (!commentId || commentId.length < 10) {
      return NextResponse.json({ error: 'Invalid comment ID' }, { status: 400 });
    }

    const { isResolved, comment } = await request.json();
    await connectToDatabase();
    const update: any = {};
    if (typeof isResolved === 'boolean') {
      update.isResolved = isResolved;
      if (isResolved) update.resolvedAt = new Date();
      else update.resolvedAt = null;
    }
    if (typeof comment === 'string') {
      update.comment = comment;
    }
    const updated = await StoryComment.findOneAndUpdate(
      { _id: commentId, authorId: session.user.id },
      { $set: update },
      { new: true }
    );
    if (!updated) {
      return NextResponse.json({ error: 'Comment not found or not authorized' }, { status: 404 });
    }
    return NextResponse.json({ success: true, comment: updated });
  } catch (error) {
    console.error('Error updating mentor comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}
// Add the POST method for adding comments
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'mentor') {
      return NextResponse.json(
        { error: 'Mentor access required' },
        { status: 403 }
      );
    }

    const { storyId, comment, commentType } = await request.json();

    if (!storyId || !comment) {
      return NextResponse.json(
        { error: 'Story ID and comment are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Optionally, check that this mentor is assigned to the child for this story
    const story = await (await import('@/models/StorySession')).default.findById(storyId);
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    const MentorAssignment = (await import('@/models/MentorAssignment')).default;
    const assignment = await MentorAssignment.findOne({ mentorId: session.user.id, childId: story.childId, isActive: { $ne: false } });
    if (!assignment) {
      return NextResponse.json({ error: 'Not authorized for this story' }, { status: 403 });
    }

    const newComment = await StoryComment.create({
      storyId,
      comment,
      commentType: commentType || 'general',
      authorId: session.user.id,
      authorRole: 'mentor',
      mentorId: session.user.id, // for backward compatibility if needed
      isResolved: false,
      createdAt: new Date(),
    });

    const populatedComment = await StoryComment.findById(newComment._id)
      .populate('authorId', 'firstName lastName role');

    return NextResponse.json({
      success: true,
      comment: populatedComment,
    });
  } catch (error) {
    console.error('Error creating mentor comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
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
    const commentType = searchParams.get('commentType');
    const isResolved = searchParams.get('isResolved');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    await connectToDatabase();

    const mentorId = session.user.id;

    // Build query for mentor's comments only
    let query: any = { authorId: mentorId };

    if (commentType && commentType !== 'all') {
      query.commentType = commentType;
    }

    if (isResolved && isResolved !== 'all') {
      query.isResolved = isResolved === 'true';
    }

    // Get comments with populated story data
    const comments = await StoryComment.find(query)
      .populate({
        path: 'storyId',
        select: 'title childId',
        populate: {
          path: 'childId',
          select: 'firstName lastName',
        },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get response counts for each comment (if there's a comment threading system)
    const commentsWithResponses = await Promise.all(
      comments.map(async (comment) => {
        // This would require a comment threading system
        // For now, we'll set responses to 0
        const responses = 0;

        return {
          ...comment.toObject(),
          responses,
        };
      })
    );

    const totalComments = await StoryComment.countDocuments(query);

    return NextResponse.json({
      success: true,
      comments: commentsWithResponses,
      pagination: {
        page,
        limit,
        total: totalComments,
        pages: Math.ceil(totalComments / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching mentor comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
