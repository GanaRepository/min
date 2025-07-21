// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import Contact from '@/models/Contact';
import { sendContactFormConfirmationEmail } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await req.formData();
    const name = formData.get('name') as string | null;
    const email = formData.get('email') as string | null;
    const phone = formData.get('phone') as string | null;
    const age = formData.get('age') as string | null;
    const school = formData.get('school') as string | null;
    const message = formData.get('message') as string | null;

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { success: false, message: 'All required fields must be filled.' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Validate phone number
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid phone number.' },
        { status: 400 }
      );
    }

    // Create contact entry
    const contact = await Contact.create({
      name,
      email,
      phone,
      age: age || '',
      school: school || '',
      message,
    });

    // Send confirmation email to the user
    try {
      await sendContactFormConfirmationEmail(email, name);
      console.log('Contact form confirmation email sent successfully');
    } catch (emailError) {
      console.error('Error sending contact form email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully.',
      contact,
    });
  } catch (error) {
    console.error('Error in contact form submission:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send message. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
