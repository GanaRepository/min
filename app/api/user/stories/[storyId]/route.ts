// app/api/user/stories/[storyId]/route.ts - COMPLETELY FIXED ALL TYPESCRIPT ERRORS
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import PublishedStory from '@/models/PublishedStory';
import StoryComment from '@/models/StoryComment';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// Type definitions to fix all FlattenMaps errors
interface StoryDocument {
  _id: mongoose.Types.ObjectId;
  title: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  totalWords: number;
  childWords: number;
  currentTurn: number;
  maxApiCalls: number;
  apiCallsUsed: number;
  aiOpening?: string;
  storyNumber: number;
  pausedAt?: Date;
  resumedAt?: Date;
  publicationFee?: number;
  isUploadedForAssessment: boolean;
  assessmentAttempts: number;
  competitionEligible: boolean;
  competitionEntries?: Array<{
    competitionId: mongoose.Types.ObjectId;
    submittedAt: Date;
    rank?: number;
    score?: number;
  }>;
  elements?: Record<string, any>;

  // Legacy fields for backward compatibility
  plagiarismScore?: number;
  aiDetectionScore?: number;
  integrityStatus?: string;

  assessment?: {
    overallScore: number;
    grammarScore: number;
    creativityScore: number;
    vocabularyScore: number;
    structureScore: number;
    characterDevelopmentScore: number;
    plotDevelopmentScore: number;
    themeScore?: number;
    dialogueScore?: number;
    descriptiveScore?: number;
    pacingScore?: number;
    readingLevel: string;
    feedback: string;
    strengths: string[];
    improvements: string[];
    integrityAnalysis?: {
      plagiarismCheck?: {
        originalityScore: number;
        riskLevel: string;
      };
      aiDetection?: {
        aiLikelihood: string;
        confidenceLevel: number;
      };
      overallStatus?: string;
    };
    integrityStatus: {
      status: 'PASS' | 'WARNING' | 'FAIL';
      message: string;
    };
  };
}

interface TurnDocument {
  _id: mongoose.Types.ObjectId;
  turnNumber: number;
  childInput: string;
  aiResponse: string;
  wordCount: number;
  createdAt: Date;
}

interface PublishedStoryDocument {
  _id: mongoose.Types.ObjectId;
  publishedAt: Date;
}

interface CommentDocument {
  _id: mongoose.Types.ObjectId;
  content?: string;
  comment?: string;
  createdAt: Date;
  isPublic?: boolean;
  category?: string;
  commentType?: string;
  authorId?: {
    _id: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export async function GET(
  request: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const { storyId } = params;

    if (!storyId || !mongoose.Types.ObjectId.isValid(storyId)) {
      return NextResponse.json({ error: 'Invalid story ID' }, { status: 400 });
    }

    console.log('📖 Fetching story details for:', storyId);

    await connectToDatabase();

    // Get the story and verify ownership - FIXED WITH PROPER TYPING
    const story = (await StorySession.findOne({
      _id: storyId,
      childId: session.user.id,
    }).lean()) as StoryDocument | null;

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found or access denied' },
        { status: 404 }
      );
    }

    console.log('✅ Story found:', story.title);

    // Get all turns for this story (for content)
    const turns = (await Turn.find({ sessionId: storyId })
      .sort({ turnNumber: 1 })
      .lean()) as unknown as TurnDocument[];

    console.log(`� Found ${turns.length} turns`);

    // Build complete story content
    let fullContent = '';
    if (story.aiOpening) {
      fullContent += story.aiOpening + '\n\n';
    }

    turns.forEach((turn) => {
      if (turn.childInput) {
        fullContent += `**Turn ${turn.turnNumber} - Your Writing:**\n${turn.childInput}\n\n`;
      }
      if (turn.aiResponse) {
        fullContent += `**AI Response:**\n${turn.aiResponse}\n\n`;
      }
    });

    // Check if story is published
    const publishedStory = (await PublishedStory.findOne({
      sessionId: storyId,
    }).lean()) as PublishedStoryDocument | null;
    const isPublished = !!publishedStory;

    // Get comments (from mentors/admin)
    const comments = (await StoryComment.find({ storyId })
      .populate('authorId', 'firstName lastName role')
      .sort({ createdAt: -1 })
      .lean()) as unknown as CommentDocument[];

    console.log(`💬 Found ${comments.length} comments`);

