// lib/mailer.ts - PROFESSIONAL PREMIUM Digiverse Story MAILER
import { UserRole } from '@/types/auth';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';
import Competition from '@/models/Competition';

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Professional email header template - EMAIL CLIENT COMPATIBLE
const getEmailHeader = () => `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 20px 20px 0 0;">
      <div style="background: rgba(255,255,255,0.95); padding: 25px; border-radius: 15px; display: inline-block; box-shadow: 0 8px 32px rgba(0,0,0,0.1); max-width: 400px;">
        <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
          <tr>
            <td style="vertical-align: middle; padding-right: 20px;">
              <div style="background: linear-gradient(45deg, #667eea, #764ba2); width: 70px; height: 70px; border-radius: 50%; display: table-cell; vertical-align: middle; text-align: center; box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);">
                <span style="color: white; font-size: 32px; font-weight: bold; line-height: 70px; display: inline-block; width: 100%; text-align: center;">M</span>
              </div>
            </td>
            <td style="vertical-align: middle; text-align: left;">
              <h1 style="margin: 0 0 5px 0; font-size: 32px; font-weight: 700; background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: #667eea; font-family: 'Segoe UI', Arial, sans-serif; letter-spacing: -0.5px;">Digiverse Story</h1>
              <p style="margin: 0; font-size: 14px; color: #64748b; font-weight: 500; line-height: 1.2;">AI-Powered Creative Writing Platform</p>
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;

// Professional email footer template - EMAIL CLIENT COMPATIBLE
const getEmailFooter = () => `
    <div style="background: #f8fafc; padding: 40px 20px; text-align: center; border-radius: 0 0 20px 20px; border-top: 1px solid #e2e8f0;">
      <div style="max-width: 500px; margin: 0 auto;">
        <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 25px auto;">
          <tr>
            <td style="padding: 8px 16px;">
              <a href="${process.env.NEXTAUTH_URL}" style="color: #667eea; text-decoration: none; font-weight: 600; font-size: 14px; padding: 8px 16px; border-radius: 20px; transition: background-color 0.2s; display: inline-block;">🏠 Home</a>
            </td>
            <td style="padding: 8px 16px;">
              <a href="${process.env.NEXTAUTH_URL}/pricing" style="color: #667eea; text-decoration: none; font-weight: 600; font-size: 14px; padding: 8px 16px; border-radius: 20px; transition: background-color 0.2s; display: inline-block;">💎 Pricing</a>
            </td>
            <td style="padding: 8px 16px;">
              <a href="${process.env.NEXTAUTH_URL}/contact-us" style="color: #667eea; text-decoration: none; font-weight: 600; font-size: 14px; padding: 8px 16px; border-radius: 20px; transition: background-color 0.2s; display: inline-block;">📧 Support</a>
            </td>
          </tr>
        </table>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 25px;">
          <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.6;">
            © ${new Date().getFullYear()} Digiverse Story. All rights reserved.<br/>
            Empowering young writers with AI-powered creativity tools.
          </p>
        </div>
      </div>
    </div>
  `;

/**
 * Send premium child registration email with upgrade incentives
 */
export const sendChildRegistrationEmail = async (
  email: string,
  firstName: string
): Promise<nodemailer.SentMessageInfo> => {
  const transporter = createTransporter();

  // USER EMAIL - Premium welcome with upgrade incentives
  const userMailOptions = {
    from: `"Digiverse Story Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🎉 Welcome to Digiverse Story - Your Premium Writing Journey Begins!',
    html: `
        <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1); font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;">
          <tr>
            <td align="center">
              ${getEmailHeader()}
            </td>
          </tr>
          
          <!-- Welcome Hero Section -->
          <tr>
            <td style="background: linear-gradient(135deg, #fef7ff 0%, #f0f9ff 100%); padding: 50px 30px; text-align: center; position: relative;">
              <div style="position: absolute; top: 20px; right: 20px; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                FREE STARTER PLAN
              </div>
              <h2 style="margin: 0 0 15px 0; font-size: 36px; font-weight: 700; color: #1a202c;">
                Welcome, ${firstName}! 🌟
              </h2>
              <p style="margin: 0 0 30px 0; font-size: 18px; color: #4a5568; line-height: 1.6; max-width: 400px; margin-left: auto; margin-right: auto;">
                You've joined thousands of young writers creating amazing stories with AI assistance!
              </p>
              
              <!-- Stats Row -->
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0;">
                <div style="text-align: center; padding: 20px; background: rgba(255,255,255,0.8); border-radius: 15px; border: 2px solid #e2e8f0;">
                  <div style="font-size: 32px; font-weight: 700; color: #667eea; margin-bottom: 5px;">10K+</div>
                  <div style="font-size: 14px; color: #64748b; font-weight: 500;">Stories Created</div>
                </div>
                <div style="text-align: center; padding: 20px; background: rgba(255,255,255,0.8); border-radius: 15px; border: 2px solid #e2e8f0;">
                  <div style="font-size: 32px; font-weight: 700; color: #10b981; margin-bottom: 5px;">500+</div>
                  <div style="font-size: 14px; color: #64748b; font-weight: 500;">Young Writers</div>
                </div>
                <div style="text-align: center; padding: 20px; background: rgba(255,255,255,0.8); border-radius: 15px; border: 2px solid #e2e8f0;">
                  <div style="font-size: 32px; font-weight: 700; color: #f59e0b; margin-bottom: 5px;">25+</div>
                  <div style="font-size: 14px; color: #64748b; font-weight: 500;">Countries</div>
                </div>
              </div>
            </td>
          </tr>

          <!-- Your Free Plan Section -->
          <tr>
            <td style="padding: 40px 30px; background: #ffffff;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h3 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #1a202c;">Your Free Starter Plan Includes:</h3>
                <p style="margin: 0; font-size: 16px; color: #64748b;">Everything you need to start your writing journey</p>
              </div>
              
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #fef7ff 100%); padding: 30px; border-radius: 20px; border: 2px solid #e2e8f0; margin-bottom: 30px;">
                <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                  <tr>
                    <td style="padding: 15px; vertical-align: top;">
                      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                        <tr>
                          <td style="width: 65px; vertical-align: middle; padding-right: 15px;">
                            <div style="background: #667eea; width: 50px; height: 50px; border-radius: 12px; text-align: center; line-height: 50px;">
                              <span style="color: white; font-size: 20px; display: inline-block; vertical-align: middle; line-height: normal;">✍️</span>
                            </div>
                          </td>
                          <td style="vertical-align: middle;">
                            <div style="font-size: 18px; font-weight: 600; color: #1a202c; margin-bottom: 3px;">3 Free Stories</div>
                            <div style="font-size: 14px; color: #64748b;">Create amazing stories with AI help</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td style="padding: 15px; vertical-align: top;">
                      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                        <tr>
                          <td style="width: 65px; vertical-align: middle; padding-right: 15px;">
                            <div style="background: #10b981; width: 50px; height: 50px; border-radius: 12px; text-align: center; line-height: 50px;">
                              <span style="color: white; font-size: 20px; display: inline-block; vertical-align: middle; line-height: normal;">🧠</span>
                            </div>
                          </td>
                          <td style="vertical-align: middle;">
                            <div style="font-size: 18px; font-weight: 600; color: #1a202c; margin-bottom: 3px;">3 AI Assessments</div>
                            <div style="font-size: 14px; color: #64748b;">Get detailed feedback on your writing</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 15px; vertical-align: top;">
                      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                        <tr>
                          <td style="width: 65px; vertical-align: middle; padding-right: 15px;">
                            <div style="background: #f59e0b; width: 50px; height: 50px; border-radius: 12px; text-align: center; line-height: 50px;">
                              <span style="color: white; font-size: 20px; display: inline-block; vertical-align: middle; line-height: normal;">🏆</span>
                            </div>
                          </td>
                          <td style="vertical-align: middle;">
                            <div style="font-size: 18px; font-weight: 600; color: #1a202c; margin-bottom: 3px;">Competition Entries</div>
                            <div style="font-size: 14px; color: #64748b;">Participate in monthly contests</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td style="padding: 15px; vertical-align: top; width: 50%;">
                      <!-- Empty cell for spacing when there's an odd number of items -->
                    </td>
                  </tr>
                </table>
                    <div>
                      <div style="font-size: 18px; font-weight: 600; color: #1a202c; margin-bottom: 3px;">Competition Entries</div>
                      <div style="font-size: 14px; color: #64748b;">Participate in monthly contests</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- CTA Buttons -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${process.env.NEXTAUTH_URL}/create-stories" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 18px 40px; text-decoration: none; font-size: 18px; font-weight: 600; border-radius: 50px; display: inline-block; margin: 0 10px 10px 0; box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3); transition: transform 0.2s;">
                  🚀 Start Writing Now
                </a>
                <a href="${process.env.NEXTAUTH_URL}/pricing" style="background: #ffffff; color: #667eea; padding: 18px 40px; text-decoration: none; font-size: 18px; font-weight: 600; border-radius: 50px; display: inline-block; border: 2px solid #667eea; transition: all 0.2s;">
                  💎 View Premium Plans
                </a>
              </div>
            </td>
          </tr>

          <!-- Upgrade Incentive Section -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%); padding: 40px 30px; color: white; text-align: center;">
              <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px 0; font-size: 28px; font-weight: 700; color: #ffffff;">Ready for More? 🚀</h3>
                <p style="margin: 0 0 25px 0; font-size: 16px; color: #a0aec0; line-height: 1.6;">
                  Unlock unlimited creativity with our Story Pack - perfect for young writers who want to explore more!
                </p>
              </div>
              
              <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 20px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); margin-bottom: 30px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin-bottom: 25px;">
                  <div style="text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #4ade80; margin-bottom: 8px;">+5 Stories</div>
                    <div style="font-size: 14px; color: #a0aec0;">Extra creations</div>
                  </div>
                  <div style="text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #60a5fa; margin-bottom: 8px;">+5 Assessments</div>
                    <div style="font-size: 14px; color: #a0aec0;">More feedback</div>
                  </div>
                  <div style="text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #f59e0b; margin-bottom: 8px;">$15</div>
                    <div style="font-size: 14px; color: #a0aec0;">One-time</div>
                  </div>
                </div>
                
                <a href="${process.env.NEXTAUTH_URL}/pricing" style="background: linear-gradient(135deg, #4ade80 0%, #06b6d4 100%); color: white; padding: 15px 35px; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 50px; display: inline-block; box-shadow: 0 6px 20px rgba(74, 222, 128, 0.3);">
                  💎 Upgrade to Story Pack
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td align="center">
              ${getEmailFooter()}
            </td>
          </tr>
        </table>
      `,
  };

  // ADMIN EMAIL - Professional notification
  const adminMailOptions = {
    from: `"Digiverse Story Platform" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: `👤 New User Registration - ${firstName}`,
    html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; color: white; text-align: center;">
            <h2 style="margin: 0; font-size: 24px; font-weight: 600;">New User Registration</h2>
          </div>
          
          <div style="padding: 30px;">
            <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #667eea;">
              <h3 style="margin: 0 0 15px 0; color: #1a202c; font-size: 18px;">User Details</h3>
              <div style="display: grid; gap: 8px;">
                <div><strong>Name:</strong> ${firstName}</div>
                <div><strong>Email:</strong> ${email}</div>
                <div><strong>Role:</strong> Child Writer</div>
                <div><strong>Plan:</strong> Free Starter (3 stories, 3 assessments)</div>
                <div><strong>Registered:</strong> ${new Date().toLocaleString()}</div>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
              <a href="${process.env.NEXTAUTH_URL}/admin/children" style="background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                View in Admin Dashboard
              </a>
            </div>
          </div>
        </div>
      `,
  };

  try {
    const [userInfo, adminInfo] = await Promise.all([
      transporter.sendMail(userMailOptions),
      transporter.sendMail(adminMailOptions),
    ]);

    console.log('Premium registration emails sent successfully:', {
      userMessageId: userInfo.messageId,
      adminMessageId: adminInfo.messageId,
    });

    return userInfo;
  } catch (error) {
    console.error('Error sending premium registration emails:', error);
    throw error;
  }
};

