import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StoryComment from '@/models/StoryComment';
import StorySession from '@/models/StorySession';
import MentorAssignment from '@/models/MentorAssignment';

export async function POST(
  request: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['admin', 'mentor'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Admin or Mentor access required' },
        { status: 403 }
      );
    }

    const { storyId } = params;
    const body = await request.json();
    const { comment, commentType, position, parentCommentId } = body;

    await connectToDatabase();

    // Verify story exists
    const story = await StorySession.findById(storyId);
    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // If mentor, verify they can access this child's story
    if (session.user.role === 'mentor') {
      const assignment = await MentorAssignment.findOne({
        mentorId: session.user.id,
        childId: story.childId,
        isActive: true
      });

      if (!assignment) {
        return NextResponse.json(
          { error: 'You are not assigned to this student' },
          { status: 403 }
        );
      }
    }

    // Create comment
    const newComment = await StoryComment.create({
      storyId,
      authorId: session.user.id,
      authorRole: session.user.role,
      comment,
      commentType: commentType || 'general',
      position,
      parentCommentId
    });

    // Populate author info for response
    await newComment.populate('authorId', 'firstName lastName email');

    return NextResponse.json({
      success: true,
      comment: newComment
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { storyId } = params;

    await connectToDatabase();

    // Get story to verify access
    const story = await StorySession.findById(storyId);
    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    let hasAccess = false;

    if (session.user.role === 'admin') {
      hasAccess = true;
    } else if (session.user.role === 'mentor') {
      const assignment = await MentorAssignment.findOne({
        mentorId: session.user.id,
        childId: story.childId,
        isActive: true
      });
      hasAccess = !!assignment;
    } else if (session.user.role === 'child') {
      hasAccess = story.childId.toString() === session.user.id;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get comments
    const comments = await StoryComment.find({ storyId })
      .populate('authorId', 'firstName lastName email role')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      comments
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}