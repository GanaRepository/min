// app/api/admin/competitions/route.ts - ENHANCED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import Competition from '@/models/Competition';
import StorySession from '@/models/StorySession';
import User from '@/models/User';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const phase = searchParams.get('phase');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'newest';

    await connectToDatabase();

    // Build query
    const query: any = {};
    if (phase && phase !== 'all') {
      query.phase = phase;
    }
    if (search) {
      query.$or = [
        { month: { $regex: search, $options: 'i' } },
        { year: parseInt(search) || 0 },
      ];
    }

    // Build sort
    let sort: any = {};
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'submissions':
        sort = { totalSubmissions: -1 };
        break;
      case 'participants':
        sort = { totalParticipants: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const [competitions, totalCompetitions] = await Promise.all([
      Competition.find(query)
        .populate('createdBy', 'firstName lastName')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Competition.countDocuments(query),
    ]);

    // Enhanced competition data with detailed info
    const enhancedCompetitions = await Promise.all(
      competitions.map(async (comp: any) => {
        // Get submissions for this competition
        const submissions = await StorySession.find({
          'competitionEntries.competitionId': comp._id,
        })
          .populate('childId', 'firstName lastName')
          .select(
            'title totalWords childWords competitionEntries childId createdAt'
          )
          .lean();

        // Format submissions with entry details
        const formattedSubmissions = submissions.map((story: any) => {
          const entry = story.competitionEntries.find(
            (e: any) => e.competitionId.toString() === comp._id.toString()
          );
          return {
            storyId: story._id,
            title: story.title,
            childName: `${story.childId.firstName} ${story.childId.lastName}`,
            wordCount: story.totalWords || story.childWords || 0,
            submittedAt: entry?.submittedAt,
            rank: entry?.rank,
            score: entry?.score,
          };
        });

        return {
          ...comp,
          submissions: formattedSubmissions,
          actualParticipants: submissions.length,
          actualSubmissions: submissions.length,
        };
      })
    );

    // Get comprehensive stats
    const [totalSubmissions, avgParticipants, activeCompetitions] =
      await Promise.all([
        Competition.aggregate([
          { $group: { _id: null, total: { $sum: '$totalSubmissions' } } },
        ]),
        Competition.aggregate([
          { $group: { _id: null, avg: { $avg: '$totalParticipants' } } },
        ]),
        Competition.countDocuments({ isActive: true }),
      ]);

    const stats = {
      totalCompetitions,
      activeCompetitions,
      totalSubmissions: totalSubmissions[0]?.total || 0,
      avgParticipants: Math.round(avgParticipants[0]?.avg || 0),
      completedCompetitions: await Competition.countDocuments({
        phase: 'results',
      }),
      inProgressCompetitions: await Competition.countDocuments({
        phase: { $in: ['submission', 'judging'] },
      }),
    };

    return NextResponse.json({
      success: true,
      competitions: enhancedCompetitions,
      stats,
      pagination: {
        page,
        limit,
        total: totalCompetitions,
        pages: Math.ceil(totalCompetitions / limit),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching admin competitions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competitions' },
      { status: 500 }
    );
  }
}

// POST - Create new competition or bulk actions
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
    const { action, data } = body;

    await connectToDatabase();

    switch (action) {
      case 'create_competition':
        const { month, year, theme, judgingCriteria } = data;

        if (!month || !year) {
          return NextResponse.json(
            { error: 'Month and year are required' },
            { status: 400 }
          );
        }

        // Check if competition already exists
        const existingCompetition = await Competition.findOne({ month, year });
        if (existingCompetition) {
          return NextResponse.json(
            { error: 'Competition for this month and year already exists' },
            { status: 400 }
          );
        }

        const adminUser = await User.findOne({ _id: session.user.id });

        const newCompetition = new Competition({
          month,
          year,
          theme: theme || 'Monthly Storytelling Competition',
          phase: 'submission',
          isActive: true,
          totalSubmissions: 0,
          totalParticipants: 0,
          judgingCriteria: judgingCriteria || {
            grammar: 12,
            creativity: 25,
            structure: 10,
            character: 12,
            plot: 15,
            vocabulary: 10,
            originality: 8,
            engagement: 5,
            aiDetection: 3,
          },
          submissionStart: new Date(),
          submissionEnd: new Date(year, new Date().getMonth() + 1, 25), // 25th of month
          judgingStart: new Date(year, new Date().getMonth() + 1, 26),
          judgingEnd: new Date(year, new Date().getMonth() + 1, 30),
          resultsDate: new Date(year, new Date().getMonth() + 1, 31),
          createdBy: adminUser?._id,
        });

        await newCompetition.save();

        return NextResponse.json({
          success: true,
          message: 'Competition created successfully',
          competition: newCompetition,
        });

      case 'bulk_update_phases':
        const { competitionIds, newPhase } = data;

        if (!competitionIds || !Array.isArray(competitionIds) || !newPhase) {
          return NextResponse.json(
            { error: 'Competition IDs and new phase are required' },
            { status: 400 }
          );
        }

        const updateResult = await Competition.updateMany(
          { _id: { $in: competitionIds } },
          { phase: newPhase }
        );

        return NextResponse.json({
          success: true,
          message: `Updated ${updateResult.modifiedCount} competitions to ${newPhase} phase`,
          updated: updateResult.modifiedCount,
        });

      case 'export_data':
        // Export competition data
        const allCompetitions = await Competition.find()
          .populate('createdBy', 'firstName lastName')
          .sort({ createdAt: -1 })
          .lean();

        const exportData = allCompetitions.map((comp) => ({
          month: comp.month,
          year: comp.year,
          phase: comp.phase,
          isActive: comp.isActive,
          totalSubmissions: comp.totalSubmissions,
          totalParticipants: comp.totalParticipants,
          winnersCount: comp.winners?.length || 0,
          createdAt: comp.createdAt,
          resultsDate: comp.resultsDate,
        }));

        return NextResponse.json({
          success: true,
          data: exportData,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Error in admin competitions POST:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
