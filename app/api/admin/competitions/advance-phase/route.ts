// app/api/admin/competitions/advance-phase/route.ts - Advance Competition Phase
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { competitionManager } from '@/lib/competition-manager';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { competitionId } = await request.json();
    if (!competitionId) {
      return NextResponse.json({ error: 'Competition ID is required' }, { status: 400 });
    }

    const updatedCompetition = await competitionManager.advancePhase(competitionId);

    return NextResponse.json({
      success: true,
      competition: updatedCompetition,
      message: `Competition advanced to ${updatedCompetition.phase} phase`,
    });
  } catch (error) {
    console.error('Error advancing competition phase:', error);
    return NextResponse.json({ error: 'Failed to advance competition phase' }, { status: 500 });
  }
}