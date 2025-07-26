// // app/api/admin/mentors/route.ts
// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/utils/authOptions';
// import { connectToDatabase } from '@/utils/db';
// import User from '@/models/User';
// import MentorAssignment from '@/models/MentorAssignment';
// import bcrypt from 'bcryptjs';

// export async function POST(request: Request) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || session.user.role !== 'admin') {
//       return NextResponse.json(
//         { error: 'Admin access required' },
//         { status: 403 }
//       );
//     }

//     const body = await request.json();
//     const { email, firstName, lastName, password, assignedStudents } = body;

//     await connectToDatabase();

//     // Check if mentor already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return NextResponse.json(
//         { error: 'User with this email already exists' },
//         { status: 400 }
//       );
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 12);

//     // Create mentor user
//     const mentor = await User.create({
//       email,
//       firstName,
//       lastName,
//       password: hashedPassword,
//       role: 'mentor',
//       isVerified: true,
//       createdAt: new Date(),
//     });

//     // Assign students to mentor
//     if (assignedStudents && assignedStudents.length > 0) {
//       const assignments = assignedStudents.map((studentId: string) => ({
//         mentorId: mentor._id,
//         childId: studentId,
//         assignedAt: new Date(),
//         assignedBy: session.user.id,
//       }));

//       await MentorAssignment.insertMany(assignments);
//     }

//     return NextResponse.json({
//       success: true,
//       mentor: {
//         id: mentor._id,
//         email: mentor.email,
//         firstName: mentor.firstName,
//         lastName: mentor.lastName,
//         assignedStudents: assignedStudents?.length || 0,
//       },
//     });
//   } catch (error) {
//     console.error('Error creating mentor:', error);
//     return NextResponse.json(
//       { error: 'Failed to create mentor' },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import MentorAssignment from '@/models/MentorAssignment';
import StorySession from '@/models/StorySession';
import StoryComment from '@/models/StoryComment';
import bcrypt from 'bcryptjs';

// GET - Fetch all mentors with statistics
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

    // Get all mentors with their statistics
    const mentors = await User.aggregate([
      { $match: { role: 'mentor' } },
      {
        $lookup: {
          from: 'mentorassignments',
          localField: '_id',
          foreignField: 'mentorId',
          as: 'assignments',
        },
      },
      {
        $lookup: {
          from: 'storycomments',
          localField: '_id',
          foreignField: 'authorId',
          as: 'comments',
        },
      },
      {
        $addFields: {
          assignedStudents: { $size: '$assignments' },
          activeAssignments: {
            $size: {
              $filter: {
                input: '$assignments',
                cond: { $ne: ['$$this.isActive', false] },
              },
            },
          },
          totalComments: { $size: '$comments' },
        },
      },
      {
        $project: {
          password: 0,
          assignments: 0,
          comments: 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    // Get total stories for each mentor (stories by their assigned students)
    const mentorsWithStories = await Promise.all(
      mentors.map(async (mentor) => {
        const assignments = await MentorAssignment.find({
          mentorId: mentor._id,
        }).select('childId');

        const studentIds = assignments.map((a) => a.childId);
        const totalStories = await StorySession.countDocuments({
          childId: { $in: studentIds },
        });

        return {
          ...mentor,
          totalStories,
        };
      })
    );

    return NextResponse.json({
      success: true,
      mentors: mentorsWithStories,
    });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mentors' },
      { status: 500 }
    );
  }
}

// POST - Create new mentor (same as before but enhanced)
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

    if (!email || !firstName || !lastName || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

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
      createdAt: new Date(),
    });

    // Assign students to mentor if provided
    if (assignedStudents && assignedStudents.length > 0) {
      const assignments = assignedStudents.map((studentId: string) => ({
        mentorId: mentor._id,
        childId: studentId,
        assignedAt: new Date(),
        assignedBy: session.user.id,
        isActive: true,
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
        assignedStudents: assignedStudents?.length || 0,
      },
      message: 'Mentor created successfully',
    });
  } catch (error) {
    console.error('Error creating mentor:', error);
    return NextResponse.json(
      { error: 'Failed to create mentor' },
      { status: 500 }
    );
  }
}
