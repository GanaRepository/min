// app/api/community/stories/route.ts - COMMUNITY STORIES
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const genre = searchParams.get('genre') || 'all';
    const ageGroup = searchParams.get('ageGroup') || 'all';
    const sort = searchParams.get('sort') || 'newest';
    const featured = searchParams.get('featured') === 'true';
    const winners = searchParams.get('winners') === 'true';

    await connectToDatabase();

    // Build filter for published stories only
    let filter: any = {
      isPublished: true,
      status: 'completed'
    };

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const userIds = await User.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex }
        ],
        role: 'child'
      }).distinct('_id');

      filter.$or = [
        { title: searchRegex },
        { childId: { $in: userIds } }
      ];
    }

    // Genre filter
    if (genre !== 'all') {
      filter.genre = genre;
    }

    // Age group filter
    if (ageGroup !== 'all') {
      // This would require age group info in user profile
      const ageGroupUsers = await User.find({
        role: 'child',
        ageGroup: ageGroup
      }).distinct('_id');
      filter.childId = { $in: ageGroupUsers };
    }

    // Featured filter
    if (featured) {
      filter.isFeatured = true;
    }

    // Winners filter
    if (winners) {
      filter['competitionEntries.isWinner'] = true;
    }

    // Sort options
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
      StorySession.find(filter)
        .populate('childId', 'firstName lastName ageGroup')
        .sort(sortQuery)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      StorySession.countDocuments(filter)
    ]);

    // Transform stories for community display
    const transformedStories = stories.map(story => {
      // Get story type
      const storyType = story.competitionEntries?.length > 0 ? 'competition' : 
                      story.isUploadedForAssessment ? 'uploaded' : 'freestyle';

      // Create excerpt from first turn or content
      // Create excerpt from first turn or content
     const excerpt = story.turns?.[0]?.content?.substring(0, 200) + '...' || 
                    story.content?.substring(0, 200) + '...' || 
                    'No preview available';

     // Check if user has liked/bookmarked (if logged in)
     const isLikedByUser = userId ? (story.likes || []).includes(userId) : false;
     const isBookmarkedByUser = userId ? (story.bookmarks || []).includes(userId) : false;

     // Get competition winner info if applicable
     let competitionWinner = null;
     if (story.competitionEntries?.length > 0) {
       const winnerEntry = story.competitionEntries.find(entry => entry.isWinner);
       if (winnerEntry) {
         competitionWinner = {
           position: winnerEntry.position,
           competitionName: winnerEntry.competitionName,
           month: winnerEntry.month
         };
       }
     }

     return {
       _id: story._id,
       title: story.title,
       excerpt,
       wordCount: story.wordCount || 0,
       storyType,
       publishedAt: story.publishedAt || story.createdAt,
       author: {
         _id: story.childId._id,
         firstName: story.childId.firstName,
         lastName: story.childId.lastName,
         ageGroup: story.childId.ageGroup || '9-12'
       },
       assessment: {
         overallScore: story.assessment?.overallScore || 0,
         creativity: story.assessment?.creativity || 0,
         grammar: story.assessment?.grammar || 0,
         vocabulary: story.assessment?.vocabulary || 0
       },
       stats: {
         views: story.views || 0,
         likes: story.likes?.length || 0,
         comments: story.comments?.length || 0,
         bookmarks: story.bookmarks?.length || 0
       },
       tags: story.tags || [],
       genre: story.genre || 'Fantasy',
       isFeatured: story.isFeatured || false,
       competitionWinner,
       isLikedByUser,
       isBookmarkedByUser
     };
   });

   const hasMore = (page * limit) < totalStories;

   return NextResponse.json({
     success: true,
     stories: transformedStories,
     hasMore,
     pagination: {
       page,
       limit,
       total: totalStories,
       pages: Math.ceil(totalStories / limit)
     }
   });

 } catch (error) {
   console.error('Error fetching community stories:', error);
   return NextResponse.json(
     { error: 'Failed to fetch community stories' },
     { status: 500 }
   );
 }
}