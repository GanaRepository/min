// app/api/admin/competitions/[id]/route.ts - ENHANCED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import Competition from '@/models/Competition';
import StorySession from '@/models/StorySession';
import User from '@/models/User';
import { competitionManager } from '@/lib/competition-manager';

export const dynamic = 'force-dynamic';

// GET - Get detailed competition information
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;
    await connectToDatabase();

    const competition = await Competition.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .lean();

    if (!competition) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      );
    }

    // Get all submissions for this competition
    const submissions = await StorySession.find({
      'competitionEntries.competitionId': id
    })
    .populate('childId', 'firstName lastName email')
    .select('title story totalWords childWords competitionEntries childId createdAt updatedAt')
    .lean();

    // Format submissions with detailed entry information
    const detailedSubmissions = submissions.map((story: any) => {
      const entry = story.competitionEntries.find(
        (e: any) => e.competitionId.toString() === id
      );
      
      return {
        storyId: story._id,
        title: story.title,
        wordCount: story.totalWords || story.childWords || 0,
        childInfo: {
          id: story.childId._id,
          name: `${story.childId.firstName} ${story.childId.lastName}`,
          email: story.childId.email,
        },
        submissionDetails: {
          submittedAt: entry?.submittedAt,
          rank: entry?.rank,
          score: entry?.score,
          aiJudgingNotes: entry?.aiJudgingNotes,
        },
        storyMetadata: {
          createdAt: story.createdAt,
          updatedAt: story.updatedAt,
          storyLength: story.story?.length || 0,
        }
      };
    });

    // Sort submissions by rank (winners first), then by score, then by submission date
    detailedSubmissions.sort((a, b) => {
      // Winners first (rank exists and is low)
      if (a.submissionDetails.rank && !b.submissionDetails.rank) return -1;
      if (!a.submissionDetails.rank && b.submissionDetails.rank) return 1;
      
      // If both have ranks, sort by rank
      if (a.submissionDetails.rank && b.submissionDetails.rank) {
        return a.submissionDetails.rank - b.submissionDetails.rank;
      }
      
      // If both have scores, sort by score (highest first)
      if (a.submissionDetails.score && b.submissionDetails.score) {
        return b.submissionDetails.score - a.submissionDetails.score;
      }
      
      // Finally, sort by submission date (earliest first)
      return new Date(a.submissionDetails.submittedAt || 0).getTime() - 
             new Date(b.submissionDetails.submittedAt || 0).getTime();
    });

    // Calculate competition analytics
    const analytics = {
      totalSubmissions: detailedSubmissions.length,
      totalParticipants: new Set(detailedSubmissions.map(s => s.childInfo.id)).size,
      averageWordCount: detailedSubmissions.length > 0 
        ? Math.round(detailedSubmissions.reduce((sum, s) => sum + s.wordCount, 0) / detailedSubmissions.length)
        : 0,
      winners: detailedSubmissions.filter(s => s.submissionDetails.rank && s.submissionDetails.rank <= 3),
      scoredSubmissions: detailedSubmissions.filter(s => s.submissionDetails.score).length,
      submissionsByDay: getSubmissionsByDay(detailedSubmissions),
      topScores: detailedSubmissions
        .filter(s => s.submissionDetails.score)
        .slice(0, 10)
        .map(s => ({
          childName: s.childInfo.name,
          title: s.title,
          score: s.submissionDetails.score,
          rank: s.submissionDetails.rank
        }))
    };

    return NextResponse.json({
      success: true,
      competition: {
        ...competition,
        analytics,
        submissions: detailedSubmissions,
      }
    });

  } catch (error) {
    console.error('❌ Error fetching competition details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competition details' },
      { status: 500 }
    );
  }
}

