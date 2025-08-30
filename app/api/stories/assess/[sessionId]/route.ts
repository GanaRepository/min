// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/utils/authOptions';
// import { connectToDatabase } from '@/utils/db';
// import StorySession from '@/models/StorySession';
// import Turn from '@/models/Turn';
// import User from '@/models/User';
// import { SingleCallAssessmentEngine } from '@/lib/ai/SingleCallAssessmentEngine';

// export async function POST(
//   request: NextRequest,
//   { params }: { params: { sessionId: string } }
// ) {
//   console.log(
//     '🎯 ADVANCED AI ASSESSMENT API called for session:',
//     params.sessionId
//   );

//   try {
//     const session = await getServerSession(authOptions);
//     if (!session) {
//       return NextResponse.json(
//         { error: 'Authentication required' },
//         { status: 401 }
//       );
//     }

//     const { sessionId } = params;
//     const { isReassessment = false } = await request.json();

//     await connectToDatabase();

//     const storySession = await StorySession.findById(sessionId);
//     if (!storySession) {
//       return NextResponse.json(
//         { error: 'Story session not found' },
//         { status: 404 }
//       );
//     }

//     if (storySession.userId.toString() !== session.user.id) {
//       return NextResponse.json({ error: 'Access denied' }, { status: 403 });
//     }

//     const user = await User.findById(session.user.id);
//     const userAge = user?.age || 10;

//     console.log(
//       `📖 Starting ADVANCED assessment with AI detection for age: ${userAge}`
//     );

//     // Prepare story content
//     let fullStoryContent = '';
//     let userContributions: string[] = [];

//     if (storySession.type === 'collaborative') {
//       const turns = await Turn.find({ sessionId }).sort({ turnNumber: 1 });

//       userContributions = turns
//         .filter((turn) => turn.childInput && turn.childInput.trim().length > 0)
//         .map((turn) => turn.childInput.trim());

//       fullStoryContent = userContributions.join('\n\n');
//       console.log(
//         `📝 Collaborative story: ${userContributions.length} user turns`
//       );
//     } else {
//       fullStoryContent =
//         storySession.storyContent || storySession.content || '';
//       userContributions = [fullStoryContent];
//       console.log(`📝 Freestyle story: ${fullStoryContent.length} characters`);
//     }

//     if (!fullStoryContent || fullStoryContent.trim().length < 50) {
//       return NextResponse.json(
//         {
//           error:
//             'Story content too short for meaningful assessment (minimum 50 words)',
//         },
//         { status: 400 }
//       );
//     }

//     console.log(
//       '🤖 Starting comprehensive AI-powered assessment with advanced AI detection...'
//     );

//     // PERFORM COMPREHENSIVE ASSESSMENT WITH ADVANCED AI DETECTION
//     const comprehensiveAssessment =
//       await SingleCallAssessmentEngine.performCompleteAssessment(
//         fullStoryContent,
//         {
//           childAge: userAge,
//           storyTitle: storySession.title,
//           expectedGenre: storySession.genre || 'creative',
//           isCollaborativeStory: storySession.type === 'collaborative',
//         }
//       );

//     console.log('✅ Advanced AI assessment completed');
//     console.log(`📊 Overall Score: ${comprehensiveAssessment.overallScore}%`);
//     console.log(`🔍 Status: ${comprehensiveAssessment.status}`);
//     console.log(
//       `🔒 Integrity: ${comprehensiveAssessment.integrityAnalysis.overallStatus}`
//     );
//     console.log(
//       `🤖 AI Detection: ${comprehensiveAssessment.integrityAnalysis.aiDetection.aiLikelihood}`
//     );
//     console.log(
//       `📝 Human-like Score: ${comprehensiveAssessment.integrityAnalysis.aiDetection.humanLikeScore}%`
//     );

//     const assessmentData = {
//       comprehensiveAssessment: comprehensiveAssessment,
//       overallScore: comprehensiveAssessment.overallScore,
//       status: comprehensiveAssessment.status,
//       statusMessage: comprehensiveAssessment.statusMessage,

//       // Core scores
//       grammarScore: comprehensiveAssessment.coreWritingSkills.grammar.score,
//       creativityScore:
//         comprehensiveAssessment.coreWritingSkills.creativity.score,
//       vocabularyScore:
//         comprehensiveAssessment.coreWritingSkills.vocabulary.score,
//       structureScore: comprehensiveAssessment.coreWritingSkills.structure.score,
//       characterDevelopmentScore:
//         comprehensiveAssessment.storyDevelopment.characterDevelopment.score,
//       plotDevelopmentScore:
//         comprehensiveAssessment.storyDevelopment.plotDevelopment.score,

