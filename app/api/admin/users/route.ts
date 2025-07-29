// export const dynamic = 'force-dynamic';

// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/utils/authOptions';
// import { connectToDatabase } from '@/utils/db';
// import User from '@/models/User';
// import StorySession from '@/models/StorySession';

// export async function GET() {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || session.user.role !== 'admin') {
//       return NextResponse.json(
//         { error: 'Admin access required' },
//         { status: 403 }
//       );
//     }

//     await connectToDatabase();

//     // Get REAL users with subscription data
//     const users = await User.find({ role: 'child' })
//       .select(
//         'firstName lastName email subscriptionTier subscriptionStartDate subscriptionEndDate createdAt'
//       )
//       .sort({ createdAt: -1 });

//     // Get mentor assignments for all children
//     const assignments = await MentorAssignment.find({ isActive: true })
//       .populate('mentorId', 'firstName lastName email');

//     // Get REAL usage stats for each user
//     const usersWithStats = await Promise.all(
//       users.map(async (user) => {
//         const [totalStories, apiCallsData] = await Promise.all([
//           StorySession.countDocuments({ childId: user._id }),
//           StorySession.aggregate([
//             { $match: { childId: user._id } },
//             { $group: { _id: null, total: { $sum: '$apiCallsUsed' } } },
//           ]),
//         ]);



//         return {
//           _id: user._id,
//           firstName: user.firstName,
//           lastName: user.lastName,
//           email: user.email,
//           subscriptionTier: user.subscriptionTier || 'free',
//           subscriptionStartDate: user.subscriptionStartDate,
//           subscriptionEndDate: user.subscriptionEndDate,
//           createdAt: user.createdAt,
//           totalStories,
//           apiCallsUsed: apiCallsData[0]?.total || 0,
//           assignedMentor,
//         };
//       })
//     );

//     return NextResponse.json({
//       success: true,
//       users: usersWithStats,
//     });
//   } catch (error) {
//     console.error('Error fetching subscription users:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch subscription users' },
//       { status: 500 }
//     );
//   }
// }

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import StorySession from '@/models/StorySession';
import MentorAssignment from '@/models/MentorAssignment';

export async function GET(request: Request) {
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
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    await connectToDatabase();

    // Build query
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



    // Get users with pagination
    const users = await User.find(query)
      .select('firstName lastName email role createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get mentor assignments for all children
    const assignments = await MentorAssignment.find({ isActive: true })
      .populate('mentorId', 'firstName lastName email');

    // Get usage stats for each user
    // Normalize subscriptionTier for all users before returning
    const usersWithStats = await Promise.all(
      users.map(async (user: any) => {
        const [totalStories, completedStories, activeStories] = await Promise.all([
          StorySession.countDocuments({ childId: user._id }),
          StorySession.countDocuments({ childId: user._id, status: 'completed' }),
          StorySession.countDocuments({ childId: user._id, status: 'active' }),
        ]);

        // Find assigned mentor for this user
        const assignment = assignments.find((a: any) => a.childId.toString() === user._id.toString());
        let assignedMentor = null;
        if (assignment && assignment.mentorId) {
          assignedMentor = {
            _id: assignment.mentorId._id,
            firstName: assignment.mentorId.firstName,
            lastName: assignment.mentorId.lastName,
            email: assignment.mentorId.email,
          };
        }

        let tier = (user.subscriptionTier || '').trim().toUpperCase();
        if (!["FREE", "BASIC", "PREMIUM"].includes(tier)) tier = "FREE";
        return {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          subscriptionTier: tier,
          totalStories,
          completedStories,
          activeStories,
          assignedMentor,
        };
      })
    );

    // Get total count for pagination
    const totalUsers = await User.countDocuments(query);

    return NextResponse.json({
      success: true,
      users: usersWithStats,
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