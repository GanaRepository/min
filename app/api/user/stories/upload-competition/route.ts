// app/api/stories/upload-competition/route.ts - BASED ON ACTUAL SCHEMA
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import User from '@/models/User';
import { UsageManager } from '@/lib/usage-manager';
import { competitionManager } from '@/lib/competition-manager';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Check competition eligibility
    const competitionCheck = await UsageManager.canEnterCompetition(session.user.id);
    if (!competitionCheck.allowed) {
      return NextResponse.json(
        { error: competitionCheck.reason },
        { status: 403 }
      );
    }

    // Get current competition
    const currentCompetition = await competitionManager.getCurrentCompetition();
    if (!currentCompetition || currentCompetition.phase !== 'submission') {
      return NextResponse.json(
        { error: 'No active competition or submission phase has ended' },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const file = formData.get('file') as File | null;
    const content = formData.get('content') as string | null;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Story title is required' },
        { status: 400 }
      );
    }

    let storyContent = '';

    // Handle file upload or direct content
    if (file && file.size > 0) {
      if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
        return NextResponse.json(
          { error: 'Only .txt files are supported' },
          { status: 400 }
        );
      }
      
      if (file.size > 1024 * 1024) { // 1MB limit
        return NextResponse.json(
          { error: 'File size must be less than 1MB' },
          { status: 400 }
        );
      }

      try {
        storyContent = await file.text();
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to read file' },
          { status: 400 }
        );
      }
    } else if (content?.trim()) {
      storyContent = content.trim();
    } else {
      return NextResponse.json(
        { error: 'Please provide story content' },
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

    // Word count validation for competition
    const wordCount = storyContent.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 100) {
      return NextResponse.json(
        { error: 'Competition stories must be at least 100 words' },
        { status: 400 }
      );
    }

    if (wordCount > 2000) {
      return NextResponse.json(
        { error: 'Competition stories must be less than 2000 words' },
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
      .lean();

    const nextStoryNumber = (lastSession?.storyNumber || 0) + 1;

    // Create story session for competition using actual schema
    const storySession = await StorySession.create({
      childId: session.user.id,
      storyNumber: nextStoryNumber,
      title: title.trim(),
      currentTurn: 7, // Mark as complete
      totalWords: wordCount,
      childWords: wordCount,
      apiCallsUsed: 0,
      maxApiCalls: 0,
      status: 'completed',
      aiOpening: storyContent, // Store the uploaded content
      completedAt: new Date(),
      
      // Publication fields
      isPublished: true, // Auto-publish for competition
      publicationDate: new Date(),
      competitionEligible: true,
      
      // Competition entry using actual schema structure
      competitionEntries: [{
        competitionId: currentCompetition._id,
        submittedAt: new Date(),
        phase: 'submission'
      }]
    });

    // Increment competition entry counter
    await UsageManager.incrementCompetitionEntry(session.user.id);

    return NextResponse.json({
      success: true,
      story: {
        id: storySession._id,
        title: storySession.title,
        storyNumber: storySession.storyNumber,
        wordCount,
        submittedToCompetition: true,
        competitionId: currentCompetition._id,
      },
      message: 'Story uploaded and submitted to competition successfully!',
    });

  } catch (error) {
    console.error('Competition upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload story for competition',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}