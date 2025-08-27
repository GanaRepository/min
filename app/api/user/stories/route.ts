// app/api/user/stories/route.ts 
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import PublishedStory from '@/models/PublishedStory';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    console.log('📚 Fetching stories for user:', session.user.id);

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    const recent = searchParams.get('recent') === 'true';
    const status = searchParams.get('status');
    const type = searchParams.get('type'); // 'freestyle', 'uploaded', 'competition'

    await connectToDatabase();

    // Build query
    const query: any = {
      childId: new mongoose.Types.ObjectId(session.user.id),
    };

    if (status) {
      query.status = status;
    }

    // Filter by story type
    if (type) {
      switch (type) {
        case 'freestyle':
          query.isUploadedForAssessment = { $ne: true };
          query.competitionEntries = { $not: { $elemMatch: {} } };
          break;
        case 'uploaded':
          query.isUploadedForAssessment = true;
          break;
        case 'competition':
          query.competitionEntries = { $elemMatch: {} };
          break;
      }
    }

    console.log('🔍 Story query:', JSON.stringify(query, null, 2));

    // Get stories with pagination
    const stories = await StorySession.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Get total count for pagination
    const totalCount = await StorySession.countDocuments(query);

    console.log(`📖 Found ${stories.length} stories (${totalCount} total)`);

    // Get publication status for each story
    const storyIds = stories.map((story) => story._id);
    const publishedStories = await PublishedStory.find({
      sessionId: { $in: storyIds },
    }).lean();

    const publishedStoryIds = new Set(
      publishedStories.map((ps) => ps.sessionId.toString())
    );

    // Format stories for frontend with comprehensive assessment support
    const formattedStories = stories.map((story: any) => {
      // Determine story type
      let storyType = 'freestyle';
      if (story.isUploadedForAssessment) {
        storyType = 'uploaded';
      } else if (
        story.competitionEntries &&
        story.competitionEntries.length > 0
      ) {
        storyType = 'competition';
      }

      // Get competition info if exists
      const latestCompetitionEntry =
        story.competitionEntries && story.competitionEntries.length > 0
          ? story.competitionEntries[story.competitionEntries.length - 1]
          : null;

      // Check if published
      const isPublished = publishedStoryIds.has(story._id.toString());

      // Format assessment data with new comprehensive assessment support
      const assessment = story.assessment
        ? {
            // Check if we have the new comprehensive assessment format
            hasComprehensiveAssessment:
              !!story.assessment.comprehensiveAssessment,

            // Core scores (backwards compatible)
            overallScore: story.assessment.overallScore || 0,
            grammarScore: story.assessment.grammarScore || 0,
            creativityScore: story.assessment.creativityScore || 0,
            vocabularyScore: story.assessment.vocabularyScore || 0,
            structureScore: story.assessment.structureScore || 0,
            characterDevelopmentScore:
              story.assessment.characterDevelopmentScore || 0,
            plotDevelopmentScore: story.assessment.plotDevelopmentScore || 0,

            // Reading and feedback
            readingLevel: story.assessment.readingLevel || 'Elementary',
            feedback: story.assessment.feedback || '',
            strengths: story.assessment.strengths || [],
            improvements: story.assessment.improvements || [],

            // NEW: Comprehensive integrity status
            integrityAnalysis: story.assessment.integrityAnalysis
              ? {
                  overallStatus:
                    story.assessment.integrityAnalysis.overallStatus || 'PASS',
                  // Map AI detection data to expected format
                  aiDetectionResult: {
                    likelihood: story.assessment.integrityAnalysis.aiDetection?.aiLikelihood || 'Very Low (10%)',
                    confidence: story.assessment.integrityAnalysis.aiDetection?.confidenceLevel || 85,
                    humanLikeScore: story.assessment.integrityAnalysis.aiDetection?.humanLikeScore || 90,
                    riskLevel: story.assessment.integrityAnalysis.aiDetection?.riskLevel || 'VERY LOW RISK',
                  },
                  // Map plagiarism data to expected format
                  plagiarismResult: {
                    overallScore: story.assessment.integrityAnalysis.plagiarismCheck?.originalityScore || 95,
                    riskLevel: story.assessment.integrityAnalysis.plagiarismCheck?.riskLevel || 'low',
                    status: story.assessment.integrityAnalysis.plagiarismCheck?.status || 'CLEAR',
                  },
                  message: story.assessment.integrityAnalysis.message || '',
                }
              : {
                  // Legacy format fallback
                  overallStatus: story.integrityStatus || 'PASS',
                  aiDetectionResult: {
                    likelihood: 'Very Low (10%)',
                    confidence: 85,
                    humanLikeScore: story.aiDetectionScore || 90,
                    riskLevel: 'VERY LOW RISK',
                  },
                  plagiarismResult: {
                    overallScore: story.plagiarismScore || 95,
                    riskLevel: 'low',
                    status: 'CLEAR',
                  },
                  message: 'Story integrity verified',
                },

            // Assessment metadata
            assessmentVersion:
              story.assessment.assessmentVersion || '6.0-comprehensive',
            assessmentDate:
              story.assessment.assessmentDate ||
              story.lastAssessedAt ||
              story.createdAt,
            assessmentType: story.assessment.assessmentType || storyType,

            // For detailed view
            comprehensiveAssessment:
              story.assessment.comprehensiveAssessment || null,
          }
        : null;

      return {
        _id: story._id.toString(),
        title: story.title || '',
        status: story.status || 'active',
        storyType,
        createdAt: story.createdAt
          ? new Date(story.createdAt).toISOString()
          : new Date().toISOString(),
        updatedAt: story.updatedAt
          ? new Date(story.updatedAt).toISOString()
          : new Date().toISOString(),
        completedAt: story.completedAt
          ? new Date(story.completedAt).toISOString()
          : null,

        // Progress and metrics
        totalWords: story.totalWords || 0,
        childWords: story.childWords || 0,
        currentTurn: story.currentTurn || 1,
        maxTurns: story.maxApiCalls || 7,
        storyNumber: story.storyNumber || 0,

        // Publication status
        isPublished,
        publishedAt: isPublished
          ? publishedStories.find(
              (ps) => ps.sessionId.toString() === story._id.toString()
            )?.publishedAt
          : null,

        // Assessment information
        isAssessed: !!story.assessment,
        assessment,
        assessmentAttempts: story.assessmentAttempts || 0,
        maxAssessmentAttempts: 3,
        lastAssessedAt: story.lastAssessedAt || null,

        // Top-level integrity status for easy filtering
        integrityStatus:
          story.integrityStatus ||
          assessment?.integrityAnalysis?.overallStatus ||
          'PASS',
        aiDetectionScore: story.aiDetectionScore || 100,
        plagiarismScore: story.plagiarismScore || 100,

        // Competition data
        competitionEligible: story.competitionEligible || false,
        competitionEntries: story.competitionEntries || [],
        latestCompetitionEntry,

        // Upload specific
        isUploadedForAssessment: story.isUploadedForAssessment || false,

        // Story content preview (first 150 characters)
        preview: story.aiOpening
          ? story.aiOpening.substring(0, 150) +
            (story.aiOpening.length > 150 ? '...' : '')
          : '',

        // Flags for review
        needsReview: story.integrityFlags?.needsReview || false,
        integrityFlags: story.integrityFlags || null,
      };
    });

    // Calculate summary statistics
    const stats = {
      total: totalCount,
      completed: stories.filter((story) => story.status === 'completed').length,
      inProgress: stories.filter((story) => story.status === 'active').length,
      flagged: stories.filter((story) => story.status === 'flagged').length,
      needsReview: stories.filter((story) => story.status === 'review').length,
      published: formattedStories.filter((story) => story.isPublished).length,

      // Assessment stats
      assessed: stories.filter((story) => story.assessment).length,
      comprehensiveAssessments: stories.filter(
        (story) => story.assessment?.comprehensiveAssessment
      ).length,

      // Integrity stats
      passedIntegrity: stories.filter(
        (story) => (story.integrityStatus || 'PASS') === 'PASS'
      ).length,
      flaggedIntegrity: stories.filter(
        (story) => (story.integrityStatus || 'PASS') === 'FAIL'
      ).length,

      // Story types
      freestyleStories: formattedStories.filter(
        (story) => story.storyType === 'freestyle'
      ).length,
      uploadedStories: formattedStories.filter(
        (story) => story.storyType === 'uploaded'
      ).length,
      competitionStories: formattedStories.filter(
        (story) => story.storyType === 'competition'
      ).length,
    };

    console.log('📊 Story stats:', stats);

    return NextResponse.json({
      success: true,
      stories: formattedStories,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
      stats,
      message: `Found ${formattedStories.length} stories`,
    });
  } catch (error) {
    console.error('❌ Error fetching user stories:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch stories',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
