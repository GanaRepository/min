// app/api/user/stories/route.ts - FIXED VERSION BASED ON ACTUAL SCHEMA
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const published = searchParams.get('published');
    const competitionEligible = searchParams.get('competitionEligible');
    const isUploadedForAssessment = searchParams.get('assessment');
    const competition = searchParams.get('competition');
    const notSubmitted = searchParams.get('notSubmitted');

    await connectToDatabase();

    // Build query filters based on actual schema
    const query: any = { childId: session.user.id };
    
    if (published === 'true') {
      query.isPublished = true;
    }
    
    if (competitionEligible === 'true') {
      query.competitionEligible = true;
    }
    
    if (isUploadedForAssessment === 'true') {
      query.isUploadedForAssessment = true;
    }

    // Competition filters using the actual competitionEntries array
    if (competition === 'true') {
      query.competitionEntries = { $exists: true, $not: { $size: 0 } };
    }

    if (notSubmitted === 'true') {
      query.$or = [
        { competitionEntries: { $exists: false } },
        { competitionEntries: { $size: 0 } }
      ];
    }

    const stories = await StorySession.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Format stories data based on actual schema fields
    const formattedStories = stories.map((story: any) => {
      // Check if story is submitted to competition
      const hasCompetitionEntry = story.competitionEntries && story.competitionEntries.length > 0;
      const latestCompetitionEntry = hasCompetitionEntry ? story.competitionEntries[story.competitionEntries.length - 1] : null;
      
      return {
        _id: story._id,
        title: story.title || 'Untitled',
        status: story.status || 'active',
        storyNumber: story.storyNumber || 0,
        totalWords: story.totalWords || story.childWords || 0,
        childWords: story.childWords || 0,
        
        // Assessment fields
        isUploadedForAssessment: story.isUploadedForAssessment || false,
        assessmentAttempts: story.assessmentAttempts || 0,
        assessment: story.assessment || null,
        
        // Publication fields
        isPublished: story.isPublished || false,
        publicationDate: story.publicationDate || null,
        competitionEligible: story.competitionEligible || false,
        
        // Competition fields (using actual schema)
        competitionEntries: story.competitionEntries || [],
        submittedToCompetition: hasCompetitionEntry,
        competitionSubmissionDate: latestCompetitionEntry?.submittedAt || null,
        competitionId: latestCompetitionEntry?.competitionId || null,
        
        // Timestamps
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
        
        // Legacy fields for backward compatibility
        overallScore: story.assessment?.overallScore || story.overallScore || 0,
        grammarScore: story.assessment?.grammarScore || story.grammarScore || 0,
        creativityScore: story.assessment?.creativityScore || story.creativityScore || 0,
        feedback: story.assessment?.feedback || story.feedback || '',
      };
    });

    const totalCount = await StorySession.countDocuments(query);

    return NextResponse.json({
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
        completed: formattedStories.filter(s => s.status === 'completed').length,
        active: formattedStories.filter(s => s.status === 'active').length,
        published: formattedStories.filter(s => s.isPublished).length,
        submittedToCompetition: formattedStories.filter(s => s.submittedToCompetition).length,
      },
    });

  } catch (error) {
    console.error('Error fetching user stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}