    // Determine story type
    let storyType: 'freestyle' | 'uploaded' | 'competition' = 'freestyle';
    if (story.isUploadedForAssessment) {
      storyType = 'uploaded';
    } else if (
      story.competitionEntries &&
      story.competitionEntries.length > 0
    ) {
      storyType = 'competition';
    }

    // Get competition info if exists
    const latestCompetitionEntry =
      story.competitionEntries && story.competitionEntries.length > 0
        ? story.competitionEntries[story.competitionEntries.length - 1]
        : null;

    // FIXED: Format comprehensive story response with ALL required properties
    const formattedStory = {
      _id: story._id.toString(),
      title: story.title || '',
      status: story.status || 'active',
      storyType,
      createdAt: story.createdAt
        ? new Date(story.createdAt).toISOString()
        : new Date().toISOString(),
      updatedAt: story.updatedAt
        ? new Date(story.updatedAt).toISOString()
        : new Date().toISOString(),
      completedAt: story.completedAt
        ? new Date(story.completedAt).toISOString()
        : undefined,

      // Word counts and progress
      totalWords: story.totalWords || 0,
      childWords: story.childWords || 0,
      currentTurn: story.currentTurn || 1,
      maxTurns: story.maxApiCalls || 7,
      apiCallsUsed: story.apiCallsUsed || 0,

      // FIXED: All the missing properties that were causing errors
      aiOpening: story.aiOpening || '',
      storyNumber: story.storyNumber || 0,
      pausedAt: story.pausedAt
        ? new Date(story.pausedAt).toISOString()
        : undefined,
      resumedAt: story.resumedAt
        ? new Date(story.resumedAt).toISOString()
        : undefined,

      // Content
      content: fullContent.trim(),
      turns: turns.map((turn) => ({
        turnNumber: turn.turnNumber || 1,
        childInput: turn.childInput || '',
        aiResponse: turn.aiResponse || '',
        wordCount: turn.wordCount || 0,
        timestamp: turn.createdAt
          ? new Date(turn.createdAt).toISOString()
          : new Date().toISOString(),
      })),

      // Publication status
      isPublished,
      publishedAt: publishedStory?.publishedAt
        ? new Date(publishedStory.publishedAt).toISOString()
        : undefined,
      publicationDate: publishedStory?.publishedAt
        ? new Date(publishedStory.publishedAt).toISOString()
        : undefined,
      publicationFee: story.publicationFee || undefined,

      // Assessment data - FIXED with proper null checking and correct property mapping
      isUploadedForAssessment: story.isUploadedForAssessment || false,
      assessmentAttempts: story.assessmentAttempts || 0,
      assessment: story.assessment
        ? {
            // ✅ PRESERVE THE ENTIRE 13-FACTOR STRUCTURE (use type assertion for new fields)
            coreLanguageSkills:
              (story.assessment as any).coreLanguageSkills || {},
            storytellingSkills:
              (story.assessment as any).storytellingSkills || {},
            creativeExpressiveSkills:
              (story.assessment as any).creativeExpressiveSkills || {},
            authenticityGrowth:
              (story.assessment as any).authenticityGrowth || {},

            // Metadata from new assessment system
            assessmentVersion: (story.assessment as any).assessmentVersion,
            assessmentDate: (story.assessment as any).assessmentDate,
            assessmentType: (story.assessment as any).assessmentType,
            userAge: (story.assessment as any).userAge,
            wordCount: (story.assessment as any).wordCount,
            userContributionCount: (story.assessment as any)
              .userContributionCount,

            // Legacy compatibility fields (for other parts of the system)
            overallScore: story.assessment.overallScore || 0,
            grammarScore: story.assessment.grammarScore || 0,
            creativityScore: story.assessment.creativityScore || 0,
            vocabularyScore: story.assessment.vocabularyScore || 0,
            structureScore: story.assessment.structureScore || 0,
            characterDevelopmentScore:
              story.assessment.characterDevelopmentScore || 0,
            plotDevelopmentScore: story.assessment.plotDevelopmentScore || 0,
            themeScore: story.assessment.themeScore || 0,
            dialogueScore: story.assessment.dialogueScore || 0,
            descriptiveScore: story.assessment.descriptiveScore || 0,
            pacingScore: story.assessment.pacingScore || 0,

            // Reading level and general feedback
            readingLevel: story.assessment.readingLevel || 'Unknown',
            feedback: story.assessment.feedback || '',
            strengths: story.assessment.strengths || [],
            improvements: story.assessment.improvements || [],

            // Integrity analysis
            integrityRisk:
              story.assessment.integrityAnalysis?.overallStatus === 'critical'
                ? 'critical'
                : story.assessment.integrityAnalysis?.overallStatus ===
                    'warning'
                  ? 'high'
                  : story.assessment.integrityAnalysis?.overallStatus ===
                      'caution'
                    ? 'medium'
                    : 'low',
            integrityAnalysis: story.assessment.integrityAnalysis || null,
          }
        : null,

      // Competition data - FIXED
      competitionEligible: story.competitionEligible || false,
      competitionEntries: story.competitionEntries || [],
      latestCompetitionEntry,
      submittedToCompetition: !!latestCompetitionEntry,

      // Story elements - FIXED
      elements: story.elements || {},

      // Comments from mentors/admin - FIXED with proper property names
      comments: comments.map((comment) => ({
        _id: comment._id.toString(),
        content: comment.content || comment.comment || '', // Handle both property names
        author: comment.authorId
          ? {
              _id: comment.authorId._id ? comment.authorId._id.toString() : '',
              name: `${comment.authorId.firstName || ''} ${comment.authorId.lastName || ''}`.trim(),
              role: comment.authorId.role || 'mentor',
            }
          : null,
        createdAt: comment.createdAt
          ? new Date(comment.createdAt).toISOString()
          : new Date().toISOString(),
        isPublic: comment.isPublic !== undefined ? comment.isPublic : true,
        category: comment.category || comment.commentType || 'general',
      })),
    };

