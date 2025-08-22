import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { CompetitionManager } from '@/lib/competition-manager';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const eligibility = await CompetitionManager.canUserSubmit(session.user.id);
    const userEntries = await CompetitionManager.getUserSubmissions(
      session.user.id
    );

    return NextResponse.json({
      success: true,
      ...eligibility,
      userEntries,
    });
  } catch (error) {
    console.error('Error checking competition eligibility:', error);
    return NextResponse.json(
      { error: 'Failed to check competition eligibility' },
      { status: 500 }
    );
  }
}