//       // Feedback
//       feedback: comprehensiveAssessment.comprehensiveFeedback.teacherAssessment,
//       strengths: comprehensiveAssessment.comprehensiveFeedback.strengths,
//       improvements:
//         comprehensiveAssessment.comprehensiveFeedback.areasForEnhancement,
//       nextSteps: comprehensiveAssessment.comprehensiveFeedback.nextSteps,

//       // ADVANCED INTEGRITY ANALYSIS
//       integrityAnalysis: {
//         // AI Detection Results
//         aiDetection: {
//           humanLikeScore:
//             comprehensiveAssessment.integrityAnalysis.aiDetection
//               .humanLikeScore,
//           aiLikelihood:
//             comprehensiveAssessment.integrityAnalysis.aiDetection.aiLikelihood,
//           confidenceLevel:
//             comprehensiveAssessment.integrityAnalysis.aiDetection
//               .confidenceLevel,
//           analysis:
//             comprehensiveAssessment.integrityAnalysis.aiDetection.analysis,
//           riskLevel:
//             comprehensiveAssessment.integrityAnalysis.aiDetection.riskLevel,
//           indicators:
//             comprehensiveAssessment.integrityAnalysis.aiDetection.indicators,
//         },
//         // Plagiarism Results
//         plagiarismCheck: {
//           originalityScore:
//             comprehensiveAssessment.integrityAnalysis.plagiarismCheck
//               .originalityScore,
//           riskLevel:
//             comprehensiveAssessment.integrityAnalysis.plagiarismCheck.riskLevel,
//           violations:
//             comprehensiveAssessment.integrityAnalysis.plagiarismCheck
//               .violations,
//           status:
//             comprehensiveAssessment.integrityAnalysis.plagiarismCheck.status,
//         },
//         // Overall Integrity Status
//         overallStatus: comprehensiveAssessment.integrityAnalysis.overallStatus,
//         message: comprehensiveAssessment.integrityAnalysis.message,
//         recommendation:
//           comprehensiveAssessment.integrityAnalysis.recommendation,
//       },

//       // Assessment metadata
//       assessmentVersion: '6.0-advanced-ai-detection',
//       assessmentDate: new Date(),
//       isReassessment,
//       aiDetectionEnabled: true,
//     };

//     // Determine story status based on integrity analysis
//     let storyStatus = 'completed';
//     if (comprehensiveAssessment.integrityAnalysis.overallStatus === 'FAIL') {
//       storyStatus = 'flagged'; // AI content or plagiarism detected
//     } else if (
//       comprehensiveAssessment.integrityAnalysis.overallStatus === 'WARNING'
//     ) {
//       storyStatus = 'review'; // Needs manual review
//     }

//     // Update story session
//     const updateData = {
//       assessment: assessmentData,
//       overallScore: comprehensiveAssessment.overallScore,
//       grammarScore: comprehensiveAssessment.coreWritingSkills.grammar.score,
//       creativityScore:
//         comprehensiveAssessment.coreWritingSkills.creativity.score,
//       feedback: comprehensiveAssessment.comprehensiveFeedback.teacherAssessment,

//       // Set status based on integrity analysis
//       status: storyStatus,

//       lastAssessedAt: new Date(),
//       assessmentAttempts: (storySession.assessmentAttempts || 0) + 1,

//       // Store integrity information at top level
//       integrityStatus: comprehensiveAssessment.integrityAnalysis.overallStatus,
//       aiDetectionScore:
//         comprehensiveAssessment.integrityAnalysis.aiDetection.humanLikeScore,
//       plagiarismScore:
//         comprehensiveAssessment.integrityAnalysis.plagiarismCheck
//           .originalityScore,

//       // Flag for admin review if necessary
//       ...(storyStatus === 'flagged' && {
//         adminFlags: {
//           aiDetected:
//             comprehensiveAssessment.integrityAnalysis.aiDetection.riskLevel ===
//             'CRITICAL RISK',
//           plagiarismDetected:
//             comprehensiveAssessment.integrityAnalysis.plagiarismCheck.status ===
//             'VIOLATION',
//           flaggedAt: new Date(),
//           flagReason: comprehensiveAssessment.integrityAnalysis.message,
//         },
//       }),
//     };

//     const updatedSession = await StorySession.findByIdAndUpdate(
//       sessionId,
//       updateData,
//       { new: true, runValidators: true }
//     );

//     if (!updatedSession) {
//       throw new Error('Failed to update story session with assessment');
//     }

//     console.log('💾 Advanced assessment with AI detection saved successfully');

