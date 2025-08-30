// app/api/stories/assessment/[storyId]/route.ts - Updated for 13-Factor Teacher Assessment

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import mongoose from 'mongoose';
import { SingleCallAssessmentEngine } from '@/lib/ai/SingleCallAssessmentEngine';

export async function GET(
  request: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'child') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { storyId } = params;

    await connectToDatabase();

    let storySession = null;
    if (mongoose.Types.ObjectId.isValid(storyId)) {
      storySession = await StorySession.findOne({
        _id: storyId,
        childId: session.user.id,
      });
    } else if (!isNaN(Number(storyId))) {
      storySession = await StorySession.findOne({
        storyNumber: Number(storyId),
        childId: session.user.id,
      });
    }

    if (!storySession) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Build story content
    let storyContent = '';
    if (storySession.isUploadedForAssessment) {
      storyContent = storySession.content || '';
    } else {
      const turns = await Turn.find({ sessionId: storySession._id })
        .sort({ turnNumber: 1 })
        .lean();

      const childInputs = turns
        .filter((turn: any) => turn.childInput?.trim())
        .map((turn: any) => turn.childInput.trim());

      storyContent = childInputs.join('\n\n');
    }

    if (!storyContent.trim()) {
      return NextResponse.json(
        { error: 'No story content found' },
        { status: 400 }
      );
    }

    // Check if we need to generate a new assessment or return existing
    if (storySession.assessment?.assessmentVersion === '1.0-13-factor') {
      console.log('Returning existing 13-factor teacher assessment');
      return NextResponse.json({
        success: true,
        assessment: storySession.assessment,
        storyInfo: {
          title: storySession.title,
          wordCount: storySession.totalWords,
          createdAt: storySession.createdAt,
        },
      });
    }

    console.log(
      `📊 Generating new 13-factor teacher assessment for ${storyContent.length} characters`
    );

    try {
      const assessment = await SingleCallAssessmentEngine.performAssessment(
        storyContent,
        {
          childAge: storySession.childAge || 10,
          storyTitle: storySession.title || 'Untitled Story',
        }
      );

      console.log('✅ 13-factor assessment completed successfully');

      const teacherAssessment = {
        ...assessment,
        assessmentVersion: '1.0-13-factor',
        assessmentDate: new Date().toISOString(),
        assessmentType: storySession.isUploadedForAssessment
          ? 'uploaded'
          : 'collaborative',
        userAge: storySession.childAge || 10,
        wordCount: storyContent.split(/\s+/).filter(Boolean).length,
      };

      // Update story session with new teacher assessment
      await StorySession.findByIdAndUpdate(storySession._id, {
        $set: {
          assessment: teacherAssessment,
          lastAssessedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        assessment: teacherAssessment,
        storyInfo: {
          title: storySession.title,
          wordCount: storySession.totalWords,
          createdAt: storySession.createdAt,
        },
        message: '13-factor teacher assessment completed successfully!',
      });
    } catch (assessmentError) {
      console.error('13-factor assessment failed:', assessmentError);
      let message = 'Unknown error';
      if (
        assessmentError &&
        typeof assessmentError === 'object' &&
        'message' in assessmentError
      ) {
        message = (assessmentError as any).message;
      }
      throw new Error(`Assessment generation failed: ${message}`);
    }
  } catch (error) {
    console.error('Assessment route error:', error);
    return NextResponse.json(
      {
        error: 'Assessment failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
