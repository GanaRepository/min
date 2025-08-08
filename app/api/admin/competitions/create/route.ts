// app/api/admin/competitions/create/route.ts (Fixed)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import Competition from '@/models/Competition';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { month, year, theme, description, judgingCriteria } = await request.json();

    if (!month || !year) {
      return NextResponse.json({ 
        error: 'Month and year are required' 
      }, { status: 400 });
    }

    await connectToDatabase();

    // Check if competition already exists
    const existingCompetition = await Competition.findOne({ 
      month: month,
      year: parseInt(year.toString())
    });
    
    if (existingCompetition) {
      return NextResponse.json({ 
        error: 'Competition already exists for this month/year' 
      }, { status: 400 });
    }

    const competition = new Competition({
      month,
      year: parseInt(year.toString()),
      theme: theme || '',
      description: description || '',
      phase: 'submission',
      isActive: true,
      submissionStart: new Date(),
      submissionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      judgingStart: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
      judgingEnd: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      resultsDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
      judgingCriteria: judgingCriteria || {
        grammar: 0.2,
        creativity: 0.25,
        structure: 0.15,
        characterDev: 0.15,
        plotOriginality: 0.15,
        vocabulary: 0.1,
      },
      createdBy: session.user.id,
      createdAt: new Date(),
    });

    await competition.save();

    return NextResponse.json({
      success: true,
      competition,
      message: `Competition for ${month} ${year} created successfully`,
    });

  } catch (error) {
    console.error('Error creating competition:', error);
    return NextResponse.json({ 
      error: 'Failed to create competition' 
    }, { status: 500 });
  }
}