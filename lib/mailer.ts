// // lib/mailer.ts - COMPLETE FILE FOR MINTOONS PLATFORM
// import { UserRole } from '@/types/auth';
// import nodemailer from 'nodemailer';
// import mongoose from 'mongoose';
// import { connectToDatabase } from '@/utils/db';
// import User from '@/models/User';
// import StorySession from '@/models/StorySession';
// import Competition from '@/models/Competition';

// // Email configuration
// const createTransporter = () => {
//   return nodemailer.createTransport({
//     host: process.env.EMAIL_HOST || 'smtp.gmail.com',
//     port: parseInt(process.env.EMAIL_PORT || '587'),
//     secure: process.env.EMAIL_SECURE === 'true',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });
// };

// /**
//  * Send password reset email to user AND notify admin
//  * @param email User's email address
//  * @param resetUrl Password reset URL with token
//  * @param role User role for customized email content
//  */
// export const sendPasswordResetEmail = async (
//   email: string,
//   resetUrl: string,
//   role?: UserRole
// ): Promise<nodemailer.SentMessageInfo> => {
//   const transporter = createTransporter();

//   // Customize content based on user role
//   let salutation = 'Dear storyteller';
//   let roleSpecificText = '';
//   let fromName = 'Mintoons Support';

//   if (role === 'child') {
//     salutation = 'Dear young writer';
//     roleSpecificText =
//       'You can reset your magic key (password) to get back to creating amazing stories with your AI writing companion!';
//     fromName = 'Mintoons Magic Team';
//   } else if (role === 'mentor') {
//     salutation = 'Dear mentor';
//     roleSpecificText =
//       'You can reset your password to regain access to your mentor dashboard and continue guiding young storytellers.';
//     fromName = 'Mintoons Mentor Support';
//   } else if (role === 'admin') {
//     salutation = 'Dear admin';
//     roleSpecificText =
//       'You can reset your password to regain access to the admin dashboard.';
//     fromName = 'Mintoons Admin Support';
//   }

//   // USER EMAIL - Password reset for user
//   const userMailOptions = {
//     from: `"${fromName}" <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: '🔑 Reset Your Magic Key - Mintoons',
//     html: `
//       <div style="font-family: 'Comic Sans MS', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 15px; background: linear-gradient(135deg, #fef3ff 0%, #f0f9ff 100%);">
//         <div style="text-align: center; padding: 20px 0;">
//           <div style="background: linear-gradient(45deg, #7c3aed, #ec4899, #f97316); color: white; padding: 15px; border-radius: 15px; font-size: 24px; font-weight: bold; display: inline-block;">
//             ✨ Mintoons ✨
//           </div>
//         </div>

//         <h2 style="color: #7c3aed; text-align: center; font-family: 'Comic Sans MS', Arial, sans-serif; font-size: 28px;">
//           🔐 Reset Your Magic Key
//         </h2>

//         <div style="background: rgba(124, 58, 237, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #7c3aed;">
//           <p style="font-size: 18px; color: #374151; margin: 0;">
//             ${salutation},
//           </p>
//         </div>

//         <p style="font-size: 16px; color: #374151; line-height: 1.6;">
//           Don't worry! Even the greatest storytellers sometimes forget their magic keys. We received a request to reset your password for your Mintoons account.
//         </p>

//         <p style="font-size: 16px; color: #374151; line-height: 1.6;">
//           ${roleSpecificText}
//         </p>

//         <div style="text-align: center; margin: 30px 0;">
//           <a href="${resetUrl}" style="background: linear-gradient(45deg, #7c3aed, #ec4899); color: white; padding: 15px 30px; text-decoration: none; font-size: 18px; border-radius: 25px; display: inline-block; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3); transition: transform 0.2s;">
//             🔑 Reset My Magic Key
//           </a>
//         </div>

//         <div style="background: #fef3ff; padding: 15px; border-radius: 10px; margin: 20px 0;">
//           <p style="font-size: 14px; color: #7c2d12; margin: 0;">
//             ⏰ This magic link will expire in 15 minutes for security. If you need a new link, just visit the forgot password page again!
//           </p>
//         </div>

//         <p style="font-size: 14px; color: #6b7280; word-wrap: break-word; background: #f9fafb; padding: 10px; border-radius: 8px;">
//           If the button doesn't work, copy and paste this link: <br/>
//           <a href="${resetUrl}" style="color: #7c3aed; word-break: break-all;">${resetUrl}</a>
//         </p>

//         <p style="font-size: 16px; color: #374151;">
//           Keep creating amazing stories! 📚✨<br/>
//           The Mintoons Team
//         </p>

