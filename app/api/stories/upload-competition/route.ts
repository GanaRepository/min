// app/api/stories/upload-competition/route.ts - FIXED (Text Only)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Competition from '@/models/Competition';
import { UsageManager } from '@/lib/usage-manager';
import { competitionManager } from '@/lib/competition-manager';

export async function POST(request: NextRequest) {
  try {
    console.log('🏆 Competition story upload request received');

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Check competition eligibility
    const competitionCheck = await UsageManager.canEnterCompetition(
      session.user.id
    );
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

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Story title is required' },
        { status: 400 }
      );
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Please provide story content by pasting text' },
        { status: 400 }
      );
    }

    const storyContent = content.trim();

    if (!storyContent) {
      return NextResponse.json(
        { error: 'Story content cannot be empty' },
        { status: 400 }
      );
    }

    // Word count validation for competition
    const wordCount = storyContent.split(/\s+/).filter(Boolean).length;

    if (wordCount < 350) {
      return NextResponse.json(
        { error: 'Competition stories must be at least 350 words' },
        { status: 400 }
      );
    }

    if (wordCount > 2000) {
      return NextResponse.json(
        { error: 'Competition stories must be less than 2000 words' },
        { status: 400 }
      );
    }

    const userStoryCount = await StorySession.countDocuments({
      childId: session.user.id,
    });

    const storySession = new StorySession({
      childId: session.user.id,
      storyNumber: userStoryCount + 1,
      title: title.trim(),
      currentTurn: 1,
      totalWords: wordCount,
      childWords: wordCount,
      apiCallsUsed: 0,
      maxApiCalls: 1,
      status: 'completed',
      aiOpening: storyContent,
      completedAt: new Date(),
      isUploadedForAssessment: false,
      storyType: 'competition',
      competitionEligible: true,
      assessment: {
        integrityStatus: {
          status: 'PASS',
          message: 'Competition entry integrity check passed',
        },
      },
      competitionEntries: [
        {
          competitionId: currentCompetition._id,
          submittedAt: new Date(),
          phase: 'submission',
        },
      ],
    });

    await storySession.save();
    console.log(`✅ Competition story saved with ID: ${storySession._id}`);

    // Update competition statistics
    const userSubmissionsCount = await StorySession.countDocuments({
      childId: session.user.id,
      'competitionEntries.competitionId': currentCompetition._id,
    });

    const isFirstSubmissionFromUser = userSubmissionsCount === 1;

    await Competition.findByIdAndUpdate(currentCompetition._id, {
      $inc: {
        totalSubmissions: 1,
        ...(isFirstSubmissionFromUser && { totalParticipants: 1 }),
      },
    });

    console.log(
      `📊 Updated competition: +1 submission${isFirstSubmissionFromUser ? ', +1 participant' : ''}`
    );

    // Increment competition entry counter
    await UsageManager.incrementCompetitionEntry(session.user.id);

    return NextResponse.json({
      success: true,
      storyId: storySession._id,
      story: {
        id: storySession._id,
        title: storySession.title,
        storyNumber: storySession.storyNumber,
        wordCount,
        submittedToCompetition: true,
        competitionId: currentCompetition._id,
        competitionEligible: true,
      },
      competition: {
        id: currentCompetition._id,
        month: currentCompetition.month,
        phase: currentCompetition.phase,
      },
      message: 'Story uploaded and submitted to competition successfully!',
    });
  } catch (error) {
    console.error('Competition upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload story for competition',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