//     // Log integrity results
//     if (storyStatus === 'flagged') {
//       console.log('🚨 INTEGRITY ISSUE DETECTED:');
//       console.log(
//         `   🤖 AI Detection: ${comprehensiveAssessment.integrityAnalysis.aiDetection.aiLikelihood} (${comprehensiveAssessment.integrityAnalysis.aiDetection.humanLikeScore}% human-like)`
//       );
//       console.log(
//         `   📝 Plagiarism: ${comprehensiveAssessment.integrityAnalysis.plagiarismCheck.riskLevel} risk`
//       );
//       console.log(
//         `   ⚠️  Status: ${comprehensiveAssessment.integrityAnalysis.overallStatus}`
//       );
//       console.log(
//         `   💬 Message: ${comprehensiveAssessment.integrityAnalysis.message}`
//       );
//     } else {
//       console.log('✅ INTEGRITY CHECK PASSED:');
//       console.log(
//         `   🤖 AI Detection: ${comprehensiveAssessment.integrityAnalysis.aiDetection.aiLikelihood}`
//       );
//       console.log(
//         `   📝 Plagiarism: ${comprehensiveAssessment.integrityAnalysis.plagiarismCheck.riskLevel} risk`
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       assessment: assessmentData,
//       message:
//         'Advanced AI-powered assessment with integrity verification completed',
//       session: {
//         id: updatedSession._id,
//         overallScore: updatedSession.overallScore,
//         status: updatedSession.status,
//         title: updatedSession.title,
//       },
//       integrityCheck: {
//         status: comprehensiveAssessment.integrityAnalysis.overallStatus,
//         aiDetection:
//           comprehensiveAssessment.integrityAnalysis.aiDetection.aiLikelihood,
//         humanLikeScore:
//           comprehensiveAssessment.integrityAnalysis.aiDetection.humanLikeScore,
//       },
//     });
//   } catch (error) {
//     console.error('❌ Advanced Assessment failed:', error);

//     const errorMessage =
//       error instanceof Error ? error.message : 'Unknown error';
//     console.error('Error details:', errorMessage);

//     try {
//       await StorySession.findByIdAndUpdate(params.sessionId, {
//         'assessment.error': true,
//         'assessment.errorMessage': errorMessage,
//         'assessment.assessmentDate': new Date(),
//         lastAssessedAt: new Date(),
//         status: 'error',
//       });
//     } catch (dbError) {
//       console.error('Failed to save error state:', dbError);
//     }

//     return NextResponse.json(
//       {
//         error: 'Advanced assessment failed',
//         details:
//           'Unable to complete AI-powered assessment with integrity verification.',
//         errorType:
//           error instanceof Error ? error.constructor.name : 'UnknownError',
//       },
//       { status: 500 }
//     );
//   }
// }

// // GET method remains the same
// export async function GET(
//   request: NextRequest,
//   { params }: { params: { sessionId: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session) {
//       return NextResponse.json(
//         { error: 'Authentication required' },
//         { status: 401 }
//       );
//     }

//     await connectToDatabase();

//     const storySession = await StorySession.findById(params.sessionId);
//     if (!storySession) {
//       return NextResponse.json(
//         { error: 'Story session not found' },
//         { status: 404 }
//       );
//     }

//     if (storySession.userId.toString() !== session.user.id) {
//       return NextResponse.json({ error: 'Access denied' }, { status: 403 });
//     }

//     if (storySession.assessment && !storySession.assessment.error) {
//       return NextResponse.json({
//         success: true,
//         assessment: storySession.assessment,
//         session: {
//           id: storySession._id,
//           title: storySession.title,
//           overallScore: storySession.overallScore,
//           status: storySession.status,
//         },
//       });
//     }

//     return NextResponse.json(
//       { error: 'No assessment found for this story' },
//       { status: 404 }
//     );
//   } catch (error) {
//     console.error('Error retrieving assessment:', error);
//     return NextResponse.json(
//       { error: 'Failed to retrieve assessment' },
//       { status: 500 }
//     );
//   }
// }