//         <hr style="border: 1px solid #e5e7eb; margin: 30px 0;" />
//         <p style="font-size: 12px; color: #9ca3af; text-align: center;">
//           If you didn't request this, you can safely ignore this email. Your account remains secure! 🛡️
//           <br/>
//           © ${new Date().getFullYear()} Mintoons - AI-Powered Creative Writing Platform. All rights reserved.
//         </p>
//       </div>
//     `,
//   };

//   // ADMIN EMAIL - Password reset notification
//   const adminMailOptions = {
//     from: `"Mintoons System" <${process.env.EMAIL_USER}>`,
//     to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
//     subject: `🔐 Password Reset Request - ${role || 'Unknown'} User`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 10px;">
//         <h2 style="color: #7c3aed; display: flex; align-items: center;">
//           🔐 Password Reset Request
//         </h2>
//         <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
//           <p style="margin: 5px 0;"><strong>👤 User:</strong> ${email}</p>
//           <p style="margin: 5px 0;"><strong>🎭 Role:</strong> ${role || 'Unknown'}</p>
//           <p style="margin: 5px 0;"><strong>🕐 Time:</strong> ${new Date().toLocaleString()}</p>
//           <p style="margin: 5px 0;"><strong>🔗 Action:</strong> Password reset requested</p>
//         </div>
//         <p style="font-size: 14px; color: #6b7280;">This is an automated notification from the Mintoons platform.</p>
//       </div>
//     `,
//   };

//   try {
//     const [userInfo, adminInfo] = await Promise.all([
//       transporter.sendMail(userMailOptions),
//       transporter.sendMail(adminMailOptions),
//     ]);

//     console.log('Password reset emails sent successfully:', {
//       userMessageId: userInfo.messageId,
//       adminMessageId: adminInfo.messageId,
//     });

//     return userInfo;
//   } catch (error) {
//     console.error('Error sending password reset emails:', error);
//     throw error;
//   }
// };

// /**
//  * Send registration confirmation email to child AND notify admin
//  * @param email Child's email address
//  * @param firstName Child's first name
//  */
// export const sendChildRegistrationEmail = async (
//   email: string,
//   firstName: string
// ): Promise<nodemailer.SentMessageInfo> => {
//   const transporter = createTransporter();

//   // USER EMAIL - Welcome email for child
//   const userMailOptions = {
//     from: `"Mintoons Magic Team" <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: '🌟 Welcome to Mintoons - Your Creative Journey Begins!',
//     html: `
//       <div style="font-family: 'Comic Sans MS', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 15px; background: linear-gradient(135deg, #fef3ff 0%, #fff7ed 100%);">
//         <div style="text-align: center; padding: 20px 0;">
//           <div style="background: linear-gradient(45deg, #7c3aed, #ec4899, #f97316); color: white; padding: 15px; border-radius: 15px; font-size: 24px; font-weight: bold; display: inline-block;">
//             ✨ Mintoons ✨
//           </div>
//         </div>

//         <h2 style="color: #7c3aed; text-align: center; font-family: 'Comic Sans MS', Arial, sans-serif; font-size: 28px;">
//           🎉 Welcome, ${firstName}!
//         </h2>

//         <div style="background: rgba(124, 58, 237, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
//           <p style="font-size: 20px; color: #7c3aed; margin: 0; font-weight: bold;">
//             🚀 Your magical storytelling adventure starts NOW! ✨
//           </p>
//         </div>

//         <p style="font-size: 16px; color: #374151; line-height: 1.6;">
//           Amazing! You've just joined the most exciting creative writing platform for young storytellers. Get ready to unleash your imagination! 🌟
//         </p>

//         <div style="background: #fef3ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
//           <h3 style="color: #7c3aed; margin-top: 0;">🎭 What magical things can you do now?</h3>
//           <ul style="font-size: 16px; color: #374151; line-height: 1.8;">
//             <li>🤖 <strong>Write with AI:</strong> Get help from your smart writing companion</li>
//             <li>📚 <strong>Create Stories:</strong> Adventure, fantasy, mystery - you choose!</li>
//             <li>👨‍🏫 <strong>Learn from Mentors:</strong> Get feedback from expert writers</li>
//             <li>🏆 <strong>Earn Achievements:</strong> Unlock badges as you improve</li>
//             <li>⭐ <strong>Track Progress:</strong> See how your writing skills grow</li>
//           </ul>
//         </div>

