// app/api/stories/ai-assess/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { collaborationEngine } from '@/lib/ai/collaboration';
import { AIAssessmentRequest } from '@/types/story';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const body: AIAssessmentRequest = await request.json();
    const { sessionId, finalStory } = body;

    if (!sessionId || !finalStory) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate AI assessment
    const assessment = await collaborationEngine.generateAssessment(
      finalStory,
      finalStory.split(/\s+/).length
    );

    return NextResponse.json({
      success: true,
      assessment
    });

  } catch (error) {
    console.error('Error in AI assessment:', error);
    return NextResponse.json(
      { error: 'Failed to assess story' },
      { status: 500 }
    );
  }
}