// app/api/competitions/past/route.ts - FIXED WITH REAL-TIME STATS
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import Competition from '@/models/Competition';
import StorySession from '@/models/StorySession';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    console.log('📜 Fetching past competitions...');

    // Get all past competitions (not active or in results phase)
    const pastCompetitions = await Competition.find({
      $or: [
        { isActive: false },
        { phase: 'results' }
      ]
    })
    .sort({ year: -1, createdAt: -1 })
    .lean();

    console.log(`📊 Found ${pastCompetitions.length} past competitions`);

    // Get session for user-specific data
    const session = await getServerSession(authOptions);

    // Calculate real-time stats for each past competition
    const formattedCompetitions = await Promise.all(
      pastCompetitions.map(async (competition: any) => {
        console.log(`📈 Calculating stats for ${competition.month} ${competition.year}...`);

        // 🔧 CALCULATE REAL-TIME STATISTICS
        const submissions = await StorySession.find({
          'competitionEntries.competitionId': competition._id
        }).select('childId competitionEntries').lean();

        const realTotalSubmissions = submissions.length;
        const realTotalParticipants = new Set(
          submissions.map(submission => submission.childId.toString())
        ).size;

        // User participation data (if logged in as child)
        let userParticipated = false;
        let userEntries: any[] = [];

        if (session && session.user?.role === 'child') {
          const userStories = await StorySession.find({
            childId: session.user.id,
            'competitionEntries.competitionId': competition._id
          }).select('title competitionEntries createdAt').lean();

          if (userStories.length > 0) {
            userParticipated = true;
            userEntries = userStories.map(story => {
              const competitionEntry = story.competitionEntries?.find(
                (entry: any) => entry.competitionId.toString() === competition._id.toString()
              );

              return {
                storyId: (story._id as string | { toString(): string }).toString(),
                title: story.title,
                submittedAt: competitionEntry?.submittedAt || story.createdAt,
                rank: competitionEntry?.rank || null,
                score: competitionEntry?.score || null
              };
            });
          }
        }

        // Calculate days since completion
        const completedDate = competition.resultsDate || competition.updatedAt;
        const daysSinceCompletion = Math.floor(
          (Date.now() - new Date(completedDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          _id: competition._id.toString(),
          month: competition.month,
          year: competition.year,
          phase: competition.phase,
          
          // 🔧 REAL-TIME STATS (not stored values)
          totalSubmissions: realTotalSubmissions,
          totalParticipants: realTotalParticipants,
          
          // Dates
          submissionStart: competition.submissionStart?.toISOString(),
          submissionEnd: competition.submissionEnd?.toISOString(),
          resultsDate: competition.resultsDate?.toISOString(),
          completedAt: completedDate?.toISOString(),
          daysSinceCompletion,
          
          // Status
          isActive: competition.isActive || false,
          
          // Winners (top 3)
          winners: competition.winners?.slice(0, 3).map((winner: any) => ({
            position: winner.position,
            childId: winner.childId?.toString() || '',
            childName: winner.childName || 'Anonymous',
            title: winner.title || 'Untitled Story',
            score: winner.score || 0
          })) || [],
          
          // User participation (if logged in)
          userParticipated,
          userEntries,
          
          // Judging criteria
          judgingCriteria: competition.judgingCriteria || {
            grammar: 12,
            creativity: 25,
            structure: 10,
            character: 12,
            plot: 15,
            vocabulary: 10,
            originality: 8,
            engagement: 5,
            aiDetection: 3
          }
        };
      })
    );

    // Calculate summary statistics with REAL data
    const summary = {
      totalCompetitions: formattedCompetitions.length,
      totalSubmissions: formattedCompetitions.reduce(
        (sum, comp) => sum + comp.totalSubmissions, 0
      ),
      totalParticipants: formattedCompetitions.reduce(
        (sum, comp) => sum + comp.totalParticipants, 0
      ),
      averageSubmissions: formattedCompetitions.length > 0 
        ? Math.round(
            formattedCompetitions.reduce((sum, comp) => sum + comp.totalSubmissions, 0) / 
            formattedCompetitions.length
          )
        : 0,
      userParticipationCount: session && session.user?.role === 'child' 
        ? formattedCompetitions.filter(comp => comp.userParticipated).length
        : 0
    };

    console.log('✅ Past competitions formatted with real-time stats');

    return NextResponse.json({
      success: true,
      competitions: formattedCompetitions,
      summary,
      message: `Retrieved ${formattedCompetitions.length} past competitions with real-time statistics`
    });

  } catch (error) {
    console.error('❌ Error fetching past competitions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch past competitions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST endpoint for admin actions on past competitions - UNCHANGED
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
      case 'update_winners':
        if (!competitionId || !data?.winners) {
          return NextResponse.json(
            { error: 'Competition ID and winners data required' },
            { status: 400 }
          );
        }

        const competition = await Competition.findById(competitionId);
        if (!competition) {
          return NextResponse.json(
            { error: 'Competition not found' },
            { status: 404 }
          );
        }

        competition.winners = data.winners;
        competition.phase = 'results';
        competition.isActive = false;
        await competition.save();

        result = {
          success: true,
          message: 'Winners updated successfully',
          competition: {
            _id: competition._id,
            month: competition.month,
            year: competition.year,
            winners: competition.winners
          }
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Error in past competitions action:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}