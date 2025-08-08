// app/api/admin/integrity/route.ts - NEW FILE
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import { AssessmentEngine } from '@/lib/ai/assessment-engine';

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
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function getIntegrityOverview() {
  const [totalStories, flaggedContent, integrityStats, assessmentStats] = await Promise.all([
    // Total stories with assessments
    StorySession.countDocuments({
      assessment: { $exists: true }
    }),
    
    // Flagged content count
    StorySession.countDocuments({
      'assessment.integrityRisk': { $in: ['high', 'critical'] }
    }),
    
    // Integrity statistics
    StorySession.aggregate([
      {
        $match: {
          assessment: { $exists: true },
          'assessment.integrityRisk': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$assessment.integrityRisk',
          count: { $sum: 1 }
        }
      }
    ]),
    
    // Assessment statistics from engine
    AssessmentEngine.getAssessmentStats()
  ]);

  // Process integrity stats
  // Use type guard for riskDistribution indexing
  const riskDistribution = typeof stats.riskDistribution === 'object' && stats.riskDistribution !== null ? stats.riskDistribution : {};
  const low = riskDistribution.low || 0;
  const medium = riskDistribution.medium || 0;
  const high = riskDistribution.high || 0;
  const critical = riskDistribution.critical || 0;

  const flaggedPercentage = totalStories > 0 ? (flaggedContent / totalStories * 100).toFixed(1) : '0';

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
        critical
      },
      assessmentStats: {
        averageScore: Math.round(assessmentStats.averageScore || 0),
        totalAssessments: assessmentStats.totalAssessments || 0,
        aiDetectedCount: assessmentStats.aiDetectedCount || 0,
        plagiarismDetectedCount: assessmentStats.plagiarismDetectedCount || 0,
      }
    }
  });
}

