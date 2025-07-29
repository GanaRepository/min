
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import MentorAssignment from '@/models/MentorAssignment';
import User from '@/models/User';
import StorySession from '@/models/StorySession';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'mentor') {
      return NextResponse.json({ success: false, error: 'Mentor access required' }, { status: 403 });
    }
    await connectToDatabase();
    const mentorId = session.user.id;
    const studentId = params.id;
    // Check assignment
    const assignment = await MentorAssignment.findOne({ mentorId, childId: studentId, isActive: { $ne: false } });
    if (!assignment) {
      return NextResponse.json({ success: false, error: 'Student not assigned to this mentor' }, { status: 404 });
    }
    // Get student
    const student = await User.findById(studentId);
    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }
    // Get stories
    const stories = await StorySession.find({ childId: studentId })
      .sort({ updatedAt: -1 })
      .select('_id title status updatedAt totalWords');
    // Stats
    const totalStories = stories.length;
    const completedStories = stories.filter((s: any) => s.status === 'completed').length;
    const activeStories = stories.filter((s: any) => s.status === 'active').length;
    return NextResponse.json({
      success: true,
      student: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        createdAt: student.createdAt,
        lastActiveAt: student.lastLoginAt || student.createdAt,
        totalStories,
        completedStories,
        activeStories,
        stories: stories.map((s: any) => ({
          _id: s._id,
          title: s.title,
          status: s.status,
          updatedAt: s.updatedAt,
          totalWords: s.totalWords || 0,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching mentor student profile:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch student' }, { status: 500 });
  }
}
