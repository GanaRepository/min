// app/api/admin/competitions/[id]/route.ts - COMPLETE FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import Competition from '@/models/Competition';
import StorySession from '@/models/StorySession';

export const dynamic = 'force-dynamic';

// GET single competition with submissions
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

    const competition = await Competition.findById(id).lean();

    if (!competition) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      );
    }

    // ✅ FIXED: Get actual competition entries from StorySession
    const entries = await StorySession.find({
      'competitionEntries.competitionId': id,
    })
      .populate('childId', 'firstName lastName email')
      .select('title totalWords competitionEntries createdAt aiOpening storyType')
      .sort({ 'competitionEntries.submittedAt': -1 });

    // Format entries properly
    const formattedEntries = entries.map(story => {
      const entry = story.competitionEntries.find((e: any) => 
        e.competitionId.toString() === id
      );
      
      return {
        storyId: story._id,
        title: story.title,
        wordCount: story.totalWords,
        childName: `${story.childId.firstName} ${story.childId.lastName}`,
        childEmail: story.childId.email,
        childId: story.childId._id,
        submittedAt: entry?.submittedAt || story.createdAt,
        rank: entry?.rank || null,
        score: entry?.score || null,
        storyType: story.storyType || 'competition',
        contentPreview: story.aiOpening?.substring(0, 200) + '...'
      };
    });

    // Calculate submission statistics
    const stats = {
      totalSubmissions: formattedEntries.length,
      uniqueParticipants: [...new Set(formattedEntries.map(e => e.childId.toString()))].length,
      averageWordCount: formattedEntries.length > 0 
        ? Math.round(formattedEntries.reduce((sum, e) => sum + e.wordCount, 0) / formattedEntries.length)
        : 0,
      submissionsByType: {
        competition: formattedEntries.filter(e => e.storyType === 'competition').length,
        freestyle: formattedEntries.filter(e => e.storyType === 'freestyle').length,
        uploaded: formattedEntries.filter(e => e.storyType === 'uploaded').length,
      }
    };

    return NextResponse.json({
      success: true,
      competition: {
        ...competition,
        entries: formattedEntries,
        totalEntries: formattedEntries.length,
        stats
      },
    });
  } catch (error) {
    console.error('Error fetching competition:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competition' },
      { status: 500 }
    );
  }
}

// PATCH - Update competition
export async function PATCH(
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
    const updateData = await request.json();

    await connectToDatabase();

    const updatedCompetition = await Competition.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedCompetition) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      competition: updatedCompetition,
      message: 'Competition updated successfully',
    });
  } catch (error) {
    console.error('Error updating competition:', error);
    return NextResponse.json(
      { error: 'Failed to update competition' },
      { status: 500 }
    );
  }
}

// DELETE competition
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

    // Remove competition entries from stories
    await StorySession.updateMany(
      { 'competitionEntries.competitionId': id },
      { $pull: { competitionEntries: { competitionId: id } } }
    );

    await Competition.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Competition deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting competition:', error);
    return NextResponse.json(
      { error: 'Failed to delete competition' },
      { status: 500 }
    );
  }
}

// POST - Admin actions on competition (set winners, etc.)
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

    switch (action) {
      case 'set_winner':
        const { storyId, position } = data;
        
        if (!storyId || !position) {
          return NextResponse.json(
            { error: 'Story ID and position are required' },
            { status: 400 }
          );
        }

        // Update story with winner position
        await StorySession.findByIdAndUpdate(storyId, {
          $set: {
            'competitionEntries.$[elem].rank': position
          }
        }, {
          arrayFilters: [{ 'elem.competitionId': id }]
        });

        // Update competition winners array
        const story = await StorySession.findById(storyId).populate('childId', 'firstName lastName');
        const competition = await Competition.findById(id);
        
        if (story && competition) {
          const winnerData = {
            position,
            childId: story.childId._id.toString(),
            childName: `${story.childId.firstName} ${story.childId.lastName}`,
            title: story.title,
            storyId: story._id.toString()
          };

          // Remove existing winner at this position
          competition.winners = competition.winners?.filter((w: { position: number }) => w.position !== position) || [];
          
          // Add new winner
          competition.winners.push(winnerData);
          competition.winners.sort((a: { position: number }, b: { position: number }) => a.position - b.position);
          
          await competition.save();
        }

        return NextResponse.json({
          success: true,
          message: `Story set as position ${position} winner`
        });

      case 'clear_winner':
        const { position: clearPosition } = data;
        
        if (!clearPosition) {
          return NextResponse.json(
            { error: 'Position is required' },
            { status: 400 }
          );
        }

        const comp = await Competition.findById(id);
        if (comp) {
          comp.winners = comp.winners?.filter((w: { position: number }) => w.position !== clearPosition) || [];
          await comp.save();
        }

        // Clear rank from stories
        await StorySession.updateMany(
          { 'competitionEntries.competitionId': id },
          { $set: { 'competitionEntries.$[elem].rank': null } },
          { arrayFilters: [{ 'elem.competitionId': id, 'elem.rank': clearPosition }] }
        );

        return NextResponse.json({
          success: true,
          message: `Cleared position ${clearPosition} winner`
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error performing admin action:', error);
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 });
  }
}