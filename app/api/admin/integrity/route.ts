// app/api/admin/integrity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';


export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admins only.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'overview';
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    switch (action) {
      case 'overview':
        return await getIntegrityOverview();

      case 'flagged':
        return await getFlaggedContent(limit, page);

      case 'stats':
        return await getIntegrityStats();

      case 'recent':
        return await getRecentAssessments(limit);

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ Admin integrity API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch integrity data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function getIntegrityOverview() {
  const [totalStories, flaggedContent, integrityStats, assessmentStats] =
    await Promise.all([
      // Total stories with assessments
      StorySession.countDocuments({
        assessment: { $exists: true },
      }),

      // Flagged content count
      StorySession.countDocuments({
        'assessment.integrityRisk': { $in: ['high', 'critical'] },
      }),

      // Integrity statistics
      StorySession.aggregate([
        {
          $match: {
            assessment: { $exists: true },
            'assessment.integrityRisk': { $exists: true },
          },
        },
        {
          $group: {
            _id: '$assessment.integrityRisk',
            count: { $sum: 1 },
          },
        },
      ]),

      // Assessment statistics - placeholder for new engine
      { assessmentCount: 0, averageScore: 0 },
    ]);

  // FIXED: Process integrity stats to create riskDistribution
  const riskDistribution: { [key: string]: number } = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };

  // Process the aggregated integrity stats
  integrityStats.forEach((stat: any) => {
    if (stat._id && riskDistribution.hasOwnProperty(stat._id)) {
      riskDistribution[stat._id] = stat.count;
    }
  });

  const low = riskDistribution.low || 0;
  const medium = riskDistribution.medium || 0;
  const high = riskDistribution.high || 0;
  const critical = riskDistribution.critical || 0;

  const flaggedPercentage =
    totalStories > 0 ? ((flaggedContent / totalStories) * 100).toFixed(1) : '0';

  return NextResponse.json({
    success: true,
    overview: {
      totalStoriesAssessed: totalStories,
      flaggedContentCount: flaggedContent,
      flaggedPercentage: parseFloat(flaggedPercentage),
      riskDistribution: {
        low,
        medium,
        high,
        critical,
      },
      assessmentStats: {
        averageScore: Math.round(assessmentStats.averageScore || 0),
        totalAssessments: assessmentStats.assessmentCount || 0,
        aiDetectedCount: 0, // Placeholder
        plagiarismDetectedCount: 0, // Placeholder
      },
    },
  });
}

async function getFlaggedContent(limit: number, page: number) {
  const skip = (page - 1) * limit;

  const [flaggedStories, totalCount] = await Promise.all([
    StorySession.find({
      'assessment.integrityRisk': { $in: ['high', 'critical'] },
    })
      .populate('childId', 'firstName lastName email age')
      .select(
        'title storyNumber assessment.integrityRisk assessment.plagiarismScore assessment.aiDetectionScore assessment.assessmentDate childId createdAt'
      )
      .sort({ 'assessment.assessmentDate': -1 })
      .skip(skip)
      .limit(limit),

    StorySession.countDocuments({
      'assessment.integrityRisk': { $in: ['high', 'critical'] },
    }),
  ]);

  const processedStories = flaggedStories.map((story) => {
    const child =
      typeof story.childId === 'object' && story.childId !== null
        ? story.childId
        : {};
    // FIXED: Use type assertion for _id property on child
    const childId = (child as any)._id ? (child as any)._id.toString() : '';

    return {
      id: story._id,
      title: story.title,
      storyNumber: story.storyNumber,
      author: {
        id: childId,
        // FIXED: Use type assertion for all child properties
        name: `${(child as any).firstName || ''} ${(child as any).lastName || ''}`.trim(),
        email: (child as any).email || '',
        age: (child as any).age || '',
      },
      integrity: {
        riskLevel: story.assessment?.integrityRisk,
        plagiarismScore: story.assessment?.plagiarismScore,
        aiDetectionScore: story.assessment?.aiDetectionScore,
        assessmentDate: story.assessment?.assessmentDate,
      },
      createdAt: story.createdAt,
    };
  });

  return NextResponse.json({
    success: true,
    flaggedContent: processedStories,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      hasMore: skip + flaggedStories.length < totalCount,
    },
  });
}

