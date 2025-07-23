import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import { collaborationEngine } from '@/lib/ai/collaboration';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';

export async function POST(req: NextRequest, { params }: { params: { sessionId: string } }) {
  await connectToDatabase();
  const { sessionId } = params;

  // Require authentication and child role
  const userSession = await getServerSession(authOptions);
  if (!userSession || userSession.user.role !== 'child') {
    return NextResponse.json({ error: 'Access denied. Children only.' }, { status: 403 });
  }

  // Find the story session
  const session = await StorySession.findById(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  // Only allow assessment if story is completed
  if (session.status !== 'completed') {
    return NextResponse.json({ error: 'Story not completed' }, { status: 400 });
  }

  // If assessment already exists, return it
  if (session.assessment) {
    return NextResponse.json({ assessment: session.assessment });
  }

  // Get all turns for the session
  const turns = await Turn.find({ sessionId }).sort({ turnNumber: 1 });

  // Aggregate story content from turns
  const storyContent = turns.map(t => t.childInput).join(' ');
  const totalWords = session.childWords || storyContent.split(/\s+/).length;

  // Generate assessment using AI logic
  const assessment = await collaborationEngine.generateAssessment(storyContent, totalWords);

  // Save assessment to session, but DO NOT overwrite childId
  session.assessment = assessment;
  session.status = 'completed';
  await session.save();

  return NextResponse.json({ assessment });
}
