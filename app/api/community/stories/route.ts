// app/api/community/stories/route.ts - FIXED WITH PROPER TYPING
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';

export const dynamic = 'force-dynamic';

// Define the exact type that comes from the database
interface StoryDocument {
  _id: any;
  title: string;
  content?: string;
  aiOpening?: string;
  totalWords?: number;
  childWords?: number;
  publishedAt?: Date;
  updatedAt: Date;
  childId: {
    _id: any;
    firstName: string;
    lastName: string;
    ageGroup?: string;
  };
  assessment?: {
    overallScore?: number;
    creativityScore?: number;
    grammarScore?: number;
    vocabularyScore?: number;
  };
  overallScore?: number;
  creativityScore?: number;
  grammarScore?: number;
  competitionEntries?: Array<{
    isWinner?: boolean;
    position?: number;
    competitionName?: string;
    month?: string;
  }>;
  isUploadedForAssessment?: boolean;
  views?: number;
  likes?: any[];
  bookmarks?: any[];
  tags?: string[];
  genre?: string;
  elements?: {
    genre?: string;
  };
  isFeatured?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sort = searchParams.get('sort') || 'newest';
    const search = searchParams.get('search') || '';
    const genre = searchParams.get('genre') || '';
    const ageGroup = searchParams.get('ageGroup') || '';

    await connectToDatabase();

    // Build filter for published stories only
    const filter: any = { isPublished: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'elements.genre': { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (genre) {
      filter['elements.genre'] = genre;
    }

    // Build sort query
    let sortQuery: any = {};
    switch (sort) {
      case 'newest':
        sortQuery = { publishedAt: -1 };
        break;
      case 'popular':
        sortQuery = { views: -1 };
        break;
      case 'most_liked':
        sortQuery = { likes: -1 };
        break;
      case 'most_viewed':
        sortQuery = { views: -1 };
        break;
      case 'highest_rated':
        sortQuery = { 'assessment.overallScore': -1 };
        break;
      default:
        sortQuery = { publishedAt: -1 };
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const [stories, totalStories] = await Promise.all([
      (await StorySession.find(filter)
        .populate('childId', 'firstName lastName ageGroup')
        .sort(sortQuery)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()) as unknown as StoryDocument[],
      StorySession.countDocuments(filter),
    ]);

    // Transform stories for community display
    const transformedStories = await Promise.all(
      stories.map(async (story: StoryDocument) => {
        // Get story type - safely handle competitionEntries
        const storyType =
          story.competitionEntries && story.competitionEntries.length > 0
            ? 'competition'
            : story.isUploadedForAssessment
              ? 'uploaded'
              : 'freestyle';

        // Create excerpt from first turn or content
        let excerpt = '';
        if (story.content) {
          excerpt = story.content.substring(0, 200) + '...';
        } else if (story.aiOpening) {
          excerpt = story.aiOpening.substring(0, 200) + '...';
        } else {
          // Get first turn for excerpt
          const firstTurn = (await Turn.findOne({ sessionId: story._id })
            .sort({ turnNumber: 1 })
            .lean()) as any;
          if (firstTurn?.childInput) {
            excerpt = firstTurn.childInput.substring(0, 200) + '...';
          } else {
            excerpt = 'No preview available';
          }
        }

        // Check if user has liked/bookmarked (if logged in) - safely handle arrays
        const likesArray = story.likes || [];
        const bookmarksArray = story.bookmarks || [];
        const isLikedByUser = userId
          ? likesArray.some((like: any) => like.toString() === userId)
          : false;
        const isBookmarkedByUser = userId
          ? bookmarksArray.some(
              (bookmark: any) => bookmark.toString() === userId
            )
          : false;

        // Format competition winner info - safely handle competitionEntries
        let competitionWinner;
        if (story.competitionEntries && story.competitionEntries.length > 0) {
          const winningEntry = story.competitionEntries.find(
            (entry: any) => entry.isWinner
          );
          if (winningEntry) {
            competitionWinner = {
              position: winningEntry.position || 1,
              competitionName:
                winningEntry.competitionName || 'Monthly Competition',
              month:
                winningEntry.month ||
                new Date(
                  story.publishedAt || story.updatedAt
                ).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                }),
            };
          }
        }

        return {
          _id: story._id.toString(),
          title: story.title || 'Untitled Story',
          excerpt,
          wordCount: story.totalWords || story.childWords || 0,
          storyType,
          publishedAt: story.publishedAt || story.updatedAt,
          author: {
            _id: story.childId._id.toString(),
            firstName: story.childId.firstName,
            lastName: story.childId.lastName,
            ageGroup: story.childId.ageGroup || 'Unknown',
          },
          assessment: {
            overallScore:
              story.assessment?.overallScore || story.overallScore || 0,
            creativity:
              story.assessment?.creativityScore || story.creativityScore || 0,
            grammar: story.assessment?.grammarScore || story.grammarScore || 0,
            vocabulary: story.assessment?.vocabularyScore || 0,
          },
          stats: {
            views: story.views || 0,
            likes: likesArray.length,
            comments: 0, // Could be calculated with another query if needed
            bookmarks: bookmarksArray.length,
          },
          tags: story.tags || [],
          genre: story.genre || story.elements?.genre || 'Adventure',
          isFeatured: story.isFeatured || false,
          competitionWinner,
          isLikedByUser,
          isBookmarkedByUser,
        };
      })
    );

    const hasMore = page * limit < totalStories;

    return NextResponse.json({
      success: true,
      stories: transformedStories,
      pagination: {
        page,
        limit,
        total: totalStories,
        pages: Math.ceil(totalStories / limit),
      },
      hasMore,
    });
  } catch (error) {
    console.error('Error fetching community stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community stories' },
      { status: 500 }
    );
  }
}
