// // mailer.ts - COMPLETE FILE WITH ALL ADMIN NOTIFICATIONS
// import nodemailer from 'nodemailer';
// import { UserRole } from '@/types/auth';

// /**
//  * Send password reset email to user AND notify admin
//  * @param email User's email address
//  * @param resetUrl Password reset URL with token
//  * @param role User role (optional) for customized email content
//  */
// export const sendPasswordResetEmail = async (
//   email: string,
//   resetUrl: string,
//   role?: UserRole
// ): Promise<nodemailer.SentMessageInfo> => {
//   // Only send emails for candidate and business roles
//   if (role !== 'candidate' && role !== 'business') {
//     console.log(
//       'Password reset email not sent: role is not candidate or business'
//     );
//     return {} as nodemailer.SentMessageInfo; // Return empty object as SentMessageInfo
//   }

//   // Configure email transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST || 'smtp.gmail.com',
//     port: parseInt(process.env.EMAIL_PORT || '587'),
//     secure: process.env.EMAIL_SECURE === 'true',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   // Customize salutation based on user role
//   let salutation = 'Dear user';
//   let roleSpecificText = '';

//   if (role === 'candidate') {
//     salutation = 'Dear candidate';
//     roleSpecificText =
//       'You can reset your password to regain access to your candidate profile and continue with your job applications.';
//   } else if (role === 'business') {
//     salutation = 'Dear business partner';
//     roleSpecificText =
//       'You can reset your password to regain access to your business portal and continue with your recruitment services.';
//   }

//   // USER EMAIL - Password reset for user
//   const userMailOptions = {
//     from: `"PioneerIT Support" <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: 'Password Reset Request - PioneerIT',
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
//         <div style="text-align: center; padding: 20px 0;">
//           <div style="background: linear-gradient(to right, #7e22ce, #14b8a6); color: white; padding: 15px; border-radius: 10px; font-size: 22px; font-weight: bold;">
//             PioneerIT
//           </div>
//         </div>
//         <h2 style="color: #7e22ce; text-align: center; font-family: 'Arial', sans-serif;">
//           Password Reset Request
//         </h2>
//         <p style="font-size: 16px; color: #333;">
//           ${salutation},
//         </p>
//         <p style="font-size: 16px; color: #333;">
//           We received a request to reset your password for your PioneerIT account. If you didn't make this request, you can safely ignore this email.
//         </p>
//         <p style="font-size: 16px; color: #333;">
//           ${roleSpecificText}
//         </p>
//         <div style="text-align: center; margin: 30px 0;">
//           <a href="${resetUrl}" style="background: linear-gradient(to right, #7e22ce, #14b8a6); color: white; padding: 12px 25px; text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block;">Reset Password</a>
//         </div>
//         <p style="font-size: 16px; color: #333;">
//           This link will expire in 15 minutes for security reasons. If you need a new reset link, please visit the forgot password page again.
//         </p>
//         <p style="font-size: 14px; color: #777; word-wrap: break-word;">
//           If you're having trouble with the button, copy and paste this link into your browser:
//           <br />
//           <a href="${resetUrl}" style="color: #7e22ce;">${resetUrl}</a>
//         </p>
//         <p style="font-size: 16px; color: #333;">
//           Thanks,
//           <br />
//           PioneerIT Support Team
//         </p>
//         <hr style="border: 1px solid #ddd; margin: 30px 0;" />
//         <p style="font-size: 12px; color: #777; text-align: center;">
//           This email was sent by PioneerIT. If you did not request a password reset, please ignore this message.
//           <br>
//           © ${new Date().getFullYear()} PioneerIT Systems. All rights reserved.
//         </p>
//       </div>
//     `,
//   };

//   // ADMIN EMAIL - Password reset notification
//   const adminMailOptions = {
//     from: `"PioneerIT System" <${process.env.EMAIL_USER}>`,
//     to: process.env.EMAIL_USER, // Goes to info@pioneeritsystems.com
//     subject: 'Password Reset Request - PioneerIT',
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
//         <h2 style="color: #7e22ce;">🔐 Password Reset Request</h2>
//         <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
//           <p style="margin: 5px 0;"><strong>👤 User:</strong> ${email}</p>
//           <p style="margin: 5px 0;"><strong>🎭 Role:</strong> ${role || 'Unknown'}</p>
//           <p style="margin: 5px 0;"><strong>🕐 Time:</strong> ${new Date().toLocaleString()}</p>
//           <p style="margin: 5px 0;"><strong>🔗 Action:</strong> Password reset requested</p>
//         </div>
//         <p style="font-size: 14px; color: #777;">This is an automated notification from the PioneerIT system.</p>
//       </div>
//     `,
//   };

