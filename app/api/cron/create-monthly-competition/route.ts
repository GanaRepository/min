//app/api/cron/create-monthly-competition/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CompetitionManager } from '@/lib/competition-manager';

export async function POST(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    const expectedToken = `Bearer ${process.env.CRON_SECRET_TOKEN}`;

    if (process.env.CRON_SECRET_TOKEN && authHeader !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🎯 Creating new monthly competition...');

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Check if competition already exists for this month
    const existingCompetition = await CompetitionManager.getCurrentCompetition();
    const currentMonth = now.toLocaleDateString('en-US', { month: 'long' });
    
    if (existingCompetition && existingCompetition.month === currentMonth && existingCompetition.year === year) {
      return NextResponse.json({
        success: true,
        message: `Competition for ${currentMonth} ${year} already exists`,
        competition: existingCompetition,
        timestamp: new Date().toISOString(),
      });
    }

    // Create new competition
    const newCompetition = await CompetitionManager.createMonthlyCompetition(year, month);

    return NextResponse.json({
      success: true,
      message: `New competition created for ${newCompetition.month} ${newCompetition.year}`,
      competition: {
        id: newCompetition._id,
        month: newCompetition.month,
        year: newCompetition.year,
        phase: newCompetition.phase,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Failed to create monthly competition:', error);
    return NextResponse.json(
      { error: 'Failed to create monthly competition' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}