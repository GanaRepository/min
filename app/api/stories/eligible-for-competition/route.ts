import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { CompetitionManager } from '@/lib/competition-manager';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'child') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stories = await CompetitionManager.getEligibleStories(session.user.id);

    return NextResponse.json({ stories });
  } catch (error) {
    console.error('Error fetching eligible stories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}