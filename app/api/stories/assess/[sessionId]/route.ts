// app/api/stories/assess/[sessionId]/route.ts - Updated for 13-Factor Teacher Assessment

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import User from '@/models/User';
import { SingleCallAssessmentEngine } from '@/lib/ai/SingleCallAssessmentEngine';
import mongoose from 'mongoose';

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'child') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { sessionId } = params;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const storySession = await StorySession.findOne({
      _id: sessionId,
      childId: session.user.id,
    });

    if (!storySession) {
      return NextResponse.json(
        { error: 'Story session not found' },
        { status: 404 }
      );
    }

    if (storySession.status !== 'completed') {
      return NextResponse.json(
        { error: 'Story must be completed before assessment' },
        { status: 400 }
      );
    }

    // Check if already has 13-factor assessment
    if (storySession.assessment?.assessmentVersion === '1.0-13-factor') {
      return NextResponse.json({
        success: true,
        assessment: storySession.assessment,
        message: 'Returning existing 13-factor assessment',
      });
    }

    // Get user age for assessment
    const user = await User.findById(session.user.id);
    const userAge = user?.age || 10;

    console.log(
      `Generating new 13-factor teacher assessment for session ${sessionId}`
    );

    // Build story content
    let fullStoryContent = '';
    let userContributions = [];

    if (storySession.isUploadedForAssessment) {
      fullStoryContent = storySession.content || '';
      userContributions = [fullStoryContent];
    } else {
      // Collaborative story - rebuild from turns
      const turns = await Turn.find({ sessionId }).sort({ turnNumber: 1 });

      if (storySession.aiOpening) {
        fullStoryContent += `${storySession.aiOpening}\n\n`;
      }

      const childInputs = turns
        .filter((turn) => turn.childInput?.trim())
        .map((turn) => turn.childInput.trim());

      userContributions = childInputs;
      fullStoryContent += childInputs.join('\n\n');
    }

    if (!fullStoryContent || fullStoryContent.trim().length < 50) {
      return NextResponse.json(
        {
          error:
            'Story content too short for meaningful assessment (minimum 50 characters)',
        },
        { status: 400 }
      );
    }

    console.log(
      `Starting teacher-style 13-factor assessment for ${fullStoryContent.length} characters`
    );

    try {
      // Perform teacher-style 13-factor assessment
      const assessment = await SingleCallAssessmentEngine.performAssessment(
        fullStoryContent,
        {
          childAge: userAge,
          storyTitle: storySession.title,
        }
      );

      console.log(`13-factor assessment completed`);

      const teacherAssessment = {
        ...assessment,
        assessmentVersion: '1.0-13-factor',
        assessmentDate: new Date().toISOString(),
        assessmentType: storySession.isUploadedForAssessment
          ? 'uploaded'
          : 'collaborative',
        userAge,
        wordCount: fullStoryContent.split(/\s+/).filter(Boolean).length,
        userContributionCount: userContributions.length,
      };

      // Debug log: print the full teacherAssessment object before saving
      console.log('Saving teacherAssessment to DB:', JSON.stringify(teacherAssessment, null, 2));

      // Update story session with teacher assessment
      await StorySession.findByIdAndUpdate(sessionId, {
        $set: {
          assessment: teacherAssessment,
          lastAssessedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        assessment: teacherAssessment,
        message: '13-factor teacher-style assessment completed successfully!',
        storyInfo: {
          title: storySession.title,
          wordCount: fullStoryContent.split(/\s+/).filter(Boolean).length,
          type: storySession.storyType,
          createdAt: storySession.createdAt,
        },
      });
    } catch (assessmentError) {
      console.error('13-factor assessment failed:', assessmentError);
      return NextResponse.json(
        {
          error: 'Assessment generation failed',
          details:
            assessmentError instanceof Error
              ? assessmentError.message
              : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Assessment route error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate assessment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
