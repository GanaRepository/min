// app/api/admin/mentors/route.ts - Mentors Management
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import MentorAssignment from '@/models/MentorAssignment';
import StorySession from '@/models/StorySession';
import StoryComment from '@/models/StoryComment';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// GET all mentors
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const search = searchParams.get('search');

    await connectToDatabase();

    let query: any = { role: 'mentor' };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [mentors, totalMentors] = await Promise.all([
      User.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'mentorassignments',
            let: { mentorId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$mentorId', '$$mentorId'] },
                      { $eq: ['$isActive', true] },
                    ],
                  },
                },
              },
            ],
            as: 'activeAssignments',
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
            assignedStudents: { $size: '$activeAssignments' },
            totalComments: { $size: '$comments' },
          },
        },
        {
          $project: {
            password: 0,
            activeAssignments: 0,
            comments: 0,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ]),
      User.countDocuments(query),
    ]);

    // Get total stories for each mentor (stories by their assigned students)
    const mentorsWithStats = await Promise.all(
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
      mentors: mentorsWithStats,
      pagination: {
        page,
        limit,
        total: totalMentors,
        pages: Math.ceil(totalMentors / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mentors' },
      { status: 500 }
    );
  }
}

// POST - Create new mentor
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { firstName, lastName, email, password } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create mentor
    const mentor = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'mentor',
      isActive: true,
      // isVerified: true, (removed)
      preferences: {
        theme: 'light',
        language: 'en',
        emailNotifications: true,
        soundEffects: false,
        autoSave: true,
      },
    });

    await mentor.save();

    return NextResponse.json({
      success: true,
      mentor: {
        _id: mentor._id,
        firstName: mentor.firstName,
        lastName: mentor.lastName,
        email: mentor.email,
        role: mentor.role,
        createdAt: mentor.createdAt,
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