//   // Send both emails simultaneously
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
//  * Send registration confirmation email to candidate AND notify admin
//  * @param email User's email address
//  * @param firstName User's first name
//  */
// export const sendCandidateRegistrationEmail = async (
//   email: string,
//   firstName: string
// ): Promise<nodemailer.SentMessageInfo> => {
//   // Configure email transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST || 'smtp.gmail.com',
//     port: parseInt(process.env.EMAIL_PORT || '587'),
//     secure: process.env.EMAIL_SECURE === 'true',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   // Enable debugging
//   transporter.on('error', (error) => {
//     console.error('SMTP Error:', error);
//   });

//   // USER EMAIL - Confirmation to candidate
//   const userMailOptions = {
//     from: `"PioneerIT Careers" <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: 'Welcome to PioneerIT Talent Network',
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
//         <div style="text-align: center; padding: 20px 0;">
//           <div style="background: linear-gradient(to right, #7e22ce, #14b8a6); color: white; padding: 15px; border-radius: 10px; font-size: 22px; font-weight: bold;">
//             PioneerIT
//           </div>
//         </div>
//         <h2 style="color: #7e22ce; text-align: center; font-family: 'Arial', sans-serif;">
//           Welcome to Our Talent Network!
//         </h2>
//         <p style="font-size: 16px; color: #333;">
//           Dear ${firstName},
//         </p>
//         <p style="font-size: 16px; color: #333;">
//           Thank you for registering with PioneerIT Talent Network. Your candidate account has been successfully created.
//         </p>
//         <p style="font-size: 16px; color: #333;">
//           You can now:
//         </p>
//         <ul style="font-size: 16px; color: #333;">
//           <li>Browse and apply for job opportunities</li>
//           <li>Track your applications</li>
//           <li>Update your profile and resume</li>
//           <li>Receive personalized job recommendations</li>
//         </ul>
//         <div style="text-align: center; margin: 30px 0;">
//           <a href="${process.env.NEXT_PUBLIC_BASE_URL}/login/candidate" style="background: linear-gradient(to right, #7e22ce, #14b8a6); color: white; padding: 12px 25px; text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block;">Login to Your Account</a>
//         </div>
//         <p style="font-size: 16px; color: #333;">
//           We're excited to help you find the perfect opportunity that matches your skills and career goals.
//         </p>
//         <p style="font-size: 16px; color: #333;">
//           Thanks,
//           <br />
//           PioneerIT Talent Acquisition Team
//         </p>
//         <hr style="border: 1px solid #ddd; margin: 30px 0;" />
//         <p style="font-size: 12px; color: #777; text-align: center;">
//           © ${new Date().getFullYear()} PioneerIT Systems. All rights reserved.
//         </p>
//       </div>
//     `,
//   };

//   // ADMIN EMAIL - Notification to admin
//   const adminMailOptions = {
//     from: `"PioneerIT System" <${process.env.EMAIL_USER}>`,
//     to: process.env.EMAIL_USER, // Goes to info@pioneeritsystems.com
//     subject: 'New Candidate Registration - PioneerIT',
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
//         <h2 style="color: #7e22ce;">🎯 New Candidate Registration</h2>
//         <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
//           <p style="margin: 5px 0;"><strong>👤 Name:</strong> ${firstName}</p>
//           <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${email}</p>
//           <p style="margin: 5px 0;"><strong>🕐 Time:</strong> ${new Date().toLocaleString()}</p>
//           <p style="margin: 5px 0;"><strong>🔗 Profile Link:</strong> <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/candidates">View All Candidates</a></p>
//         </div>
//         <p style="font-size: 14px; color: #777;">This is an automated notification from the PioneerIT system.</p>
//       </div>
//     `,
//   };

//   // Send both emails simultaneously
//   try {
//     const [userInfo, adminInfo] = await Promise.all([
//       transporter.sendMail(userMailOptions),
//       transporter.sendMail(adminMailOptions),
//     ]);

