import { NextResponse } from 'next/server';
import crypto from 'crypto';
import User from '@/models/User';
import { connectToDatabase } from '@/utils/db';
import { sendPasswordResetEmail } from '@/lib/mailer';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Validate email
    if (!email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      return NextResponse.json(
        { message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find user by email (regardless of role)
    const user = await User.findOne({ email });

    // If no user is found, we still return a success response for security reasons
    // This prevents user enumeration attacks
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return NextResponse.json(
        {
          message:
            'If a user with that email exists, we have sent a password reset link',
        },
        { status: 200 }
      );
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before storing in the database
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token and expiry (15 minutes)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    // Create reset URL - use appropriate base URL based on environment
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    // Send email with reset link - the function handles the actual email sending
    try {
      await sendPasswordResetEmail(user.email, resetUrl, user.role);

      return NextResponse.json({
        message: 'Password reset link has been sent to your email',
      });
    } catch (error) {
      // If email sending fails, clear the reset token and throw error
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      console.error('Error sending password reset email:', error);

      return NextResponse.json(
        {
          message:
            'Error sending password reset email. Please try again later.',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