/**
 * Send premium password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string,
  role?: UserRole
): Promise<nodemailer.SentMessageInfo> => {
  const transporter = createTransporter();

  const userMailOptions = {
    from: `"Digiverse Story Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Reset Your Digiverse Story Password',
    html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">
          ${getEmailHeader()}
          
          <div style="padding: 50px 30px; text-align: center; background: linear-gradient(135deg, #fef7ff 0%, #f0f9ff 100%);">
            <div style="background: #fee2e2; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 25px auto; text-align: center; line-height: 80px;">
              <span style="font-size: 32px; display: inline-block; vertical-align: middle; line-height: normal;">🔐</span>
            </div>
            
            <h2 style="margin: 0 0 15px 0; font-size: 28px; font-weight: 700; color: #1a202c;">
              Password Reset Request
            </h2>
            
            <p style="margin: 0 0 35px 0; font-size: 16px; color: #64748b; line-height: 1.6; max-width: 400px; margin-left: auto; margin-right: auto;">
              We received a request to reset your password. Click the button below to create a new password.
            </p>
            
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 18px 40px; text-decoration: none; font-size: 18px; font-weight: 600; border-radius: 50px; display: inline-block; box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3); margin-bottom: 30px;">
              🔑 Reset My Password
            </a>
            
            <div style="background: rgba(239, 68, 68, 0.1); padding: 20px; border-radius: 15px; border: 1px solid rgba(239, 68, 68, 0.2);">
              <p style="margin: 0; font-size: 14px; color: #7f1d1d; font-weight: 500;">
                ⏰ This link expires in 15 minutes for security reasons
              </p>
            </div>
          </div>
          
          <div style="padding: 30px; background: #f8fafc; text-align: center;">
            <p style="margin: 0 0 15px 0; font-size: 14px; color: #64748b;">
              If you didn't request this, you can safely ignore this email.
            </p>
            <p style="margin: 0; font-size: 12px; color: #94a3b8; word-break: break-all;">
              Link: ${resetUrl}
            </p>
          </div>
          
          ${getEmailFooter()}
        </div>
      `,
  };

  try {
    const userInfo = await transporter.sendMail(userMailOptions);
    console.log('Premium password reset email sent successfully');
    return userInfo;
  } catch (error) {
    console.error('Error sending premium password reset email:', error);
    throw error;
  }
};

/**
 * Send premium contact form confirmation
 */
