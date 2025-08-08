// lib/mailer.ts - COMPLETE FILE FOR MINTOONS PLATFORM
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

/**
 * Send password reset email to user AND notify admin
 * @param email User's email address
 * @param resetUrl Password reset URL with token
 * @param role User role for customized email content
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string,
  role?: UserRole
): Promise<nodemailer.SentMessageInfo> => {
  const transporter = createTransporter();

  // Customize content based on user role
  let salutation = 'Dear storyteller';
  let roleSpecificText = '';
  let fromName = 'Mintoons Support';

  if (role === 'child') {
    salutation = 'Dear young writer';
    roleSpecificText =
      'You can reset your magic key (password) to get back to creating amazing stories with your AI writing companion!';
    fromName = 'Mintoons Magic Team';
  } else if (role === 'mentor') {
    salutation = 'Dear mentor';
    roleSpecificText =
      'You can reset your password to regain access to your mentor dashboard and continue guiding young storytellers.';
    fromName = 'Mintoons Mentor Support';
  } else if (role === 'admin') {
    salutation = 'Dear admin';
    roleSpecificText =
      'You can reset your password to regain access to the admin dashboard.';
    fromName = 'Mintoons Admin Support';
  }

  // USER EMAIL - Password reset for user
  const userMailOptions = {
    from: `"${fromName}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔑 Reset Your Magic Key - Mintoons',
    html: `
      <div style="font-family: 'Comic Sans MS', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 15px; background: linear-gradient(135deg, #fef3ff 0%, #f0f9ff 100%);">
        <div style="text-align: center; padding: 20px 0;">
          <div style="background: linear-gradient(45deg, #7c3aed, #ec4899, #f97316); color: white; padding: 15px; border-radius: 15px; font-size: 24px; font-weight: bold; display: inline-block;">
            ✨ Mintoons ✨
          </div>
        </div>
        
        <h2 style="color: #7c3aed; text-align: center; font-family: 'Comic Sans MS', Arial, sans-serif; font-size: 28px;">
          🔐 Reset Your Magic Key
        </h2>
        
        <div style="background: rgba(124, 58, 237, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #7c3aed;">
          <p style="font-size: 18px; color: #374151; margin: 0;">
            ${salutation},
          </p>
        </div>
        
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          Don't worry! Even the greatest storytellers sometimes forget their magic keys. We received a request to reset your password for your Mintoons account.
        </p>
        
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          ${roleSpecificText}
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(45deg, #7c3aed, #ec4899); color: white; padding: 15px 30px; text-decoration: none; font-size: 18px; border-radius: 25px; display: inline-block; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3); transition: transform 0.2s;">
            🔑 Reset My Magic Key
          </a>
        </div>
        
        <div style="background: #fef3ff; padding: 15px; border-radius: 10px; margin: 20px 0;">
          <p style="font-size: 14px; color: #7c2d12; margin: 0;">
            ⏰ This magic link will expire in 15 minutes for security. If you need a new link, just visit the forgot password page again!
          </p>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; word-wrap: break-word; background: #f9fafb; padding: 10px; border-radius: 8px;">
          If the button doesn't work, copy and paste this link: <br/>
          <a href="${resetUrl}" style="color: #7c3aed; word-break: break-all;">${resetUrl}</a>
        </p>
        
        <p style="font-size: 16px; color: #374151;">
          Keep creating amazing stories! 📚✨<br/>
          The Mintoons Team
        </p>
        
        <hr style="border: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          If you didn't request this, you can safely ignore this email. Your account remains secure! 🛡️
          <br/>
          © ${new Date().getFullYear()} Mintoons - AI-Powered Creative Writing Platform. All rights reserved.
        </p>
      </div>
    `,
  };

  // ADMIN EMAIL - Password reset notification
  const adminMailOptions = {
    from: `"Mintoons System" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: `🔐 Password Reset Request - ${role || 'Unknown'} User`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 10px;">
        <h2 style="color: #7c3aed; display: flex; align-items: center;">
          🔐 Password Reset Request
        </h2>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>👤 User:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>🎭 Role:</strong> ${role || 'Unknown'}</p>
          <p style="margin: 5px 0;"><strong>🕐 Time:</strong> ${new Date().toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>🔗 Action:</strong> Password reset requested</p>
        </div>
        <p style="font-size: 14px; color: #6b7280;">This is an automated notification from the Mintoons platform.</p>
      </div>
    `,
  };

  try {
    const [userInfo, adminInfo] = await Promise.all([
      transporter.sendMail(userMailOptions),
      transporter.sendMail(adminMailOptions),
    ]);

    console.log('Password reset emails sent successfully:', {
      userMessageId: userInfo.messageId,
      adminMessageId: adminInfo.messageId,
    });

    return userInfo;
  } catch (error) {
    console.error('Error sending password reset emails:', error);
    throw error;
  }
};

/**
 * Send registration confirmation email to child AND notify admin
 * @param email Child's email address
 * @param firstName Child's first name
 */