//     console.log('Candidate registration emails sent successfully:', {
//       userMessageId: userInfo.messageId,
//       adminMessageId: adminInfo.messageId,
//       userResponse: userInfo.response,
//       adminResponse: adminInfo.response,
//       accepted: userInfo.accepted,
//       rejected: userInfo.rejected,
//     });

//     return userInfo;
//   } catch (error) {
//     console.error('Error sending candidate registration emails:', error);
//     throw error;
//   }
// };

// /**
//  * Send registration confirmation email to business AND notify admin
//  * @param email User's email address
//  * @param companyName Company name
//  */
// export const sendBusinessRegistrationEmail = async (
//   email: string,
//   companyName: string
// ): Promise<nodemailer.SentMessageInfo> => {
//   // Configure email transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST || 'smtp.gmail.com',
//     port: parseInt(process.env.EMAIL_PORT || '587'),
//     secure: process.env.EMAIL_SECURE === 'true',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   // Enable debugging
//   transporter.on('error', (error) => {
//     console.error('SMTP Error:', error);
//   });

//   // USER EMAIL - Confirmation to business
//   const userMailOptions = {
//     from: `"PioneerIT Business Portal" <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: 'Welcome to PioneerIT Business Portal',
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
//         <div style="text-align: center; padding: 20px 0;">
//           <div style="background: linear-gradient(to right, #7e22ce, #14b8a6); color: white; padding: 15px; border-radius: 10px; font-size: 22px; font-weight: bold;">
//             PioneerIT
//           </div>
//         </div>
//         <h2 style="color: #7e22ce; text-align: center; font-family: 'Arial', sans-serif;">
//           Welcome to Our Business Portal!
//         </h2>
//         <p style="font-size: 16px; color: #333;">
//           Dear ${companyName} Team,
//         </p>
//         <p style="font-size: 16px; color: #333;">
//           Thank you for registering with PioneerIT Business Portal. Your business account has been successfully created.
//         </p>
//         <p style="font-size: 16px; color: #333;">
//           As a business partner, you can now:
//         </p>
//         <ul style="font-size: 16px; color: #333;">
//           <li>Post job openings and manage applications</li>
//           <li>Access our talent pool of qualified candidates</li>
//           <li>Track recruitment progress</li>
//           <li>Collaborate with our staffing specialists</li>
//         </ul>
//         <div style="text-align: center; margin: 30px 0;">
//           <a href="${process.env.NEXT_PUBLIC_BASE_URL}/login/business" style="background: linear-gradient(to right, #7e22ce, #14b8a6); color: white; padding: 12px 25px; text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block;">Login to Business Portal</a>
//         </div>
//         <p style="font-size: 16px; color: #333;">
//           Our team is dedicated to helping you find the right talent for your organization. If you have any questions, please don't hesitate to contact us.
//         </p>
//         <p style="font-size: 16px; color: #333;">
//           Thanks,
//           <br />
//           PioneerIT Business Solutions Team
//         </p>
//         <hr style="border: 1px solid #ddd; margin: 30px 0;" />
//         <p style="font-size: 12px; color: #777; text-align: center;">
//           © ${new Date().getFullYear()} PioneerIT Systems. All rights reserved.
//         </p>
//       </div>
//     `,
//   };

//   // ADMIN EMAIL - Notification to admin
//   const adminMailOptions = {
//     from: `"PioneerIT System" <${process.env.EMAIL_USER}>`,
//     to: process.env.EMAIL_USER, // Goes to info@pioneeritsystems.com
//     subject: 'New Business Registration - PioneerIT',
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
//         <h2 style="color: #7e22ce;">🏢 New Business Registration</h2>
//         <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
//           <p style="margin: 5px 0;"><strong>🏢 Company:</strong> ${companyName}</p>
//           <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${email}</p>
//           <p style="margin: 5px 0;"><strong>🕐 Time:</strong> ${new Date().toLocaleString()}</p>
//           <p style="margin: 5px 0;"><strong>🔗 Profile Link:</strong> <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/businesses">View All Businesses</a></p>
//         </div>
//         <p style="font-size: 14px; color: #777;">This is an automated notification from the PioneerIT system.</p>
//       </div>
//     `,
//   };