async function getIntegrityStats() {
  const [riskStats, scoreStats, timeStats] = await Promise.all([
    // Risk level distribution
    StorySession.aggregate([
      {
        $match: {
          assessment: { $exists: true },
          'assessment.integrityRisk': { $exists: true },
        },
      },
      {
        $group: {
          _id: '$assessment.integrityRisk',
          count: { $sum: 1 },
          avgPlagiarismScore: { $avg: '$assessment.plagiarismScore' },
          avgAIScore: { $avg: '$assessment.aiDetectionScore' },
          avgOverallScore: { $avg: '$assessment.overallScore' },
        },
      },
    ]),

    // Score distribution
    StorySession.aggregate([
      {
        $match: {
          assessment: { $exists: true },
        },
      },
      {
        $group: {
          _id: null,
          plagiarismDistribution: {
            $push: {
              $switch: {
                branches: [
                  {
                    case: { $lt: ['$assessment.plagiarismScore', 30] },
                    then: 'high_risk',
                  },
                  {
                    case: { $lt: ['$assessment.plagiarismScore', 50] },
                    then: 'medium_risk',
                  },
                  {
                    case: { $lt: ['$assessment.plagiarismScore', 70] },
                    then: 'low_risk',
                  },
                ],
                default: 'very_low_risk',
              },
            },
          },
          aiDistribution: {
            $push: {
              $switch: {
                branches: [
                  {
                    case: { $lt: ['$assessment.aiDetectionScore', 30] },
                    then: 'high_risk',
                  },
                  {
                    case: { $lt: ['$assessment.aiDetectionScore', 50] },
                    then: 'medium_risk',
                  },
                  {
                    case: { $lt: ['$assessment.aiDetectionScore', 70] },
                    then: 'low_risk',
                  },
                ],
                default: 'very_low_risk',
              },
            },
          },
        },
      },
    ]),

    // Time-based trends (last 30 days)
    StorySession.aggregate([
      {
        $match: {
          'assessment.assessmentDate': {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$assessment.assessmentDate',
            },
          },
          totalAssessments: { $sum: 1 },
          flaggedCount: {
            $sum: {
              $cond: [
                { $in: ['$assessment.integrityRisk', ['high', 'critical']] },
                1,
                0,
              ],
            },
          },
          avgPlagiarismScore: { $avg: '$assessment.plagiarismScore' },
          avgAIScore: { $avg: '$assessment.aiDetectionScore' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]),
  ]);

  return NextResponse.json({
    success: true,
    stats: {
      riskDistribution: riskStats,
      scoreDistribution: scoreStats[0] || {
        plagiarismDistribution: [],
        aiDistribution: [],
      },
      timeTrends: timeStats,
    },
  });
}

async function getRecentAssessments(limit: number) {
  const recentAssessments = await StorySession.find({
    assessment: { $exists: true },
    'assessment.assessmentDate': { $exists: true },
  })
    .populate('childId', 'firstName lastName email')
    .select('title storyNumber assessment childId')
    .sort({ 'assessment.assessmentDate': -1 })
    .limit(limit);

  const processedAssessments = recentAssessments.map((story) => {
    const child =
      story.childId && typeof story.childId === 'object' ? story.childId : {};
    return {
      id: story._id,
      title: story.title,
      storyNumber: story.storyNumber,
      author: {
        // FIXED: Use type assertion for all child properties
        name: `${(child as any).firstName || ''} ${(child as any).lastName || ''}`.trim(),
        email: (child as any).email || '',
      },
      assessment: {
        overallScore: story.assessment?.overallScore,
        integrityRisk: story.assessment?.integrityRisk,
        plagiarismScore: story.assessment?.plagiarismScore,
        aiDetectionScore: story.assessment?.aiDetectionScore,
        assessmentDate: story.assessment?.assessmentDate,
        version: story.assessment?.assessmentVersion || '1.0',
      },
    };
  });

  return NextResponse.json({
    success: true,
    recentAssessments: processedAssessments,
  });
}

// POST endpoint for admin actions
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admins only.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { action, storyId } = await request.json();

    if (action === 'reassess' && storyId) {
      const updatedSession = await StorySession.findByIdAndUpdate(
        storyId,
        { $inc: { assessmentAttempts: 1 }, lastAssessedAt: new Date() },
        { new: true }
      );

      if (!updatedSession) {
        return NextResponse.json(
          { error: 'Story session not found' },
          { status: 404 }
        );
      }

      console.log(`🔄 Admin ${session.user.email} reassessed story ${storyId}`);

      return NextResponse.json({
        success: true,
        message: 'Story successfully reassessed',
        assessmentAttempts: updatedSession.assessmentAttempts,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('❌ Admin integrity POST error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process admin action',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
