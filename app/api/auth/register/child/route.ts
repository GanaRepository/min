// app/api/auth/register/child/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import { IRegisterChild } from '@/types/auth';
import { sendChildRegistrationEmail } from '@/lib/mailer';

export async function POST(request: Request) {
  try {
    const body: IRegisterChild = await request.json();
    const {
      firstName,
      lastName,
      email,
      age,
      school,
      password,
      confirmPassword,
      agreeToTerms,
    } = body;

    // Validate inputs
    if (
      !firstName ||
      !lastName ||
      !email ||
      !age ||
      !school ||
      !password ||
      !confirmPassword
    ) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (!agreeToTerms) {
      return NextResponse.json(
        { error: 'You must agree to the terms and conditions' },
        { status: 400 }
      );
    }

    // Age validation
    const ageNumber = parseInt(age);
    if (isNaN(ageNumber) || ageNumber < 2 || ageNumber > 18) {
      return NextResponse.json(
        { error: 'Age must be between 2 and 18 years' },
        { status: 400 }
      );
    }

    // Password strength validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          error:
            'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new child user
    const newUser = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      age: ageNumber,
      school: school.trim(),
      password: hashedPassword,
      role: 'child',
      isActive: true,
    });

    // Send welcome email
    try {
      await sendChildRegistrationEmail(email, firstName);
      console.log(`Welcome email sent to ${email}`);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
    }

    // Return success response
    return NextResponse.json(
      {
        message:
          'Welcome to Mintoons! Your magical storytelling journey begins now...',
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          age: newUser.age,
          school: newUser.school,
          role: newUser.role,
        },
        autoSignIn: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Child registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register child account' },
      { status: 500 }
    );
  }
}