// POST - Admin actions on specific competition
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;
    const { action, data } = await request.json();

    await connectToDatabase();

    const competition = await Competition.findById(id);
    if (!competition) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'advance_phase':
        const updatedCompetition = await competitionManager.forceAdvancePhase(id);
        
        return NextResponse.json({
          success: true,
          message: `Competition advanced to ${updatedCompetition.phase} phase`,
          competition: updatedCompetition,
        });

      case 'set_winners':
        const { winners } = data;
        
        if (!winners || !Array.isArray(winners)) {
          return NextResponse.json(
            { error: 'Winners array is required' },
            { status: 400 }
          );
        }

        // Update competition with winners
        competition.winners = winners;
        competition.phase = 'results';
        competition.isActive = false;
        competition.resultsDate = new Date();
        await competition.save();

        // Update individual story entries with ranks and scores
        for (const winner of winners) {
          await StorySession.findByIdAndUpdate(
            winner.storyId,
            {
              $set: {
                'competitionEntries.$[elem].rank': winner.position,
                'competitionEntries.$[elem].score': winner.score,
                'competitionEntries.$[elem].aiJudgingNotes': winner.aiJudgingNotes || '',
              }
            },
            {
              arrayFilters: [{ 'elem.competitionId': id }]
            }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Winners set successfully',
          competition,
        });

      case 'update_dates':
        const { submissionEnd, judgingStart, judgingEnd, resultsDate } = data;
        
        if (submissionEnd) competition.submissionEnd = new Date(submissionEnd);
        if (judgingStart) competition.judgingStart = new Date(judgingStart);
        if (judgingEnd) competition.judgingEnd = new Date(judgingEnd);
        if (resultsDate) competition.resultsDate = new Date(resultsDate);
        
        await competition.save();

        return NextResponse.json({
          success: true,
          message: 'Competition dates updated successfully',
          competition,
        });

      case 'update_criteria':
        const { judgingCriteria } = data;
        
        if (!judgingCriteria) {
          return NextResponse.json(
            { error: 'Judging criteria is required' },
            { status: 400 }
          );
        }

        competition.judgingCriteria = judgingCriteria;
        await competition.save();

        return NextResponse.json({
          success: true,
          message: 'Judging criteria updated successfully',
          competition,
        });

      case 'recalculate_stats':
        // Recalculate competition statistics
        const submissions = await StorySession.find({
          'competitionEntries.competitionId': id
        });

        const participantIds = new Set();
        submissions.forEach(story => {
          story.competitionEntries.forEach((entry: any) => {
            if (entry.competitionId.toString() === id) {
              participantIds.add(story.childId.toString());
            }
          });
        });

        competition.totalSubmissions = submissions.length;
        competition.totalParticipants = participantIds.size;
        await competition.save();

        return NextResponse.json({
          success: true,
          message: 'Competition statistics recalculated',
          stats: {
            totalSubmissions: competition.totalSubmissions,
            totalParticipants: competition.totalParticipants,
          }
        });

      case 'export_submissions':
        // Export all submissions for this competition
        const exportSubmissions = await StorySession.find({
          'competitionEntries.competitionId': id
        })
        .populate('childId', 'firstName lastName email')
        .select('title story totalWords competitionEntries childId createdAt')
        .lean();

        const exportData = exportSubmissions.map((story: any) => {
          const entry = story.competitionEntries.find(
            (e: any) => e.competitionId.toString() === id
          );
          
          return {
            title: story.title,
            childName: `${story.childId.firstName} ${story.childId.lastName}`,
            childEmail: story.childId.email,
            wordCount: story.totalWords,
            submittedAt: entry?.submittedAt,
            rank: entry?.rank || null,
            score: entry?.score || null,
            story: story.story,
          };
        });

        return NextResponse.json({
          success: true,
          exportData,
          competition: {
            month: competition.month,
            year: competition.year,
            exportedAt: new Date().toISOString(),
          }
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Error in competition action:', error);
    return NextResponse.json(
      { error: 'Failed to process competition action' },
      { status: 500 }
    );
  }
}

// DELETE - Delete competition (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;
    await connectToDatabase();

    const competition = await Competition.findById(id);
    if (!competition) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      );
    }

    // Remove competition entries from all stories
    await StorySession.updateMany(
      { 'competitionEntries.competitionId': id },
      { $pull: { competitionEntries: { competitionId: id } } }
    );

    // Delete the competition
    await Competition.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Competition deleted successfully',
    });

  } catch (error) {
    console.error('❌ Error deleting competition:', error);
    return NextResponse.json(
      { error: 'Failed to delete competition' },
      { status: 500 }
    );
  }
}

// Helper function to get submissions by day
function getSubmissionsByDay(submissions: any[]) {
  const submissionsByDay: { [key: string]: number } = {};
  
  submissions.forEach(submission => {
    if (submission.submissionDetails.submittedAt) {
      const date = new Date(submission.submissionDetails.submittedAt).toISOString().split('T')[0];
      submissionsByDay[date] = (submissionsByDay[date] || 0) + 1;
    }
  });
  
  return Object.entries(submissionsByDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}