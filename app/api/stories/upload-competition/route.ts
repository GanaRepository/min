// // app/api/stories/upload-competition/route.ts - FIXED (Text Only)
// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/utils/authOptions';
// import { connectToDatabase } from '@/utils/db';
// import StorySession from '@/models/StorySession';
// import Competition from '@/models/Competition';
// import { UsageManager } from '@/lib/usage-manager';
// import { competitionManager } from '@/lib/competition-manager';

// export async function POST(request: NextRequest) {
//   try {
//     console.log('🏆 Competition story upload request received');

//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== 'child') {
//       return NextResponse.json(
//         { error: 'Access denied. Children only.' },
//         { status: 403 }
//       );
//     }

//     await connectToDatabase();

//     // Check competition eligibility
//     const competitionCheck = await UsageManager.canEnterCompetition(
//       session.user.id
//     );
//     if (!competitionCheck.allowed) {
//       return NextResponse.json(
//         { error: competitionCheck.reason },
//         { status: 403 }
//       );
//     }

//     // Get current competition
//     const currentCompetition = await competitionManager.getCurrentCompetition();
//     if (!currentCompetition || currentCompetition.phase !== 'submission') {
//       return NextResponse.json(
//         { error: 'No active competition or submission phase has ended' },
//         { status: 400 }
//       );
//     }

//     const formData = await request.formData();
//     const title = formData.get('title') as string;
//     const content = formData.get('content') as string;

//     if (!title?.trim()) {
//       return NextResponse.json(
//         { error: 'Story title is required' },
//         { status: 400 }
//       );
//     }

//     if (!content?.trim()) {
//       return NextResponse.json(
//         { error: 'Please provide story content by pasting text' },
//         { status: 400 }
//       );
//     }

//     const storyContent = content.trim();

//     if (!storyContent) {
//       return NextResponse.json(
//         { error: 'Story content cannot be empty' },
//         { status: 400 }
//       );
//     }

//     // Word count validation for competition
//     const wordCount = storyContent.split(/\s+/).filter(Boolean).length;

//     if (wordCount < 350) {
//       return NextResponse.json(
//         { error: 'Competition stories must be at least 350 words' },
//         { status: 400 }
//       );
//     }

//     if (wordCount > 2000) {
//       return NextResponse.json(
//         { error: 'Competition stories must be less than 2000 words' },
//         { status: 400 }
//       );
//     }

//     const userStoryCount = await StorySession.countDocuments({
//       childId: session.user.id,
//     });

//     const storySession = new StorySession({
//       childId: session.user.id,
//       storyNumber: userStoryCount + 1,
//       title: title.trim(),
//       currentTurn: 1,
//       totalWords: wordCount,
//       childWords: wordCount,
//       apiCallsUsed: 0,
//       maxApiCalls: 1,
//       status: 'completed',
//       aiOpening: storyContent,
//       completedAt: new Date(),
//       isUploadedForAssessment: false,
//       storyType: 'competition',
//       competitionEligible: true,
//       assessment: {
//         integrityStatus: {
//           status: 'PASS',
//           message: 'Competition entry integrity check passed',
//         },
//       },
//       competitionEntries: [
//         {
//           competitionId: currentCompetition._id,
//           submittedAt: new Date(),
//           phase: 'submission',
//         },
//       ],
//     });

//     await storySession.save();
//     console.log(`✅ Competition story saved with ID: ${storySession._id}`);

//     // Update competition statistics
//     const userSubmissionsCount = await StorySession.countDocuments({
//       childId: session.user.id,
//       'competitionEntries.competitionId': currentCompetition._id,
//     });

//     const isFirstSubmissionFromUser = userSubmissionsCount === 1;

//     await Competition.findByIdAndUpdate(currentCompetition._id, {
//       $inc: {
//         totalSubmissions: 1,
//         ...(isFirstSubmissionFromUser && { totalParticipants: 1 }),
//       },
//     });

//     console.log(
//       `📊 Updated competition: +1 submission${isFirstSubmissionFromUser ? ', +1 participant' : ''}`
//     );

//     // Increment competition entry counter
//     await UsageManager.incrementCompetitionEntry(session.user.id);

//     return NextResponse.json({
//       success: true,
//       storyId: storySession._id,
//       story: {
//         id: storySession._id,
//         title: storySession.title,
//         storyNumber: storySession.storyNumber,
//         wordCount,
//         submittedToCompetition: true,
//         competitionId: currentCompetition._id,
//         competitionEligible: true,
//       },
//       competition: {
//         id: currentCompetition._id,
//         month: currentCompetition.month,
//         phase: currentCompetition.phase,
//       },
//       message: 'Story uploaded and submitted to competition successfully!',
//     });
//   } catch (error) {
//     console.error('Competition upload error:', error);
//     return NextResponse.json(
//       {
//         error: 'Failed to upload story for competition',
//         details: error instanceof Error ? error.message : 'Unknown error',
//       },
//       { status: 500 }
//     );
//   }
// }