//         <div style="text-align: center; margin: 30px 0;">
//           <a href="${process.env.NEXTAUTH_URL}/login/child" style="background: linear-gradient(45deg, #7c3aed, #ec4899); color: white; padding: 15px 30px; text-decoration: none; font-size: 18px; border-radius: 25px; display: inline-block; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);">
//             🚀 Start My First Story!
//           </a>
//         </div>

//         <div style="background: #f0f9ff; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #3b82f6;">
//           <p style="margin: 0; font-size: 14px; color: #1e40af;">
//             💡 <strong>Pro Tip:</strong> Start with the story creation wizard to choose your adventure type, characters, and setting!
//           </p>
//         </div>

//         <p style="font-size: 16px; color: #374151; text-align: center;">
//           Ready to become the next great storyteller? Let's create some magic! ✨📖<br/>
//           <span style="color: #7c3aed; font-weight: bold;">The Mintoons Team</span>
//         </p>

//         <hr style="border: 1px solid #e5e7eb; margin: 30px 0;" />
//         <p style="font-size: 12px; color: #9ca3af; text-align: center;">
//           Welcome to the Mintoons family! 🏠✨
//           <br/>
//           © ${new Date().getFullYear()} Mintoons - Where Young Writers Become Great Storytellers
//         </p>
//       </div>
//     `,
//   };

//   // ADMIN EMAIL - New child registration notification
//   const adminMailOptions = {
//     from: `"Mintoons System" <${process.env.EMAIL_USER}>`,
//     to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
//     subject: '🎯 New Young Writer Joined - Mintoons',
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 10px;">
//         <h2 style="color: #7c3aed;">🎉 New Child Registration</h2>
//         <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
//           <p style="margin: 5px 0;"><strong>👤 Name:</strong> ${firstName}</p>
//           <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${email}</p>
//           <p style="margin: 5px 0;"><strong>🎭 Role:</strong> Child Writer</p>
//           <p style="margin: 5px 0;"><strong>🕐 Joined:</strong> ${new Date().toLocaleString()}</p>
//           <p style="margin: 5px 0;"><strong>🔗 Dashboard:</strong> <a href="${process.env.NEXTAUTH_URL}/admin/children">View All Children</a></p>
//         </div>
//         <p style="font-size: 14px; color: #6b7280;">A new young writer has joined the Mintoons community!</p>
//       </div>
//     `,
//   };

//   try {
//     const [userInfo, adminInfo] = await Promise.all([
//       transporter.sendMail(userMailOptions),
//       transporter.sendMail(adminMailOptions),
//     ]);

//     console.log('Child registration emails sent successfully:', {
//       userMessageId: userInfo.messageId,
//       adminMessageId: adminInfo.messageId,
//     });

//     return userInfo;
//   } catch (error) {
//     console.error('Error sending child registration emails:', error);
//     throw error;
//   }
// };

// /**
//  * Send contact form confirmation email AND notify admin
//  * @param email Contact's email address
//  * @param firstName Contact's first name
//  * @param subject Message subject
//  * @param message Message content
//  */
// export const sendContactFormConfirmationEmail = async (
//   email: string,
//   firstName: string,
//   subject?: string,
//   message?: string
// ): Promise<nodemailer.SentMessageInfo> => {
//   const transporter = createTransporter();

