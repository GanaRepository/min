// app/api/cron/monthly-reset/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import { UsageManager } from '@/lib/usage-manager';
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

    // Reset monthly usage for all users using NEW system
    const resetResult = await UsageManager.resetMonthlyUsage();

    // Send monthly reset notification emails
    try {
      await sendMonthlyResetNotification();
      console.log('📧 Monthly reset notification emails sent');
    } catch (emailError) {
      console.error('Failed to send monthly reset emails:', emailError);
    }

    console.log(
      `✅ Monthly usage reset completed for ${resetResult.usersReset} users`
    );

    return NextResponse.json({
      success: true,
      message: `Monthly usage reset completed for ${resetResult.usersReset} users`,
      resetCount: resetResult.usersReset,
      errors: resetResult.errors,
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
  return POST(req);
}
