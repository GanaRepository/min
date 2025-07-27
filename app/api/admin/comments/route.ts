export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
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
    const commentType = searchParams.get('commentType');
    const isResolved = searchParams.get('isResolved');
    const unresolved = searchParams.get('unresolved');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    await connectToDatabase();

    // Build query for REAL comments
    let query: any = {};
    
    if (commentType && commentType !== 'all') {
      query.commentType = commentType;
    }
    
    if (isResolved && isResolved !== 'all') {
      query.isResolved = isResolved === 'true';
    }
    
    if (unresolved === 'true') {
      query.isResolved = false;
    }

    // Get REAL comments from your database
    const comments = await StoryComment.find(query)
      .populate('authorId', 'firstName lastName role')
      .populate({
        path: 'storyId',
        select: 'title childId storyNumber',
        populate: {
          path: 'childId',
          select: 'firstName lastName'
        }
      })
      .populate('resolvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalComments = await StoryComment.countDocuments(query);

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
    console.error('Error fetching admin comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// Add the POST method for adding comments
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
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

    const newComment = await StoryComment.create({
      storyId,
      comment,
      commentType: commentType || 'general',
      authorId: session.user.id,
      isResolved: false,
      createdAt: new Date(),
    });

    const populatedComment = await StoryComment.findById(newComment._id)
      .populate('authorId', 'firstName lastName role')
      .populate('storyId', 'title');

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