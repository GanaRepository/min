import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { UsageManager } from '@/lib/usage-manager';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current usage and limits
    const [storyCheck, assessmentCheck, competitionCheck] = await Promise.all([
      UsageManager.canCreateStory(session.user.id),
      UsageManager.canUploadAssessment(session.user.id),
      UsageManager.canEnterCompetition(session.user.id),
    ]);

    const limits = {
      stories: {
        used: storyCheck.currentUsage?.stories || 0,
        limit: storyCheck.limits?.stories || 3,
        remaining: Math.max(0, (storyCheck.limits?.stories || 3) - (storyCheck.currentUsage?.stories || 0)),
        canUse: storyCheck.allowed,
      },
      assessments: {
        used: assessmentCheck.currentUsage?.assessments || 0,
        limit: assessmentCheck.limits?.assessments || 3,
        remaining: Math.max(0, (assessmentCheck.limits?.assessments || 3) - (assessmentCheck.currentUsage?.assessments || 0)),
        canUse: assessmentCheck.allowed,
      },
      competitions: {
        used: competitionCheck.currentUsage?.competitionEntries || 0,
        limit: competitionCheck.limits?.competitionEntries || 3,
        remaining: Math.max(0, (competitionCheck.limits?.competitionEntries || 3) - (competitionCheck.currentUsage?.competitionEntries || 0)),
        canUse: competitionCheck.allowed,
      },
      resetDate: getNextMonthFirstDay(),
    };

    return NextResponse.json({
      success: true,
      limits
    });

  } catch (error) {
    console.error('Error fetching subscription limits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch limits' },
      { status: 500 }
    );
  }
}

function getNextMonthFirstDay(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}