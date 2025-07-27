export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import MentorAssignment from '@/models/MentorAssignment';
import StorySession from '@/models/StorySession';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'mentor') {
      return NextResponse.json(
        { error: 'Mentor access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    await connectToDatabase();

    const mentorId = session.user.id;

    // Get assignments with student details
    let query = MentorAssignment.find({ 
      mentorId,
      isActive: { $ne: false }
    }).populate('childId', 'firstName lastName email createdAt lastLoginAt');

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const assignments = await query.sort({ assignedAt: -1 });

    // Get story counts for each student
    const studentsWithStats = await Promise.all(
      assignments.map(async (assignment) => {
        const [totalStories, completedStories, activeStories] = await Promise.all([
          StorySession.countDocuments({ childId: assignment.childId._id }),
          StorySession.countDocuments({ 
            childId: assignment.childId._id,
            status: 'completed'
          }),
          StorySession.countDocuments({ 
            childId: assignment.childId._id,
            status: 'active'
          }),
        ]);

        return {
          _id: assignment.childId._id,
          firstName: assignment.childId.firstName,
          lastName: assignment.childId.lastName,
          email: assignment.childId.email,
          totalStories,
          completedStories,
          activeStories,
          assignedAt: assignment.assignedAt,
          lastActiveAt: assignment.childId.lastLoginAt || assignment.childId.createdAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      students: studentsWithStats,
    });
  } catch (error) {
    console.error('Error fetching mentor students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}