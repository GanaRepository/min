// app/api/user/stories/[storyId]/route.ts - COMPLETE UPDATE FOR MINTOONS REQUIREMENTS
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
      return NextResponse.json(
        { error: 'Invalid story ID' },
        { status: 400 }
      );
    }

    console.log('📖 Fetching story details for:', storyId);

    await connectToDatabase();

    // Get the story and verify ownership
    const story = await StorySession.findOne({
      _id: storyId,
      childId: session.user.id
    }).lean();

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found or access denied' },
        { status: 404 }
      );
    }

    console.log('✅ Story found:', story.title);

    // Get all turns for this story (for content)
    const turns = await Turn.find({ sessionId: storyId })
      .sort({ turnNumber: 1 })
      .lean();

    console.log(`📝 Found ${turns.length} turns`);

    // Build complete story content
    let fullContent = '';
    if (story.aiOpening) {
      fullContent += story.aiOpening + '\n\n';
    }

    turns.forEach((turn, index) => {
      if (turn.childInput) {
        fullContent += `**Turn ${turn.turnNumber} - Your Writing:**\n${turn.childInput}\n\n`;
      }
      if (turn.aiResponse) {
        fullContent += `**AI Response:**\n${turn.aiResponse}\n\n`;
      }
    });

    // Check if story is published
    const publishedStory = await PublishedStory.findOne({ sessionId: storyId }).lean();
    const isPublished = !!publishedStory;

    // Get comments (from mentors/admin)
    const comments = await StoryComment.find({ storyId })
      .populate('authorId', 'firstName lastName role')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`💬 Found ${comments.length} comments`);

    // Determine story type
    let storyType = 'freestyle';
    if (story.isUploadedForAssessment) {
      storyType = 'uploaded';
    } else if (story.competitionEntries && story.competitionEntries.length > 0) {
      storyType = 'competition';
    }

    // Get competition info if exists
    const latestCompetitionEntry = story.competitionEntries && story.competitionEntries.length > 0
      ? story.competitionEntries[story.competitionEntries.length - 1]
      : null;

    // Format comprehensive story response
    const formattedStory = {
      _id: story._id.toString(),
      title: story.title,
      status: story.status,
      storyType,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
      completedAt: story.completedAt,
      
      // Word counts and progress
      totalWords: story.totalWords || 0,
      childWords: story.childWords || 0,
      currentTurn: story.currentTurn || 1,
      maxTurns: story.maxApiCalls || 7,
      apiCallsUsed: story.apiCallsUsed || 0,
      
      // Content
      content: fullContent.trim(),
      aiOpening: story.aiOpening || '',
      turns: turns.map(turn => ({
        turnNumber: turn.turnNumber,
        childInput: turn.childInput || '',
        aiResponse: turn.aiResponse || '',
        wordCount: turn.wordCount || 0,
        timestamp: turn.createdAt
      })),
      
      // Publication status
      isPublished,
      publishedAt: publishedStory?.publishedAt || null,
      publicationFee: publishedStory?.publicationFee || null,
      
      // Assessment data
      isUploadedForAssessment: story.isUploadedForAssessment || false,
      assessmentAttempts: story.assessmentAttempts || 0,
      assessment: story.assessment ? {
        // Core scores
        overallScore: story.assessment.overallScore || 0,
        grammarScore: story.assessment.grammarScore || 0,
        creativityScore: story.assessment.creativityScore || 0,
        vocabularyScore: story.assessment.vocabularyScore || 0,
        structureScore: story.assessment.structureScore || 0,
        characterDevelopmentScore: story.assessment.characterDevelopmentScore || 0,
        plotDevelopmentScore: story.assessment.plotDevelopmentScore || 0,
        
        // Reading level and feedback
        readingLevel: story.assessment.readingLevel || 'Unknown',
        feedback: story.assessment.feedback || '',
        strengths: story.assessment.strengths || [],
        improvements: story.assessment.improvements || [],
        encouragement: story.assessment.encouragement || '',
        educationalInsights: story.assessment.educationalInsights || '',
        
        // Vocabulary analysis
        vocabularyUsed: story.assessment.vocabularyUsed || [],
        suggestedWords: story.assessment.suggestedWords || [],
        
        // Integrity analysis
        integrityAnalysis: story.assessment.integrityAnalysis ? {
          originalityScore: story.assessment.integrityAnalysis.originalityScore || 100,
          plagiarismResult: {
            overallScore: story.assessment.integrityAnalysis.plagiarismResult?.overallScore || 100,
            riskLevel: story.assessment.integrityAnalysis.plagiarismResult?.riskLevel || 'low',
            violations: story.assessment.integrityAnalysis.plagiarismResult?.violations || []
          },
          aiDetectionResult: {
            likelihood: story.assessment.integrityAnalysis.aiDetectionResult?.likelihood || 'low',
            confidence: story.assessment.integrityAnalysis.aiDetectionResult?.confidence || 0,
            indicators: story.assessment.integrityAnalysis.aiDetectionResult?.indicators || []
          },
          integrityRisk: story.assessment.integrityAnalysis.integrityRisk || 'low'
        } : null,
        
        integrityStatus: story.assessment.integrityStatus || {
          status: 'PASS',
          message: 'Story passed all integrity checks'
        },
        
        // Recommendations and progress
        recommendations: story.assessment.recommendations || {
          immediate: [],
          longTerm: [],
          practiceExercises: []
        },
        
        progressTracking: story.assessment.progressTracking || null
      } : null,
      
      // Competition data
      competitionEligible: story.competitionEligible || false,
      competitionEntries: story.competitionEntries || [],
      latestCompetitionEntry,
      submittedToCompetition: !!latestCompetitionEntry,
      
      // Story elements (if any)
      elements: story.elements || {},
      
      // Comments from mentors/admin
      comments: comments.map(comment => ({
        _id: comment._id.toString(),
        content: comment.content,
        author: comment.authorId ? {
          _id: comment.authorId._id.toString(),
          name: `${comment.authorId.firstName} ${comment.authorId.lastName}`,
          role: comment.authorId.role
        } : null,
        createdAt: comment.createdAt,
        isPublic: comment.isPublic || false,
        category: comment.category || 'general'
      })),
      
      // Metadata
      storyNumber: story.storyNumber || 0,
      pausedAt: story.pausedAt,
      resumedAt: story.resumedAt
    };

    console.log('📊 Story details compiled successfully');

    return NextResponse.json({
      success: true,
      story: formattedStory,
      message: 'Story details retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching story details:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch story details',
        details: error instanceof Error ? error.message : 'Unknown error'
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
      return NextResponse.json(
        { error: 'Invalid story ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify story ownership
    const story = await StorySession.findOne({
      _id: storyId,
      childId: session.user.id
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
      story.competitionEligible = competitionEligible;
    }

    if (elements && typeof elements === 'object') {
      story.elements = { ...story.elements, ...elements };
    }

    await story.save();

    console.log(`✅ Story ${storyId} updated successfully`);

    return NextResponse.json({
      success: true,
      message: 'Story updated successfully',
      story: {
        _id: story._id,
        title: story.title,
        competitionEligible: story.competitionEligible,
        elements: story.elements
      }
    });

  } catch (error) {
    console.error('❌ Error updating story:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update story',
        details: error instanceof Error ? error.message : 'Unknown error'
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
      return NextResponse.json(
        { error: 'Invalid story ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get the story and verify ownership
    const story = await StorySession.findOne({
      _id: storyId,
      childId: session.user.id
    }).lean();

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found or access denied' },
        { status: 404 }
      );
    }

    // Check if story can be deleted (not published or in competition)
    const isPublished = await PublishedStory.findOne({ sessionId: storyId });
    const hasCompetitionEntries = story.competitionEntries && story.competitionEntries.length > 0;

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
      StorySession.findByIdAndDelete(storyId)
    ]);

    console.log(`🗑️ Story ${storyId} deleted successfully`);

    return NextResponse.json({
      success: true,
      message: 'Story deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting story:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete story',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}