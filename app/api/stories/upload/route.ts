// app/api/stories/upload/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import { UsageManager } from '@/lib/usage-manager';
import StorySession from '@/models/StorySession';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Check if user can upload assessment using NEW system
    const usageCheck = await UsageManager.canUploadAssessment(session.user.id);
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { 
          error: usageCheck.reason,
          needsUpgrade: usageCheck.upgradeRequired,
          currentUsage: usageCheck.currentUsage,
          limits: usageCheck.limits,
        },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const file = formData.get('file') as File | null;

    let storyContent = '';

    // Handle file upload or direct content
    if (file) {
      if (file.type === 'text/plain') {
        storyContent = await file.text();
      } else {
        return NextResponse.json(
          { error: 'Unsupported file type. Please upload .txt files or paste text directly.' },
          { status: 400 }
        );
      }
    } else if (content) {
      storyContent = content;
    } else {
      return NextResponse.json(
        { error: 'Please provide story content via file upload or text input' },
        { status: 400 }
      );
    }

    // Validate story content
    if (!storyContent.trim()) {
      return NextResponse.json(
        { error: 'Story content cannot be empty' },
        { status: 400 }
      );
    }

    // Word count validation
    const wordCount = storyContent.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 50) {
      return NextResponse.json(
        { error: 'Story must be at least 50 words long for meaningful assessment' },
        { status: 400 }
      );
    }

    if (wordCount > 5000) {
      return NextResponse.json(
        { error: 'Story must be less than 5,000 words for assessment' },
        { status: 400 }
      );
    }

    // Get user for story number generation
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get next story number
    const lastSession = await StorySession.findOne({ childId: session.user.id })
      .sort({ storyNumber: -1 })
      .select('storyNumber')
      .lean() as Record<string, any> | null;

    const nextStoryNumber = lastSession && typeof lastSession.storyNumber === 'number' ? lastSession.storyNumber + 1 : 1;

    // Create story session for assessment
    const storySession = await StorySession.create({
      childId: session.user.id,
      storyNumber: nextStoryNumber,
      title: title.trim(),
      storyMode: 'freeform',
      isUploadedForAssessment: true,
      currentTurn: 1,
      totalWords: wordCount,
      childWords: wordCount,
      apiCallsUsed: 0,
      maxApiCalls: 0, // No AI collaboration for uploaded stories
      status: 'completed', // Uploaded stories are already complete
      aiOpening: storyContent, // Store the uploaded content here
      completedAt: new Date(),
      assessmentAttempts: 0, // Reset attempts for new upload
    });

    // Increment user's assessment upload counter using NEW system
    await UsageManager.incrementAssessmentUpload(session.user.id);

    console.log(`📝 Story uploaded for assessment: ${storySession._id} by user ${user.email}`);

    return NextResponse.json({
      success: true,
      story: {
        id: storySession._id,
        title: storySession.title,
        storyNumber: storySession.storyNumber,
        wordCount,
        assessmentAttempts: 0,
        maxAttempts: 3,
      },
      message: 'Story uploaded successfully. Ready for AI assessment.',
    });

  } catch (error) {
    console.error('❌ Error uploading story:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload story',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}