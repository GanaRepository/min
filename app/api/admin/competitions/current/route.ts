// app/api/admin/competitions/current/route.ts - Current Competition
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { competitionManager } from '@/lib/competition-manager';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const competition = await competitionManager.getCurrentCompetition();
    const stats = competition
      ? await competitionManager.getCompetitionStats(competition._id.toString())
      : null;

    return NextResponse.json({
      success: true,
      competition: stats,
    });
  } catch (error) {
    console.error('Error fetching current competition:', error);
    return NextResponse.json(
      { error: 'Failed to fetch current competition' },
      { status: 500 }
    );
  }
}
