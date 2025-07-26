// app/api/admin/mentors/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import MentorAssignment from '@/models/MentorAssignment';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, firstName, lastName, password, assignedStudents } = body;

    await connectToDatabase();

    // Check if mentor already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create mentor user
    const mentor = await User.create({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      role: 'mentor',
      isVerified: true,
      createdAt: new Date()
    });

    // Assign students to mentor
    if (assignedStudents && assignedStudents.length > 0) {
      const assignments = assignedStudents.map((studentId: string) => ({
        mentorId: mentor._id,
        childId: studentId,
        assignedAt: new Date(),
        assignedBy: session.user.id
      }));

      await MentorAssignment.insertMany(assignments);
    }

    return NextResponse.json({
      success: true,
      mentor: {
        id: mentor._id,
        email: mentor.email,
        firstName: mentor.firstName,
        lastName: mentor.lastName,
        assignedStudents: assignedStudents?.length || 0
      }
    });

  } catch (error) {
    console.error('Error creating mentor:', error);
    return NextResponse.json(
      { error: 'Failed to create mentor' },
      { status: 500 }
    );
  }
}