export const sendChildRegistrationEmail = async (
  email: string,
  firstName: string
): Promise<nodemailer.SentMessageInfo> => {
  const transporter = createTransporter();

  // USER EMAIL - Welcome email for child
  const userMailOptions = {
    from: `"Mintoons Magic Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🌟 Welcome to Mintoons - Your Creative Journey Begins!',
    html: `
      <div style="font-family: 'Comic Sans MS', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 15px; background: linear-gradient(135deg, #fef3ff 0%, #fff7ed 100%);">
        <div style="text-align: center; padding: 20px 0;">
          <div style="background: linear-gradient(45deg, #7c3aed, #ec4899, #f97316); color: white; padding: 15px; border-radius: 15px; font-size: 24px; font-weight: bold; display: inline-block;">
            ✨ Mintoons ✨
          </div>
        </div>
        
        <h2 style="color: #7c3aed; text-align: center; font-family: 'Comic Sans MS', Arial, sans-serif; font-size: 28px;">
          🎉 Welcome, ${firstName}! 
        </h2>
        
        <div style="background: rgba(124, 58, 237, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
          <p style="font-size: 20px; color: #7c3aed; margin: 0; font-weight: bold;">
            🚀 Your magical storytelling adventure starts NOW! ✨
          </p>
        </div>
        
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          Amazing! You've just joined the most exciting creative writing platform for young storytellers. Get ready to unleash your imagination! 🌟
        </p>
        
        <div style="background: #fef3ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #7c3aed; margin-top: 0;">🎭 What magical things can you do now?</h3>
          <ul style="font-size: 16px; color: #374151; line-height: 1.8;">
            <li>🤖 <strong>Write with AI:</strong> Get help from your smart writing companion</li>
            <li>📚 <strong>Create Stories:</strong> Adventure, fantasy, mystery - you choose!</li>
            <li>👨‍🏫 <strong>Learn from Mentors:</strong> Get feedback from expert writers</li>
            <li>🏆 <strong>Earn Achievements:</strong> Unlock badges as you improve</li>
            <li>⭐ <strong>Track Progress:</strong> See how your writing skills grow</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/login/child" style="background: linear-gradient(45deg, #7c3aed, #ec4899); color: white; padding: 15px 30px; text-decoration: none; font-size: 18px; border-radius: 25px; display: inline-block; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);">
            🚀 Start My First Story!
          </a>
        </div>
        
        <div style="background: #f0f9ff; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #3b82f6;">
          <p style="margin: 0; font-size: 14px; color: #1e40af;">
            💡 <strong>Pro Tip:</strong> Start with the story creation wizard to choose your adventure type, characters, and setting!
          </p>
        </div>
        
        <p style="font-size: 16px; color: #374151; text-align: center;">
          Ready to become the next great storyteller? Let's create some magic! ✨📖<br/>
          <span style="color: #7c3aed; font-weight: bold;">The Mintoons Team</span>
        </p>
        
        <hr style="border: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          Welcome to the Mintoons family! 🏠✨
          <br/>
          © ${new Date().getFullYear()} Mintoons - Where Young Writers Become Great Storytellers
        </p>
      </div>
    `,
  };

  // ADMIN EMAIL - New child registration notification
  const adminMailOptions = {
    from: `"Mintoons System" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: '🎯 New Young Writer Joined - Mintoons',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 10px;">
        <h2 style="color: #7c3aed;">🎉 New Child Registration</h2>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>👤 Name:</strong> ${firstName}</p>
          <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>🎭 Role:</strong> Child Writer</p>
          <p style="margin: 5px 0;"><strong>🕐 Joined:</strong> ${new Date().toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>🔗 Dashboard:</strong> <a href="${process.env.NEXTAUTH_URL}/admin/children">View All Children</a></p>
        </div>
        <p style="font-size: 14px; color: #6b7280;">A new young writer has joined the Mintoons community!</p>
      </div>
    `,
  };

  try {
    const [userInfo, adminInfo] = await Promise.all([
      transporter.sendMail(userMailOptions),
      transporter.sendMail(adminMailOptions),
    ]);

    console.log('Child registration emails sent successfully:', {
      userMessageId: userInfo.messageId,
      adminMessageId: adminInfo.messageId,
    });

    return userInfo;
  } catch (error) {
    console.error('Error sending child registration emails:', error);
    throw error;
  }
};



/**
 * Send contact form confirmation email AND notify admin
 * @param email Contact's email address
 * @param firstName Contact's first name
 * @param subject Message subject
 * @param message Message content
 */
export const sendContactFormConfirmationEmail = async (
  email: string,
  firstName: string,
  subject?: string,
  message?: string
): Promise<nodemailer.SentMessageInfo> => {
  const transporter = createTransporter();

  // USER EMAIL - Contact confirmation
  const userMailOptions = {
    from: `"Mintoons Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '📧 Thanks for Contacting Mintoons!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 15px; background: linear-gradient(135deg, #fef3ff 0%, #f0f9ff 100%);">
        <div style="text-align: center; padding: 20px 0;">
          <div style="background: linear-gradient(45deg, #7c3aed, #ec4899, #f97316); color: white; padding: 15px; border-radius: 15px; font-size: 24px; font-weight: bold; display: inline-block;">
            ✨ Mintoons ✨
          </div>
        </div>
        
        <h2 style="color: #7c3aed; text-align: center; font-size: 28px;">
          📧 Message Received!
        </h2>
        
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          Dear ${firstName},
        </p>
        
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          Thank you for reaching out to Mintoons! We've received your message and our magical support team is reviewing your inquiry.
        </p>
        
        <div style="background: #fef3ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p style="font-size: 16px; color: #374151; margin: 0;">
            🚀 <strong>What happens next?</strong><br/>
            Our team will respond within 1-2 business days. For urgent matters, feel free to contact us directly!
          </p>
        </div>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #3b82f6; margin-top: 0;">🌟 While you wait, explore:</h3>
          <ul style="font-size: 16px; color: #374151; line-height: 1.8;">
            <li><a href="${process.env.NEXTAUTH_URL}/about" style="color: #7c3aed;">About Mintoons</a> - Learn about our mission</li>
            <li><a href="${process.env.NEXTAUTH_URL}/register/child" style="color: #7c3aed;">Join as Writer</a> - Start your creative journey</li>
            <li><a href="${process.env.NEXTAUTH_URL}" style="color: #7c3aed;">Home</a> - Explore our platform</li>
          </ul>
        </div>
        
        <p style="font-size: 16px; color: #374151; text-align: center;">
          Thanks for being part of the Mintoons community! ✨<br/>
          <span style="color: #7c3aed; font-weight: bold;">The Mintoons Support Team</span>
        </p>
        
        <hr style="border: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          © ${new Date().getFullYear()} Mintoons - Empowering Young Storytellers
        </p>
      </div>
    `,
  };

  // ADMIN EMAIL - Contact form notification
  const adminMailOptions = {
    from: `"Mintoons System" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: `📧 New Contact Form: ${subject || 'General Inquiry'} - Mintoons`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 10px;">
        <h2 style="color: #7c3aed;">📧 New Contact Form Submission</h2>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>👤 Name:</strong> ${firstName}</p>
          <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>📝 Subject:</strong> ${subject || 'No subject provided'}</p>
          <p style="margin: 5px 0;"><strong>🕐 Submitted:</strong> ${new Date().toLocaleString()}</p>
        </div>
        ${
          message
            ? `
        <div style="background: #ffffff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>💬 Message:</strong></p>
          <p style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">${message}</p>
        </div>
        `
            : ''
        }
        <div style="text-align: center; margin: 20px 0;">
          <a href="mailto:${email}?subject=Re: ${subject || 'Your inquiry'}" style="background: linear-gradient(45deg, #7c3aed, #ec4899); color: white; padding: 10px 20px; text-decoration: none; font-size: 14px; border-radius: 8px; display: inline-block;">
            Reply to ${firstName}
          </a>
        </div>
        <p style="font-size: 14px; color: #6b7280;">This is an automated notification from the Mintoons platform.</p>
      </div>
    `,
  };

  try {
    const [userInfo, adminInfo] = await Promise.all([
      transporter.sendMail(userMailOptions),
      transporter.sendMail(adminMailOptions),
    ]);

    console.log('Contact form emails sent successfully:', {
      userMessageId: userInfo.messageId,
      adminMessageId: adminInfo.messageId,
    });

    return userInfo;
  } catch (error) {
    console.error('Error sending contact form emails:', error);
    throw error;
  }
};

/**
 * Send mentor registration notification to admin
 * @param email Mentor's email address
 * @param firstName Mentor's first name
 * @param lastName Mentor's last name
 */
export const sendMentorRegistrationNotification = async (
  email: string,
  firstName: string,
  lastName: string
): Promise<nodemailer.SentMessageInfo> => {
  const transporter = createTransporter();

  // ADMIN EMAIL - Mentor registration notification
  const adminMailOptions = {
    from: `"Mintoons System" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: '👨‍🏫 New Mentor Registration Request - Mintoons',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 10px;">
        <h2 style="color: #059669;">👨‍🏫 New Mentor Registration</h2>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>👤 Name:</strong> ${firstName} ${lastName}</p>
          <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>🎭 Role:</strong> Mentor (Pending Approval)</p>
         <p style="margin: 5px 0;"><strong>🕐 Applied:</strong> ${new Date().toLocaleString()}</p>
         <p style="margin: 5px 0;"><strong>🔗 Dashboard:</strong> <a href="${process.env.NEXTAUTH_URL}/admin/mentors">Review Application</a></p>
       </div>
       <div style="background: #fef3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
         <p style="margin: 0; font-size: 14px; color: #7c2d12;">
           ⚠️ <strong>Action Required:</strong> Please review this mentor application and approve or reject as appropriate.
         </p>
       </div>
       <p style="font-size: 14px; color: #6b7280;">A new mentor has applied to join the Mintoons mentorship program.</p>
     </div>
   `,
  };

  try {
    const adminInfo = await transporter.sendMail(adminMailOptions);

    console.log('Mentor registration notification sent successfully:', {
      adminMessageId: adminInfo.messageId,
    });

    return adminInfo;
  } catch (error) {
    console.error('Error sending mentor registration notification:', error);
    throw error;
  }
};

// Add competition-related mailer services


/**
 * Send competition announcement email to admin
 */
export const sendCompetitionAnnouncement = async (
  competitionId: string,
  month: string,
  year: number
): Promise<nodemailer.SentMessageInfo> => {
  const transporter = createTransporter();
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '';
  const subject = `New Competition Created: ${month} ${year}`;
  const html = `<p>A new competition for ${month} ${year} has been created and is now active. Competition ID: ${competitionId}</p>`;
  return transporter.sendMail({ from: `"Mintoons" <${process.env.EMAIL_USER}>`, to: adminEmail, subject, html });
};



/**
 * Send phase change notification to admin
 */
export const sendCompetitionPhaseChange = async (
  competitionId: string,
  phase: string
): Promise<nodemailer.SentMessageInfo> => {
  const transporter = createTransporter();
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '';
  const subject = `Competition Phase Changed: ${phase}`;
  const html = `<p>The competition phase has changed to ${phase} for competition ID: ${competitionId}.</p>`;
  return transporter.sendMail({ from: `"Mintoons" <${process.env.EMAIL_USER}>`, to: adminEmail, subject, html });
};

/**
 * Send competition results notification to admin
 */
export const sendCompetitionResults = async (
  competitionId: string
): Promise<nodemailer.SentMessageInfo> => {
  const transporter = createTransporter();
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '';
  const subject = `Competition Results Announced`;
  const html = `<p>The results for competition ID: ${competitionId} have been announced.</p>`;
  return transporter.sendMail({ from: `"Mintoons" <${process.env.EMAIL_USER}>`, to: adminEmail, subject, html });
};

/**
 * Send monthly reset notification to all children
 */
export const sendMonthlyResetNotification = async (): Promise<number> => {
  const transporter = createTransporter();
  
  try {
    await connectToDatabase();
    
    // Get all active children with email notifications enabled
    const children = await User.find({ 
      role: 'child', 
      isActive: true,
      'preferences.emailNotifications': true 
    }).select('firstName lastName email totalStoriesCreated');

    let emailsSent = 0;
    const currentDate = new Date();
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' });

    for (const child of children) {
      const mailOptions = {
        from: `"Stories Platform" <${process.env.EMAIL_USER}>`,
        to: child.email,
        subject: `🔄 ${monthName} Reset - Fresh Writing Opportunities Await!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 15px; background: linear-gradient(135deg, #f0f9ff 0%, #fef3ff 100%);">
            <div style="text-align: center; padding: 20px 0;">
              <div style="background: linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899); color: white; padding: 15px; border-radius: 15px; font-size: 24px; font-weight: bold; display: inline-block;">
                ✨ Stories Platform ✨
              </div>
            </div>
            
            <h2 style="color: #3b82f6; text-align: center; font-size: 28px;">
              🔄 Welcome to ${monthName}!
            </h2>
            
            <div style="background: rgba(59, 130, 246, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
              <p style="font-size: 20px; color: #1e40af; margin: 0; font-weight: bold;">
                🎉 Your writing limits have been reset! 🎉
              </p>
            </div>
            
            <div style="background: #fef3ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #8b5cf6; margin-top: 0;">📚 Your Fresh ${monthName} Limits:</h3>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                <div style="text-align: center; padding: 15px; background: white; border-radius: 8px; border: 2px solid #3b82f6;">
                  <div style="font-size: 28px; font-weight: bold; color: #3b82f6;">3</div>
                  <div style="color: #374151;">Story Creations</div>
                </div>
                <div style="text-align: center; padding: 15px; background: white; border-radius: 8px; border: 2px solid #10b981;">
                  <div style="font-size: 28px; font-weight: bold; color: #10b981;">3</div>
                  <div style="color: #374151;">AI Assessments</div>
                </div>
                <div style="text-align: center; padding: 15px; background: white; border-radius: 8px; border: 2px solid #8b5cf6;">
                  <div style="font-size: 28px; font-weight: bold; color: #8b5cf6;">3</div>
                  <div style="color: #374151;">Competition Entries</div>
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/children-dashboard" style="background: linear-gradient(45deg, #3b82f6, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; font-size: 18px; border-radius: 25px; display: inline-block; margin-right: 10px;">
                🏠 View Dashboard
              </a>
              <a href="${process.env.NEXTAUTH_URL}/create-stories" style="background: linear-gradient(45deg, #10b981, #3b82f6); color: white; padding: 15px 30px; text-decoration: none; font-size: 18px; border-radius: 25px; display: inline-block;">
                ✍️ Start Writing
              </a>
            </div>
            
            <div style="background: #fff7ed; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #f59e0b;">
              <p style="margin: 0; font-size: 14px; color: #92400e;">
                🏆 <strong>Don't forget:</strong> Check out this month's writing competition! Submit your published stories for a chance to win recognition and prizes.
              </p>
            </div>
            
            <p style="font-size: 16px; color: #374151; text-align: center;">
              Let's make this your most creative month yet! 🌟📖<br/>
              <span style="color: #3b82f6; font-weight: bold;">The Stories Platform Team</span>
            </p>
            
            <hr style="border: 1px solid #e5e7eb; margin: 30px 0;" />
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              Keep writing, keep growing! ✨
              <br/>
              © ${new Date().getFullYear()} Stories Platform - Empowering Young Writers
            </p>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        emailsSent++;
        console.log(`📧 Monthly reset email sent to ${child.firstName} (${child.email})`);
      } catch (emailError) {
        console.error(`Failed to send monthly reset email to ${child.email}:`, emailError);
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`📧 Monthly reset notifications sent to ${emailsSent} children`);
    return emailsSent;

  } catch (error) {
    console.error('Error sending monthly reset notifications:', error);
    throw error;
  }
};

/**
 * Send competition submission confirmation to child
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
      Competition.findById(competitionId).select('month year phase submissionEnd')
    ]);

    if (!user || !story || !competition) {
      throw new Error('User, story, or competition not found');
    }
    if (!user.preferences?.emailNotifications) {
      throw new Error('User has disabled email notifications');
    }

    const submissionDeadline = new Date(competition.submissionEnd).toLocaleDateString();

    const mailOptions = {
      from: `"Stories Platform Competition" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `🎉 Story Submitted - "${story.title}" is in the Competition!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 15px; background: linear-gradient(135deg, #fef3ff 0%, #fff7ed 100%);">
          <div style="text-align: center; padding: 20px 0;">
            <div style="background: linear-gradient(45deg, #8b5cf6, #f59e0b); color: white; padding: 15px; border-radius: 15px; font-size: 24px; font-weight: bold; display: inline-block;">
              🏆 Competition Entry 🏆
            </div>
          </div>
          
          <h2 style="color: #8b5cf6; text-align: center; font-size: 28px;">
            🎉 Submission Confirmed!
          </h2>
          
          <div style="background: rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
            <p style="font-size: 18px; color: #6b21a8; margin: 0;">
              <strong>Congratulations, ${user.firstName}!</strong><br/>
              Your story has been successfully submitted to the competition!
            </p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">📖 Submission Details:</h3>
            <ul style="color: #4b5563; line-height: 1.8;">
              <li><strong>Story Title:</strong> "${story.title}"</li>
              <li><strong>Competition:</strong> ${competition.month} ${competition.year}</li>
              <li><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</li>
              <li><strong>Submission Deadline:</strong> ${submissionDeadline}</li>
            </ul>
          </div>
          
          <div style="background: #fef3ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #8b5cf6; margin-top: 0;">🚀 What Happens Next?</h3>
            <div style="color: #374151; line-height: 1.6;">
              <p><strong>📝 Judging Phase (Days 26-30):</strong> Our advanced AI system will evaluate your story across 16 different categories including creativity, grammar, vocabulary, and storytelling structure.</p>
              <p><strong>🏆 Results (Day 31):</strong> Winners will be announced with Olympic-style recognition! Top 3 stories receive special badges and certificates.</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/competitions" style="background: linear-gradient(45deg, #8b5cf6, #f59e0b); color: white; padding: 15px 30px; text-decoration: none; font-size: 18px; border-radius: 25px; display: inline-block;">
              🏆 View Competition
            </a>
          </div>
          
          <div style="background: #ecfdf5; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #10b981;">
            <p style="margin: 0; font-size: 14px; color: #065f46;">
              💡 <strong>Good luck!</strong> You can submit up to 3 stories per competition. Keep writing and creating amazing stories!
            </p>
          </div>
          
          <p style="font-size: 16px; color: #374151; text-align: center;">
            We're excited to see your creativity shine! 🌟<br/>
            <span style="color: #8b5cf6; font-weight: bold;">The Stories Platform Team</span>
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Competition submission confirmation sent to ${user.firstName} (${user.email})`);
    return info;

  } catch (error) {
    console.error('Error sending competition submission confirmation:', error);
    throw error;
  }
};