//   // Send both emails simultaneously
//   try {
//     const [userInfo, adminInfo] = await Promise.all([
//       transporter.sendMail(userMailOptions),
//       transporter.sendMail(adminMailOptions),
//     ]);

//     console.log('Business registration emails sent successfully:', {
//       userMessageId: userInfo.messageId,
//       adminMessageId: adminInfo.messageId,
//       userResponse: userInfo.response,
//       adminResponse: adminInfo.response,
//       accepted: userInfo.accepted,
//       rejected: userInfo.rejected,
//     });

//     return userInfo;
//   } catch (error) {
//     console.error('Error sending business registration emails:', error);
//     throw error;
//   }
// };

// /**
//  * Send job application confirmation email to applicant AND notify admin
//  * @param email Applicant's email address
//  * @param fullName Applicant's full name
//  * @param jobTitle Title of the job applied for
//  */
// export const sendJobApplicationConfirmationEmail = async (
//   email: string,
//   fullName: string,
//   jobTitle: string
// ): Promise<nodemailer.SentMessageInfo> => {
//   // Configure email transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST || 'smtp.gmail.com',
//     port: parseInt(process.env.EMAIL_PORT || '587'),
//     secure: process.env.EMAIL_SECURE === 'true',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   // Enable debugging
//   transporter.on('error', (error) => {
//     console.error('SMTP Error:', error);
//   });

//   // Format first name (use only the first part of the full name)
//   const firstName = fullName.split(' ')[0];

//   // USER EMAIL - Confirmation to applicant
//   const userMailOptions = {
//     from: `"PioneerIT Careers" <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: `Your Application for ${jobTitle} - PioneerIT Systems`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
//         <div style="text-align: center; padding: 20px 0;">
//           <div style="background: linear-gradient(to right, #7e22ce, #14b8a6); color: white; padding: 15px; border-radius: 10px; font-size: 22px; font-weight: bold;">
//             PioneerIT
//           </div>
//         </div>
//         <h2 style="color: #7e22ce; text-align: center; font-family: 'Arial', sans-serif;">
//           Application Received
//         </h2>
//         <p style="font-size: 16px; color: #333;">
//           Dear ${firstName},
//         </p>
//         <p style="font-size: 16px; color: #333;">
//           Thank you for applying for the <strong>${jobTitle}</strong> position at PioneerIT Systems. We've received your application and are excited to review your qualifications.
//         </p>
//         <p style="font-size: 16px; color: #333;">
//           Here's what happens next:
//         </p>
//         <ol style="font-size: 16px; color: #333;">
//           <li>Our recruitment team will review your application within the next 5-7 business days</li>
//           <li>If your qualifications match our requirements, we'll contact you to schedule an interview</li>
//           <li>If we determine that your skills and experience aren't the right fit for this particular role, we'll keep your information on file for future opportunities</li>
//         </ol>
//         <p style="font-size: 16px; color: #333;">
//           In the meantime, we encourage you to:
//         </p>
//         <ul style="font-size: 16px; color: #333;">
//           <li>Visit our <a href="${process.env.NEXT_PUBLIC_BASE_URL}/careers" style="color: #7e22ce;">careers page</a> to explore other opportunities</li>
//           <li>Follow us on <a href="https://www.linkedin.com/company/pioneerit" style="color: #7e22ce;">LinkedIn</a> for company updates and new job postings</li>
//         </ul>
//         <p style="font-size: 16px; color: #333;">
//           If you have any questions about your application or our hiring process, please don't hesitate to contact our recruitment team.
//         </p>
//         <p style="font-size: 16px; color: #333;">
//           Best regards,
//           <br />
//           PioneerIT Talent Acquisition Team
//         </p>
//         <hr style="border: 1px solid #ddd; margin: 30px 0;" />
//         <p style="font-size: 12px; color: #777; text-align: center;">
//           © ${new Date().getFullYear()} PioneerIT Systems. All rights reserved.
//         </p>
//       </div>
//     `,
//   };

