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

    const competitions = await CompetitionManager.getPastCompetitions();

    return NextResponse.json({ competitions });
  } catch (error) {
    console.error('Error fetching past competitions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}