// app/api/community/stats/route.ts - COMMUNITY STATISTICS
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();

    const [
      totalPublishedStories,
      totalAuthors,
      totalViewsResult,
      totalLikesResult,
      featuredStories,
      competitionWinners
    ] = await Promise.all([
      StorySession.countDocuments({ isPublished: true }),
      StorySession.distinct('childId', { isPublished: true }).then(ids => ids.length),
      StorySession.aggregate([
        { $match: { isPublished: true } },
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ]),
      StorySession.aggregate([
        { $match: { isPublished: true } },
        { $group: { _id: null, totalLikes: { $sum: { $size: { $ifNull: ['$likes', []] } } } } }
      ]),
      StorySession.countDocuments({ isPublished: true, isFeatured: true }),
      StorySession.countDocuments({ 
        isPublished: true, 
        'competitionEntries.isWinner': true 
      })
    ]);

    const totalViews = totalViewsResult[0]?.totalViews || 0;
    const totalLikes = totalLikesResult[0]?.totalLikes || 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalPublishedStories,
        totalAuthors,
        totalViews,
        totalLikes,
        featuredStories,
        competitionWinners
      }
    });

  } catch (error) {
    console.error('Error fetching community stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community stats' },
      { status: 500 }
    );
  }
}