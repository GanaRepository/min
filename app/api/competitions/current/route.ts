import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { CompetitionManager } from '@/lib/competition-manager';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const competition = await CompetitionManager.getCurrentCompetition();
    if (!competition) {
      return NextResponse.json({ competition: null });
    }

    // Get user's competition stats if user is a child
    let userStats = null;
    if (session.user.role === 'child') {
      const eligibilityCheck = await CompetitionManager.canUserSubmit(session.user.id);
      const userEntries = await CompetitionManager.getUserCompetitionEntries(session.user.id);

      userStats = {
        entriesUsed: eligibilityCheck.entriesUsed,
        entriesLimit: eligibilityCheck.maxEntries,
        canSubmit: eligibilityCheck.canSubmit,
        userEntries: userEntries
      };
    }

    // Calculate days left based on phase
    const now = new Date();
    let daysLeft = 0;
    
    if (competition.phase === 'submission') {
      daysLeft = Math.max(0, Math.ceil((new Date(competition.submissionEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    } else if (competition.phase === 'judging') {
      daysLeft = Math.max(0, Math.ceil((new Date(competition.judgingEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }

    const competitionData = {
      _id: competition._id,
      month: competition.month,
      year: competition.year,
      phase: competition.phase,
      daysLeft,
      totalSubmissions: competition.totalSubmissions || 0,
      totalParticipants: competition.totalParticipants || 0,
      winners: competition.winners || [],
      userStats
    };

    return NextResponse.json({ competition: competitionData });
  } catch (error) {
    console.error('Error fetching current competition:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}