//   // USER EMAIL - Contact confirmation
//   const userMailOptions = {
//     from: `"Mintoons Support" <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: '📧 Thanks for Contacting Mintoons!',
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 15px; background: linear-gradient(135deg, #fef3ff 0%, #f0f9ff 100%);">
//         <div style="text-align: center; padding: 20px 0;">
//           <div style="background: linear-gradient(45deg, #7c3aed, #ec4899, #f97316); color: white; padding: 15px; border-radius: 15px; font-size: 24px; font-weight: bold; display: inline-block;">
//             ✨ Mintoons ✨
//           </div>
//         </div>

//         <h2 style="color: #7c3aed; text-align: center; font-size: 28px;">
//           📧 Message Received!
//         </h2>

//         <p style="font-size: 16px; color: #374151; line-height: 1.6;">
//           Dear ${firstName},
//         </p>

//         <p style="font-size: 16px; color: #374151; line-height: 1.6;">
//           Thank you for reaching out to Mintoons! We've received your message and our magical support team is reviewing your inquiry.
//         </p>

//         <div style="background: #fef3ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
//           <p style="font-size: 16px; color: #374151; margin: 0;">
//             🚀 <strong>What happens next?</strong><br/>
//             Our team will respond within 1-2 business days. For urgent matters, feel free to contact us directly!
//           </p>
//         </div>

//         <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
//           <h3 style="color: #3b82f6; margin-top: 0;">🌟 While you wait, explore:</h3>
//           <ul style="font-size: 16px; color: #374151; line-height: 1.8;">
//             <li><a href="${process.env.NEXTAUTH_URL}/about" style="color: #7c3aed;">About Mintoons</a> - Learn about our mission</li>
//             <li><a href="${process.env.NEXTAUTH_URL}/register/child" style="color: #7c3aed;">Join as Writer</a> - Start your creative journey</li>
//             <li><a href="${process.env.NEXTAUTH_URL}" style="color: #7c3aed;">Home</a> - Explore our platform</li>
//           </ul>
//         </div>

//         <p style="font-size: 16px; color: #374151; text-align: center;">
//           Thanks for being part of the Mintoons community! ✨<br/>
//           <span style="color: #7c3aed; font-weight: bold;">The Mintoons Support Team</span>
//         </p>

//         <hr style="border: 1px solid #e5e7eb; margin: 30px 0;" />
//         <p style="font-size: 12px; color: #9ca3af; text-align: center;">
//           © ${new Date().getFullYear()} Mintoons - Empowering Young Storytellers
//         </p>
//       </div>
//     `,
//   };

//   // ADMIN EMAIL - Contact form notification
//   const adminMailOptions = {
//     from: `"Mintoons System" <${process.env.EMAIL_USER}>`,
//     to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
//     subject: `📧 New Contact Form: ${subject || 'General Inquiry'} - Mintoons`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 10px;">
//         <h2 style="color: #7c3aed;">📧 New Contact Form Submission</h2>
//         <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
//           <p style="margin: 5px 0;"><strong>👤 Name:</strong> ${firstName}</p>
//           <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${email}</p>
//           <p style="margin: 5px 0;"><strong>📝 Subject:</strong> ${subject || 'No subject provided'}</p>
//           <p style="margin: 5px 0;"><strong>🕐 Submitted:</strong> ${new Date().toLocaleString()}</p>
//         </div>
//         ${
//           message
//             ? `
//         <div style="background: #ffffff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin: 20px 0;">
//           <p style="margin: 0 0 10px 0;"><strong>💬 Message:</strong></p>
//           <p style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">${message}</p>
//         </div>
//         `
//             : ''
//         }
//         <div style="text-align: center; margin: 20px 0;">
//           <a href="mailto:${email}?subject=Re: ${subject || 'Your inquiry'}" style="background: linear-gradient(45deg, #7c3aed, #ec4899); color: white; padding: 10px 20px; text-decoration: none; font-size: 14px; border-radius: 8px; display: inline-block;">
//             Reply to ${firstName}
//           </a>
//         </div>
//         <p style="font-size: 14px; color: #6b7280;">This is an automated notification from the Mintoons platform.</p>
//       </div>
//     `,
//   };

//   try {
//     const [userInfo, adminInfo] = await Promise.all([
//       transporter.sendMail(userMailOptions),
//       transporter.sendMail(adminMailOptions),
//     ]);

//     console.log('Contact form emails sent successfully:', {
//       userMessageId: userInfo.messageId,
//       adminMessageId: adminInfo.messageId,
//     });

//     return userInfo;
//   } catch (error) {
//     console.error('Error sending contact form emails:', error);
//     throw error;
//   }
// };

// /**
//  * Send mentor registration notification to admin
//  * @param email Mentor's email address
//  * @param firstName Mentor's first name
//  * @param lastName Mentor's last name
//  */
// export const sendMentorRegistrationNotification = async (
//   email: string,
//   firstName: string,
//   lastName: string
// ): Promise<nodemailer.SentMessageInfo> => {
//   const transporter = createTransporter();

//   // ADMIN EMAIL - Mentor registration notification
//   const adminMailOptions = {
//     from: `"Mintoons System" <${process.env.EMAIL_USER}>`,
//     to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
//     subject: '👨‍🏫 New Mentor Registration Request - Mintoons',
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 10px;">
//         <h2 style="color: #059669;">👨‍🏫 New Mentor Registration</h2>
//         <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
//           <p style="margin: 5px 0;"><strong>👤 Name:</strong> ${firstName} ${lastName}</p>
//           <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${email}</p>
//           <p style="margin: 5px 0;"><strong>🎭 Role:</strong> Mentor (Pending Approval)</p>
//          <p style="margin: 5px 0;"><strong>🕐 Applied:</strong> ${new Date().toLocaleString()}</p>
//          <p style="margin: 5px 0;"><strong>🔗 Dashboard:</strong> <a href="${process.env.NEXTAUTH_URL}/admin/mentors">Review Application</a></p>
//        </div>
//        <div style="background: #fef3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
//          <p style="margin: 0; font-size: 14px; color: #7c2d12;">
//            ⚠️ <strong>Action Required:</strong> Please review this mentor application and approve or reject as appropriate.
//          </p>
//        </div>
//        <p style="font-size: 14px; color: #6b7280;">A new mentor has applied to join the Mintoons mentorship program.</p>
//      </div>
//    `,
//   };

//   try {
//     const adminInfo = await transporter.sendMail(adminMailOptions);

//     console.log('Mentor registration notification sent successfully:', {
//       adminMessageId: adminInfo.messageId,
//     });

//     return adminInfo;
//   } catch (error) {
//     console.error('Error sending mentor registration notification:', error);
//     throw error;
//   }
// };

// // Add competition-related mailer services

// /**
//  * Send competition announcement email to admin
//  */
// export const sendCompetitionAnnouncement = async (
//   competitionId: string,
//   month: string,
//   year: number
// ): Promise<nodemailer.SentMessageInfo> => {
//   const transporter = createTransporter();
//   const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '';
//   const subject = `New Competition Created: ${month} ${year}`;
//   const html = `<p>A new competition for ${month} ${year} has been created and is now active. Competition ID: ${competitionId}</p>`;
//   return transporter.sendMail({ from: `"Mintoons" <${process.env.EMAIL_USER}>`, to: adminEmail, subject, html });
// };

// /**
//  * Send phase change notification to admin
//  */
// export const sendCompetitionPhaseChange = async (
//   competitionId: string,
//   phase: string
// ): Promise<nodemailer.SentMessageInfo> => {
//   const transporter = createTransporter();
//   const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '';
//   const subject = `Competition Phase Changed: ${phase}`;
//   const html = `<p>The competition phase has changed to ${phase} for competition ID: ${competitionId}.</p>`;
//   return transporter.sendMail({ from: `"Mintoons" <${process.env.EMAIL_USER}>`, to: adminEmail, subject, html });
// };

// /**
//  * Send competition results notification to admin
//  */
// export const sendCompetitionResults = async (
//   competitionId: string
// ): Promise<nodemailer.SentMessageInfo> => {
//   const transporter = createTransporter();
//   const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '';
//   const subject = `Competition Results Announced`;
//   const html = `<p>The results for competition ID: ${competitionId} have been announced.</p>`;
//   return transporter.sendMail({ from: `"Mintoons" <${process.env.EMAIL_USER}>`, to: adminEmail, subject, html });
// };

// /**
//  * Send monthly reset notification to all children
//  */
// export const sendMonthlyResetNotification = async (): Promise<number> => {
//   const transporter = createTransporter();

//   try {
//     await connectToDatabase();

//     // Get all active children with email notifications enabled
//     const children = await User.find({
//       role: 'child',
//       isActive: true,
//       'preferences.emailNotifications': true
//     }).select('firstName lastName email totalStoriesCreated');

//     let emailsSent = 0;
//     const currentDate = new Date();
//     const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' });

//     for (const child of children) {
//       const mailOptions = {
//         from: `"Stories Platform" <${process.env.EMAIL_USER}>`,
//         to: child.email,
//         subject: `🔄 ${monthName} Reset - Fresh Writing Opportunities Await!`,
//         html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 15px; background: linear-gradient(135deg, #f0f9ff 0%, #fef3ff 100%);">
//             <div style="text-align: center; padding: 20px 0;">
//               <div style="background: linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899); color: white; padding: 15px; border-radius: 15px; font-size: 24px; font-weight: bold; display: inline-block;">
//                 ✨ Stories Platform ✨
//               </div>
//             </div>

//             <h2 style="color: #3b82f6; text-align: center; font-size: 28px;">
//               🔄 Welcome to ${monthName}!
//             </h2>

//             <div style="background: rgba(59, 130, 246, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
//               <p style="font-size: 20px; color: #1e40af; margin: 0; font-weight: bold;">
//                 🎉 Your writing limits have been reset! 🎉
//               </p>
//             </div>

//             <div style="background: #fef3ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
//               <h3 style="color: #8b5cf6; margin-top: 0;">📚 Your Fresh ${monthName} Limits:</h3>
//               <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
//                 <div style="text-align: center; padding: 15px; background: white; border-radius: 8px; border: 2px solid #3b82f6;">
//                   <div style="font-size: 28px; font-weight: bold; color: #3b82f6;">3</div>
//                   <div style="color: #374151;">Story Creations</div>
//                 </div>
//                 <div style="text-align: center; padding: 15px; background: white; border-radius: 8px; border: 2px solid #10b981;">
//                   <div style="font-size: 28px; font-weight: bold; color: #10b981;">3</div>
//                   <div style="color: #374151;">AI Assessments</div>
//                 </div>
//                 <div style="text-align: center; padding: 15px; background: white; border-radius: 8px; border: 2px solid #8b5cf6;">
//                   <div style="font-size: 28px; font-weight: bold; color: #8b5cf6;">3</div>
//                   <div style="color: #374151;">Competition Entries</div>
//                 </div>
//               </div>
//             </div>

//             <div style="text-align: center; margin: 30px 0;">
//               <a href="${process.env.NEXTAUTH_URL}/children-dashboard" style="background: linear-gradient(45deg, #3b82f6, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; font-size: 18px; border-radius: 25px; display: inline-block; margin-right: 10px;">
//                 🏠 View Dashboard
//               </a>
//               <a href="${process.env.NEXTAUTH_URL}/create-stories" style="background: linear-gradient(45deg, #10b981, #3b82f6); color: white; padding: 15px 30px; text-decoration: none; font-size: 18px; border-radius: 25px; display: inline-block;">
//                 ✍️ Start Writing
//               </a>
//             </div>

//             <div style="background: #fff7ed; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #f59e0b;">
//               <p style="margin: 0; font-size: 14px; color: #92400e;">
//                 🏆 <strong>Don't forget:</strong> Check out this month's writing competition! Submit your published stories for a chance to win recognition and prizes.
//               </p>
//             </div>

//             <p style="font-size: 16px; color: #374151; text-align: center;">
//               Let's make this your most creative month yet! 🌟📖<br/>
//               <span style="color: #3b82f6; font-weight: bold;">The Stories Platform Team</span>
//             </p>

//             <hr style="border: 1px solid #e5e7eb; margin: 30px 0;" />
//             <p style="font-size: 12px; color: #9ca3af; text-align: center;">
//               Keep writing, keep growing! ✨
//               <br/>
//               © ${new Date().getFullYear()} Stories Platform - Empowering Young Writers
//             </p>
//           </div>
//         `,
//       };

//       try {
//         await transporter.sendMail(mailOptions);
//         emailsSent++;
//         console.log(`📧 Monthly reset email sent to ${child.firstName} (${child.email})`);
//       } catch (emailError) {
//         console.error(`Failed to send monthly reset email to ${child.email}:`, emailError);
//       }

//       // Add small delay to avoid rate limiting
//       await new Promise(resolve => setTimeout(resolve, 100));
//     }

//     console.log(`📧 Monthly reset notifications sent to ${emailsSent} children`);
//     return emailsSent;

//   } catch (error) {
//     console.error('Error sending monthly reset notifications:', error);
//     throw error;
//   }
// };

// /**
//  * Send competition submission confirmation to child
//  */
// export const sendCompetitionSubmissionConfirmation = async (
//   childId: string,
//   storyId: string,
//   competitionId: string
// ): Promise<nodemailer.SentMessageInfo> => {
//   const transporter = createTransporter();

//   try {
//     await connectToDatabase();

//     const [user, story, competition] = await Promise.all([
//       User.findById(childId).select('firstName lastName email preferences'),
//       StorySession.findById(storyId).select('title'),
//       Competition.findById(competitionId).select('month year phase submissionEnd')
//     ]);

//     if (!user || !story || !competition) {
//       throw new Error('User, story, or competition not found');
//     }
//     if (!user.preferences?.emailNotifications) {
//       throw new Error('User has disabled email notifications');
//     }

//     const submissionDeadline = new Date(competition.submissionEnd).toLocaleDateString();

//     const mailOptions = {
//       from: `"Stories Platform Competition" <${process.env.EMAIL_USER}>`,
//       to: user.email,
//       subject: `🎉 Story Submitted - "${story.title}" is in the Competition!`,
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 15px; background: linear-gradient(135deg, #fef3ff 0%, #fff7ed 100%);">
//           <div style="text-align: center; padding: 20px 0;">
//             <div style="background: linear-gradient(45deg, #8b5cf6, #f59e0b); color: white; padding: 15px; border-radius: 15px; font-size: 24px; font-weight: bold; display: inline-block;">
//               🏆 Competition Entry 🏆
//             </div>
//           </div>

//           <h2 style="color: #8b5cf6; text-align: center; font-size: 28px;">
//             🎉 Submission Confirmed!
//           </h2>

//           <div style="background: rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
//             <p style="font-size: 18px; color: #6b21a8; margin: 0;">
//               <strong>Congratulations, ${user.firstName}!</strong><br/>
//               Your story has been successfully submitted to the competition!
//             </p>
//           </div>

//           <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
//             <h3 style="color: #374151; margin-top: 0;">📖 Submission Details:</h3>
//             <ul style="color: #4b5563; line-height: 1.8;">
//               <li><strong>Story Title:</strong> "${story.title}"</li>
//               <li><strong>Competition:</strong> ${competition.month} ${competition.year}</li>
//               <li><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</li>
//               <li><strong>Submission Deadline:</strong> ${submissionDeadline}</li>
//             </ul>
//           </div>

//           <div style="background: #fef3ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
//             <h3 style="color: #8b5cf6; margin-top: 0;">🚀 What Happens Next?</h3>
//             <div style="color: #374151; line-height: 1.6;">
//               <p><strong>📝 Judging Phase (Days 26-30):</strong> Our advanced AI system will evaluate your story across 16 different categories including creativity, grammar, vocabulary, and storytelling structure.</p>
//               <p><strong>🏆 Results (Day 31):</strong> Winners will be announced with Olympic-style recognition! Top 3 stories receive special badges and certificates.</p>
//             </div>
//           </div>

//           <div style="text-align: center; margin: 30px 0;">
//             <a href="${process.env.NEXTAUTH_URL}/competitions" style="background: linear-gradient(45deg, #8b5cf6, #f59e0b); color: white; padding: 15px 30px; text-decoration: none; font-size: 18px; border-radius: 25px; display: inline-block;">
//               🏆 View Competition
//             </a>
//           </div>

//           <div style="background: #ecfdf5; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #10b981;">
//             <p style="margin: 0; font-size: 14px; color: #065f46;">
//               💡 <strong>Good luck!</strong> You can submit up to 3 stories per competition. Keep writing and creating amazing stories!
//             </p>
//           </div>

//           <p style="font-size: 16px; color: #374151; text-align: center;">
//             We're excited to see your creativity shine! 🌟<br/>
//             <span style="color: #8b5cf6; font-weight: bold;">The Stories Platform Team</span>
//           </p>
//         </div>
//       `,
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log(`📧 Competition submission confirmation sent to ${user.firstName} (${user.email})`);
//     return info;

//   } catch (error) {
//     console.error('Error sending competition submission confirmation:', error);
//     throw error;
//   }
// };

// lib/mailer.ts - PROFESSIONAL PREMIUM MINTOONS MAILER
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

// Professional email header template
const getEmailHeader = () => `
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 20px 20px 0 0;">
    <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 15px; display: inline-block; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
      <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
        <div style="background: linear-gradient(45deg, #667eea, #764ba2); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);">
          <span style="color: white; font-size: 24px; font-weight: bold;">M</span>
        </div>
        <div style="text-align: left;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 700; background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-family: 'Segoe UI', Arial, sans-serif;">MINTOONS</h1>
          <p style="margin: 0; font-size: 14px; color: #666; font-weight: 500;">AI-Powered Creative Writing Platform</p>
        </div>
      </div>
    </div>
  </div>
`;

// Professional email footer template
const getEmailFooter = () => `
  <div style="background: #f8fafc; padding: 40px 20px; text-align: center; border-radius: 0 0 20px 20px; border-top: 1px solid #e2e8f0;">
    <div style="max-width: 500px; margin: 0 auto;">
      <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 20px;">
        <a href="${process.env.NEXTAUTH_URL}" style="color: #667eea; text-decoration: none; font-weight: 500;">Home</a>
        <a href="${process.env.NEXTAUTH_URL}/pricing" style="color: #667eea; text-decoration: none; font-weight: 500;">Pricing</a>
        <a href="${process.env.NEXTAUTH_URL}/contact-us" style="color: #667eea; text-decoration: none; font-weight: 500;">Support</a>
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
        <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
          © ${new Date().getFullYear()} Mintoons. All rights reserved.<br/>
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
    from: `"Mintoons Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🎉 Welcome to Mintoons - Your Premium Writing Journey Begins!',
    html: `
      <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">
        ${getEmailHeader()}
        
        <!-- Welcome Hero Section -->
        <div style="background: linear-gradient(135deg, #fef7ff 0%, #f0f9ff 100%); padding: 50px 30px; text-align: center; position: relative;">
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
        </div>

        <!-- Your Free Plan Section -->
        <div style="padding: 40px 30px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h3 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #1a202c;">Your Free Starter Plan Includes:</h3>
            <p style="margin: 0; font-size: 16px; color: #64748b;">Everything you need to start your writing journey</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #fef7ff 100%); padding: 30px; border-radius: 20px; border: 2px solid #e2e8f0; margin-bottom: 30px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
              <div style="display: flex; align-items: center; gap: 15px;">
                <div style="background: #667eea; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <span style="color: white; font-size: 20px;">✍️</span>
                </div>
                <div>
                  <div style="font-size: 18px; font-weight: 600; color: #1a202c; margin-bottom: 3px;">3 Free Stories</div>
                  <div style="font-size: 14px; color: #64748b;">Create amazing stories with AI help</div>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; gap: 15px;">
                <div style="background: #10b981; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <span style="color: white; font-size: 20px;">🧠</span>
                </div>
                <div>
                  <div style="font-size: 18px; font-weight: 600; color: #1a202c; margin-bottom: 3px;">3 AI Assessments</div>
                  <div style="font-size: 14px; color: #64748b;">Get detailed feedback on your writing</div>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; gap: 15px;">
                <div style="background: #f59e0b; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <span style="color: white; font-size: 20px;">🏆</span>
                </div>
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
        </div>

        <!-- Upgrade Incentive Section -->
        <div style="background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%); padding: 40px 30px; color: white; text-align: center;">
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
        </div>

        ${getEmailFooter()}
      </div>
    `,
  };

  // ADMIN EMAIL - Professional notification
  const adminMailOptions = {
    from: `"Mintoons Platform" <${process.env.EMAIL_USER}>`,
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
    from: `"Mintoons Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Reset Your Mintoons Password',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">
        ${getEmailHeader()}
        
        <div style="padding: 50px 30px; text-align: center; background: linear-gradient(135deg, #fef7ff 0%, #f0f9ff 100%);">
          <div style="background: #fee2e2; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px auto;">
            <span style="font-size: 32px;">🔐</span>
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
    from: `"Mintoons Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '✅ We Received Your Message - Mintoons Support',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">
        ${getEmailHeader()}
        
        <div style="padding: 50px 30px; text-align: center; background: linear-gradient(135deg, #ecfdf5 0%, #f0f9ff 100%);">
          <div style="background: #dcfce7; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px auto;">
            <span style="font-size: 32px;">✅</span>
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
              🏠 Back to Mintoons
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
        from: `"Mintoons Platform" <${process.env.EMAIL_USER}>`,
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
      from: `"Mintoons Competition" <${process.env.EMAIL_USER}>`,
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
           
           <div style="background: #fbbf24; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px auto; box-shadow: 0 8px 25px rgba(251, 191, 36, 0.3);">
             <span style="font-size: 32px;">🏆</span>
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
               <div style="display: flex; align-items: center; gap: 15px;">
                 <div style="background: #3b82f6; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                   <span style="color: white; font-size: 20px;">🧠</span>
                 </div>
                 <div>
                   <div style="font-size: 18px; font-weight: 600; color: #1a202c; margin-bottom: 5px;">AI Judging Phase</div>
                   <div style="font-size: 14px; color: #64748b; line-height: 1.5;">Our advanced AI will evaluate your story across 16 categories including creativity, grammar, vocabulary, and storytelling structure.</div>
                 </div>
               </div>
             </div>
             
             <div style="background: linear-gradient(135deg, #fef7ff 0%, #fef3cd 100%); padding: 25px; border-radius: 15px; border-left: 4px solid #8b5cf6;">
               <div style="display: flex; align-items: center; gap: 15px;">
                 <div style="background: #8b5cf6; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                   <span style="color: white; font-size: 20px;">🥇</span>
                 </div>
                 <div>
                   <div style="font-size: 18px; font-weight: 600; color: #1a202c; margin-bottom: 5px;">Results & Recognition</div>
                   <div style="font-size: 14px; color: #64748b; line-height: 1.5;">Top 3 winners receive Olympic-style recognition, special badges, digital certificates, and featured story placement!</div>
                 </div>
               </div>
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
    from: `"Mintoons Platform" <${process.env.EMAIL_USER}>`,
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

// Competition-related mailers (admin notifications - keep simple)
export const sendCompetitionAnnouncement = async (
  competitionId: string,
  month: string,
  year: number
): Promise<nodemailer.SentMessageInfo> => {
  const transporter = createTransporter();
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '';

  const mailOptions = {
    from: `"Mintoons System" <${process.env.EMAIL_USER}>`,
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
    from: `"Mintoons System" <${process.env.EMAIL_USER}>`,
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
    from: `"Mintoons System" <${process.env.EMAIL_USER}>`,
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
