// app/api/competitions/submit/route.ts - UPDATED FOR SIMPLIFIED COMPETITION ENTRIES (COMPLETE)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import { competitionManager } from '@/lib/competition-manager';
import StorySession from '@/models/StorySession';
import User from '@/models/User';
import mongoose from 'mongoose';
import Competition from '@/models/Competition';
import { UsageManager } from '@/lib/usage-manager'; // ADD: Import simplified usage manager

export const dynamic = 'force-dynamic';

// Type definitions for better type safety
interface StoryDocument {
  _id: mongoose.Types.ObjectId;
  title: string;
  status: string;
  childId: mongoose.Types.ObjectId;
  totalWords: number;
  competitionEligible: boolean;
  competitionEntries?: Array<{
    competitionId: mongoose.Types.ObjectId;
    submittedAt: Date;
    rank?: number;
    score?: number;
  }>;
  isUploadedForAssessment?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CompetitionDocument {
  _id: mongoose.Types.ObjectId;
  month: string;
  year: number;
  phase: 'submission' | 'judging' | 'results';
  isActive: boolean;
  submissionEnd?: Date;
  totalSubmissions?: number;
  totalParticipants?: number;
}

interface UserDocument {
  _id: mongoose.Types.ObjectId;
  competitionEntriesThisMonth?: number;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { storyId } = body;

    if (!storyId || !mongoose.Types.ObjectId.isValid(storyId)) {
      return NextResponse.json(
        { error: 'Valid story ID is required' },
        { status: 400 }
      );
    }

    console.log('🏆 Processing competition submission:', storyId);

    await connectToDatabase();

    // ADD: Check if user can enter competition using simplified system
    const canEnter = await UsageManager.canEnterCompetition(session.user.id);
    if (!canEnter.allowed) {
      console.log(`❌ Competition entry denied: ${canEnter.reason}`);
      return NextResponse.json(
        {
          error: canEnter.reason,
          usage: canEnter.currentUsage,
          limits: canEnter.limits
        },
        { status: 403 }
      );
    }

    // Get current competition
    const currentCompetition = await competitionManager.getCurrentCompetition() as CompetitionDocument | null;

    if (!currentCompetition) {
      return NextResponse.json(
        { error: 'No active competition found' },
        { status: 404 }
      );
    }

    if (currentCompetition.phase !== 'submission') {
      return NextResponse.json(
        { error: 'Competition submission period has ended' },
        { status: 400 }
      );
    }

    // Check if submission deadline has passed
    if (currentCompetition.submissionEnd && new Date() > currentCompetition.submissionEnd) {
      return NextResponse.json(
        { error: 'Competition submission deadline has passed' },
        { status: 400 }
      );
    }

