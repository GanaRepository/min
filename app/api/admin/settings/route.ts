import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import PlatformSettings from '@/models/PlatformSettings';

export const dynamic = 'force-dynamic';

// GET - Fetch platform settings
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

    // Get settings or create default if doesn't exist
    let settings = await PlatformSettings.findOne();

    if (!settings) {
      // Create default settings
      settings = await PlatformSettings.create({
        general: {
          platformName: 'Mintoons',
          platformDescription: 'Creative writing platform for young minds',
          supportEmail: 'support@mintoons.com',
          maxStoriesPerUser: 10,
          maxApiCallsPerStory: 7,
          allowUserRegistration: true,
        },
        email: {
          smtpHost: '',
          smtpPort: 587,
          smtpUser: '',
          smtpSecure: true,
          fromEmail: 'noreply@mintoons.com',
          fromName: 'Mintoons',
        },
        security: {
          requireEmailVerification: true,
          passwordMinLength: 8,
          sessionTimeout: 1440, // 24 hours in minutes
          maxLoginAttempts: 5,
          enableTwoFactor: false,
        },
        content: {
          allowAdultContent: false,
          moderationEnabled: true,
          autoModerationLevel: 'medium',
          wordLimit: 5000,
        },
        notifications: {
          emailNotifications: true,
          adminAlerts: true,
          weeklyReports: true,
          systemMaintenance: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT - Update platform settings
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();

    await connectToDatabase();

    // Update or create settings
    const settings = await PlatformSettings.findOneAndUpdate(
      {},
      {
        ...body,
        updatedAt: new Date(),
        updatedBy: session.user.id,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return NextResponse.json({
      success: true,
      settings,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
