export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import StoryComment from '@/models/StoryComment';
import Turn from '@/models/Turn'; // ✅ Changed from StoryTurn to Turn

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;

    await connectToDatabase();

    // Get REAL story from your database
    const story = await StorySession.findById(id)
      .populate('childId', 'firstName lastName email subscriptionTier');

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Get REAL comments for this story
    const comments = await StoryComment.find({ storyId: id })
      .populate('authorId', 'firstName lastName role')
      .populate('resolvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Get REAL story turns to build the content - Fixed the query
    const turns = await Turn.find({ sessionId: id })
      .sort({ turnNumber: 1 });

    // Build the complete story content from turns
    let content = story.aiOpening || '';
    turns.forEach((turn: any) => { // Added type annotation to fix the 'any' error
      if (turn.childInput) {
        content += `\n\n${turn.childInput}`;
      }
      if (turn.aiResponse) {
        content += `\n\n${turn.aiResponse}`;
      }
    });

    const storyWithDetails = {
      _id: story._id,
      title: story.title,
      status: story.status,
      storyNumber: story.storyNumber,
      totalWords: story.totalWords || 0,
      childWords: story.childWords || 0,
      apiCallsUsed: story.apiCallsUsed || 0,
      maxApiCalls: story.maxApiCalls || 7,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
      completedAt: story.completedAt,
      child: story.childId,
      comments,
      content,
      elements: story.elements,
    };

    return NextResponse.json({
      success: true,
      story: storyWithDetails,
    });
  } catch (error) {
    console.error('Error fetching story details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story details' },
      { status: 500 }
    );
  }
}