// app/api/community/stories/[id]/comments/route.ts - COMMUNITY COMMENTS
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import StoryComment from '@/models/StoryComment';

export const dynamic = 'force-dynamic';

// POST - Add a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify story exists and is published
    const story = await StorySession.findOne({
      _id: id,
      isPublished: true
    });

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found or not published' },
        { status: 404 }
      );
    }

    // Create the comment
    const comment = new StoryComment({
      storyId: id,
      authorId: session.user.id,
      authorRole: session.user.role,
      content: content.trim(),
      commentType: 'community',
      category: 'community',
      isPublic: true,
      createdAt: new Date()
    });

    await comment.save();

    // Populate author info for response
    await comment.populate('authorId', 'firstName lastName');

    const formattedComment = {
      _id: comment._id.toString(),
      authorId: comment.authorId._id.toString(),
      authorName: `${comment.authorId.firstName} ${comment.authorId.lastName}`,
      content: comment.content,
      createdAt: comment.createdAt,
      likes: 0,
      isLikedByUser: false
    };

    return NextResponse.json({
      success: true,
      comment: formattedComment,
      message: 'Comment added successfully'
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

// GET - Fetch comments for a story
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;

    await connectToDatabase();

    // Verify story exists and is published
    const story = await StorySession.findOne({
      _id: id,
      isPublished: true
    });

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found or not published' },
        { status: 404 }
      );
    }

    // Get public comments for this story
    const comments = await StoryComment.find({
      storyId: id,
      isPublic: true
    })
      .populate('authorId', 'firstName lastName')
      .sort({ createdAt: -1 });

    const userId = session?.user?.id;

    const formattedComments = comments.map(comment => ({
      _id: comment._id.toString(),
      authorId: comment.authorId._id.toString(),
      authorName: `${comment.authorId.firstName} ${comment.authorId.lastName}`,
      content: comment.content,
      createdAt: comment.createdAt,
      likes: (comment.likes || []).length,
      isLikedByUser: userId ? ((comment.likes || []).includes(userId)) : false
    }));

    return NextResponse.json({
      success: true,
      comments: formattedComments
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