//   // ADMIN EMAIL - Notification to admin
//   const adminMailOptions = {
//     from: `"PioneerIT System" <${process.env.EMAIL_USER}>`,
//     to: process.env.EMAIL_USER, // Goes to info@pioneeritsystems.com
//     subject: `New Job Application: ${jobTitle} - PioneerIT`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
//         <h2 style="color: #7e22ce;">📋 New Job Application</h2>
//         <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
//           <p style="margin: 5px 0;"><strong>💼 Position:</strong> ${jobTitle}</p>
//           <p style="margin: 5px 0;"><strong>👤 Applicant:</strong> ${fullName}</p>
//           <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${email}</p>
//           <p style="margin: 5px 0;"><strong>🕐 Applied On:</strong> ${new Date().toLocaleString()}</p>
//           <p style="margin: 5px 0;"><strong>🔗 Applications:</strong> <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/applications">View All Applications</a></p>
//         </div>
//         <p style="font-size: 14px; color: #777;">This is an automated notification from the PioneerIT system.</p>
//       </div>
//     `,
//   };

//   // Send both emails simultaneously
//   try {
//     const [userInfo, adminInfo] = await Promise.all([
//       transporter.sendMail(userMailOptions),
//       transporter.sendMail(adminMailOptions),
//     ]);

//     console.log('Job application emails sent successfully:', {
//       userMessageId: userInfo.messageId,
//       adminMessageId: adminInfo.messageId,
//       userResponse: userInfo.response,
//       adminResponse: adminInfo.response,
//       accepted: userInfo.accepted,
//       rejected: userInfo.rejected,
//     });

//     return userInfo;
//   } catch (error) {
//     console.error('Error sending job application emails:', error);
//     throw error;
//   }
// };

// /**
//  * Send contact form confirmation email to sender AND notify admin
//  * @param email Contact's email address
//  * @param firstName Contact's first name
//  * @param subject Message subject (optional)
//  * @param message Message content (optional)
//  */
// export const sendContactFormConfirmationEmail = async (
//   email: string,
//   firstName: string,
//   subject?: string,
//   message?: string
// ): Promise<nodemailer.SentMessageInfo> => {
//   // Configure email transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST || 'smtp.gmail.com',
//     port: parseInt(process.env.EMAIL_PORT || '587'),
//     secure: process.env.EMAIL_SECURE === 'true',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   // Enable debugging
//   transporter.on('error', (error) => {
//     console.error('SMTP Error:', error);
//   });

//   // USER EMAIL - Confirmation to contact
//   const userMailOptions = {
//     from: `"PioneerIT Support" <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: 'Thanks for Contacting PioneerIT Systems',
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
//         <div style="text-align: center; padding: 20px 0;">
//           <div style="background: linear-gradient(to right, #7e22ce, #14b8a6); color: white; padding: 15px; border-radius: 10px; font-size: 22px; font-weight: bold;">
//             PioneerIT
//           </div>
//         </div>
//         <h2 style="color: #7e22ce; text-align: center; font-family: 'Arial', sans-serif;">
//           Message Received
//         </h2>
//         <p style="font-size: 16px; color: #333;">
//           Dear ${firstName},
//         </p>
//         <p style="font-size: 16px; color: #333;">
//           Thank you for reaching out to PioneerIT Systems. We've received your message and appreciate your interest in our services.
//         </p>
//         <p style="font-size: 16px; color: #333;">
//           Our team is reviewing your inquiry and will respond within 1-2 business days. If your matter requires immediate attention, please call our support line at ${process.env.SUPPORT_PHONE || '+1 (123) 456-7890'}.
//         </p>
//         <p style="font-size: 16px; color: #333;">
//           While you wait, you might find these resources helpful:
//         </p>
//         <ul style="font-size: 16px; color: #333;">
//           <li><a href="${process.env.NEXT_PUBLIC_BASE_URL}/about-us" style="color: #7e22ce;">About Us</a> - Learn more about our company</li>
//           <li><a href="${process.env.NEXT_PUBLIC_BASE_URL}/careers" style="color: #7e22ce;">Careers</a> - Explore career opportunities with us</li>
//           <li><a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="color: #7e22ce;">Home</a> - Explore our main website</li>
//         </ul>
//         <p style="font-size: 16px; color: #333;">
//           We look forward to connecting with you soon.
//         </p>
//         <p style="font-size: 16px; color: #333;">
//           Best regards,
//           <br />
//           PioneerIT Customer Support Team
//         </p>
//         <hr style="border: 1px solid #ddd; margin: 30px 0;" />
//         <p style="font-size: 12px; color: #777; text-align: center;">
//           © ${new Date().getFullYear()} PioneerIT Systems. All rights reserved.
//         </p>
//       </div>
//     `,
//   };

