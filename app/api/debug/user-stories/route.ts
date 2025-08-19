// app/api/user/stories/route.ts - FINAL FIX
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'child') {
      console.log('Session check failed:', session?.user?.role);
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    console.log('=== STORIES API DEBUG ===');
    console.log('User ID:', session.user.id);
    console.log('User ID type:', typeof session.user.id);

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    await connectToDatabase();

    const db = mongoose.connection.db;

    if (!db) {
      console.error('Database connection failed');
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    let stories: any[] = [];
    let totalCount = 0;

    // Since we know from debug that childIds are ObjectIds, convert user ID to ObjectId
    if (mongoose.Types.ObjectId.isValid(session.user.id)) {
      try {
        const objectId = new mongoose.Types.ObjectId(session.user.id);
        console.log('Using ObjectId query:', objectId);

        // Get stories
        stories = await db
          .collection('storysessions')
          .find({ childId: objectId })
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(skip)
          .toArray();

        // Get total count
        totalCount = await db
          .collection('storysessions')
          .countDocuments({ childId: objectId });

        console.log('✅ Found stories:', stories.length);
        console.log('✅ Total count:', totalCount);
      } catch (error) {
        console.error('ObjectId query failed:', error);
        return NextResponse.json(
          { error: 'Failed to query stories' },
          { status: 500 }
        );
      }
    } else {
      console.error(
        'Invalid user ID for ObjectId conversion:',
        session.user.id
      );
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Format stories for frontend
    const formattedStories = stories.map((story: any) => {
      const hasCompetitionEntry =
        story.competitionEntries &&
        Array.isArray(story.competitionEntries) &&
        story.competitionEntries.length > 0;

      const latestCompetitionEntry = hasCompetitionEntry
        ? story.competitionEntries[story.competitionEntries.length - 1]
        : null;

      return {
        _id: story._id?.toString(),
        title: story.title || 'Untitled',
        status: story.status || 'active',
        storyNumber: story.storyNumber || 0,
        totalWords: story.totalWords || story.childWords || 0,
        childWords: story.childWords || 0,
        isUploadedForAssessment: story.isUploadedForAssessment || false,
        assessmentAttempts: story.assessmentAttempts || 0,
        assessment: story.assessment || null,
        isPublished: story.isPublished || false,
        publicationDate: story.publicationDate || null,
        competitionEligible: story.competitionEligible || false,
        competitionEntries: story.competitionEntries || [],
        submittedToCompetition: hasCompetitionEntry,
        competitionSubmissionDate: latestCompetitionEntry?.submittedAt || null,
        competitionId:
          latestCompetitionEntry?.competitionId?.toString() || null,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
        completedAt: story.completedAt,
        overallScore: story.assessment?.overallScore || story.overallScore || 0,
        grammarScore: story.assessment?.grammarScore || story.grammarScore || 0,
        creativityScore:
          story.assessment?.creativityScore || story.creativityScore || 0,
        feedback: story.assessment?.feedback || story.feedback || '',
      };
    });

    const response = {
      success: true,
      stories: formattedStories,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
      stats: {
        total: formattedStories.length,
        completed: formattedStories.filter((s) => s.status === 'completed')
          .length,
        active: formattedStories.filter((s) => s.status === 'active').length,
        published: formattedStories.filter((s) => s.isPublished).length,
        submittedToCompetition: formattedStories.filter(
          (s) => s.submittedToCompetition
        ).length,
      },
    };

    console.log('=== API RESPONSE ===');
    console.log('Stories returned:', response.stories.length);
    console.log('Total items:', response.pagination.totalItems);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in stories API:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch stories',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
