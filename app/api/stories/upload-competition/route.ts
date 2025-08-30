// app/api/user/stories/upload-competition/route.ts - Updated for 13-Factor Assessment

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
    console.log('Competition story upload request received');

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // ✅ Check competition eligibility
    const competitionCheck = await UsageManager.canEnterCompetition(
      session.user.id
    );
    if (!competitionCheck.allowed) {
      return NextResponse.json(
        { error: competitionCheck.reason },
        { status: 403 }
      );
    }

    // ✅ Get current competition
    const currentCompetition = await competitionManager.getCurrentCompetition();
    if (!currentCompetition || currentCompetition.phase !== 'submission') {
      return NextResponse.json(
        { error: 'No active competition or submission phase has ended' },
        { status: 400 }
      );
    }

    // ✅ Parse form data
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

    // ✅ Competition word count validation
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

    // ✅ Get user for story number
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userStoryCount = await StorySession.countDocuments({
      childId: session.user.id,
    });
    const nextStoryNumber = userStoryCount + 1;

    console.log(
      'Running 13-factor teacher assessment for competition entry...'
    );

    try {
      // ✅ Perform 13-factor teacher assessment
      const assessment = await SingleCallAssessmentEngine.performAssessment(
        storyContent,
        {
          childAge: user.age || 10,
          storyTitle: title,
        }
      );

      console.log(`Competition 13-factor assessment completed for "${title}"`);

      // Create 13-factor assessment structure for competition entry
      const competitionAssessment = {
        version: '1.0-13-factor-competition',
        date: new Date().toISOString(),
        type: 'competition',
        fullFeedback: assessment, // all 13 categories with teacher-style comments
      };

      // ✅ Create story session with assessment
      const storySession = new StorySession({
        childId: session.user.id,
        title: title.trim(),
        content: storyContent,
        storyNumber: nextStoryNumber,
        status: 'completed',
        totalWords: wordCount,
        childWords: wordCount,
        currentTurn: 1,
        apiCallsUsed: 1,
        maxApiCalls: 1,
        isUploadedForAssessment: true,
        storyType: 'competition',
        competitionEligible: true,
        assessment: competitionAssessment,
        overallScore: null, // 13-factor does not provide numeric score
        competitionEntries: [
          {
            competitionId: currentCompetition._id,
            submittedAt: new Date(),
            phase: 'submission',
          },
        ],
      });

      await storySession.save();

      // ✅ Update user's competition entry count
      await User.findByIdAndUpdate(session.user.id, {
        $inc: { competitionEntriesThisMonth: 1 },
      });

      console.log(`Competition entry saved with 13-factor assessment`);

      return NextResponse.json({
        success: true,
        message:
          'Story submitted to competition with teacher-style assessment!',
        storyId: storySession._id,
        competitionId: currentCompetition._id,
        assessment: {
          version: '1.0-13-factor',
          summary: 'Detailed teacher feedback available',
        },
      });
    } catch (assessmentError) {
      console.error(
        '13-factor assessment failed for competition entry:',
        assessmentError
      );
      return NextResponse.json(
        {
          error: 'Unable to assess story quality',
          details:
            'Please try submitting again. If the problem persists, contact support.',
        },
        { status: 500 }
      );
    }
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
