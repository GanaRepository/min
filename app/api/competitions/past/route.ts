// app/api/competitions/past/route.ts - COMPLETE UPDATE FOR MINTOONS REQUIREMENTS
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import { competitionManager } from '@/lib/competition-manager';
import Competition from '@/models/Competition';
import StorySession from '@/models/StorySession';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('📜 Fetching past competitions...');

    await connectToDatabase();

    // Get session to check if user is logged in for personalized data
    const session = await getServerSession(authOptions);

    // Get past competitions (completed/inactive)
    const pastCompetitions = await Competition.find({
      $or: [
        { isActive: false },
        { phase: 'results' }
      ]
    })
    .sort({ year: -1, month: -1 }) // Most recent first
    .limit(12) // Last 12 competitions
    .lean();

    console.log(`📊 Found ${pastCompetitions.length} past competitions`);

    // Format competitions for frontend
    const formattedCompetitions = await Promise.all(
      pastCompetitions.map(async (competition) => {
        // Get user-specific data if logged in
        let userParticipated = false;
        let userEntries: any[] = [];
        
        if (session && session.user?.role === 'child') {
          // Check if user participated in this competition
          const userStories = await StorySession.find({
            childId: session.user.id,
            competitionEntries: {
              $elemMatch: {
                competitionId: competition._id
              }
            }
          }).select('title competitionEntries').lean();

          if (userStories.length > 0) {
            userParticipated = true;
            userEntries = userStories.map(story => {
              const competitionEntry = story.competitionEntries?.find(
                (entry: any) => entry.competitionId.toString() === competition._id.toString()
              );

              return {
                storyId: story._id.toString(),
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
          
          // Participation stats
          totalSubmissions: competition.totalSubmissions || 0,
          totalParticipants: competition.totalParticipants || 0,
          
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

    // Calculate summary statistics
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

    console.log('✅ Past competitions formatted successfully');

    return NextResponse.json({
      success: true,
      competitions: formattedCompetitions,
      summary,
      message: `Retrieved ${formattedCompetitions.length} past competitions`
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

// POST endpoint for admin actions on past competitions
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

      case 'archive_competition':
        if (!competitionId) {
          return NextResponse.json(
            { error: 'Competition ID required' },
            { status: 400 }
          );
        }

        await Competition.findByIdAndUpdate(competitionId, {
          isActive: false,
          archivedAt: new Date()
        });

        result = {
          success: true,
          message: 'Competition archived successfully'
        };
        break;

      case 'get_detailed_stats':
        if (!competitionId) {
          return NextResponse.json(
            { error: 'Competition ID required' },
            { status: 400 }
          );
        }

        const detailedStats = await competitionManager.getCompetitionStats(competitionId);
        
        result = {
          success: true,
          stats: detailedStats,
          message: 'Detailed statistics retrieved'
        };
        break;

      case 'export_competition_data':
        if (!competitionId) {
          return NextResponse.json(
            { error: 'Competition ID required' },
            { status: 400 }
          );
        }

        // Get competition with all entries
        const compForExport = await Competition.findById(competitionId)
          .populate('entries.storyId')
          .lean();

        if (!compForExport) {
          return NextResponse.json(
            { error: 'Competition not found' },
            { status: 404 }
          );
        }

        // Format export data
        const exportData = {
          competition: {
            month: compForExport.month,
            year: compForExport.year,
            phase: compForExport.phase,
            totalSubmissions: compForExport.totalSubmissions,
            totalParticipants: compForExport.totalParticipants
          },
          winners: compForExport.winners || [],
          entries: compForExport.entries?.map((entry: any) => ({
            storyId: entry.storyId?._id,
            title: entry.storyId?.title,
            submittedAt: entry.submittedAt,
            score: entry.score,
            rank: entry.rank
          })) || [],
          judgingCriteria: compForExport.judgingCriteria,
          exportedAt: new Date().toISOString()
        };

        result = {
          success: true,
          exportData,
          filename: `${compForExport.month}_${compForExport.year}_competition_data.json`,
          message: 'Competition data exported successfully'
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }

    console.log(`✅ Competition action '${action}' completed successfully`);

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Error processing competition action:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process competition action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}