async function getFlaggedContent(limit: number, page: number) {
  const skip = (page - 1) * limit;
  
  const [flaggedStories, totalCount] = await Promise.all([
    StorySession.find({
      'assessment.integrityRisk': { $in: ['high', 'critical'] }
    })
    .populate('childId', 'firstName lastName email age')
    .select('title storyNumber assessment.integrityRisk assessment.plagiarismScore assessment.aiDetectionScore assessment.assessmentDate childId createdAt')
    .sort({ 'assessment.assessmentDate': -1 })
    .skip(skip)
    .limit(limit),
    
    StorySession.countDocuments({
      'assessment.integrityRisk': { $in: ['high', 'critical'] }
    })
  ]);

  const processedStories = flaggedStories.map(story => {
    const child = typeof story.childId === 'object' && story.childId !== null ? story.childId : {};
    // Use type guard for _id property on child
    const childId = (child as any)._id ? (child as any)._id.toString() : '';

    return {
      id: story._id,
      title: story.title,
      storyNumber: story.storyNumber,
      author: {
        id: childId,
        // Use type guard for child properties in admin/integrity/route.ts (all usages)
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
    }
  });
}

async function getIntegrityStats() {
  const [riskStats, scoreStats, timeStats] = await Promise.all([
    // Risk level distribution
    StorySession.aggregate([
      {
        $match: {
          assessment: { $exists: true },
          'assessment.integrityRisk': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$assessment.integrityRisk',
          count: { $sum: 1 },
          avgPlagiarismScore: { $avg: '$assessment.plagiarismScore' },
          avgAIScore: { $avg: '$assessment.aiDetectionScore' },
          avgOverallScore: { $avg: '$assessment.overallScore' }
        }
      }
    ]),
    
    // Score distribution
    StorySession.aggregate([
      {
        $match: {
          assessment: { $exists: true },
          'assessment.plagiarismScore': { $exists: true },
          'assessment.aiDetectionScore': { $exists: true }
        }
      },
      {
        $project: {
          plagiarismRange: {
            $switch: {
              branches: [
                { case: { $gte: ['$assessment.plagiarismScore', 90] }, then: '90-100' },
                { case: { $gte: ['$assessment.plagiarismScore', 80] }, then: '80-89' },
                { case: { $gte: ['$assessment.plagiarismScore', 70] }, then: '70-79' },
                { case: { $gte: ['$assessment.plagiarismScore', 60] }, then: '60-69' },
              ],
              default: '0-59'
            }
          },
          aiRange: {
            $switch: {
              branches: [
                { case: { $gte: ['$assessment.aiDetectionScore', 90] }, then: '90-100' },
                { case: { $gte: ['$assessment.aiDetectionScore', 80] }, then: '80-89' },
                { case: { $gte: ['$assessment.aiDetectionScore', 70] }, then: '70-79' },
                { case: { $gte: ['$assessment.aiDetectionScore', 60] }, then: '60-69' },
              ],
              default: '0-59'
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          plagiarismDistribution: {
            $push: '$plagiarismRange'
          },
          aiDistribution: {
            $push: '$aiRange'
          }
        }
      }
    ]),
    
    // Time-based trends (last 30 days)
    StorySession.aggregate([
      {
        $match: {
          'assessment.assessmentDate': {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$assessment.assessmentDate'
            }
          },
          totalAssessments: { $sum: 1 },
          flaggedCount: {
            $sum: {
              $cond: [
                { $in: ['$assessment.integrityRisk', ['high', 'critical']] },
                1,
                0
              ]
            }
          },
          avgPlagiarismScore: { $avg: '$assessment.plagiarismScore' },
          avgAIScore: { $avg: '$assessment.aiDetectionScore' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])
  ]);

  return NextResponse.json({
    success: true,
    stats: {
      riskDistribution: riskStats,
      scoreDistribution: scoreStats[0] || { plagiarismDistribution: [], aiDistribution: [] },
      timeTrends: timeStats,
    }
  });
}

async function getRecentAssessments(limit: number) {
  const recentAssessments = await StorySession.find({
    assessment: { $exists: true },
    'assessment.assessmentDate': { $exists: true }
  })
  .populate('childId', 'firstName lastName email')
  .select('title storyNumber assessment childId')
  .sort({ 'assessment.assessmentDate': -1 })
  .limit(limit);

  const processedAssessments = recentAssessments.map(story => {
    const child = story.childId && typeof story.childId === 'object' ? story.childId : {};
    return {
      id: story._id,
      title: story.title,
      storyNumber: story.storyNumber,
      author: {
        name: `${child.firstName || ''} ${child.lastName || ''}`.trim(),
        email: child.email || '',
      },
      assessment: {
        overallScore: story.assessment?.overallScore,
        integrityRisk: story.assessment?.integrityRisk,
        plagiarismScore: story.assessment?.plagiarismScore,
        aiDetectionScore: story.assessment?.aiDetectionScore,
        assessmentDate: story.assessment?.assessmentDate,
        version: story.assessment?.assessmentVersion || '1.0',
      }
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

    const { action, sessionId, decision, notes } = await request.json();

    if (action === 'review_flagged') {
      if (!sessionId || !decision) {
        return NextResponse.json(
          { error: 'Session ID and decision are required' },
          { status: 400 }
        );
      }

      // Update story session with admin review
      const updatedSession = await StorySession.findByIdAndUpdate(
        sessionId,
        {
          $set: {
            'assessment.adminReview': {
              reviewedBy: session.user.id,
              reviewedAt: new Date(),
              decision, // 'approved', 'rejected', 'needs_revision'
              notes: notes || '',
            },
            status: decision === 'approved' ? 'completed' : 
                   decision === 'rejected' ? 'flagged' : 'completed'
          }
        },
        { new: true }
      );

      if (!updatedSession) {
        return NextResponse.json(
          { error: 'Story session not found' },
          { status: 404 }
        );
      }

      console.log(`👨‍💼 Admin ${session.user.email} reviewed story ${sessionId}: ${decision}`);

      return NextResponse.json({
        success: true,
        message: `Story ${decision} successfully`,
        sessionId,
        decision,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Admin action error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process admin action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}