// app/api/admin/competitions/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import Competition from '@/models/Competition';
import StorySession from '@/models/StorySession';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'all';

    await connectToDatabase();

    // Build date filter
    let dateFilter: any = {};
    const now = new Date();

    switch (timeframe) {
      case 'last6months':
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        dateFilter = { createdAt: { $gte: sixMonthsAgo } };
        break;
      case 'lastyear':
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        dateFilter = { createdAt: { $gte: oneYearAgo } };
        break;
    }

    // 1. Basic Competition Stats
    const [totalCompetitions, activeCompetitions, completedCompetitions] =
      await Promise.all([
        Competition.countDocuments(dateFilter),
        Competition.countDocuments({ ...dateFilter, isActive: true }),
        Competition.countDocuments({ ...dateFilter, phase: 'results' }),
      ]);

    // 2. Get all competitions for analysis
    const competitions = await Competition.find(dateFilter)
      .sort({ createdAt: -1 })
      .lean();

    // 3. Calculate totals manually
    const totalSubmissions = competitions.reduce(
      (sum, comp) => sum + (comp.totalSubmissions || 0),
      0
    );
    const totalParticipants = competitions.reduce(
      (sum, comp) => sum + (comp.totalParticipants || 0),
      0
    );
    const avgSubmissions =
      totalCompetitions > 0
        ? Math.round(totalSubmissions / totalCompetitions)
        : 0;
    const avgParticipants =
      totalCompetitions > 0
        ? Math.round(totalParticipants / totalCompetitions)
        : 0;

    // 4. Phase Distribution
    const phaseDistribution = competitions.reduce((acc: any, comp) => {
      acc[comp.phase] = (acc[comp.phase] || 0) + 1;
      return acc;
    }, {});

    // 5. Monthly Trends
    const monthlyTrends = competitions.reduce((acc: any, comp) => {
      const key = `${comp.month} ${comp.year}`;
      if (!acc[key]) {
        acc[key] = {
          period: key,
          competitions: 0,
          submissions: 0,
          participants: 0,
        };
      }
      acc[key].competitions += 1;
      acc[key].submissions += comp.totalSubmissions || 0;
      acc[key].participants += comp.totalParticipants || 0;
      return acc;
    }, {});

    const competitionTrends = Object.values(monthlyTrends);

    // 6. Top Competitions
    const topCompetitions = competitions
      .sort((a, b) => (b.totalSubmissions || 0) - (a.totalSubmissions || 0))
      .slice(0, 10)
      .map((comp) => ({
        _id: comp._id,
        month: comp.month,
        year: comp.year,
        totalSubmissions: comp.totalSubmissions || 0,
        totalParticipants: comp.totalParticipants || 0,
        phase: comp.phase,
        winnersCount: comp.winners?.length || 0,
      }));

    // 7. Winner Analysis - Get from competitions with winners
    const winnersData = competitions
      .filter((comp) => comp.winners && comp.winners.length > 0)
      .flatMap((comp) => comp.winners || []);

    const winnerAnalysis = winnersData.reduce((acc: any, winner) => {
      const name = winner.childName;
      if (!acc[name]) {
        acc[name] = {
          childName: name,
          totalWins: 0,
          positions: [],
          avgScore: 0,
          scores: [],
        };
      }
      acc[name].totalWins += 1;
      acc[name].positions.push(winner.position);
      if (winner.score) {
        acc[name].scores.push(winner.score);
      }
      return acc;
    }, {});

    // Calculate average scores for winners
    Object.values(winnerAnalysis).forEach((winner: any) => {
      if (winner.scores.length > 0) {
        winner.avgScore = Math.round(
          winner.scores.reduce((sum: number, score: number) => sum + score, 0) /
            winner.scores.length
        );
      }
      delete winner.scores; // Remove raw scores from response
    });

    const topWinners = Object.values(winnerAnalysis)
      .sort(
        (a: any, b: any) => b.totalWins - a.totalWins || b.avgScore - a.avgScore
      )
      .slice(0, 10);

    // 8. Simple Scoring Analytics
    let scoringAnalytics = {
      totalScored: 0,
      avgScore: 0,
      scoreDistribution: {},
    };

    try {
      const submissionsWithScores = await StorySession.find({
        'competitionEntries.score': { $exists: true, $ne: null },
      })
        .select('competitionEntries')
        .lean();

      const allScores = submissionsWithScores
        .flatMap((story) => story.competitionEntries || [])
        .filter((entry) => entry.score != null)
        .map((entry) => entry.score);

      if (allScores.length > 0) {
        scoringAnalytics.totalScored = allScores.length;
        scoringAnalytics.avgScore = Math.round(
          allScores.reduce((sum, score) => sum + score, 0) / allScores.length
        );

        // Score distribution
        const distribution: any = {
          '0-20': 0,
          '21-40': 0,
          '41-60': 0,
          '61-80': 0,
          '81-100': 0,
        };

        allScores.forEach((score) => {
          if (score <= 20) distribution['0-20']++;
          else if (score <= 40) distribution['21-40']++;
          else if (score <= 60) distribution['41-60']++;
          else if (score <= 80) distribution['61-80']++;
          else distribution['81-100']++;
        });

        scoringAnalytics.scoreDistribution = distribution;
      }
    } catch (error) {
      console.warn('Error calculating scoring analytics:', error);
    }

    // Compile response
    const analytics = {
      overview: {
        totalCompetitions,
        activeCompetitions,
        completedCompetitions,
        totalSubmissions,
        totalParticipants,
        avgSubmissions,
        avgParticipants,
        completionRate:
          totalCompetitions > 0
            ? Math.round((completedCompetitions / totalCompetitions) * 100)
            : 0,
      },
      trends: {
        competitionTrends,
        phaseDistribution: Object.entries(phaseDistribution).map(
          ([phase, count]) => ({
            phase,
            count,
          })
        ),
      },
      performance: {
        topCompetitions,
        topWinners,
      },
      scoring: scoringAnalytics,
      timeframe,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error('❌ Error generating competition analytics:', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    );
  }
}

// POST - Generate basic custom report
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { startDate, endDate, competitionIds } = body;

    await connectToDatabase();

    // Build query
    let query: any = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (competitionIds && competitionIds.length > 0) {
      query._id = { $in: competitionIds };
    }

    // Get competitions
    const competitions = await Competition.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Format for export
    const exportData = competitions.map((comp) => ({
      month: comp.month,
      year: comp.year,
      phase: comp.phase,
      isActive: comp.isActive,
      totalSubmissions: comp.totalSubmissions || 0,
      totalParticipants: comp.totalParticipants || 0,
      winnersCount: comp.winners?.length || 0,
      createdAt: comp.createdAt,
      resultsDate: comp.resultsDate || null,
    }));

    return NextResponse.json({
      success: true,
      data: exportData,
      summary: {
        totalCompetitions: competitions.length,
        totalSubmissions: competitions.reduce(
          (sum, comp) => sum + (comp.totalSubmissions || 0),
          0
        ),
        totalParticipants: competitions.reduce(
          (sum, comp) => sum + (comp.totalParticipants || 0),
          0
        ),
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error generating custom report:', error);
    return NextResponse.json(
      { error: 'Failed to generate custom report' },
      { status: 500 }
    );
  }
}
