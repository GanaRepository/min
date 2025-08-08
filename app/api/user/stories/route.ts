// // app/api/user/stories/route.ts
// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/utils/authOptions';
// import { connectToDatabase } from '@/utils/db';
// import StorySession from '@/models/StorySession';
// import mongoose from 'mongoose';

// export const dynamic = 'force-dynamic';

// export async function GET() {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || session.user.role !== 'child') {
//       return NextResponse.json(
//         { error: 'Access denied. Children only.' },
//         { status: 403 }
//       );
//     }

//     await connectToDatabase();

//     const userId = new mongoose.Types.ObjectId(session.user.id);

//     // Get all story sessions for the user
//     const storySessions = await StorySession.find({ childId: userId })
//       .sort({ updatedAt: -1 })
//       .lean();

//     // Transform the data for frontend
//     const stories = storySessions.map((session) => ({
//       _id: session._id,
//       storyNumber: session.storyNumber,
//       title: session.title,
//       elements: session.elements,
//       status: session.status,
//       currentTurn: session.currentTurn,
//       totalWords: session.totalWords,
//       childWords: session.childWords,
//       apiCallsUsed: session.apiCallsUsed,
//       maxApiCalls: session.maxApiCalls,
//       createdAt: session.createdAt,
//       updatedAt: session.updatedAt,
//       // Use real assessment scores if available
//       ...(session.status === 'completed' && {
//         overallScore:
//           session.assessment?.overallScore ?? session.overallScore ?? 0,
//         grammarScore:
//           session.assessment?.grammarScore ?? session.grammarScore ?? 0,
//         creativityScore:
//           session.assessment?.creativityScore ?? session.creativityScore ?? 0,
//         feedback: session.assessment?.feedback ?? session.feedback ?? '',
//         publishedAt: session.updatedAt,
//       }),
//     }));

//     return NextResponse.json({
//       success: true,
//       stories,
//       stats: {
//         total: stories.length,
//         completed: stories.filter((s) => s.status === 'completed').length,
//         active: stories.filter((s) => s.status === 'active').length,
//         paused: stories.filter((s) => s.status === 'paused').length,
//         totalWords: stories.reduce((sum, s) => sum + (s.childWords || 0), 0),
//       },
//     });
//   } catch (error) {
//     console.error('Error fetching user stories:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch stories' },
//       { status: 500 }
//     );
//   }
// }


// app/api/user/stories/route.ts - Get User's Stories with Filtering
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const published = searchParams.get('published') === 'true';
    const competitionEligible = searchParams.get('competitionEligible') === 'true';
    const isUploadedForAssessment = searchParams.get('assessment') === 'true';

    await connectToDatabase();

    // Build query filters
    const query: any = { childId: session.user.id };
    
    if (published !== undefined) {
      query.isPublished = published;
    }
    
    if (competitionEligible) {
      query.competitionEligible = true;
    }
    
    if (isUploadedForAssessment !== undefined) {
      query.isUploadedForAssessment = isUploadedForAssessment;
    }

    const stories = await StorySession.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .select('title status isUploadedForAssessment assessmentScore assessmentAttempts isPublished competitionEligible createdAt collaborativeContent freeformContent competitionEntries');

    // Add word count and format data
    const formattedStories = stories.map(story => {
      const content = story.collaborativeContent || story.freeformContent || '';
      const wordCount: number = content.trim().split(/\s+/).filter((word: string) => word.length > 0).length;
      
      return {
        _id: story._id,
        title: story.title,
        status: story.status,
        isUploadedForAssessment: story.isUploadedForAssessment,
        assessmentScore: story.assessmentScore,
        assessmentAttempts: story.assessmentAttempts || 0,
        isPublished: story.isPublished || false,
        competitionEligible: story.competitionEligible || false,
        createdAt: story.createdAt,
        wordCount,
        competitionEntries: story.competitionEntries || [],
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
    });

  } catch (error) {
    console.error('Error fetching user stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}
