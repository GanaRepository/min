// import { NextRequest, NextResponse } from 'next/server';
// import { connectToDatabase } from '@/utils/db';
// import { CompetitionManager } from '@/lib/competition-manager';

// export async function POST(req: NextRequest) {
//   try {
//     // Verify cron secret
//     const authHeader = req.headers.get('authorization');
//     const expectedToken = `Bearer ${process.env.CRON_SECRET_TOKEN}`;

//     if (authHeader !== expectedToken) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     console.log('🏆 Checking competition phase transitions...');

//     await connectToDatabase();

//     // Get current competition and check if phase needs to advance
//     const currentCompetition = await CompetitionManager.getCurrentCompetition();

//     if (currentCompetition) {
//       const updatedCompetition = await CompetitionManager.advancePhase(
//         currentCompetition._id.toString()
//       );

//       console.log(
//         `📊 Competition ${updatedCompetition.month} is in ${updatedCompetition.phase} phase`
//       );

//       return NextResponse.json({
//         success: true,
//         message: `Competition phase check completed`,
//         competition: {
//           month: updatedCompetition.month,
//           phase: updatedCompetition.phase,
//           isActive: updatedCompetition.isActive,
//         },
//         timestamp: new Date().toISOString(),
//       });
//     } else {
//       console.log('ℹ️ No active competition found');
//       return NextResponse.json({
//         success: true,
//         message: 'No active competition found',
//         timestamp: new Date().toISOString(),
//       });
//     }
//   } catch (error) {
//     console.error('Competition phase check failed:', error);
//     return NextResponse.json(
//       { error: 'Competition phase check failed' },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(req: NextRequest) {
//   return POST(req);
// }

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import { CompetitionManager } from '@/lib/competition-manager';

export async function POST(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    const expectedToken = `Bearer ${process.env.CRON_SECRET_TOKEN}`;

    if (process.env.CRON_SECRET_TOKEN && authHeader !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🏆 Checking competition phase transitions...');

    await connectToDatabase();

    // Get current competition and check if phase needs to advance
    const currentCompetition = await CompetitionManager.getCurrentCompetition();

    if (currentCompetition) {
      const updatedCompetition = await CompetitionManager.advancePhase(
        currentCompetition._id.toString()
      );

      console.log(
        `📊 Competition ${updatedCompetition.month} is in ${updatedCompetition.phase} phase`
      );

      return NextResponse.json({
        success: true,
        message: `Competition phase check completed`,
        competition: {
          month: updatedCompetition.month,
          phase: updatedCompetition.phase,
          isActive: updatedCompetition.isActive,
        },
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log('ℹ️ No active competition found');
      return NextResponse.json({
        success: true,
        message: 'No active competition found',
        timestamp: new Date().toISOString(),
        });
   }
 } catch (error) {
   console.error('Competition phase check failed:', error);
   return NextResponse.json(
     { error: 'Competition phase check failed' },
     { status: 500 }
   );
 }
}

export async function GET(req: NextRequest) {
 return POST(req);
}