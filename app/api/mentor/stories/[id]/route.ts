import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import MentorAssignment from '@/models/MentorAssignment';
import StorySession from '@/models/StorySession';
import User from '@/models/User';
import Turn from '@/models/Turn';
import StoryComment from '@/models/StoryComment';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'mentor') {
      return NextResponse.json(
        { success: false, error: 'Mentor access required' },
        { status: 403 }
      );
    }
    await connectToDatabase();
    const mentorId = session.user.id;
    const storyId = params.id;
    // Get the story and populate childId
    const story = await StorySession.findById(storyId).populate(
      'childId',
      'firstName lastName email'
    );
    if (!story) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      );
    }
    // Check if the child is assigned to this mentor
    const assignment = await MentorAssignment.findOne({
      mentorId,
      childId: story.childId._id,
      isActive: { $ne: false },
    });
    if (!assignment) {
      return NextResponse.json(
        { success: false, error: 'Not authorized for this story' },
        { status: 404 }
      );
    }
    // Get comments for this story
    const comments = await StoryComment.find({ storyId: story._id })
      .populate('authorId', 'firstName lastName role')
      .sort({ createdAt: -1 });
    // Get turns and build content
    const turns = await Turn.find({ sessionId: story._id }).sort({
      turnNumber: 1,
    });
    let content = story.aiOpening || '';
    turns.forEach((turn: any) => {
      if (turn.childInput) content += `\n\n${turn.childInput}`;
      if (turn.aiResponse) content += `\n\n${turn.aiResponse}`;
    });
    return NextResponse.json({
      success: true,
      story: {
        _id: story._id,
        title: story.title,
        status: story.status,
        updatedAt: story.updatedAt,
        totalWords: story.totalWords || 0,
        child: story.childId
          ? {
              _id: story.childId._id,
              firstName: story.childId.firstName,
              lastName: story.childId.lastName,
              email: story.childId.email,
            }
          : null,
        content,
      },
      comments,
    });
  } catch (error) {
    console.error('Error fetching mentor story detail:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch story' },
      { status: 500 }
    );
  }
}