export const sendContactFormConfirmationEmail = async (
  email: string,
  firstName: string,
  subject?: string,
  message?: string
): Promise<nodemailer.SentMessageInfo> => {
  const transporter = createTransporter();

  const userMailOptions = {
    from: `"Digiverse Story Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '✅ We Received Your Message - Digiverse Story Support',
    html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">
          ${getEmailHeader()}
          
          <div style="padding: 50px 30px; text-align: center; background: linear-gradient(135deg, #ecfdf5 0%, #f0f9ff 100%);">
            <div style="background: #dcfce7; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 25px auto; text-align: center; line-height: 80px;">
              <span style="font-size: 32px; display: inline-block; vertical-align: middle; line-height: normal;">✅</span>
            </div>
            
            <h2 style="margin: 0 0 15px 0; font-size: 28px; font-weight: 700; color: #1a202c;">
              Message Received!
            </h2>
            
            <p style="margin: 0 0 35px 0; font-size: 16px; color: #64748b; line-height: 1.6;">
              Thanks for contacting us, ${firstName}! Our support team will respond within 24 hours.
            </p>
          </div>
          
          <div style="padding: 40px 30px; background: #ffffff;">
            <div style="background: #f8fafc; padding: 25px; border-radius: 15px; border-left: 4px solid #10b981; margin-bottom: 30px;">
              <h3 style="margin: 0 0 15px 0; color: #065f46; font-size: 18px;">What happens next?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #374151; line-height: 1.7;">
                <li>Our expert support team reviews your message</li>
                <li>You'll receive a personalized response within 24 hours</li>
                <li>For urgent matters, contact us directly</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXTAUTH_URL}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 50px; display: inline-block; box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);">
                🏠 Back to Digiverse Story
              </a>
            </div>
          </div>
          
          ${getEmailFooter()}
        </div>
      `,
  };

  try {
    const userInfo = await transporter.sendMail(userMailOptions);
    console.log('Premium contact confirmation email sent successfully');
    return userInfo;
  } catch (error) {
    console.error('Error sending premium contact confirmation:', error);
    throw error;
  }
};

/**
 * Send monthly reset notification with upgrade incentives
 */
