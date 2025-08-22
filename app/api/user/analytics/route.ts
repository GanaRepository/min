import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const stories = await StorySession.find({ childId: session.user.id });

    // Filter stories with valid assessments
    const storiesWithScores = stories.filter(
      (s) =>
        s.assessment?.overallScore !== undefined &&
        s.assessment.overallScore !== null
    );

    const storiesWithGrammar = stories.filter(
      (s) =>
        s.assessment?.grammarScore !== undefined &&
        s.assessment.grammarScore !== null
    );

    const storiesWithCreativity = stories.filter(
      (s) =>
        s.assessment?.creativityScore !== undefined &&
        s.assessment.creativityScore !== null
    );

    const storiesWithVocabulary = stories.filter(
      (s) =>
        s.assessment?.vocabularyScore !== undefined &&
        s.assessment.vocabularyScore !== null
    );

    const analytics = {
      overview: {
        totalStories: stories.length,
        completedStories: stories.filter((s) => s.status === 'completed')
          .length,
        totalWords: stories.reduce(
          (sum, s) => sum + (Number(s.childWords) || 0),
          0
        ),
        averageWords:
          stories.length > 0
            ? Math.round(
                stories.reduce(
                  (sum, s) => sum + (Number(s.childWords) || 0),
                  0
                ) / stories.length
              )
            : 0,
        bestScore:
          storiesWithScores.length > 0
            ? Math.max(
                ...storiesWithScores.map((s) =>
                  Number(s.assessment!.overallScore)
                )
              )
            : 0,
        averageScore:
          storiesWithScores.length > 0
            ? Math.round(
                storiesWithScores.reduce(
                  (sum, s) => sum + Number(s.assessment!.overallScore),
                  0
                ) / storiesWithScores.length
              )
            : 0,
      },
      monthly: {
        thisMonth: stories.filter((s) => {
          const storyDate = new Date(s.createdAt);
          const now = new Date();
          return (
            storyDate.getMonth() === now.getMonth() &&
            storyDate.getFullYear() === now.getFullYear()
          );
        }).length,
        wordsThisMonth: stories
          .filter((s) => {
            const storyDate = new Date(s.createdAt);
            const now = new Date();
            return (
              storyDate.getMonth() === now.getMonth() &&
              storyDate.getFullYear() === now.getFullYear()
            );
          })
          .reduce((sum, s) => sum + (Number(s.childWords) || 0), 0),
      },
      categories: {
        grammarAverage:
          storiesWithGrammar.length > 0
            ? Math.round(
                storiesWithGrammar.reduce(
                  (sum, s) => sum + Number(s.assessment!.grammarScore),
                  0
                ) / storiesWithGrammar.length
              )
            : 0,
        creativityAverage:
          storiesWithCreativity.length > 0
            ? Math.round(
                storiesWithCreativity.reduce(
                  (sum, s) => sum + Number(s.assessment!.creativityScore),
                  0
                ) / storiesWithCreativity.length
              )
            : 0,
        vocabularyAverage:
          storiesWithVocabulary.length > 0
            ? Math.round(
                storiesWithVocabulary.reduce(
                  (sum, s) => sum + Number(s.assessment!.vocabularyScore),
                  0
                ) / storiesWithVocabulary.length
              )
            : 0,
      },
      recent: stories
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5)
        .map((s) => ({
          id: s._id?.toString(),
          title: s.title,
          createdAt: s.createdAt,
          status: s.status,
          words: Number(s.childWords) || 0,
          score: s.assessment?.overallScore
            ? Number(s.assessment.overallScore)
            : null,
        })),
    };

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
