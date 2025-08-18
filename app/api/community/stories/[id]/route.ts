// app/api/community/stories/[id]/route.ts - FIXED WITH PROPER TYPING
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import StoryComment from '@/models/StoryComment';
import Turn from '@/models/Turn';

export const dynamic = 'force-dynamic';

// Define the exact type that comes from the database
interface StoryDocument {
  _id: any;
  title: string;
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
    structureScore?: number;
    characterDevelopmentScore?: number;
    plotDevelopmentScore?: number;
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

interface CommentDocument {
  _id: any;
  content: string;
  createdAt: Date;
  likes?: any[];
  authorId: {
    _id: any;
    firstName: string;
    lastName: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;

    await connectToDatabase();

    // Find the published story
    const story = await StorySession.findOne({
      _id: id,
      isPublished: true
    }).populate('childId', 'firstName lastName ageGroup').lean() as StoryDocument | null;

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found or not published' },
        { status: 404 }
      );
    }

    // Get story turns to build complete content
    const turns = await Turn.find({ sessionId: id })
      .sort({ turnNumber: 1 })
      .lean();

    // Build complete story content
    const storyParts = [];
    if (story.aiOpening) {
      storyParts.push(story.aiOpening);
    }

    turns.forEach((turn: any) => {
      if (turn.childInput) {
        storyParts.push(turn.childInput);
      }
      if (turn.aiResponse) {
        storyParts.push(turn.aiResponse);
      }
    });

    const completeContent = storyParts.join('\n\n');

    // Get comments for this story
    const comments = await StoryComment.find({ 
      storyId: id,
      isPublic: true 
    })
      .populate('authorId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean() as unknown as CommentDocument[];

    // Determine story type - safely handle competitionEntries
    const storyType = (story.competitionEntries && story.competitionEntries.length > 0) ? 'competition' : 
                     (story.isUploadedForAssessment) ? 'uploaded' : 'freestyle';

    // Check if user has liked/bookmarked (if logged in) - safely handle arrays
    const userId = session?.user?.id;
    const likesArray = story.likes || [];
    const bookmarksArray = story.bookmarks || [];
    const isLikedByUser = userId ? likesArray.some((like: any) => like.toString() === userId) : false;
    const isBookmarkedByUser = userId ? bookmarksArray.some((bookmark: any) => bookmark.toString() === userId) : false;

    // Format competition winner info - safely handle competitionEntries
    let competitionWinner;
    if (story.competitionEntries && story.competitionEntries.length > 0) {
      const winningEntry = story.competitionEntries.find((entry: any) => entry.isWinner);
      if (winningEntry) {
        competitionWinner = {
          position: winningEntry.position || 1,
          competitionName: winningEntry.competitionName || 'Monthly Competition',
          month: winningEntry.month || new Date(story.publishedAt || story.updatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        };
      }
    }

    // Format the story details
    const storyDetails = {
      _id: story._id.toString(),
      title: story.title || 'Untitled Story',
      content: completeContent,
      wordCount: story.totalWords || story.childWords || 0,
      storyType,
      publishedAt: story.publishedAt || story.updatedAt,
      author: {
        _id: story.childId._id.toString(),
        firstName: story.childId.firstName,
        lastName: story.childId.lastName,
        ageGroup: story.childId.ageGroup || 'Unknown',
        totalStories: 1 // We could calculate this with another query if needed
      },
      assessment: {
        overallScore: (story.assessment?.overallScore) || story.overallScore || 0,
        creativity: (story.assessment?.creativityScore) || story.creativityScore || 0,
        grammar: (story.assessment?.grammarScore) || story.grammarScore || 0,
        vocabulary: (story.assessment?.vocabularyScore) || 0,
        structure: (story.assessment?.structureScore) || 0,
        characterDevelopment: (story.assessment?.characterDevelopmentScore) || 0,
        plotDevelopment: (story.assessment?.plotDevelopmentScore) || 0
      },
      stats: {
        views: story.views || 0,
        likes: likesArray.length,
        comments: comments.length,
        bookmarks: bookmarksArray.length
      },
      tags: story.tags || [],
      genre: story.genre || (story.elements?.genre) || 'Adventure',
      isFeatured: story.isFeatured || false,
      competitionWinner,
      isLikedByUser,
      isBookmarkedByUser,
      comments: comments.map((comment: CommentDocument) => {
        const commentLikesArray = comment.likes || [];
        return {
          _id: comment._id.toString(),
          authorId: comment.authorId._id.toString(),
          authorName: `${comment.authorId.firstName} ${comment.authorId.lastName}`,
          content: comment.content,
          createdAt: comment.createdAt,
          likes: commentLikesArray.length,
          isLikedByUser: userId ? commentLikesArray.some((like: any) => like.toString() === userId) : false
        };
      })
    };

    return NextResponse.json({
      success: true,
      story: storyDetails
    });

  } catch (error) {
    console.error('Error fetching story details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story details' },
      { status: 500 }
    );
  }
}