//   // ADMIN EMAIL - Notification to admin
//   const adminMailOptions = {
//     from: `"PioneerIT System" <${process.env.EMAIL_USER}>`,
//     to: process.env.EMAIL_USER, // Goes to info@pioneeritsystems.com
//     subject: `New Contact Form: ${subject || 'General Inquiry'} - PioneerIT`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
//         <h2 style="color: #7e22ce;">📧 New Contact Form Submission</h2>
//         <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
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
//           <a href="mailto:${email}?subject=Re: ${subject || 'Your inquiry'}" style="background: linear-gradient(to right, #7e22ce, #14b8a6); color: white; padding: 10px 20px; text-decoration: none; font-size: 14px; border-radius: 5px; display: inline-block;">Reply to ${firstName}</a>
//         </div>
//         <p style="font-size: 14px; color: #777;">This is an automated notification from the PioneerIT system.</p>
//       </div>
//     `,
//   };

//   // Send both emails simultaneously
//   try {
//     const [userInfo, adminInfo] = await Promise.all([
//       transporter.sendMail(userMailOptions),
//       transporter.sendMail(adminMailOptions),
//     ]);

//     console.log('Contact form emails sent successfully:', {
//       userMessageId: userInfo.messageId,
//       adminMessageId: adminInfo.messageId,
//       userResponse: userInfo.response,
//       adminResponse: adminInfo.response,
//       accepted: userInfo.accepted,
//       rejected: userInfo.rejected,
//     });

//     return userInfo;
//   } catch (error) {
//     console.error('Error sending contact form emails:', error);
//     throw error;
//   }
// };

// lib/mailer.ts - COMPLETE FILE FOR MINTOONS PLATFORM
import nodemailer from 'nodemailer';
import { UserRole } from '@/types/auth';

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
 * Send story publication notification to child AND notify mentor/admin
 * @param childEmail Child's email address
 * @param childName Child's first name
 * @param storyTitle Title of the published story
 * @param mentorEmail Optional mentor email to notify
 */