export const sendMonthlyResetNotification = async (): Promise<number> => {
  const transporter = createTransporter();

  try {
    await connectToDatabase();

    const children = await User.find({
      role: 'child',
      isActive: true,
      'preferences.emailNotifications': true,
    }).select('firstName lastName email totalStoriesCreated');

    let emailsSent = 0;
    const currentDate = new Date();
    const monthName = currentDate.toLocaleDateString('en-US', {
      month: 'long',
    });

    for (const child of children) {
      const mailOptions = {
        from: `"Digiverse Story Platform" <${process.env.EMAIL_USER}>`,
        to: child.email,
        subject: `🎉 ${monthName} Reset - Fresh Stories Await, ${child.firstName}!`,
        html: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">
              ${getEmailHeader()}
              
              <!-- Hero Section -->
              <div style="background: linear-gradient(135deg, #fef7ff 0%, #f0f9ff 100%); padding: 50px 30px; text-align: center; position: relative;">
                <div style="position: absolute; top: 20px; right: 20px; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; animation: pulse 2s infinite;">
                  LIMITS RESET ✨
                </div>
                
                <h2 style="margin: 0 0 15px 0; font-size: 36px; font-weight: 700; color: #1a202c;">
                  Welcome to ${monthName}, ${child.firstName}! 🌟
                </h2>
                
                <p style="margin: 0 0 30px 0; font-size: 18px; color: #4a5568; line-height: 1.6;">
                  Your creative limits have been refreshed! Time to write amazing new stories.
                </p>
                
                <!-- Refreshed Limits -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 30px 0;">
                  <div style="background: rgba(102, 126, 234, 0.1); padding: 25px 15px; border-radius: 20px; border: 2px solid #667eea;">
                    <div style="font-size: 36px; font-weight: 700; color: #667eea; margin-bottom: 8px;">3</div>
                    <div style="font-size: 14px; color: #1a202c; font-weight: 600;">Free Stories</div>
                    <div style="font-size: 12px; color: #64748b;">Create & collaborate</div>
                  </div>
                  <div style="background: rgba(16, 185, 129, 0.1); padding: 25px 15px; border-radius: 20px; border: 2px solid #10b981;">
                    <div style="font-size: 36px; font-weight: 700; color: #10b981; margin-bottom: 8px;">3</div>
                    <div style="font-size: 14px; color: #1a202c; font-weight: 600;">AI Assessments</div>
                    <div style="font-size: 12px; color: #64748b;">Get detailed feedback</div>
                  </div>
                  <div style="background: rgba(245, 158, 11, 0.1); padding: 25px 15px; border-radius: 20px; border: 2px solid #f59e0b;">
                    <div style="font-size: 36px; font-weight: 700; color: #f59e0b; margin-bottom: 8px;">3</div>
                    <div style="font-size: 14px; color: #1a202c; font-weight: 600;">Competition Entries</div>
                    <div style="font-size: 12px; color: #64748b;">Win amazing prizes</div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div style="padding: 40px 30px; background: #ffffff; text-align: center;">
                <div style="margin-bottom: 40px;">
                  <a href="${process.env.NEXTAUTH_URL}/create-stories" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 18px 35px; text-decoration: none; font-size: 18px; font-weight: 600; border-radius: 50px; display: inline-block; margin: 0 10px 15px 0; box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);">
                  ✍️ Start Writing Now
                </a>
                <a href="${process.env.NEXTAUTH_URL}/children-dashboard" style="background: #ffffff; color: #667eea; padding: 18px 35px; text-decoration: none; font-size: 18px; font-weight: 600; border-radius: 50px; display: inline-block; border: 2px solid #667eea;">
                  📊 View Dashboard
                </a>
              </div>
            </div>

            <!-- Upgrade Incentive -->
            <div style="background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%); padding: 40px 30px; color: white; text-align: center;">
              <h3 style="margin: 0 0 15px 0; font-size: 24px; font-weight: 700; color: #ffffff;">
                Need More Stories? 🚀
              </h3>
              <p style="margin: 0 0 25px 0; font-size: 16px; color: #a0aec0; line-height: 1.6;">
                Unlock unlimited creativity this month with our Story Pack!
              </p>
              
              <div style="background: rgba(255,255,255,0.1); padding: 25px; border-radius: 20px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); margin-bottom: 25px; max-width: 400px; margin-left: auto; margin-right: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                  <div style="text-align: left;">
                    <div style="font-size: 20px; font-weight: 700; color: #4ade80;">+5 Stories</div>
                    <div style="font-size: 20px; font-weight: 700; color: #60a5fa;">+5 Assessments</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 32px; font-weight: 700; color: #fbbf24;">$15</div>
                    <div style="font-size: 14px; color: #a0aec0;">One-time purchase</div>
                  </div>
                </div>
                
                <a href="${process.env.NEXTAUTH_URL}/pricing" style="background: linear-gradient(135deg, #4ade80 0%, #06b6d4 100%); color: white; padding: 15px 30px; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 50px; display: inline-block; box-shadow: 0 6px 20px rgba(74, 222, 128, 0.3); width: 100%; box-sizing: border-box;">
                  💎 Upgrade to Story Pack
                </a>
              </div>
              
              <p style="margin: 0; font-size: 12px; color: #a0aec0;">
                Perfect for creative kids who want to write more stories!
              </p>
            </div>

            ${getEmailFooter()}
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        emailsSent++;
        console.log(
          `📧 Premium monthly reset email sent to ${child.firstName} (${child.email})`
        );
      } catch (emailError) {
        console.error(
          `Failed to send monthly reset email to ${child.email}:`,
          emailError
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(
      `📧 Premium monthly reset notifications sent to ${emailsSent} children`
    );
    return emailsSent;
  } catch (error) {
    console.error('Error sending premium monthly reset notifications:', error);
    throw error;
  }
};

/**
 * Send premium competition submission confirmation
 */
export const sendCompetitionSubmissionConfirmation = async (
  childId: string,
  storyId: string,
  competitionId: string
): Promise<nodemailer.SentMessageInfo> => {
  const transporter = createTransporter();

  try {
    await connectToDatabase();

    const [user, story, competition] = await Promise.all([
      User.findById(childId).select('firstName lastName email preferences'),
      StorySession.findById(storyId).select('title'),
      Competition.findById(competitionId).select(
        'month year phase submissionEnd'
      ),
    ]);

    if (!user || !story || !competition) {
      throw new Error('User, story, or competition not found');
    }
    if (!user.preferences?.emailNotifications) {
      throw new Error('User has disabled email notifications');
    }

    const submissionDeadline = new Date(
      competition.submissionEnd
    ).toLocaleDateString();

    const mailOptions = {
      from: `"Digiverse Story Competition" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `🏆 Story Submitted Successfully - "${story.title}"`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">
          ${getEmailHeader()}
          
          <!-- Hero Section -->
          <div style="background: linear-gradient(135deg, #fef3cd 0%, #fef7ff 100%); padding: 50px 30px; text-align: center; position: relative;">
            <div style="position: absolute; top: 20px; right: 20px; background: #f59e0b; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">
              COMPETITION ENTRY ✨
            </div>
            
            <div style="background: #fbbf24; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 25px auto; box-shadow: 0 8px 25px rgba(251, 191, 36, 0.3); text-align: center; line-height: 80px;">
              <span style="font-size: 32px; display: inline-block; vertical-align: middle; line-height: normal;">🏆</span>
            </div>
            
            <h2 style="margin: 0 0 15px 0; font-size: 32px; font-weight: 700; color: #1a202c;">
              Congratulations, ${user.firstName}! 🎉
            </h2>
            
            <p style="margin: 0 0 25px 0; font-size: 18px; color: #4a5568; line-height: 1.6;">
              Your story <strong>"${story.title}"</strong> has been successfully submitted to the ${competition.month} ${competition.year} competition!
            </p>
            
            <div style="background: rgba(251, 191, 36, 0.1); padding: 20px; border-radius: 15px; border: 2px solid #fbbf24; margin: 25px 0;">
              <div style="font-size: 18px; font-weight: 600; color: #92400e; margin-bottom: 10px;">
                📅 Competition Timeline
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; color: #1a202c; font-size: 14px;">
                <div>
                  <div style="font-weight: 600; color: #059669;">✅ Submission</div>
                  <div>Now - Day 25</div>
                </div>
                <div>
                  <div style="font-weight: 600; color: #dc2626;">⏰ Judging</div>
                  <div>Days 26-30</div>
                </div>
                <div>
                  <div style="font-weight: 600; color: #7c3aed;">🏆 Results</div>
                  <div>Day 31</div>
                </div>
              </div>
            </div>
          </div>

          <!-- What Happens Next -->
          <div style="padding: 40px 30px; background: #ffffff;">
            <h3 style="margin: 0 0 25px 0; font-size: 24px; font-weight: 700; color: #1a202c; text-align: center;">
              What Happens Next? 🚀
            </h3>
            
            <div style="display: grid; gap: 20px; margin-bottom: 30px;">
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #fef7ff 100%); padding: 25px; border-radius: 15px; border-left: 4px solid #3b82f6;">
                <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                  <tr>
                    <td style="width: 65px; vertical-align: middle; padding-right: 15px;">
                      <div style="background: #3b82f6; width: 50px; height: 50px; border-radius: 12px; text-align: center; line-height: 50px;">
                        <span style="color: white; font-size: 20px; display: inline-block; vertical-align: middle; line-height: normal;">🧠</span>
                      </div>
                    </td>
                    <td style="vertical-align: middle;">
                      <div style="font-size: 18px; font-weight: 600; color: #1a202c; margin-bottom: 5px;">AI Judging Phase</div>
                      <div style="font-size: 14px; color: #64748b; line-height: 1.5;">Our advanced AI will evaluate your story across 16 categories including creativity, grammar, vocabulary, and storytelling structure.</div>
                    </td>
                  </tr>
                </table>
              </div>
              
              <div style="background: linear-gradient(135deg, #fef7ff 0%, #fef3cd 100%); padding: 25px; border-radius: 15px; border-left: 4px solid #8b5cf6;">
                <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                  <tr>
                    <td style="width: 65px; vertical-align: middle; padding-right: 15px;">
                      <div style="background: #8b5cf6; width: 50px; height: 50px; border-radius: 12px; text-align: center; line-height: 50px;">
                        <span style="color: white; font-size: 20px; display: inline-block; vertical-align: middle; line-height: normal;">🥇</span>
                      </div>
                    </td>
                    <td style="vertical-align: middle;">
                      <div style="font-size: 18px; font-weight: 600; color: #1a202c; margin-bottom: 5px;">Results & Recognition</div>
                      <div style="font-size: 14px; color: #64748b; line-height: 1.5;">Top 3 winners receive Olympic-style recognition, special badges, digital certificates, and featured story placement!</div>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/competitions" style="background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%); color: white; padding: 18px 35px; text-decoration: none; font-size: 18px; font-weight: 600; border-radius: 50px; display: inline-block; margin: 0 10px 15px 0; box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);">
                🏆 View Competition
              </a>
              <a href="${process.env.NEXTAUTH_URL}/create-stories" style="background: #ffffff; color: #f59e0b; padding: 18px 35px; text-decoration: none; font-size: 18px; font-weight: 600; border-radius: 50px; display: inline-block; border: 2px solid #f59e0b;">
                ✍️ Write Another Story
              </a>
            </div>
          </div>

          <!-- Upgrade Incentive -->
          <div style="background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%); padding: 40px 30px; color: white; text-align: center;">
            <h3 style="margin: 0 0 15px 0; font-size: 24px; font-weight: 700; color: #ffffff;">
              Want to Submit More Stories? 📝
            </h3>
            <p style="margin: 0 0 25px 0; font-size: 16px; color: #a0aec0; line-height: 1.6;">
              Maximize your chances of winning with more competition entries!
            </p>
            
            <div style="background: rgba(255,255,255,0.1); padding: 25px; border-radius: 20px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); margin-bottom: 25px; max-width: 500px; margin-left: auto; margin-right: auto;">
              <div style="display: grid; grid-template-columns: 1fr auto; gap: 20px; align-items: center; margin-bottom: 20px;">
                <div style="text-align: left;">
                  <div style="font-size: 16px; color: #a0aec0; margin-bottom: 5px;">Story Pack includes:</div>
                  <div style="font-size: 18px; font-weight: 600; color: #4ade80;">✓ 5 More Stories to Create</div>
                  <div style="font-size: 18px; font-weight: 600; color: #60a5fa;">✓ 5 More AI Assessments</div>
                  <div style="font-size: 18px; font-weight: 600; color: #fbbf24;">✓ More Competition Chances</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 32px; font-weight: 700; color: #fbbf24;">$15</div>
                  <div style="font-size: 14px; color: #a0aec0;">One-time</div>
                </div>
              </div>
              
              <a href="${process.env.NEXTAUTH_URL}/pricing" style="background: linear-gradient(135deg, #4ade80 0%, #06b6d4 100%); color: white; padding: 15px 30px; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 50px; display: inline-block; box-shadow: 0 6px 20px rgba(74, 222, 128, 0.3); width: 100%; box-sizing: border-box;">
                💎 Upgrade for More Entries
              </a>
            </div>
          </div>

          ${getEmailFooter()}
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `📧 Premium competition submission confirmation sent to ${user.firstName} (${user.email})`
    );
    return info;
  } catch (error) {
    console.error(
      'Error sending premium competition submission confirmation:',
      error
    );
    throw error;
  }
};

/**
 * Send mentor registration notification (admin only)
 */
export const sendMentorRegistrationNotification = async (
  email: string,
  firstName: string,
  lastName: string
): Promise<nodemailer.SentMessageInfo> => {
  const transporter = createTransporter();

  const adminMailOptions = {
    from: `"Digiverse Story Platform" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: `👨‍🏫 New Mentor Application - ${firstName} ${lastName}`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 25px; color: white; text-align: center;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 600;">👨‍🏫 New Mentor Application</h2>
        </div>
        
        <div style="padding: 30px;">
          <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; border-left: 4px solid #059669; margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px 0; color: #1a202c; font-size: 18px;">Applicant Details</h3>
            <div style="display: grid; gap: 8px;">
              <div><strong>Name:</strong> ${firstName} ${lastName}</div>
              <div><strong>Email:</strong> ${email}</div>
              <div><strong>Role:</strong> Mentor (Pending Approval)</div>
              <div><strong>Applied:</strong> ${new Date().toLocaleString()}</div>
            </div>
          </div>
          
          <div style="background: #fef3ff; padding: 20px; border-radius: 10px; border-left: 4px solid #8b5cf6; margin-bottom: 25px;">
            <h4 style="margin: 0 0 10px 0; color: #7c2d12; font-size: 16px;">⚠️ Action Required</h4>
            <p style="margin: 0; font-size: 14px; color: #374151;">
              Please review this mentor application and approve or reject as appropriate through the admin dashboard.
            </p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/admin/mentors" style="background: #059669; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: 500; margin-right: 10px;">
              Review Application
            </a>
            <a href="mailto:${email}" style="background: #ffffff; color: #059669; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: 500; border: 2px solid #059669;">
              Contact Applicant
            </a>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const adminInfo = await transporter.sendMail(adminMailOptions);
    console.log('Premium mentor registration notification sent successfully');
    return adminInfo;
  } catch (error) {
    console.error(
      'Error sending premium mentor registration notification:',
      error
    );
    throw error;
  }
};

/**
 * Send Story Pack purchase confirmation email ($15)
 */
export const sendStoryPackPurchaseConfirmation = async (
  email: string,
  firstName: string,
  transactionId: string,
  amount: number = 15
): Promise<nodemailer.SentMessageInfo> => {
  const transporter = createTransporter();

  const userMailOptions = {
    from: `"Digiverse Story Billing" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🎉 Story Pack Activated - More Stories Unlocked!',
    html: `
        <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">
          ${getEmailHeader()}
          
          <!-- Purchase Confirmation Hero -->
          <div style="background: linear-gradient(135deg, #ecfdf5 0%, #f0f9ff 100%); padding: 50px 30px; text-align: center; position: relative;">
            <div style="position: absolute; top: 20px; right: 20px; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">
              PURCHASE CONFIRMED ✅
            </div>
            
            <div style="background: #10b981; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 25px auto; box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3); text-align: center; line-height: 80px;">
              <span style="font-size: 32px; display: inline-block; vertical-align: middle; line-height: normal;">💎</span>
            </div>
            
            <h2 style="margin: 0 0 15px 0; font-size: 32px; font-weight: 700; color: #1a202c;">
              Story Pack Activated! 🚀
            </h2>
            
            <p style="margin: 0 0 25px 0; font-size: 18px; color: #4a5568; line-height: 1.6;">
              Congratulations ${firstName}! Your Story Pack has been successfully activated and you're ready to create more amazing stories.
            </p>
            
            <!-- Transaction Details -->
            <div style="background: rgba(16, 185, 129, 0.1); padding: 20px; border-radius: 15px; border: 2px solid #10b981; margin: 25px 0;">
              <div style="font-size: 18px; font-weight: 600; color: #065f46; margin-bottom: 10px;">
                💳 Purchase Receipt
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; color: #1a202c; font-size: 14px;">
                <div>
                  <div style="font-weight: 600; color: #065f46;">Transaction ID</div>
                  <div style="font-family: monospace; background: #ffffff; padding: 8px; border-radius: 6px; border: 1px solid #d1fae5;">${transactionId}</div>
                </div>
                <div>
                  <div style="font-weight: 600; color: #065f46;">Amount Paid</div>
                  <div style="font-size: 24px; font-weight: 700; color: #10b981;">$${amount}</div>
                </div>
              </div>
              <div style="margin-top: 15px; font-size: 12px; color: #059669;">
                📅 Purchased: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          <!-- What You Unlocked -->
          <div style="padding: 40px 30px; background: #ffffff;">
            <h3 style="margin: 0 0 25px 0; font-size: 24px; font-weight: 700; color: #1a202c; text-align: center;">
              🎁 What You Unlocked
            </h3>
            
            <div style="display: grid; gap: 20px; margin-bottom: 30px;">
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #fef7ff 100%); padding: 25px; border-radius: 15px; border-left: 4px solid #667eea;">
                <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                  <tr>
                    <td style="width: 75px; vertical-align: middle; padding-right: 15px;">
                      <div style="background: #667eea; width: 60px; height: 60px; border-radius: 12px; text-align: center; line-height: 60px;">
                        <span style="color: white; font-size: 24px; display: inline-block; vertical-align: middle; line-height: normal;">✍️</span>
                      </div>
                    </td>
                    <td style="vertical-align: middle;">
                      <div style="font-size: 20px; font-weight: 600; color: #1a202c; margin-bottom: 5px;">+5 Additional Stories</div>
                      <div style="font-size: 14px; color: #64748b; line-height: 1.5;">Create 5 more incredible stories this month with full AI collaboration and assistance.</div>
                      <div style="font-size: 12px; color: #667eea; font-weight: 600; margin-top: 5px;">Total: 8 stories available this month ⬆️</div>
                    </td>
                  </tr>
                </table>
              </div>
              
              <div style="background: linear-gradient(135deg, #ecfdf5 0%, #f0f9ff 100%); padding: 25px; border-radius: 15px; border-left: 4px solid #10b981;">
                <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                  <tr>
                    <td style="width: 75px; vertical-align: middle; padding-right: 15px;">
                      <div style="background: #10b981; width: 60px; height: 60px; border-radius: 12px; text-align: center; line-height: 60px;">
                        <span style="color: white; font-size: 24px; display: inline-block; vertical-align: middle; line-height: normal;">🧠</span>
                      </div>
                    </td>
                    <td style="vertical-align: middle;">
                      <div style="font-size: 20px; font-weight: 600; color: #1a202c; margin-bottom: 5px;">+5 AI Assessments</div>
                      <div style="font-size: 14px; color: #64748b; line-height: 1.5;">Get detailed feedback and analysis on 5 more stories with our advanced AI evaluation system.</div>
                      <div style="font-size: 12px; color: #10b981; font-weight: 600; margin-top: 5px;">Total: 8 assessments available this month ⬆️</div>
                    </td>
                  </tr>
                </table>
              </div>
              
              <div style="background: linear-gradient(135deg, #fef3cd 0%, #fef7ff 100%); padding: 25px; border-radius: 15px; border-left: 4px solid #f59e0b;">
                <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                  <tr>
                    <td style="width: 75px; vertical-align: middle; padding-right: 15px;">
                      <div style="background: #f59e0b; width: 60px; height: 60px; border-radius: 12px; text-align: center; line-height: 60px;">
                        <span style="color: white; font-size: 24px; display: inline-block; vertical-align: middle; line-height: normal;">🏆</span>
                      </div>
                    </td>
                    <td style="vertical-align: middle;">
                      <div style="font-size: 20px; font-weight: 600; color: #1a202c; margin-bottom: 5px;">Enhanced Competition Chances</div>
                      <div style="font-size: 14px; color: #64748b; line-height: 1.5;">With more stories and assessments, you can perfect your entries and increase your chances of winning!</div>
                      <div style="font-size: 12px; color: #f59e0b; font-weight: 600; margin-top: 5px;">More stories = better chances to win 🎯</div>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
            
            <!-- Quick Start Actions -->
            <div style="text-align: center; margin: 40px 0;">
              <h4 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #1a202c;">Ready to Start Creating? 🌟</h4>
              <a href="${process.env.NEXTAUTH_URL}/create-stories" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 18px 35px; text-decoration: none; font-size: 18px; font-weight: 600; border-radius: 50px; display: inline-block; margin: 0 10px 15px 0; box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);">
                ✍️ Start Writing Now
              </a>
              <a href="${process.env.NEXTAUTH_URL}/children-dashboard" style="background: #ffffff; color: #667eea; padding: 18px 35px; text-decoration: none; font-size: 18px; font-weight: 600; border-radius: 50px; display: inline-block; border: 2px solid #667eea;">
                📊 View Dashboard
              </a>
            </div>
          </div>

          <!-- Support Section -->
          <div style="background: #f8fafc; padding: 30px; text-align: center;">
            <h4 style="margin: 0 0 15px 0; color: #1a202c; font-size: 16px;">Need Help Getting Started? 🤝</h4>
            <p style="margin: 0 0 20px 0; font-size: 14px; color: #64748b; line-height: 1.6;">
              Our support team is here to help you make the most of your Story Pack upgrade.
            </p>
            <a href="${process.env.NEXTAUTH_URL}/contact-us" style="background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px;">
              💬 Contact Support
            </a>
          </div>
          
          ${getEmailFooter()}
        </div>
      `,
  };

  // ADMIN EMAIL - Purchase notification
  const adminMailOptions = {
    from: `"Digiverse Story Billing" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: `💰 Story Pack Purchase - ${firstName} ($${amount})`,
    html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px; color: white; text-align: center;">
            <h2 style="margin: 0; font-size: 24px; font-weight: 600;">💰 Story Pack Purchase</h2>
          </div>
          
          <div style="padding: 30px;">
            <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; border-left: 4px solid #10b981;">
              <h3 style="margin: 0 0 15px 0; color: #1a202c; font-size: 18px;">Purchase Details</h3>
              <div style="display: grid; gap: 8px;">
                <div><strong>Customer:</strong> ${firstName}</div>
                <div><strong>Email:</strong> ${email}</div>
                <div><strong>Product:</strong> Story Pack (+5 stories, +5 assessments)</div>
                <div><strong>Amount:</strong> $${amount}</div>
                <div><strong>Transaction ID:</strong> ${transactionId}</div>
                <div><strong>Purchased:</strong> ${new Date().toLocaleString()}</div>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
              <a href="${process.env.NEXTAUTH_URL}/admin/payments" style="background: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                View in Payment Dashboard
              </a>
            </div>
          </div>
        </div>
      `,
  };

  try {
    const [userInfo, adminInfo] = await Promise.all([
      transporter.sendMail(userMailOptions),
      transporter.sendMail(adminMailOptions),
    ]);

    console.log('Story Pack purchase confirmation emails sent successfully:', {
      userMessageId: userInfo.messageId,
      adminMessageId: adminInfo.messageId,
    });

    return userInfo;
  } catch (error) {
    console.error(
      'Error sending Story Pack purchase confirmation emails:',
      error
    );
    throw error;
  }
};

/**
 * Send Physical Anthology Book purchase confirmation email ($10)
 */
export const sendAnthologyBookPurchaseConfirmation = async (
  email: string,
  firstName: string,
  storyTitle: string,
  transactionId: string,
  amount: number = 10
): Promise<nodemailer.SentMessageInfo> => {
  const transporter = createTransporter();

  const userMailOptions = {
    from: `"Digiverse Story Publishing" <${process.env.EMAIL_USER}>`,
    to: email,
    subject:
      "📚 Anthology Reservation Confirmed - You're Going to be Published!",
    html: `
        <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">
          ${getEmailHeader()}
          
          <!-- Publishing Celebration Hero -->
          <div style="background: linear-gradient(135deg, #fef7ff 0%, #fef3cd 100%); padding: 50px 30px; text-align: center; position: relative;">
            <div style="position: absolute; top: 20px; right: 20px; background: #8b5cf6; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">
              ANTHOLOGY RESERVED 📚
            </div>
            
            <div style="background: #8b5cf6; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 25px auto; box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3); text-align: center; line-height: 80px;">
              <span style="font-size: 32px; display: inline-block; vertical-align: middle; line-height: normal;">📖</span>
            </div>
            
            <h2 style="margin: 0 0 15px 0; font-size: 32px; font-weight: 700; color: #1a202c;">
              You're Going to be Published! 🎉
            </h2>
            
            <p style="margin: 0 0 25px 0; font-size: 18px; color: #4a5568; line-height: 1.6;">
              Congratulations ${firstName}! Your story has been reserved for our exclusive physical anthology book.
            </p>
            
            <!-- Featured Story Banner -->
            <div style="background: rgba(139, 92, 246, 0.1); padding: 25px; border-radius: 20px; border: 2px solid #8b5cf6; margin: 25px 0;">
              <div style="font-size: 18px; font-weight: 600; color: #7c3aed; margin-bottom: 15px;">
                📖 Featured Story
              </div>
              <div style="font-size: 24px; font-weight: 700; color: #1a202c; margin-bottom: 10px;">
                "${storyTitle}"
              </div>
              <div style="font-size: 16px; color: #64748b;">
                by ${firstName} • Featured Author
              </div>
            </div>
          </div>

          <!-- Publication Details -->
          <div style="padding: 40px 30px; background: #ffffff;">
            <h3 style="margin: 0 0 25px 0; font-size: 24px; font-weight: 700; color: #1a202c; text-align: center;">
              📋 Your Publication Details
            </h3>
            
            <!-- Transaction Receipt -->
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #fef7ff 100%); padding: 25px; border-radius: 15px; border-left: 4px solid #8b5cf6; margin-bottom: 30px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                  <div style="font-weight: 600; color: #7c3aed; margin-bottom: 8px;">Transaction Details</div>
                  <div style="font-size: 14px; color: #64748b; margin-bottom: 5px;">Transaction ID</div>
                  <div style="font-family: monospace; background: #ffffff; padding: 8px; border-radius: 6px; border: 1px solid #e5e7eb; font-size: 12px;">${transactionId}</div>
                </div>
                <div>
                  <div style="font-weight: 600; color: #7c3aed; margin-bottom: 8px;">Reservation Fee</div>
                  <div style="font-size: 32px; font-weight: 700; color: #8b5cf6;">$${amount}</div>
                  <div style="font-size: 12px; color: #64748b;">Paid ${new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            <!-- What Happens Next -->
            <div style="display: grid; gap: 20px; margin-bottom: 30px;">
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #fef7ff 100%); padding: 25px; border-radius: 15px; border-left: 4px solid #3b82f6;">
                <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                  <tr>
                    <td style="width: 65px; vertical-align: middle; padding-right: 15px;">
                      <div style="background: #3b82f6; width: 50px; height: 50px; border-radius: 12px; text-align: center; line-height: 50px;">
                        <span style="color: white; font-size: 20px; display: inline-block; vertical-align: middle; line-height: normal;">✏️</span>
                      </div>
                    </td>
                    <td style="vertical-align: middle;">
                      <div style="font-size: 18px; font-weight: 600; color: #1a202c; margin-bottom: 5px;">Professional Editing</div>
                      <div style="font-size: 14px; color: #64748b; line-height: 1.5;">Your story will undergo professional editing and formatting to ensure it looks perfect in print.</div>
                    </td>
                  </tr>
                </table>
              </div>
              
              <div style="background: linear-gradient(135deg, #fef7ff 0%, #fef3cd 100%); padding: 25px; border-radius: 15px; border-left: 4px solid #8b5cf6;">
                <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                  <tr>
                    <td style="width: 65px; vertical-align: middle; padding-right: 15px;">
                      <div style="background: #8b5cf6; width: 50px; height: 50px; border-radius: 12px; text-align: center; line-height: 50px;">
                        <span style="color: white; font-size: 20px; display: inline-block; vertical-align: middle; line-height: normal;">📖</span>
                      </div>
                    </td>
                    <td style="vertical-align: middle;">
                      <div style="font-size: 18px; font-weight: 600; color: #1a202c; margin-bottom: 5px;">Physical Book Production</div>
                      <div style="font-size: 14px; color: #64748b; line-height: 1.5;">Your story will be included in our high-quality printed anthology, shipped directly to you!</div>
                    </td>
                  </tr>
                </table>
              </div>
              
              <div style="background: linear-gradient(135deg, #ecfdf5 0%, #f0f9ff 100%); padding: 25px; border-radius: 15px; border-left: 4px solid #10b981;">
                <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                  <tr>
                    <td style="width: 65px; vertical-align: middle; padding-right: 15px;">
                      <div style="background: #10b981; width: 50px; height: 50px; border-radius: 12px; text-align: center; line-height: 50px;">
                        <span style="color: white; font-size: 20px; display: inline-block; vertical-align: middle; line-height: normal;">🏆</span>
                      </div>
                    </td>
                    <td style="vertical-align: middle;">
                      <div style="font-size: 18px; font-weight: 600; color: #1a202c; margin-bottom: 5px;">Published Author Status</div>
                      <div style="font-size: 14px; color: #64748b; line-height: 1.5;">You'll receive a special "Published Author" badge and certificate recognizing your achievement!</div>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
            
            <!-- Timeline -->
            <div style="background: #fef3cd; padding: 25px; border-radius: 15px; border: 2px solid #f59e0b; margin-bottom: 30px;">
              <h4 style="margin: 0 0 20px 0; color: #92400e; font-size: 18px; text-align: center;">📅 Publication Timeline</h4>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; text-align: center;">
                <div>
                  <div style="font-size: 16px; font-weight: 600; color: #92400e; margin-bottom: 5px;">Week 1-2</div>
                  <div style="font-size: 14px; color: #1a202c;">Professional editing</div>
                </div>
                <div>
                  <div style="font-size: 16px; font-weight: 600; color: #92400e; margin-bottom: 5px;">Week 3-4</div>
                  <div style="font-size: 14px; color: #1a202c;">Book layout & design</div>
                </div>
                <div>
                  <div style="font-size: 16px; font-weight: 600; color: #92400e; margin-bottom: 5px;">Week 5-6</div>
                  <div style="font-size: 14px; color: #1a202c;">Printing & shipping</div>
                </div>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/children-dashboard" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 18px 35px; text-decoration: none; font-size: 18px; font-weight: 600; border-radius: 50px; display: inline-block; margin: 0 10px 15px 0; box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);">
                📊 View Your Stories
              </a>
              <a href="${process.env.NEXTAUTH_URL}/create-stories" style="background: #ffffff; color: #8b5cf6; padding: 18px 35px; text-decoration: none; font-size: 18px; font-weight: 600; border-radius: 50px; display: inline-block; border: 2px solid #8b5cf6;">
                ✍️ Write Another Story
              </a>
            </div>
          </div>

          <!-- Shipping Information Request -->
          <div style="background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%); padding: 40px 30px; color: white; text-align: center;">
            <h3 style="margin: 0 0 15px 0; font-size: 24px; font-weight: 700; color: #ffffff;">
              📦 Next Step: Shipping Information
            </h3>
            <p style="margin: 0 0 25px 0; font-size: 16px; color: #a0aec0; line-height: 1.6;">
              We'll contact you soon to collect your shipping address for the physical book delivery.
            </p>
            
            <div style="background: rgba(255,255,255,0.1); padding: 25px; border-radius: 20px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); margin-bottom: 25px; max-width: 500px; margin-left: auto; margin-right: auto;">
              <div style="font-size: 18px; font-weight: 600; color: #ffffff; margin-bottom: 15px;">
                📬 What We'll Need:
              </div>
              <div style="text-align: left; color: #a0aec0; font-size: 14px; line-height: 1.6;">
                • Full shipping name<br/>
                • Complete mailing address<br/>
                • Phone number (for delivery)<br/>
                • Any special delivery instructions
              </div>
            </div>
            
            <p style="margin: 0; font-size: 12px; color: #a0aec0;">
              Questions about shipping? Contact our support team anytime!
            </p>
          </div>

          ${getEmailFooter()}
        </div>
      `,
  };

  // ADMIN EMAIL - Anthology reservation notification
  const adminMailOptions = {
    from: `"Digiverse Story Publishing" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: `📚 Anthology Reservation - ${firstName} "$${amount}"`,
    html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 25px; color: white; text-align: center;">
            <h2 style="margin: 0; font-size: 24px; font-weight: 600;">📚 New Anthology Reservation</h2>
          </div>
          
          <div style="padding: 30px;">
            <div style="background: #fef7ff; padding: 20px; border-radius: 10px; border-left: 4px solid #8b5cf6;">
              <h3 style="margin: 0 0 15px 0; color: #1a202c; font-size: 18px;">Reservation Details</h3>
              <div style="display: grid; gap: 8px;">
                <div><strong>Author:</strong> ${firstName}</div>
                <div><strong>Email:</strong> ${email}</div>
                <div><strong>Story Title:</strong> "${storyTitle}"</div>
                <div><strong>Reservation Fee:</strong> $${amount}</div>
                <div><strong>Transaction ID:</strong> ${transactionId}</div>
                <div><strong>Reserved:</strong> ${new Date().toLocaleString()}</div>
              </div>
            </div>
            
            <div style="background: #fef3cd; padding: 20px; border-radius: 10px; border-left: 4px solid #f59e0b; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px;">⚠️ Action Required</h4>
              <p style="margin: 0; font-size: 14px; color: #374151;">
                Please contact the author to collect shipping information for the physical book delivery.
              </p>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXTAUTH_URL}/admin/anthology" style="background: #8b5cf6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: 500; margin-right: 10px;">
                Manage Anthology
              </a>
              <a href="mailto:${email}" style="background: #ffffff; color: #8b5cf6; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: 500; border: 2px solid #8b5cf6;">
                Contact Author
              </a>
            </div>
          </div>
        </div>
      `,
  };

  try {
    const [userInfo, adminInfo] = await Promise.all([
      transporter.sendMail(userMailOptions),
      transporter.sendMail(adminMailOptions),
    ]);

    console.log(
      'Anthology book purchase confirmation emails sent successfully:',
      {
        userMessageId: userInfo.messageId,
        adminMessageId: adminInfo.messageId,
      }
    );

    return userInfo;
  } catch (error) {
    console.error(
      'Error sending anthology book purchase confirmation emails:',
      error
    );
    throw error;
  }
};

// Competition-related mailers (admin notifications - keep simple)
export const sendCompetitionAnnouncement = async (
  competitionId: string,
  month: string,
  year: number
): Promise<nodemailer.SentMessageInfo> => {
  const transporter = createTransporter();
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '';

  const mailOptions = {
    from: `"Digiverse Story System" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `🏆 New Competition Created: ${month} ${year}`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: auto; background: white; border-radius: 10px; padding: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
        <h3 style="color: #f59e0b; margin: 0 0 15px 0;">🏆 New Competition Created</h3>
        <p style="margin: 0; color: #374151;">
          A new competition for <strong>${month} ${year}</strong> has been created and is now active.
        </p>
        <div style="background: #fef3cd; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <strong>Competition ID:</strong> ${competitionId}
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export const sendCompetitionPhaseChange = async (
  competitionId: string,
  phase: string
): Promise<nodemailer.SentMessageInfo> => {
  const transporter = createTransporter();
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '';

  const mailOptions = {
    from: `"Digiverse Story System" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `📅 Competition Phase Changed: ${phase}`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: auto; background: white; border-radius: 10px; padding: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
        <h3 style="color: #8b5cf6; margin: 0 0 15px 0;">📅 Competition Phase Update</h3>
        <p style="margin: 0; color: #374151;">
          The competition phase has changed to <strong>${phase}</strong> for competition ID: ${competitionId}.
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export const sendCompetitionResults = async (
  competitionId: string
): Promise<nodemailer.SentMessageInfo> => {
  const transporter = createTransporter();
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '';

  const mailOptions = {
    from: `"Digiverse Story System" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `🎉 Competition Results Announced`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: auto; background: white; border-radius: 10px; padding: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
        <h3 style="color: #059669; margin: 0 0 15px 0;">🎉 Competition Results</h3>
        <p style="margin: 0; color: #374151;">
          The results for competition ID: <strong>${competitionId}</strong> have been announced.
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send winner congratulations email
 */
export const sendWinnerCongratulationsEmail = async (
  email: string,
  childName: string,
  place: string,
  storyTitle: string,
  score: number,
  month: string,
  year: number
): Promise<nodemailer.SentMessageInfo> => {
  const transporter = createTransporter();

  const medal = place === '1st' ? '🥇' : place === '2nd' ? '🥈' : '🥉';
  const placeColor =
    place === '1st' ? '#FFD700' : place === '2nd' ? '#C0C0C0' : '#CD7F32';

  const mailOptions = {
    from: `"Digiverse Story Competition" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${medal} Congratulations ${childName}! You won ${place} place in ${month} Competition!`,
    html: `
      ${getEmailHeader()}
      
      <div style="padding: 40px 30px; background: #ffffff; text-align: center;">
        <div style="background: linear-gradient(135deg, ${placeColor} 0%, ${placeColor}CC 100%); padding: 30px; border-radius: 20px; margin-bottom: 30px;">
          <div style="font-size: 4rem; margin-bottom: 15px;">${medal}</div>
          <h1 style="margin: 0; color: white; font-size: 28px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
            🎉 CONGRATULATIONS! 🎉
          </h1>
          <h2 style="margin: 10px 0 0 0; color: white; font-size: 24px;">
            ${place} PLACE WINNER
          </h2>
        </div>

        <div style="background: #f8fafc; padding: 25px; border-radius: 15px; margin-bottom: 25px;">
          <h3 style="margin: 0 0 15px 0; color: #2d3748; font-size: 20px;">🏆 ${month} ${year} Story Competition</h3>
          <p style="margin: 0 0 10px 0; color: #4a5568; font-size: 16px;"><strong>Winner:</strong> ${childName}</p>
          <p style="margin: 0 0 10px 0; color: #4a5568; font-size: 16px;"><strong>Story:</strong> "${storyTitle}"</p>
          <p style="margin: 0; color: #4a5568; font-size: 16px;"><strong>Score:</strong> ${score}/100</p>
        </div>

        <div style="background: #e6fffa; border: 2px solid #38b2ac; padding: 20px; border-radius: 15px; margin-bottom: 30px;">
          <h4 style="margin: 0 0 10px 0; color: #2c7a7b;">🌟 What This Means</h4>
          <p style="margin: 0; color: #2c7a7b; line-height: 1.6;">
            Your story was judged by our advanced AI system and ranked among the very best submissions this month! 
            Your creativity, writing skills, and storytelling ability truly shine through.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/competition" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 50px; display: inline-block; box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);">
            🏆 View Competition Results
          </a>
        </div>
      </div>

      ${getEmailFooter()}
    `,
    text: `
  Congratulations ${childName}!

  You won ${place} place in the ${month} ${year} Story Competition!

  Story: "${storyTitle}"
  Score: ${score}/100

  Your story was judged by our AI system and ranked among the best submissions this month. Your creativity and writing skills are exceptional!

  Keep writing amazing stories!

  - The Digiverse Story Team
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send competition update email
 */
export const sendCompetitionUpdateEmail = async (
  email: string,
  subject: string,
  message: string
): Promise<nodemailer.SentMessageInfo> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Digiverse Story Competition" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: `
      ${getEmailHeader()}
      
      <div style="padding: 40px 30px; background: #ffffff;">
        <h2 style="margin: 0 0 20px 0; color: #2d3748; font-size: 24px;">📢 Competition Update</h2>
        <div style="background: #f7fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #4299e1;">
          <p style="margin: 0; color: #2d3748; line-height: 1.6;">${message}</p>
        </div>
      </div>

      ${getEmailFooter()}
    `,
    text: `Competition Update: ${message}`,
  };

  return transporter.sendMail(mailOptions);
};
