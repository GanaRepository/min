// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/utils/authOptions';
// import { CompetitionManager } from '@/lib/competition-manager';

// export async function POST(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user || session.user.role !== 'child') {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { storyId } = await request.json();
//     if (!storyId) {
//       return NextResponse.json({ error: 'Story ID required' }, { status: 400 });
//     }

//     const result = await CompetitionManager.submitStoryToCompetition(storyId, session.user.id);

//     return NextResponse.json({ 
//       success: true, 
//       competition: result.competitionId,
//       message: 'Story submitted to competition successfully!'
//     });
//   } catch (error) {
//     console.error('Error submitting to competition:', error);
//     return NextResponse.json({ 
//       error: (error instanceof Error ? error.message : 'Failed to submit to competition')
//     }, { status: 400 });
//   }
// }

// app/api/competitions/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { CompetitionManager } from '@/lib/competition-manager';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'child') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storyId } = await request.json();
    if (!storyId) {
      return NextResponse.json({ error: 'Story ID required' }, { status: 400 });
    }

    const result = await CompetitionManager.submitStoryToCompetition(storyId, session.user.id);

    return NextResponse.json({ 
      success: true, 
      competition: result.competitionId,
      message: 'Story submitted to competition successfully!'
    });
  } catch (error) {
    console.error('Error submitting to competition:', error);
    return NextResponse.json({ 
      error: (error instanceof Error ? error.message : 'Failed to submit to competition')
    }, { status: 400 });
  }
}