// app/api/competitions/current/route.ts - Get Current Competition
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import { competitionManager } from '@/lib/competition-manager';

export async function GET() {
  try {
    await connectToDatabase();
    
    const competition = await competitionManager.getCurrentCompetition();
    const stats = await competitionManager.getCompetitionStats(competition?._id?.toString());
    
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