// app/api/user/stories/upload-competition/route.ts - Updated for 42-Factor Assessment

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Competition from '@/models/Competition';
import User from '@/models/User';
import { UsageManager } from '@/lib/usage-manager';
import { competitionManager } from '@/lib/competition-manager';
import { SingleCallAssessmentEngine } from '@/lib/ai/SingleCallAssessmentEngine';

export async function POST(request: NextRequest) {
  try {
    console.log('Competition story upload request received');

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Check competition eligibility
    const competitionCheck = await UsageManager.canEnterCompetition(session.user.id);
    if (!competitionCheck.allowed) {
      return NextResponse.json(
        { error: competitionCheck.reason },
        { status: 403 }
      );
    }

    // Get current competition
    const currentCompetition = await competitionManager.getCurrentCompetition();
    if (!currentCompetition || currentCompetition.phase !== 'submission') {
      return NextResponse.json(
        { error: 'No active competition or submission phase has ended' },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Story title is required' },
        { status: 400 }
      );
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Please provide story content by pasting text' },
        { status: 400 }
      );
    }

    const storyContent = content.trim();
    const wordCount = storyContent.split(/\s+/).filter(Boolean).length;

    // Competition word count validation
    if (wordCount < 100) {
      return NextResponse.json(
        { error: 'Competition stories must be at least 100 words' },
        { status: 400 }
      );
    }

    if (wordCount > 2000) {
      return NextResponse.json(
        { error: 'Competition stories must be less than 2000 words' },
        { status: 400 }
      );
    }

    // Get user for story number
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userStoryCount = await StorySession.countDocuments({
      childId: session.user.id,
    });
    const nextStoryNumber = userStoryCount + 1;

    console.log('Running comprehensive 42-factor assessment for competition entry...');

    try {
      // Perform comprehensive 42-factor assessment
      const assessment = await SingleCallAssessmentEngine.performCompleteAssessment(
        storyContent,
        {
          childAge: user.age || 10,
          isCollaborativeStory: false,
          storyTitle: title,
          expectedGenre: 'creative',
        }
      );

      console.log(`Competition 42-factor assessment completed - Overall: ${assessment.overallScore}%`);
      console.log(`AI Detection: ${assessment.aiDetectionAnalysis?.overallResult}`);

      // Create comprehensive assessment structure for competition entry
      const comprehensiveAssessment = {
        overallScore: assessment.overallScore,
        status: assessment.status,
        statusMessage: assessment.statusMessage,
        
        // All 42 factors for competition judging
        allFactors: {
          // Core Writing Mechanics (1-6)
          grammarSyntax: assessment.coreWritingMechanics?.grammarSyntax,
          vocabularyRange: assessment.coreWritingMechanics?.vocabularyRange,
          spellingPunctuation: assessment.coreWritingMechanics?.spellingPunctuation,
          sentenceStructure: assessment.coreWritingMechanics?.sentenceStructure,
          tenseConsistency: assessment.coreWritingMechanics?.tenseConsistency,
          voiceTone: assessment.coreWritingMechanics?.voiceTone,
          
          // Story Elements (7-12)
          plotDevelopmentPacing: assessment.storyElements?.plotDevelopmentPacing,
          characterDevelopment: assessment.storyElements?.characterDevelopment,
          settingWorldBuilding: assessment.storyElements?.settingWorldBuilding,
          dialogueQuality: assessment.storyElements?.dialogueQuality,
          themeRecognition: assessment.storyElements?.themeRecognition,
          conflictResolution: assessment.storyElements?.conflictResolution,
          
          // Creative Skills (13-18) - Important for competition ranking
          originalityCreativity: assessment.creativeSkills?.originalityCreativity,
          imageryDescriptiveWriting: assessment.creativeSkills?.imageryDescriptiveWriting,
          sensoryDetailsUsage: assessment.creativeSkills?.sensoryDetailsUsage,
          metaphorFigurativeLanguage: assessment.creativeSkills?.metaphorFigurativeLanguage,
          emotionalDepth: assessment.creativeSkills?.emotionalDepth,
          showVsTellBalance: assessment.creativeSkills?.showVsTellBalance,
          
          // Structure & Organization (19-23)
          storyArcCompletion: assessment.structureOrganization?.storyArcCompletion,
          paragraphOrganization: assessment.structureOrganization?.paragraphOrganization,
          transitionsBetweenIdeas: assessment.structureOrganization?.transitionsBetweenIdeas,
          openingClosingEffectiveness: assessment.structureOrganization?.openingClosingEffectiveness,
          logicalFlow: assessment.structureOrganization?.logicalFlow,
          
          // Advanced Elements (24-28) - Critical for higher competition tiers
          foreshadowing: assessment.advancedElements?.foreshadowing,
          symbolismRecognition: assessment.advancedElements?.symbolismRecognition,
          pointOfViewConsistency: assessment.advancedElements?.pointOfViewConsistency,
          moodAtmosphereCreation: assessment.advancedElements?.moodAtmosphereCreation,
          culturalSensitivity: assessment.advancedElements?.culturalSensitivity,
          
          // AI Detection (29-32) - Important for competition integrity
          writingPatternAnalysis: assessment.aiDetectionAnalysis?.writingPatternAnalysis,
          authenticityMarkers: assessment.aiDetectionAnalysis?.authenticityMarkers,
          ageAppropriateLanguage: assessment.aiDetectionAnalysis?.ageAppropriateLanguage,
          personalVoiceRecognition: assessment.aiDetectionAnalysis?.personalVoiceRecognition,
          
          // Educational Feedback (33-42)
          strengthsIdentification: assessment.educationalFeedback?.strengthsIdentification,
          areasForImprovement: assessment.educationalFeedback?.areasForImprovement,
          gradeLevelAssessment: assessment.educationalFeedback?.gradeLevelAssessment,
          readingLevelEvaluation: assessment.educationalFeedback?.readingLevelEvaluation,
          teachersHolisticAssessment: assessment.educationalFeedback?.teachersHolisticAssessment,
          personalizedLearningPath: assessment.educationalFeedback?.personalizedLearningPath,
          practiceExerciseRecommendations: assessment.educationalFeedback?.practiceExerciseRecommendations,
          genreExplorationSuggestions: assessment.educationalFeedback?.genreExplorationSuggestions,
          vocabularyBuildingExercises: assessment.educationalFeedback?.vocabularyBuildingExercises,
          grammarFocusAreas: assessment.educationalFeedback?.grammarFocusAreas,
        },
        
        // AI Detection Results for competition integrity
        aiDetectionResult: {
          result: assessment.aiDetectionAnalysis?.overallResult,
          confidenceLevel: assessment.aiDetectionAnalysis?.confidenceLevel,
          analysis: assessment.aiDetectionAnalysis?.authenticityMarkers?.analysis,
        },
        
        // Competition-specific metadata
        competitionScores: {
          creativity: assessment.creativeSkills?.originalityCreativity?.score || 0,
          technical: Math.round((
            (assessment.coreWritingMechanics?.grammarSyntax?.score || 0) +
            (assessment.coreWritingMechanics?.vocabularyRange?.score || 0) +
            (assessment.structureOrganization?.storyArcCompletion?.score || 0)
          ) / 3),
          storytelling: Math.round((
            (assessment.storyElements?.plotDevelopmentPacing?.score || 0) +
            (assessment.storyElements?.characterDevelopment?.score || 0) +
            (assessment.creativeSkills?.emotionalDepth?.score || 0)
          ) / 3),
          advanced: Math.round((
            (assessment.advancedElements?.symbolismRecognition?.score || 0) +
            (assessment.advancedElements?.moodAtmosphereCreation?.score || 0) +
            (assessment.advancedElements?.foreshadowing?.score || 0)
          ) / 3),
        },
        
        // Legacy compatibility
        grammarScore: assessment.coreWritingMechanics?.grammarSyntax?.score || 0,
        creativityScore: assessment.creativeSkills?.originalityCreativity?.score || 0,
        vocabularyScore: assessment.coreWritingMechanics?.vocabularyRange?.score || 0,
        
        assessmentVersion: '3.0-42-factor-competition',
        assessmentDate: new Date().toISOString(),
        assessmentType: 'competition',
      };

      // Create story session with comprehensive assessment
      const storySession = new StorySession({
        childId: session.user.id,
        title: title.trim(),
        content: storyContent,
        storyNumber: nextStoryNumber,
        status: assessment.status === 'Flagged' ? 'flagged' : 'completed',
        totalWords: wordCount,
        childWords: wordCount,
        currentTurn: 1,
        apiCallsUsed: 1,
        maxApiCalls: 1,
        isUploadedForAssessment: false,
        storyType: 'competition',
        competitionEligible: true,
        assessment: comprehensiveAssessment,
        overallScore: assessment.overallScore,
        competitionEntries: [
          {
            competitionId: currentCompetition._id,
            submittedAt: new Date(),
            phase: 'submission',
          },
        ],
      });

      await storySession.save();

      // Update user's competition entry count
      await User.findByIdAndUpdate(session.user.id, {
        $inc: { competitionEntriesThisMonth: 1 },
      });

      console.log(`Competition entry saved with comprehensive 42-factor assessment`);

      return NextResponse.json({
        success: true,
        message: 'Story submitted to competition with comprehensive assessment!',
        storyId: storySession._id,
        competitionId: currentCompetition._id,
        assessment: {
          overallScore: assessment.overallScore,
          status: assessment.status,
          aiDetection: assessment.aiDetectionAnalysis?.overallResult,
          competitionScores: comprehensiveAssessment.competitionScores,
        },
      });

    } catch (assessmentError) {
      console.error('42-factor assessment failed for competition entry:', assessmentError);
      return NextResponse.json(
        {
          error: 'Unable to assess story quality and integrity',
          details: 'Please try submitting again. If the problem persists, contact support.',
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Competition upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload story for competition',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}