// app/api/stories/session/[sessionId]/assessment/route.ts - FIXED: Get existing assessment
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import  StorySession  from '@/models/StorySession';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const userSession = await getServerSession(authOptions);
    const { sessionId } = params;

    if (!userSession || userSession.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Unauthorized access. Children only.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    console.log('Fetching assessment for sessionId:', sessionId);

    // Find the story session with flexible ID lookup
    let storySession = null;

    if (mongoose.Types.ObjectId.isValid(sessionId)) {
      storySession = await StorySession.findOne({
        _id: sessionId,
        childId: userSession.user.id,
      });
    } else if (!isNaN(Number(sessionId))) {
      storySession = await StorySession.findOne({
        storyNumber: Number(sessionId),
        childId: userSession.user.id,
      });
    }

    if (!storySession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if story is completed
    if (storySession.status !== 'completed') {
      return NextResponse.json(
        { error: 'Story not completed yet' },
        { status: 400 }
      );
    }

    // Return existing assessment if available
    if (storySession.assessment) {
      console.log('Found existing detailed assessment');
      return NextResponse.json({ assessment: storySession.assessment });
    }

    // If no detailed assessment but has basic scores, create a compatible assessment
    if (storySession.grammarScore && storySession.creativityScore && storySession.overallScore) {
      console.log('Creating compatible assessment from basic scores');
      
      const compatibleAssessment = {
        grammarScore: storySession.grammarScore,
        creativityScore: storySession.creativityScore,
        overallScore: storySession.overallScore,
        readingLevel: 'Elementary',
        vocabularyScore: storySession.grammarScore, // Use grammar as fallback
        structureScore: storySession.creativityScore, // Use creativity as fallback
        characterDevelopmentScore: storySession.overallScore,
        plotDevelopmentScore: storySession.creativityScore,
        feedback: storySession.feedback || 'Great work on your creative story!',
        strengths: ['Creative imagination', 'Good story flow', 'Engaging characters', 'Descriptive writing', 'Story structure'],
        improvements: ['Add more dialogue', 'Use more descriptive words', 'Vary sentence length'],
        vocabularyUsed: ['adventure', 'mysterious', 'brave', 'discovered', 'amazing'],
        suggestedWords: ['magnificent', 'extraordinary', 'perilous', 'astonishing', 'triumphant'],
        educationalInsights: 'Keep developing your creative writing skills! Your storytelling abilities are improving.'
      };

      return NextResponse.json({ assessment: compatibleAssessment });
    }

    // No assessment found
    console.log('No assessment found for session:', sessionId);
    return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });

  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}