    console.log('📊 Story details compiled successfully');

    return NextResponse.json({
      success: true,
      story: formattedStory,
      message: 'Story details retrieved successfully',
    });
  } catch (error) {
    console.error('❌ Error fetching story details:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch story details',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT endpoint for updating story details
export async function PUT(
  request: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const { storyId } = params;
    const body = await request.json();

    if (!storyId || !mongoose.Types.ObjectId.isValid(storyId)) {
      return NextResponse.json({ error: 'Invalid story ID' }, { status: 400 });
    }

    await connectToDatabase();

    // Verify story ownership
    const story = await StorySession.findOne({
      _id: storyId,
      childId: session.user.id,
    });

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found or access denied' },
        { status: 404 }
      );
    }

    const { title, competitionEligible, elements } = body;

    // Update allowed fields
    if (title && title.trim()) {
      story.title = title.trim();
    }

    if (typeof competitionEligible === 'boolean') {
      (story as any).competitionEligible = competitionEligible;
    }

    if (elements && typeof elements === 'object') {
      (story as any).elements = { ...(story as any).elements, ...elements };
    }

    await story.save();

    console.log(`✅ Story ${storyId} updated successfully`);

    return NextResponse.json({
      success: true,
      message: 'Story updated successfully',
      story: {
        _id: story._id,
        title: story.title,
        competitionEligible: (story as any).competitionEligible,
        elements: (story as any).elements,
      },
    });
  } catch (error) {
    console.error('❌ Error updating story:', error);
    return NextResponse.json(
      {
        error: 'Failed to update story',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint for deleting a story
export async function DELETE(
  request: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const { storyId } = params;

    if (!storyId || !mongoose.Types.ObjectId.isValid(storyId)) {
      return NextResponse.json({ error: 'Invalid story ID' }, { status: 400 });
    }

    await connectToDatabase();

    // Get the story and verify ownership
    const story = (await StorySession.findOne({
      _id: storyId,
      childId: session.user.id,
    }).lean()) as StoryDocument | null;

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found or access denied' },
        { status: 404 }
      );
    }

    // Check if story can be deleted (not published or in competition)
    const isPublished = await PublishedStory.findOne({ sessionId: storyId });
    const hasCompetitionEntries =
      story.competitionEntries && story.competitionEntries.length > 0;

    if (isPublished) {
      return NextResponse.json(
        { error: 'Cannot delete published stories' },
        { status: 400 }
      );
    }

    if (hasCompetitionEntries) {
      return NextResponse.json(
        { error: 'Cannot delete stories submitted to competitions' },
        { status: 400 }
      );
    }

    // Delete associated data
    await Promise.all([
      Turn.deleteMany({ sessionId: storyId }),
      StoryComment.deleteMany({ storyId: storyId }),
      StorySession.findByIdAndDelete(storyId),
    ]);

    console.log(`🗑️ Story ${storyId} deleted successfully`);

    return NextResponse.json({
      success: true,
      message: 'Story deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting story:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete story',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
