import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';

export async function GET(
  request: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    await connectToDatabase();
    const storySession = await StorySession.findById(params.storyId);
    if (!storySession) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      assessment: storySession.assessment,
      rawAssessment: JSON.stringify(storySession.assessment, null, 2),
    });
  } catch (error) {
    console.error('Debug assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to get assessment' },
      { status: 500 }
    );
  }
}