// app/api/stories/assess/[sessionId]/route.ts - Updated for 42-Factor Assessment

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import User from '@/models/User';
import { SingleCallAssessmentEngine } from '@/lib/ai/SingleCallAssessmentEngine';
import mongoose from 'mongoose';

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'child') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { sessionId } = params;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
    }

    await connectToDatabase();

    const storySession = await StorySession.findOne({
      _id: sessionId,
      childId: session.user.id,
    });

    if (!storySession) {
      return NextResponse.json({ error: 'Story session not found' }, { status: 404 });
    }

    if (storySession.status !== 'completed') {
      return NextResponse.json({ error: 'Story must be completed before assessment' }, { status: 400 });
    }

    // Check if already has 42-factor assessment
    if (storySession.assessment?.assessmentVersion === '3.0-42-factor') {
      return NextResponse.json({
        success: true,
        assessment: storySession.assessment,
        message: 'Returning existing 42-factor assessment',
      });
    }

    // Get user age for assessment
    const user = await User.findById(session.user.id);
    const userAge = user?.age || 10;

    console.log(`Generating new 42-factor assessment for session ${sessionId}`);

    // Build story content
    let fullStoryContent = '';
    let userContributions = [];

    if (storySession.isUploadedForAssessment) {
      fullStoryContent = storySession.content || '';
      userContributions = [fullStoryContent];
    } else {
      // Collaborative story - rebuild from turns
      const turns = await Turn.find({ sessionId }).sort({ turnNumber: 1 });
      
      if (storySession.aiOpening) {
        fullStoryContent += `${storySession.aiOpening}\n\n`;
      }

      const childInputs = turns
        .filter((turn) => turn.childInput?.trim())
        .map((turn) => turn.childInput.trim());

      userContributions = childInputs;
      fullStoryContent += childInputs.join('\n\n');
    }

    if (!fullStoryContent || fullStoryContent.trim().length < 50) {
      return NextResponse.json({
        error: 'Story content too short for meaningful assessment (minimum 50 characters)',
      }, { status: 400 });
    }

    console.log(`Starting comprehensive 42-factor assessment for ${fullStoryContent.length} characters`);

    try {
      // Perform comprehensive 42-factor assessment
      const assessment = await SingleCallAssessmentEngine.performCompleteAssessment(
        fullStoryContent,
        {
          childAge: userAge,
          storyTitle: storySession.title,
          expectedGenre: storySession.genre || 'creative',
          isCollaborativeStory: !storySession.isUploadedForAssessment,
        }
      );

      console.log(`42-factor assessment completed - Overall Score: ${assessment.overallScore}%`);

      // Create comprehensive assessment data structure
      const comprehensiveAssessment = {
        overallScore: assessment.overallScore,
        status: assessment.status,
        statusMessage: assessment.statusMessage,
        
        // All 42 factors organized by category
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
          
          // Creative & Literary Skills (13-18)
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
          
          // Advanced Elements (24-28)
          foreshadowing: assessment.advancedElements?.foreshadowing,
          symbolismRecognition: assessment.advancedElements?.symbolismRecognition,
          pointOfViewConsistency: assessment.advancedElements?.pointOfViewConsistency,
          moodAtmosphereCreation: assessment.advancedElements?.moodAtmosphereCreation,
          culturalSensitivity: assessment.advancedElements?.culturalSensitivity,
          
          // AI Detection Analysis (29-32)
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
        
        // AI Detection Results
        aiDetectionResult: {
          result: assessment.aiDetectionAnalysis?.overallResult,
          confidenceLevel: assessment.aiDetectionAnalysis?.confidenceLevel,
          analysis: assessment.aiDetectionAnalysis?.authenticityMarkers?.analysis,
        },
        
        // Legacy compatibility fields
        grammarScore: assessment.coreWritingMechanics?.grammarSyntax?.score || 0,
        creativityScore: assessment.creativeSkills?.originalityCreativity?.score || 0,
        vocabularyScore: assessment.coreWritingMechanics?.vocabularyRange?.score || 0,
        structureScore: assessment.coreWritingMechanics?.sentenceStructure?.score || 0,
        characterDevelopmentScore: assessment.storyElements?.characterDevelopment?.score || 0,
        plotDevelopmentScore: assessment.storyElements?.plotDevelopmentPacing?.score || 0,
        
        // Assessment metadata
        assessmentVersion: '3.0-42-factor',
        assessmentDate: new Date().toISOString(),
        assessmentType: storySession.isUploadedForAssessment ? 'uploaded' : 'collaborative',
        userAge: userAge,
        wordCount: fullStoryContent.split(/\s+/).filter(Boolean).length,
        userContributionCount: userContributions.length,
      };

      // Update story session with comprehensive assessment
      await StorySession.findByIdAndUpdate(sessionId, {
        $set: {
          assessment: {
            ...comprehensiveAssessment,
            note: 'Complete 42-factor analysis provided regardless of status - flagging for admin review only',
          },
          overallScore: assessment.overallScore,
          status: assessment.status, // Always use AI's determination directly
          lastAssessedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        assessment: comprehensiveAssessment,
        message: 'Comprehensive 42-factor assessment completed successfully!',
        storyInfo: {
          title: storySession.title,
          wordCount: fullStoryContent.split(/\s+/).filter(Boolean).length,
          type: storySession.storyType,
          createdAt: storySession.createdAt,
        },
      });

    } catch (assessmentError) {
      console.error('42-factor assessment failed:', assessmentError);
      return NextResponse.json(
        {
          error: 'Assessment generation failed',
          details: assessmentError instanceof Error ? assessmentError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Assessment route error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate assessment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}