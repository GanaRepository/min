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
          select: 'firstName lastName'
        }
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