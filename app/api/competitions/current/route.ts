// app/api/competitions/current/route.ts - FIXED WITH REAL-TIME STATS
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import { competitionManager } from '@/lib/competition-manager';
import Competition from '@/models/Competition';
import StorySession from '@/models/StorySession';

export const dynamic = 'force-dynamic';

interface CompetitionEntry {
  competitionId: any;
  submittedAt: Date;
  rank?: number;
  score?: number;
}

interface StoryWithCompetition {
  _id: any;
  title: string;
  competitionEntries?: CompetitionEntry[];
  createdAt: Date;
}

export async function GET() {
  try {
    await connectToDatabase();

    console.log('🏆 Fetching current competition...');

    // Get current competition
    const currentCompetition = await competitionManager.getCurrentCompetition();

    if (!currentCompetition) {
      console.log('ℹ️ No current competition found');
      return NextResponse.json({
        success: false,
        message: 'No active competition found',
        competition: null,
      });
    }

    console.log(
      `📊 Found competition: ${currentCompetition.month} ${currentCompetition.year}`
    );

    // 🔧 CALCULATE REAL-TIME STATISTICS
    const submissions = await StorySession.find({
      'competitionEntries.competitionId': currentCompetition._id,
    })
      .select('childId competitionEntries')
      .lean();

    const realTotalSubmissions = submissions.length;
    const realTotalParticipants = new Set(
      submissions.map((submission) => submission.childId.toString())
    ).size;

    console.log(
      `📈 Real stats: ${realTotalSubmissions} submissions, ${realTotalParticipants} participants`
    );

    // Calculate days left
    let daysLeft = 0;
    const now = new Date();

    switch (currentCompetition.phase) {
      case 'submission':
        if (currentCompetition.submissionEnd) {
          const timeDiff =
            currentCompetition.submissionEnd.getTime() - now.getTime();
          daysLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
        }
        break;
      case 'judging':
        if (currentCompetition.judgingEnd) {
          const timeDiff =
            currentCompetition.judgingEnd.getTime() - now.getTime();
          daysLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
        }
        break;
      default:
        daysLeft = 0;
        break;
    }

    // Get user-specific stats if logged in
    let userStats = null;
    const session = await getServerSession(authOptions);

    if (session && session.user?.role === 'child') {
      console.log(`👤 Getting user stats for: ${session.user.id}`);

      const entriesLimit = 3;

      // Get user's actual competition entries for this competition
      const userEntriesRaw = await StorySession.find({
        childId: session.user.id,
        competitionEntries: {
          $elemMatch: {
            competitionId: currentCompetition._id,
          },
        },
      })
        .select('title competitionEntries createdAt')
        .lean();

      const userEntries: StoryWithCompetition[] = userEntriesRaw.map(
        (entry: any) => ({
          _id: entry._id,
          title: entry.title,
          competitionEntries: entry.competitionEntries,
          createdAt: entry.createdAt,
        })
      );

      // Format user entries with competition-specific data
      const formattedUserEntries = userEntries.map(
        (story: StoryWithCompetition) => {
          const competitionEntry = story.competitionEntries?.find(
            (entry: CompetitionEntry) =>
              entry.competitionId.toString() ===
              currentCompetition._id.toString()
          );

          return {
            storyId: story._id.toString(),
            title: story.title,
            submittedAt: competitionEntry?.submittedAt || story.createdAt,
            rank: competitionEntry?.rank || null,
            score: competitionEntry?.score || null,
          };
        }
      );

      const entriesUsed = formattedUserEntries.length;

      userStats = {
        entriesUsed,
        entriesLimit,
        canSubmit:
          entriesUsed < entriesLimit &&
          currentCompetition.phase === 'submission',
        userEntries: formattedUserEntries,
      };

      console.log(
        `📊 User stats: ${entriesUsed}/${entriesLimit} entries used, can submit: ${userStats.canSubmit}`
      );
    }

    // Format competition response with REAL-TIME stats
    const competitionResponse = {
      _id: currentCompetition._id.toString(),
      month: currentCompetition.month,
      year: currentCompetition.year,
      phase: currentCompetition.phase,
      isActive: currentCompetition.isActive,

      // Timing information - using actual schema field names
      daysLeft,
      submissionStart:
        currentCompetition.submissionStart?.toISOString() || null,
      submissionEnd: currentCompetition.submissionEnd?.toISOString() || null,
      judgingStart: currentCompetition.judgingStart?.toISOString() || null,
      judgingEnd: currentCompetition.judgingEnd?.toISOString() || null,
      resultsDate: currentCompetition.resultsDate?.toISOString() || null,

      // Backwards compatibility aliases (for frontend that might still expect old names)
      submissionDeadline:
        currentCompetition.submissionEnd?.toISOString() || null,
      judgingDeadline: currentCompetition.judgingEnd?.toISOString() || null,

      // 🔧 REAL-TIME STATS (not stored values)
      totalSubmissions: realTotalSubmissions,
      totalParticipants: realTotalParticipants,

      // User-specific data (if logged in)
      userStats,

      // Winners (if in results phase)
      winners:
        currentCompetition.phase === 'results' && currentCompetition.winners
          ? currentCompetition.winners.map((winner: any) => ({
              position: winner.position,
              childId: winner.childId.toString(),
              childName: winner.childName,
              title: winner.title,
              score: winner.score,
            }))
          : null,

      // Judging criteria (for transparency)
      judgingCriteria: currentCompetition.judgingCriteria || {
        grammar: 12,
        creativity: 25,
        structure: 10,
        character: 12,
        plot: 15,
        vocabulary: 10,
        originality: 8,
        engagement: 5,
        aiDetection: 3,
      },

      // Additional metadata
      createdAt: currentCompetition.createdAt,
      updatedAt: currentCompetition.updatedAt,
    };

    console.log('✅ Competition data compiled with real-time stats');

    return NextResponse.json({
      success: true,
      competition: competitionResponse,
      message: `Current competition: ${currentCompetition.month} ${currentCompetition.year}`,
    });
  } catch (error) {
    console.error('❌ Error fetching current competition:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch current competition',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST endpoint for competition actions (admin only) - UNCHANGED
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, competitionId, data } = body;

    await connectToDatabase();

    let result;

    switch (action) {
      case 'advance_phase':
        if (!competitionId) {
          return NextResponse.json(
            { error: 'Competition ID is required' },
            { status: 400 }
          );
        }

        const updatedCompetition =
          await competitionManager.forceAdvancePhase(competitionId);

        result = {
          success: true,
          message: `Competition phase advanced to ${updatedCompetition.phase}`,
          competition: {
            _id: updatedCompetition._id,
            phase: updatedCompetition.phase,
            month: updatedCompetition.month,
            year: updatedCompetition.year,
          },
        };
        break;

      case 'create_new_competition':
        const now = new Date();
        const year = data?.year || now.getFullYear();
        const month = data?.month || now.getMonth() + 1;

        const newCompetition =
          await competitionManager.createMonthlyCompetition(year, month);

        result = {
          success: true,
          message: `New competition created for ${newCompetition.month} ${newCompetition.year}`,
          competition: {
            _id: newCompetition._id,
            month: newCompetition.month,
            year: newCompetition.year,
            phase: newCompetition.phase,
          },
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }

    console.log(`✅ Competition action completed: ${action}`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Error processing competition action:', error);
    return NextResponse.json(
      {
        error: 'Failed to process competition action',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
