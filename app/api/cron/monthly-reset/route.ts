// app/api/cron/monthly-reset/route.ts - Monthly Usage Reset Cron Job
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import { resetMonthlyUsage } from '@/lib/rate-limiter';
import { sendMonthlyResetNotification } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    const expectedToken = `Bearer ${process.env.CRON_SECRET_TOKEN}`;
    
    if (authHeader !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting monthly usage reset...');

    await connectToDatabase();

    // Reset monthly usage for all users
    const resetCount = await resetMonthlyUsage();

    // Send monthly reset notification emails
    try {
      await sendMonthlyResetNotification();
      console.log('📧 Monthly reset notification emails sent');
    } catch (emailError) {
      console.error('Failed to send monthly reset emails:', emailError);
    }

    console.log(`✅ Monthly usage reset completed for ${resetCount} users`);

    return NextResponse.json({
      success: true,
      message: `Monthly usage reset completed for ${resetCount} users`,
      resetCount,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Monthly reset failed:', error);
    return NextResponse.json(
      { error: 'Monthly reset failed' },
      { status: 500 }
    );
  }
}

// Also handle GET for manual testing
export async function GET(req: NextRequest) {
  // Same logic as POST - for manual testing
  return POST(req);
}