import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StoryComment from '@/models/StoryComment';

// GET - Fetch all comments with filtering
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      (session.user.role !== 'admin' && session.user.role !== 'mentor')
    ) {
      return NextResponse.json(
        { error: 'Admin or mentor access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const storyId = searchParams.get('storyId');
    const authorId = searchParams.get('authorId');
    const commentType = searchParams.get('commentType');
    const isResolved = searchParams.get('isResolved');
    const unresolved = searchParams.get('unresolved') === 'true';

    await connectToDatabase();

    // Build query
    const query: any = {};
    if (storyId) query.storyId = storyId;
    if (authorId) query.authorId = authorId;
    if (commentType) query.commentType = commentType;
    if (isResolved !== null) query.isResolved = isResolved === 'true';
    if (unresolved) query.isResolved = false;

    // Get comments with populated data
    const comments = await StoryComment.find(query)
      .populate('storyId', 'title childId storyNumber')
      .populate('authorId', 'firstName lastName role')
      .populate('resolvedBy', 'firstName lastName')
      .populate({
        path: 'storyId',
        populate: {
          path: 'childId',
          select: 'firstName lastName',
        },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get total count for pagination
    const totalCount = await StoryComment.countDocuments(query);

    return NextResponse.json({
      success: true,
      comments,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST - Create new comment (admin/mentor commenting on a story)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      (session.user.role !== 'admin' && session.user.role !== 'mentor')
    ) {
      return NextResponse.json(
        { error: 'Admin or mentor access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { storyId, comment, commentType, position } = body;

    if (!storyId || !comment) {
      return NextResponse.json(
        { error: 'Story ID and comment are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Create new comment
    const newComment = await StoryComment.create({
      storyId,
      authorId: session.user.id,
      authorRole: session.user.role,
      comment,
      commentType: commentType || 'general',
      position,
      isResolved: false,
      createdAt: new Date(),
    });

    // Populate the comment for response
    const populatedComment = await StoryComment.findById(newComment._id)
      .populate('authorId', 'firstName lastName role')
      .populate('storyId', 'title childId');

    return NextResponse.json({
      success: true,
      comment: populatedComment,
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
