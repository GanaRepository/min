// app/api/test/create-past-competitions/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import Competition from '@/models/Competition';
import User from '@/models/User';

export async function POST() {
  try {
    await connectToDatabase();

    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      return NextResponse.json(
        { error: 'No admin user found' },
        { status: 404 }
      );
    }

    // Create test past competitions
    const pastCompetitions = [
      {
        month: 'July',
        year: 2025,
        phase: 'results',
        isActive: false,
        totalSubmissions: 25,
        totalParticipants: 18,
        winners: [
          {
            position: 1,
            childId: adminUser._id,
            childName: 'Alice Johnson',
            storyId: adminUser._id,
            title: 'The Secret Garden Adventure',
            score: 96,
            aiJudgingNotes: 'Excellent creativity and grammar',
          },
          {
            position: 2,
            childId: adminUser._id,
            childName: 'Bob Smith',
            storyId: adminUser._id,
            title: 'Dragon Quest',
            score: 89,
            aiJudgingNotes: 'Great storytelling',
          },
          {
            position: 3,
            childId: adminUser._id,
            childName: 'Charlie Brown',
            storyId: adminUser._id,
            title: 'Space Explorer',
            score: 84,
            aiJudgingNotes: 'Good plot development',
          },
        ],
        submissionStart: new Date('2025-07-01'),
        submissionEnd: new Date('2025-07-25'),
        judgingStart: new Date('2025-07-26'),
        judgingEnd: new Date('2025-07-30'),
        resultsDate: new Date('2025-07-31'),
        createdBy: adminUser._id,
        createdAt: new Date('2025-07-01'),
        updatedAt: new Date('2025-07-31'),
      },
      {
        month: 'June',
        year: 2025,
        phase: 'results',
        isActive: false,
        totalSubmissions: 32,
        totalParticipants: 24,
        winners: [
          {
            position: 1,
            childId: adminUser._id,
            childName: 'Emma Wilson',
            storyId: adminUser._id,
            title: 'The Magical Forest',
            score: 94,
            aiJudgingNotes: 'Outstanding creativity',
          },
          {
            position: 2,
            childId: adminUser._id,
            childName: 'David Lee',
            storyId: adminUser._id,
            title: 'Robot Friends',
            score: 87,
            aiJudgingNotes: 'Great character development',
          },
          {
            position: 3,
            childId: adminUser._id,
            childName: 'Sofia Garcia',
            storyId: adminUser._id,
            title: 'Ocean Mystery',
            score: 82,
            aiJudgingNotes: 'Engaging plot',
          },
        ],
        submissionStart: new Date('2025-06-01'),
        submissionEnd: new Date('2025-06-25'),
        judgingStart: new Date('2025-06-26'),
        judgingEnd: new Date('2025-06-30'),
        resultsDate: new Date('2025-06-30'),
        createdBy: adminUser._id,
        createdAt: new Date('2025-06-01'),
        updatedAt: new Date('2025-06-30'),
      },
    ];

    await Competition.insertMany(pastCompetitions);

    return NextResponse.json({
      success: true,
      message: 'Test past competitions created',
      count: pastCompetitions.length,
    });
  } catch (error) {
    console.error('Error creating test competitions:', error);
    return NextResponse.json(
      { error: 'Failed to create test competitions' },
      { status: 500 }
    );
  }
}