    // Get the story and verify ownership
    const story = await StorySession.findOne({
      _id: storyId,
      childId: session.user.id
    }).lean() as StoryDocument | null;

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found or access denied' },
        { status: 404 }
      );
    }

    // Validate story is eligible for competition
    if (!story.competitionEligible) {
      return NextResponse.json(
        { error: 'This story is not eligible for competition submission' },
        { status: 400 }
      );
    }

    // Check if story meets minimum requirements
    if (story.status !== 'completed') {
      return NextResponse.json(
        { error: 'Only completed stories can be submitted to competitions' },
        { status: 400 }
      );
    }

    if (story.totalWords < 350) {
      return NextResponse.json(
        { error: 'Story must be at least 350 words to be eligible for competition' },
        { status: 400 }
      );
    }

    if (story.totalWords > 2000) {
      return NextResponse.json(
        { error: 'Story exceeds maximum word limit of 2000 words for competition' },
        { status: 400 }
      );
    }

    // Check if story was uploaded for assessment (not allowed in competition)
    if (story.isUploadedForAssessment) {
      return NextResponse.json(
        { error: 'Stories uploaded for assessment cannot be submitted to competitions' },
        { status: 400 }
      );
    }

    // Check if story is already submitted to this competition
    const existingEntry = story.competitionEntries?.find(
      entry => entry.competitionId.toString() === currentCompetition._id.toString()
    );

    if (existingEntry) {
      return NextResponse.json(
        { error: 'This story has already been submitted to the current competition' },
        { status: 400 }
      );
    }

    // KEEP: Legacy check but it's now redundant since UsageManager handles this
    const user = await User.findById(session.user.id).lean() as UserDocument | null;
    const userEntriesThisMonth = user?.competitionEntriesThisMonth || 0;
    const monthlyLimit = 3; // Always 3 per month

    if (userEntriesThisMonth >= monthlyLimit) {
      return NextResponse.json(
        { error: `You have reached the monthly limit of ${monthlyLimit} competition entries` },
        { status: 400 }
      );
    }

    console.log('✅ User can submit to competition, proceeding...');

    // All validation passed - submit to competition
    const submissionData = {
      competitionId: currentCompetition._id,
      submittedAt: new Date(),
      rank: null,
      score: null
    };

    // Update story with competition entry
    await StorySession.findByIdAndUpdate(storyId, {
      $push: {
        competitionEntries: submissionData
      },
      $set: {
        updatedAt: new Date()
      }
    });

    // Update user's monthly competition count
    await User.findByIdAndUpdate(session.user.id, {
      $inc: {
        competitionEntriesThisMonth: 1
      }
    });

    // Update competition stats
    await Competition.findByIdAndUpdate(currentCompetition._id, {
      $inc: { totalSubmissions: 1 }
    });

    // ADD: Increment competition entry in simplified system (logs only)
    await UsageManager.incrementCompetitionEntry(session.user.id);

    console.log(`✅ Story ${storyId} submitted to competition successfully`);

    return NextResponse.json({
      success: true,
      message: 'Story submitted to competition successfully',
      submission: {
        storyId: storyId,
        storyTitle: story.title,
        competitionId: currentCompetition._id.toString(),
        competitionName: `${currentCompetition.month} ${currentCompetition.year}`,
        submittedAt: submissionData.submittedAt,
        userEntriesUsed: userEntriesThisMonth + 1,
        userEntriesLimit: monthlyLimit
      },
      // ADD: Include updated usage information
      usage: {
        competitionEntries: canEnter.currentUsage.competitionEntries + 1,
        limit: canEnter.limits.competitionEntries,
        remaining: canEnter.limits.competitionEntries - (canEnter.currentUsage.competitionEntries + 1)
      }
    });

  } catch (error) {
    console.error('❌ Error submitting story to competition:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit story to competition',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check submission eligibility
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get('storyId');

    if (!storyId || !mongoose.Types.ObjectId.isValid(storyId)) {
      return NextResponse.json(
        { error: 'Valid story ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // ADD: Check competition eligibility using simplified system
    const canEnter = await UsageManager.canEnterCompetition(session.user.id);

    // Get current competition
    const currentCompetition = await competitionManager.getCurrentCompetition() as CompetitionDocument | null;

    if (!currentCompetition) {
      return NextResponse.json({
        eligible: false,
        reason: 'No active competition found',
        competition: null,
        // ADD: Include usage info even when no competition
        usage: canEnter.allowed ? {
          competitionEntries: canEnter.currentUsage.competitionEntries,
          limit: canEnter.limits.competitionEntries,
          remaining: canEnter.limits.competitionEntries - canEnter.currentUsage.competitionEntries
        } : null
      });
    }

    // Get the story
    const story = await StorySession.findOne({
      _id: storyId,
      childId: session.user.id
    }).lean() as StoryDocument | null;

    if (!story) {
      return NextResponse.json({
        eligible: false,
        reason: 'Story not found or access denied',
        competition: null,
        usage: canEnter.allowed ? {
          competitionEntries: canEnter.currentUsage.competitionEntries,
          limit: canEnter.limits.competitionEntries,
          remaining: canEnter.limits.competitionEntries - canEnter.currentUsage.competitionEntries
        } : null
      });
    }

    // Check all eligibility criteria
    const checks = {
      competitionActive: currentCompetition.phase === 'submission',
      storyEligible: story.competitionEligible,
      storyCompleted: story.status === 'completed',
      wordCountValid: story.totalWords >= 350 && story.totalWords <= 2000,
      notAssessmentStory: !story.isUploadedForAssessment,
      notAlreadySubmitted: !story.competitionEntries?.some(
        entry => entry.competitionId.toString() === currentCompetition._id.toString()
      ),
      // ADD: Check using simplified system
      hasEntriesLeft: canEnter.allowed
    };

    // Get user's current entries (keep for backward compatibility)
    const user = await User.findById(session.user.id).lean() as UserDocument | null;
    const userEntriesThisMonth = user?.competitionEntriesThisMonth || 0;
    const monthlyLimit = 3;

    const eligible = Object.values(checks).every(Boolean);

    let reason = '';
    if (!checks.competitionActive) reason = 'Competition submission period has ended';
    else if (!checks.storyEligible) reason = 'Story is not marked as competition eligible';
    else if (!checks.storyCompleted) reason = 'Only completed stories can be submitted';
    else if (!checks.wordCountValid) reason = 'Story must be between 350-2000 words';
    else if (!checks.notAssessmentStory) reason = 'Assessment stories cannot be submitted';
    else if (!checks.notAlreadySubmitted) reason = 'Story already submitted to this competition';
    else if (!checks.hasEntriesLeft) reason = canEnter.reason || 'Competition entry limit reached';

    return NextResponse.json({
      eligible,
      reason: eligible ? 'Story is eligible for submission' : reason,
      competition: {
        _id: currentCompetition._id.toString(),
        month: currentCompetition.month,
        year: currentCompetition.year,
        phase: currentCompetition.phase,
        submissionEnd: currentCompetition.submissionEnd?.toISOString()
      },
      story: {
        _id: story._id.toString(),
        title: story.title,
        status: story.status,
        totalWords: story.totalWords,
        competitionEligible: story.competitionEligible
      },
      userStats: {
        entriesUsed: userEntriesThisMonth,
        entriesLimit: monthlyLimit,
        entriesLeft: monthlyLimit - userEntriesThisMonth
      },
      // ADD: Include simplified usage info
      usage: {
        competitionEntries: canEnter.currentUsage.competitionEntries,
        limit: canEnter.limits.competitionEntries,
        remaining: canEnter.limits.competitionEntries - canEnter.currentUsage.competitionEntries
      },
      checks
    });

  } catch (error) {
    console.error('❌ Error checking competition eligibility:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check competition eligibility',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}