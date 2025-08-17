// app/api/stories/[storyId]/comments/route.ts - COMPLETE FIXED VERSION
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StoryComment from '@/models/StoryComment';
import StorySession from '@/models/StorySession';
import MentorAssignment from '@/models/MentorAssignment';

// POST method - Create comment (COMPLETED)
export async function POST(
  request: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['admin', 'mentor'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Access denied. Admins and mentors only.' },
        { status: 403 }
      );
    }

    const { storyId } = params;
    
    // ✅ FIXED: Parse request body
    const body = await request.json();
    const { content, commentType = 'general', category = 'general', isPublic = true } = body;

    // ✅ FIXED: Validate content
    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // ✅ FIXED: Verify story exists
    const story = await StorySession.findById(storyId);
    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // ✅ FIXED: Check access permissions
    let hasAccess = false;
    if (session.user.role === 'admin') {
      hasAccess = true;
    } else if (session.user.role === 'mentor') {
      const assignment = await MentorAssignment.findOne({
        mentorId: session.user.id,
        childId: story.childId,
        isActive: true,
      });
      hasAccess = !!assignment;
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // ✅ FIXED: Create the comment
    const comment = new StoryComment({
      storyId,
      authorId: session.user.id,
      authorRole: session.user.role,
      content: content.trim(),
      commentType,
      category,
      isPublic,
    });

    await comment.save();

    // ✅ FIXED: Populate author info for response
    await comment.populate('authorId', 'firstName lastName email role');

    console.log('✅ Comment created successfully:', comment._id);

    return NextResponse.json({
      success: true,
      comment,
      message: 'Comment added successfully',
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

// GET method - Fetch comments (existing code)
export async function GET(
  request: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { storyId } = params;
    await connectToDatabase();

    // Verify story exists and check access
    const story = await StorySession.findById(storyId);
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    let hasAccess = false;
    if (session.user.role === 'admin') {
      hasAccess = true;
    } else if (session.user.role === 'mentor') {
      const assignment = await MentorAssignment.findOne({
        mentorId: session.user.id,
        childId: story.childId,
        isActive: true,
      });
      hasAccess = !!assignment;
    } else if (session.user.role === 'child') {
      hasAccess = story.childId.toString() === session.user.id;
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get comments
    const comments = await StoryComment.find({ storyId })
      .populate('authorId', 'firstName lastName email role')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}