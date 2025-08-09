import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';

export async function GET(
  request: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const story = await StorySession.findOne({
      _id: params.storyId,
      childId: session.user.id
    });

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Get story content
    let content = '';
    if (story.isUploadedForAssessment && story.aiOpening) {
      content = story.aiOpening;
    } else {
      // Get turns for collaborative stories
      const turns = await Turn.find({ sessionId: params.storyId })
        .sort({ turnNumber: 1 });
      
      content = turns
        .map(turn => turn.childInput || turn.aiResponse || '')
        .filter(text => text.trim())
        .join('\n\n');
    }

    const storyData = {
      _id: story._id,
      title: story.title,
      storyNumber: story.storyNumber,
      status: story.status,
      totalWords: story.totalWords,
      childWords: story.childWords,
      isUploadedForAssessment: story.isUploadedForAssessment,
      isPublished: story.isPublished,
      competitionEligible: story.competitionEligible,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
      elements: story.elements,
      assessment: story.assessment,
      content,
      competitionEntries: story.competitionEntries,
    };

    return NextResponse.json({
      success: true,
      story: storyData
    });

  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story' },
      { status: 500 }
    );
  }
}