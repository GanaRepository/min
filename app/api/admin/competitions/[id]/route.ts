//app/api/admin/competitions/[id]/route.ts
// app/api/admin/competitions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import Competition from '@/models/Competition';
import StorySession from '@/models/StorySession';

export const dynamic = 'force-dynamic';

// GET single competition
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = params;
    await connectToDatabase();

    const competition = await Competition.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .lean();

    if (!competition) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    }

    // Get competition entries
    const entries = await StorySession.find({
      competitionId: id,
      isPublished: true,
    })
    .populate('childId', 'firstName lastName email')
    .select('title totalWords competitionScore competitionRank createdAt')
    .sort({ competitionRank: 1 });

    return NextResponse.json({
      success: true,
      competition: {
        ...competition,
        entries,
        totalEntries: entries.length,
      },
    });

  } catch (error) {
    console.error('Error fetching competition:', error);
    return NextResponse.json({ error: 'Failed to fetch competition' }, { status: 500 });
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
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
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
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      competition: updatedCompetition,
      message: 'Competition updated successfully',
    });

  } catch (error) {
    console.error('Error updating competition:', error);
    return NextResponse.json({ error: 'Failed to update competition' }, { status: 500 });
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
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = params;
    await connectToDatabase();

    const competition = await Competition.findById(id);
    if (!competition) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    }

    // Remove competition reference from stories
    await StorySession.updateMany(
      { competitionId: id },
      { $unset: { competitionId: 1, competitionScore: 1, competitionRank: 1 } }
    );

    await Competition.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Competition deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting competition:', error);
    return NextResponse.json({ error: 'Failed to delete competition' }, { status: 500 });
  }
}