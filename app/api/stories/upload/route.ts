// app/api/stories/upload/route.ts - Updated for 13-Factor Assessment

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import { UsageManager } from '@/lib/usage-manager';
import { SingleCallAssessmentEngine } from '@/lib/ai/SingleCallAssessmentEngine';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Story upload request received');

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'child') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await connectToDatabase();

    const canAssess = await UsageManager.canRequestAssessment(session.user.id);
    if (!canAssess.allowed) {
      console.log(`❌ Assessment upload denied: ${canAssess.reason}`);
      return NextResponse.json(
        {
          error: canAssess.reason,
          upgradeRequired: canAssess.upgradeRequired,
        },
        { status: 403 }
      );
    }

    console.log('✅ User can request assessment, proceeding with upload...');

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const file = formData.get('file') as File | null;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Story title is required' }, { status: 400 });
    }

    let storyContent = '';
    if (file) {
      storyContent = await file.text();
    } else if (content?.trim()) {
      storyContent = content.trim();
    } else {
      return NextResponse.json({ error: 'Story content is required' }, { status: 400 });
    }

    const wordCount = storyContent.split(/\s+/).filter(Boolean).length;
    if (wordCount < 10) {
      return NextResponse.json({ error: 'Story must be at least 10 words long' }, { status: 400 });
    }

    // Count user's existing stories to set storyNumber
    const userStoryCount = await StorySession.countDocuments({
      childId: session.user.id,
    });
    const nextStoryNumber = userStoryCount + 1;

    // Create base story session
    const storySession = new StorySession({
      childId: session.user.id,
      title: title.trim(),
      content: storyContent,
      storyNumber: nextStoryNumber,
      status: 'completed',
      totalWords: wordCount,
      childWords: wordCount,
      currentTurn: 1,
      isUploadedForAssessment: true,
      storyType: 'uploaded',
      competitionEligible: wordCount >= 350 && wordCount <= 2000,
    });

    await storySession.save();
    console.log(`✅ Story saved with ID: ${storySession._id}`);

    try {
      console.log('🎯 Generating 13-factor teacher assessment for story:', storySession.title);

      // ✅ Use new 13-factor assessment
      const assessment = await SingleCallAssessmentEngine.performAssessment(storyContent, {
        childAge: 10, // you may replace with real age if available
        storyTitle: storySession.title,
      });

      console.log('✅ 13-factor assessment completed successfully');

      // Wrap assessment in consistent structure
      const assessmentData = {
        version: '1.0-13-factor',
        date: new Date().toISOString(),
        type: 'uploaded',
        fullFeedback: assessment, // all 13 teacher-style categories
      };

      // Update story session with teacher-style assessment
      await StorySession.findByIdAndUpdate(storySession._id, {
        $set: {
          assessment: assessmentData,
          status: 'completed',
          lastAssessedAt: new Date(),
        },
      });

      // Track usage
      await UsageManager.incrementAssessmentRequest(session.user.id, storySession._id.toString());

      return NextResponse.json({
        success: true,
        storyId: storySession._id,
        story: {
          id: storySession._id,
          title: storySession.title,
          wordCount,
          storyNumber: storySession.storyNumber,
        },
        assessment: {
          version: '1.0-13-factor',
          summary: 'Detailed teacher feedback available',
        },
        message: 'Story uploaded and assessed with 13 teacher-style factors!',
      });
    } catch (assessmentError) {
      console.error('❌ 13-factor assessment failed:', assessmentError);
      let message = 'Unknown error';
      if (assessmentError && typeof assessmentError === 'object' && 'message' in assessmentError) {
        message = (assessmentError as any).message;
      }
      throw new Error(`Assessment failed: ${message}`);
    }
  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json(
      {
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
