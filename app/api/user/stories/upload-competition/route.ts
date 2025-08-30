// app/api/user/stories/upload-competition/route.ts - Updated for 13-Factor Teacher Assessment
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Competition from '@/models/Competition';
import User from '@/models/User';
import { UsageManager } from '@/lib/usage-manager';
import { competitionManager } from '@/lib/competition-manager';
import { SingleCallAssessmentEngine } from '@/lib/ai/SingleCallAssessmentEngine';

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

    // Parse form data
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
    const wordCount = storyContent.split(/\s+/).filter(Boolean).length;

    // Word count validation
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

    // Get user
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get next story number
    const userStoryCount = await StorySession.countDocuments({
      childId: session.user.id,
    });
    const nextStoryNumber = userStoryCount + 1;

    // ✅ Run teacher-style assessment
    console.log(
      '🤖 Running 13-factor Teacher Assessment for competition entry...'
    );
    let assessmentResult;
    try {
      assessmentResult = await SingleCallAssessmentEngine.performAssessment(
        storyContent,
        {
          childAge: user.age || 10,
          storyTitle: title,
        }
      );
      console.log(
        `✅ 13-factor assessment completed for competition story: ${title}`
      );
    } catch (error) {
      console.error(
        '❌ Teacher assessment failed for competition entry:',
        error
      );
      return NextResponse.json(
        {
          error: 'Unable to assess story quality',
          details: 'Please try again later.',
        },
        { status: 500 }
      );
    }

    // ✅ Save story with assessment
    const storySession = await StorySession.create({
      childId: session.user.id,
      storyNumber: nextStoryNumber,
      title: title.trim(),
      content: storyContent,
      totalWords: wordCount,
      childWords: wordCount,
      currentTurn: 7,
      status: 'completed',
      completedAt: new Date(),
      isUploadedForAssessment: true,
      storyType: 'competition',
      competitionEligible: true,
      assessment: {
        version: '1.0-13-factor',
        date: new Date().toISOString(),
        type: 'competition',
        fullFeedback: assessmentResult, // the full 13-category JSON
        note: 'Teacher feedback stored for competition judging',
      },
      competitionEntries: [
        {
          competitionId: currentCompetition._id,
          submittedAt: new Date(),
          phase: 'submission',
        },
      ],
    });

    // Update competition stats
    await competitionManager.updateCompetitionStats(currentCompetition._id);

    return NextResponse.json({
      success: true,
      storyId: storySession._id,
      story: {
        id: storySession._id,
        title: storySession.title,
        wordCount,
        storyNumber: storySession.storyNumber,
        submittedToCompetition: true,
        competitionId: currentCompetition._id,
        competitionEligible: true,
      },
      competition: {
        id: currentCompetition._id,
        month: currentCompetition.month,
        phase: currentCompetition.phase,
      },
      assessment: {
        version: '1.0-13-factor',
        summary: 'Teacher-style feedback saved',
      },
      message:
        'Story assessed with 13 factors and submitted to competition successfully!',
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
