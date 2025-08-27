// app/api/admin/analytics/stories/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Story creation trends
    const storyTrends = await StorySession.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth() - 11,
              1
            ),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          active: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Word count analysis
    const wordAnalysis = await StorySession.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          avgWords: { $avg: '$totalWords' },
          minWords: { $min: '$totalWords' },
          maxWords: { $max: '$totalWords' },
          totalWords: { $sum: '$totalWords' },
        },
      },
    ]);

    // Most popular story elements
    const popularElements = await StorySession.aggregate([
      { $match: { elements: { $exists: true } } },
      {
        $project: {
          elementsArray: { $objectToArray: '$elements' },
        },
      },
      { $unwind: '$elementsArray' },
      {
        $group: {
          _id: {
            type: '$elementsArray.k',
            value: '$elementsArray.v',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    // Top stories by engagement
    const topStories = await StorySession.find({ status: 'completed' })
      .populate('childId', 'firstName lastName')
      .sort({ totalWords: -1 })
      .limit(10)
      .select('title totalWords childId createdAt isPublished')
      .lean();

    return NextResponse.json({
      success: true,
      storyAnalytics: {
        trends: storyTrends,
        wordAnalysis: wordAnalysis[0] || {},
        popularElements,
        topStories,
      },
    });
  } catch (error) {
    console.error('Error fetching story analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story analytics' },
      { status: 500 }
    );
  }
}