export const sendStoryPublishedEmail = async (
  childEmail: string,
  childName: string,
  storyTitle: string,
  mentorEmail?: string
): Promise<nodemailer.SentMessageInfo> => {
  const transporter = createTransporter();

  // CHILD EMAIL - Story published confirmation
  const childMailOptions = {
    from: `"Mintoons Magic Team" <${process.env.EMAIL_USER}>`,
    to: childEmail,
    subject: `🎉 Your Story "${storyTitle}" is Published!`,
    html: `
      <div style="font-family: 'Comic Sans MS', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 15px; background: linear-gradient(135deg, #fef3ff 0%, #fff7ed 100%);">
        <div style="text-align: center; padding: 20px 0;">
          <div style="background: linear-gradient(45deg, #7c3aed, #ec4899, #f97316); color: white; padding: 15px; border-radius: 15px; font-size: 24px; font-weight: bold; display: inline-block;">
            🎉 Success! 🎉
          </div>
        </div>
        
        <h2 style="color: #7c3aed; text-align: center; font-family: 'Comic Sans MS', Arial, sans-serif; font-size: 28px;">
          Amazing Work, ${childName}! ⭐
        </h2>
        
        <div style="background: rgba(124, 58, 237, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
          <p style="font-size: 20px; color: #7c3aed; margin: 0; font-weight: bold;">
            📚 "${storyTitle}" is now published! 🚀
          </p>
        </div>
        
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          Congratulations! Your creativity has brought another amazing story to life. You should be proud of your storytelling skills! 🌟
        </p>
        
        <div style="background: #fef3ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #7c3aed; margin-top: 0;">🎯 What's next for you?</h3>
          <ul style="font-size: 16px; color: #374151; line-height: 1.8;">
            <li>📖 <strong>Read Your Story:</strong> Share it with family and friends</li>
            <li>📝 <strong>Get Feedback:</strong> Your mentor will review and comment</li>
            <li>🆕 <strong>Start Another:</strong> Ready for your next adventure?</li>
            <li>🏆 <strong>Earn Badges:</strong> Check what achievements you've unlocked</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/my-stories" style="background: linear-gradient(45deg, #7c3aed, #ec4899); color: white; padding: 15px 30px; text-decoration: none; font-size: 18px; border-radius: 25px; display: inline-block; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);">
            📚 View My Stories
          </a>
        </div>
        
        <p style="font-size: 16px; color: #374151; text-align: center;">
          Keep unleashing your creativity! Every story makes you a better writer! ✨📖<br/>
          <span style="color: #7c3aed; font-weight: bold;">The Mintoons Team</span>
        </p>
      </div>
    `,
  };

  // Email array for Promise.all
  const emailPromises = [transporter.sendMail(childMailOptions)];

  // MENTOR EMAIL - Story review notification (if mentor assigned)
  if (mentorEmail) {
    const mentorMailOptions = {
      from: `"Mintoons Mentor System" <${process.env.EMAIL_USER}>`,
      to: mentorEmail,
      subject: `📚 New Story to Review: "${storyTitle}" by ${childName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 15px; background: linear-gradient(135deg, #ecfdf5 0%, #f0f9ff 100%);">
          <h2 style="color: #059669;">📚 New Story Ready for Review</h2>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>👤 Writer:</strong> ${childName}</p>
            <p style="margin: 5px 0;"><strong>📖 Story:</strong> "${storyTitle}"</p>
            <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${childEmail}</p>
            <p style="margin: 5px 0;"><strong>🕐 Published:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXTAUTH_URL}/mentor/dashboard" style="background: linear-gradient(45deg, #059669, #0891b2); color: white; padding: 12px 24px; text-decoration: none; font-size: 16px; border-radius: 8px; display: inline-block;">
              📝 Review Story
            </a>
          </div>
          <p style="font-size: 14px; color: #6b7280;">A new story is ready for your expert review and feedback.</p>
        </div>
      `,
    };
    emailPromises.push(transporter.sendMail(mentorMailOptions));
  }

  try {
    const results = await Promise.all(emailPromises);
    console.log('Story published emails sent successfully');
    return results[0]; // Return child email result
  } catch (error) {
    console.error('Error sending story published emails:', error);
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

/**
 * Send achievement unlock notification to child
 * @param childEmail Child's email address
 * @param childName Child's first name
 * @param achievementName Name of the achievement
 * @param achievementDescription Description of what they accomplished
 */
export const sendAchievementUnlockedEmail = async (
  childEmail: string,
  childName: string,
  achievementName: string,
  achievementDescription: string
): Promise<nodemailer.SentMessageInfo> => {
  const transporter = createTransporter();

  const userMailOptions = {
    from: `"Mintoons Magic Team" <${process.env.EMAIL_USER}>`,
    to: childEmail,
    subject: `🏆 Achievement Unlocked: ${achievementName}!`,
    html: `
     <div style="font-family: 'Comic Sans MS', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 15px; background: linear-gradient(135deg, #fef3ff 0%, #fff7ed 100%);">
       <div style="text-align: center; padding: 20px 0;">
         <div style="background: linear-gradient(45deg, #f59e0b, #f97316, #dc2626); color: white; padding: 15px; border-radius: 15px; font-size: 24px; font-weight: bold; display: inline-block;">
           🏆 ACHIEVEMENT! 🏆
         </div>
       </div>
       
       <h2 style="color: #f59e0b; text-align: center; font-family: 'Comic Sans MS', Arial, sans-serif; font-size: 28px;">
         Congratulations, ${childName}! ⭐
       </h2>
       
       <div style="background: rgba(245, 158, 11, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; border: 3px solid #f59e0b;">
         <h3 style="color: #f59e0b; margin: 0; font-size: 24px;">
           🎉 ${achievementName} 🎉
         </h3>
         <p style="font-size: 16px; color: #374151; margin: 10px 0 0 0;">
           ${achievementDescription}
         </p>
       </div>
       
       <p style="font-size: 16px; color: #374151; line-height: 1.6; text-align: center;">
         You're becoming an amazing storyteller! Keep up the fantastic work and continue creating magical stories! ✨
       </p>
       
       <div style="text-align: center; margin: 30px 0;">
         <a href="${process.env.NEXTAUTH_URL}/progress" style="background: linear-gradient(45deg, #f59e0b, #f97316); color: white; padding: 15px 30px; text-decoration: none; font-size: 18px; border-radius: 25px; display: inline-block; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);">
           🏆 View All Achievements
         </a>
       </div>
       
       <p style="font-size: 16px; color: #374151; text-align: center;">
         We're so proud of your progress! 🌟📖<br/>
         <span style="color: #f59e0b; font-weight: bold;">The Mintoons Team</span>
       </p>
     </div>
   `,
  };

  try {
    const userInfo = await transporter.sendMail(userMailOptions);

    console.log('Achievement email sent successfully:', {
      userMessageId: userInfo.messageId,
    });

    return userInfo;
  } catch (error) {
    console.error('Error sending achievement email:', error);
    throw error;
  }
};

/**
 * Send weekly progress report to child and parents
 * @param childEmail Child's email address
 * @param childName Child's first name
 * @param storiesWritten Number of stories written this week
 * @param totalWords Total words written this week
 * @param improvementAreas Areas where the child is improving
 */
export const sendWeeklyProgressEmail = async (
  childEmail: string,
  childName: string,
  storiesWritten: number,
  totalWords: number,
  improvementAreas: string[]
): Promise<nodemailer.SentMessageInfo> => {
  const transporter = createTransporter();

  const userMailOptions = {
    from: `"Mintoons Progress Team" <${process.env.EMAIL_USER}>`,
    to: childEmail,
    subject: `📊 Your Weekly Writing Progress - ${childName}`,
    html: `
     <div style="font-family: 'Comic Sans MS', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 15px; background: linear-gradient(135deg, #f0f9ff 0%, #fef3ff 100%);">
       <div style="text-align: center; padding: 20px 0;">
         <div style="background: linear-gradient(45deg, #3b82f6, #7c3aed); color: white; padding: 15px; border-radius: 15px; font-size: 24px; font-weight: bold; display: inline-block;">
           📊 Weekly Report 📊
         </div>
       </div>
       
       <h2 style="color: #3b82f6; text-align: center; font-family: 'Comic Sans MS', Arial, sans-serif; font-size: 28px;">
         Amazing Week, ${childName}! 🌟
       </h2>
       
       <div style="background: rgba(59, 130, 246, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
         <h3 style="color: #3b82f6; margin-top: 0;">📈 Your Writing Stats This Week:</h3>
         <div style="display: flex; justify-content: space-around; text-align: center; margin: 20px 0;">
           <div style="background: white; padding: 15px; border-radius: 10px; flex: 1; margin: 0 5px;">
             <div style="font-size: 24px; font-weight: bold; color: #7c3aed;">${storiesWritten}</div>
             <div style="font-size: 14px; color: #6b7280;">Stories Written</div>
           </div>
           <div style="background: white; padding: 15px; border-radius: 10px; flex: 1; margin: 0 5px;">
             <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${totalWords}</div>
             <div style="font-size: 14px; color: #6b7280;">Words Written</div>
           </div>
         </div>
       </div>
       
       ${
         improvementAreas.length > 0
           ? `
       <div style="background: #fef3ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
         <h3 style="color: #7c3aed; margin-top: 0;">🎯 Areas Where You're Growing:</h3>
         <ul style="font-size: 16px; color: #374151; line-height: 1.8;">
           ${improvementAreas.map((area) => `<li>✨ ${area}</li>`).join('')}
         </ul>
       </div>
       `
           : ''
       }
       
       <div style="text-align: center; margin: 30px 0;">
         <a href="${process.env.NEXTAUTH_URL}/create-story" style="background: linear-gradient(45deg, #3b82f6, #7c3aed); color: white; padding: 15px 30px; text-decoration: none; font-size: 18px; border-radius: 25px; display: inline-block; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);">
           📝 Write Another Story
         </a>
       </div>
       
       <p style="font-size: 16px; color: #374151; text-align: center;">
         Keep up the fantastic work! Every story you write makes you a better storyteller! 📚✨<br/>
         <span style="color: #3b82f6; font-weight: bold;">The Mintoons Team</span>
       </p>
     </div>
   `,
  };

  try {
    const userInfo = await transporter.sendMail(userMailOptions);

    console.log('Weekly progress email sent successfully:', {
      userMessageId: userInfo.messageId,
    });

    return userInfo;
  } catch (error) {
    console.error('Error sending weekly progress email:', error);
    throw error;
  }
};

// Helper function to send generic emails
const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<nodemailer.SentMessageInfo> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Mintoons" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export { sendEmail };
