// app/api/admin/users/route.ts 
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// GET all users - UPDATED to include admin users
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    await connectToDatabase();

    // UPDATED: Include ALL roles (child, mentor, admin)
    let query: any = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    console.log('Users API Query:', query); // Debug log

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    console.log('Users found:', users.length); // Debug log
    console.log('Total users count:', totalUsers); // Debug log

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const {
      firstName,
      lastName,
      email,
      password,
      role,
      parentEmail,
      age,
      school,
    } = await request.json();

    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (role === 'child' && (!age || !school)) {
      return NextResponse.json(
        { error: 'Age and school are required for children' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Helper function to format names properly (Title Case)
    const formatName = (name: string) => {
      return name
        .trim()
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const userData: any = {
      firstName: formatName(firstName),
      lastName: formatName(lastName),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      isActive: true,
      isVerified: true,
    };

    // Add role-specific fields
    if (role === 'child') {
      userData.age = age;
      userData.school = formatName(school);
      userData.parentEmail = parentEmail;
      userData.subscriptionTier = 'FREE';
      userData.subscriptionStatus = 'active';
      userData.totalStoriesCreated = 0;
      userData.storiesCreatedThisMonth = 0;
      userData.totalWordsWritten = 0;
      userData.writingStreak = 0;
      userData.totalTimeWriting = 0;
      userData.assessmentUploadsThisMonth = 0;
      userData.competitionEntriesThisMonth = 0;
      userData.assessmentAttempts = {};
      userData.preferences = {
        theme: 'light',
        language: 'en',
        emailNotifications: true,
        soundEffects: true,
        autoSave: true,
      };
      userData.lastMonthlyReset = new Date();
      userData.purchaseHistory = [];
    } else if (role === 'admin') {
      // Admin-specific fields
      userData.adminLevel = 'super';
      userData.canCreateMentors = true;
      userData.canAssignStudentsToMentors = true;
      userData.canViewAllAnalytics = true;
      userData.canManageCompetitions = true;
      userData.canProcessPayments = true;
      userData.canModerateContent = true;
      userData.platformStats = {
        totalStudentsManaged: 0,
        totalMentorsManaged: 0,
        totalRevenueGenerated: 0,
        totalCompetitionsRun: 0,
        lastAnalyticsView: new Date(),
      };
      userData.adminActivity = {
        mentorsCreated: 0,
        studentsAssigned: 0,
        competitionsManaged: 0,
        reportsGenerated: 0,
        lastLogin: new Date(),
      };
      userData.preferences = {
        theme: 'dark',
        language: 'en',
        emailNotifications: true,
        dashboardLayout: 'advanced',
        showDetailedAnalytics: true,
        autoRefreshStats: true,
        defaultView: 'analytics',
      };
    }

    const user = new User(userData);
    const savedUser = await user.save();

    // Use select to exclude password field
    const userWithoutPassword = await User.findById(savedUser._id)
      .select('-password')
      .lean();

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: `${role} created successfully`,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
