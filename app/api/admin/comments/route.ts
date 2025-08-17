// app/api/admin/comments/route.ts - UPDATED FOR 9 COMMENTS PER PAGE
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StoryComment from '@/models/StoryComment';

export const dynamic = 'force-dynamic';

// GET method - List all comments for admin
export async function GET(request: NextRequest) {
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
  const limit = parseInt(searchParams.get('limit') || '6');
    const resolved = searchParams.get('resolved');
    const type = searchParams.get('type');

    await connectToDatabase();

    let query: any = {};
    if (resolved === 'false') {
      query.isResolved = false;
    } else if (resolved === 'true') {
      query.isResolved = true;
    }
    if (type && type !== 'all') {
      query.commentType = type;
    }

    const [comments, totalComments] = await Promise.all([
      StoryComment.find(query)
        .populate('authorId', 'firstName lastName email role')
        .populate('storyId', 'title')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      StoryComment.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      comments,
      pagination: {
        page,
        limit,
        total: totalComments,
        pages: Math.ceil(totalComments / limit),
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

// POST method - Create new admin comment (from previous fix)
export async function POST(request: NextRequest) {
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
      storyId, 
      content, 
      commentType = 'admin_feedback', 
      category = 'general', 
      isPublic = true 
    } = body;

    // Validate required fields
    if (!storyId || !content || !content.trim()) {
      return NextResponse.json(
        { error: 'Story ID and comment content are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify story exists
    const StorySession = (await import('@/models/StorySession')).default;
    const story = await StorySession.findById(storyId);
    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Create the admin comment
    const comment = new StoryComment({
      storyId,
      authorId: session.user.id,
      authorRole: 'admin',
      content: content.trim(),
      commentType,
      category,
      isPublic,
    });

    await comment.save();

    // Populate author info for response
    await comment.populate('authorId', 'firstName lastName email role');

    console.log('✅ Admin comment created successfully:', comment._id);

    return NextResponse.json({
      success: true,
      comment,
      message: 'Admin comment added successfully',
    });

  } catch (error) {
    console.error('Error creating admin comment:', error);
    return NextResponse.json(
      { error: 'Failed to create admin comment' },
      { status: 500 }
    );
  }
}