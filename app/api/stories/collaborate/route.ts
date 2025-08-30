// // app/api/stories/collaborate/route.ts - FIXED VERSION
// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/utils/authOptions';
// import { connectToDatabase } from '@/utils/db';
// import StorySession from '@/models/StorySession';
// import Turn from '@/models/Turn';
// import { collaborationEngine } from '@/lib/ai/collaboration';

// export async function POST(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { error: 'Authentication required' },
//         { status: 401 }
//       );
//     }

//     const body = await request.json();
//     const { sessionId, childInput, turnNumber } = body;

//     if (!sessionId || !childInput || !turnNumber) {
//       return NextResponse.json(
//         { error: 'Session ID, child input, and turn number are required' },
//         { status: 400 }
//       );
//     }

//     await connectToDatabase();

//     // Get the story session
//     const storySession = await StorySession.findOne({
//       _id: sessionId,
//       childId: session.user.id,
//       status: 'active',
//     });

//     if (!storySession) {
//       return NextResponse.json(
//         { error: 'Active story session not found' },
//         { status: 404 }
//       );
//     }

//     // Validate word count
//     const childWords = childInput.trim().split(/\s+/).filter(Boolean);
//     if (childWords.length < 60 || childWords.length > 100) {
//       return NextResponse.json(
//         { error: 'Each turn must be between 60-100 words' },
//         { status: 400 }
//       );
//     }

//     console.log(`📝 Processing turn ${turnNumber} for session ${sessionId}`);

//     // Get previous turns for context
//     const previousTurns = await Turn.find({ sessionId })
//       .sort({ turnNumber: 1 })
//       .lean();

//     // Build story context
//     let storyContext = '';

//     // Include AI opening if exists
//     if (storySession.aiOpening) {
//       storyContext += `AI Opening: ${storySession.aiOpening}\n\n`;
//     }

//     // Include previous turns
//     previousTurns.forEach((turn) => {
//       if (turn.childInput) {
//         storyContext += `Child Turn ${turn.turnNumber}: ${turn.childInput}\n\n`;
//       }
//       if (turn.aiResponse) {
//         storyContext += `AI Response ${turn.turnNumber}: ${turn.aiResponse}\n\n`;
//       }
//     });

//     // Add current child input
//     storyContext += `Child Turn ${turnNumber}: ${childInput}\n\n`;

//     // Generate AI response (unless it's the final turn)
//     let aiResponse = '';

//     if (turnNumber < 7) {
//       console.log(`🤖 Generating AI response for turn ${turnNumber}`);

//       try {
//         aiResponse = await collaborationEngine.generateFreeformResponse(
//           childInput,
//           storyContext,
//           turnNumber
//         );
//         console.log(
//           `✅ AI response generated: ${aiResponse.split(/\s+/).filter(Boolean).length} words`
//         );
//       } catch (error) {
//         console.error('AI response generation failed:', error);
//         return NextResponse.json(
//           { error: 'AI response unavailable. Please try again later.' },
//           { status: 500 }
//         );
//       }
//     } else {
//       // Final turn - assessment message
//       aiResponse =
//         "🎉 Amazing work on your story! You've completed all 7 turns and created something wonderful. Your story is now ready for detailed assessment. Great job on this creative writing adventure!";
//     }

//     // Create the child's turn first
//     const childTurn = new Turn({
//       sessionId,
//       turnNumber,
//       author: 'child',
//       childInput: childInput.trim(),
//       content: childInput.trim(),
//       wordCount: childWords.length,
//     });

//     await childTurn.save();
//     console.log(`💾 Child turn ${turnNumber} saved successfully`);

//     // Create the AI response turn (if not final turn)
//     let aiTurn = null;
//     if (turnNumber < 7 && aiResponse) {
//       const aiWordCount = aiResponse.split(/\s+/).filter(Boolean).length;

//       aiTurn = new Turn({
//         sessionId,
//         turnNumber: turnNumber + 0.5, // Use .5 to distinguish AI responses
//         author: 'ai',
//         aiResponse,
//         content: aiResponse,
//         wordCount: aiWordCount,
//       });

//       await aiTurn.save();
//       console.log(`🤖 AI response turn saved successfully`);
//     }

//     // Update story session
//     const updateData: any = {
//       currentTurn: turnNumber, // This should be the actual turn number submitted
//       totalWords:
//         storySession.totalWords +
//         childWords.length +
//         (aiResponse ? aiResponse.split(/\s+/).filter(Boolean).length : 0),
//       childWords: storySession.childWords + childWords.length,
//       apiCallsUsed: storySession.apiCallsUsed + 1,
//       updatedAt: new Date(),
//     };

//     // If this is the final turn, mark as completed and trigger assessment
//     if (turnNumber >= 7) {
//       updateData.status = 'completed';
//       updateData.completedAt = new Date();
//       console.log(`🏁 Story completed after ${turnNumber} turns`);

//       // TRIGGER COMPREHENSIVE AI ASSESSMENT FOR FREESTYLE STORIES
//       console.log('🎯 Starting assessment process...');
//       try {
//         console.log(
//           '🎯 Story completed! Auto-generating detailed assessment...'
//         );

//         // Import the Comprehensive Assessment Engine
//         const { SingleCallAssessmentEngine } = await import(
//           '@/lib/ai/SingleCallAssessmentEngine'
//         );

//         // Get the full story content for assessment
//         const allTurns = await Turn.find({ sessionId }).sort({ turnNumber: 1 });
//         let fullStoryContent = '';

//         // Include AI opening
//         if (storySession.aiOpening) {
//           fullStoryContent += `${storySession.aiOpening}\n\n`;
//         }

//         // Include all child inputs (user's actual writing)
//         const userTurns = allTurns
//           .filter((turn) => turn.childInput)
//           .map((turn) => turn.childInput.trim());

//         fullStoryContent += userTurns.join('\n\n');

//         console.log(
//           `📝 Assessing story content: ${fullStoryContent.length} characters`
//         );
//         console.log(`👤 User turns: ${userTurns.length}`);

//         // Perform comprehensive assessment
//         const assessment =
//           await SingleCallAssessmentEngine.performCompleteAssessment(
//             fullStoryContent,
//             {
//               childAge: 10, // Default age, can be updated from user profile
//               isCollaborativeStory: true,
//               storyTitle: storySession.title || 'Collaborative Story',
//               expectedGenre: 'creative',
//             }
//           );

//         console.log('✅ Assessment completed successfully');
//         console.log(`📈 Overall Score: ${assessment.overallScore}%`);

//         console.log(
//           `🔍 Integrity Status: ${assessment.integrityAnalysis.overallStatus}`
//         );
//         console.log(
//           `🔍 Integrity Risk: ${assessment.integrityAnalysis.aiDetection.riskLevel}`
//         );
//         console.log(
//           `🤖 AI Detection: ${assessment.integrityAnalysis.aiDetection?.aiLikelihood || 'unknown'}`
//         );

//         // Create comprehensive assessment data structure
//         const assessmentData = {
//           // Legacy fields for backward compatibility
//           grammarScore: assessment.coreWritingSkills.grammar.score,
//           creativityScore: assessment.coreWritingSkills.creativity.score,
//           vocabularyScore: assessment.coreWritingSkills.vocabulary.score,
//           structureScore: assessment.coreWritingSkills.structure.score,
//           characterDevelopmentScore:
//             assessment.storyDevelopment.characterDevelopment.score,
//           plotDevelopmentScore:
//             assessment.storyDevelopment.plotDevelopment.score,
//           overallScore: assessment.overallScore,
//           readingLevel: 75, // Default since not in new structure
//           feedback: assessment.comprehensiveFeedback.teacherAssessment,
//           strengths: assessment.comprehensiveFeedback.strengths,
//           improvements: assessment.comprehensiveFeedback.areasForEnhancement,

//           // New comprehensive fields
//           coreWritingSkills: assessment.coreWritingSkills,
//           integrityAnalysis: assessment.integrityAnalysis,
//           comprehensiveFeedback: assessment.comprehensiveFeedback,
//           recommendations: assessment.comprehensiveFeedback.nextSteps,
//           progressTracking: assessment.advancedElements,
//           integrityStatus: {
//             status: assessment.integrityAnalysis.overallStatus,
//             message: assessment.integrityAnalysis.message,
//           },

//           // Assessment metadata
//           assessmentVersion: '2.0',
//           assessmentDate: new Date().toISOString(),
//           assessmentType: 'collaborative_freestyle',
//         };

//         // Update story session with comprehensive assessment
//         updateData.assessment = assessmentData;
//         updateData.overallScore = assessment.overallScore;
//         updateData.grammarScore = assessment.coreWritingSkills.grammar.score;
//         updateData.creativityScore =
//           assessment.coreWritingSkills.creativity.score;
//         updateData.lastAssessedAt = new Date();
//         updateData.assessmentAttempts = 1;

//         // HUMAN-FIRST APPROACH: Never restrict, just tag for mentor/admin review
//         // Always keep status as 'completed' - let humans decide what to do
//         updateData.status = 'completed';

//         // Add integrity tags for mentor/admin visibility
//         if (
//           assessment.integrityAnalysis.aiDetection.riskLevel === 'critical' ||
//           assessment.integrityAnalysis.aiDetection.riskLevel === 'high' ||
//           assessment.integrityAnalysis.aiDetection?.aiLikelihood === 'high' ||
//           assessment.integrityAnalysis.aiDetection?.aiLikelihood === 'very_high'
//         ) {
//           // Add integrity flags for admin/mentor review (not user restriction)
//           updateData.integrityFlags = {
//             needsReview: true,
//             aiDetectionLevel:
//               assessment.integrityAnalysis.aiDetection?.aiLikelihood ||
//               'unknown',
//             plagiarismRisk:
//               assessment.integrityAnalysis.plagiarismCheck?.riskLevel || 'low',
//             integrityRisk: assessment.integrityAnalysis.aiDetection.riskLevel,
//             flaggedAt: new Date(),
//             reviewStatus: 'pending_mentor_review',
//           };

//           console.log(
//             '🏷️ Story tagged for mentor/admin review due to integrity concerns'
//           );
//           console.log(
//             `📊 AI Detection: ${assessment.integrityAnalysis.aiDetection?.aiLikelihood}`
//           );
//           console.log(
//             `📊 Plagiarism Risk: ${assessment.integrityAnalysis.plagiarismCheck?.riskLevel}`
//           );
//         } else {
//           console.log('✅ Assessment completed - no integrity concerns');
//         }

//         console.log('💾 Saving comprehensive assessment to database...');
//       } catch (assessmentError) {
//         console.error(
//           '❌ Assessment failed for completed story:',
//           assessmentError
//         );
//         console.error('Assessment error details:', {
//           message:
//             assessmentError instanceof Error
//               ? assessmentError.message
//               : 'Unknown error',
//           stack:
//             assessmentError instanceof Error
//               ? assessmentError.stack
//               : 'No stack trace',
//           sessionId,
//           turnNumber,
//         });
//         return NextResponse.json(
//           {
//             error: 'AI assessment unavailable. Please try again later.',
//             details:
//               assessmentError instanceof Error
//                 ? assessmentError.message
//                 : 'Unknown error',
//           },
//           { status: 500 }
//         );
//       }
//     }

//     console.log('📊 Updating story session with data:', {
//       sessionId,
//       updateKeys: Object.keys(updateData),
//       hasAssessment: !!updateData.assessment,
//       status: updateData.status,
//       hasIntegrityFlags: !!updateData.integrityFlags,
//     });

//     await StorySession.findByIdAndUpdate(sessionId, updateData);
//     console.log('✅ Story session updated successfully');

//     // Prepare response - return the child turn with AI response included
//     const responseData = {
//       success: true,
//       newTurn: {
//         _id: childTurn._id,
//         turnNumber: childTurn.turnNumber,
//         childInput: childTurn.childInput,
//         aiResponse: aiResponse,
//         childWordCount: childWords.length,
//         aiWordCount: aiResponse
//           ? aiResponse.split(/\s+/).filter(Boolean).length
//           : 0,
//         timestamp: childTurn.createdAt,
//       },
//       sessionStatus: {
//         currentTurn: turnNumber,
//         totalWords: updateData.totalWords,
//         childWords: updateData.childWords,
//         status: updateData.status || 'active',
//         isCompleted: turnNumber >= 7,
//       },
//       // Include assessment data if story is completed
//       ...(turnNumber >= 7 && {
//         assessment: updateData.assessment
//           ? {
//               overallScore: updateData.assessment.overallScore,
//               categoryScores: updateData.assessment.categoryScores,
//               integrityStatus:
//                 updateData.assessment.integrityStatus?.status || 'PASS',
//               completedAt: updateData.completedAt,
//               message: 'Story completed and assessed!',
//               // Include full assessment for frontend
//               fullAssessment: updateData.assessment,
//             }
//           : null,
//       }),
//     };

//     console.log(`✅ Turn ${turnNumber} processed successfully`);
//     return NextResponse.json(responseData);
//   } catch (error) {
//     console.error('Error in story collaboration:', error);
//     return NextResponse.json(
//       { error: 'Failed to process story collaboration' },
//       { status: 500 }
//     );
//   }
// }


// app/api/stories/collaborate/route.ts - Updated for 42-Factor Assessment

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { collaborationEngine } from '@/lib/ai/collaboration';
import { SingleCallAssessmentEngine } from '@/lib/ai/SingleCallAssessmentEngine';
import mongoose from 'mongoose';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const { sessionId, childInput } = await req.json();

    if (!sessionId || !childInput?.trim()) {
      return NextResponse.json(
        { error: 'Session ID and child input are required' },
        { status: 400 }
      );
    }

    const storySession = await StorySession.findOne({
      _id: sessionId,
      childId: session.user.id,
      status: 'active',
    });

    if (!storySession) {
      return NextResponse.json(
        { error: 'Story session not found or not active' },
        { status: 404 }
      );
    }

    if (storySession.apiCallsUsed >= storySession.maxApiCalls) {
      return NextResponse.json(
        { error: 'Maximum story turns reached' },
        { status: 403 }
      );
    }

    const turnNumber = storySession.currentTurn;
    const childWords = childInput.trim().split(/\s+/).filter(Boolean);

    // Build story context for AI
    const previousTurns = await Turn.find({ sessionId })
      .sort({ turnNumber: 1 })
      .limit(6);

    let storyContext = storySession.aiOpening || '';
    previousTurns.forEach((turn) => {
      if (turn.childInput) storyContext += `\n\n${turn.childInput}`;
      if (turn.aiResponse) storyContext += `\n\n${turn.aiResponse}`;
    });

    // Generate AI response
    const aiResponse = await collaborationEngine.generateFreeformResponse(
      childInput.trim(),
      storyContext,
      turnNumber
    );

    // Save the turn
    const newTurn = new Turn({
      sessionId: new mongoose.Types.ObjectId(sessionId),
      turnNumber,
      childInput: childInput.trim(),
      aiResponse: aiResponse,
      timestamp: new Date(),
    });

    await newTurn.save();

    // Update session
    const updateData: any = {
      currentTurn: turnNumber + 1,
      totalWords: storySession.totalWords + childWords.length + (aiResponse ? aiResponse.split(/\s+/).filter(Boolean).length : 0),
      childWords: storySession.childWords + childWords.length,
      apiCallsUsed: storySession.apiCallsUsed + 1,
      updatedAt: new Date(),
    };

    // If this is the final turn, trigger comprehensive 42-factor assessment
    if (turnNumber >= 7) {
      updateData.status = 'completed';
      updateData.completedAt = new Date();
      console.log(`Story completed after ${turnNumber} turns - starting 42-factor assessment`);

      try {
        // Get full story content for assessment
        const allTurns = await Turn.find({ sessionId }).sort({ turnNumber: 1 });
        let fullStoryContent = '';

        if (storySession.aiOpening) {
          fullStoryContent += `${storySession.aiOpening}\n\n`;
        }

        const userTurns = allTurns
          .filter((turn) => turn.childInput)
          .map((turn) => turn.childInput.trim());

        fullStoryContent += userTurns.join('\n\n');

        console.log(`Starting 42-factor assessment for ${fullStoryContent.length} characters`);

        // Perform comprehensive 42-factor assessment
        const assessment = await SingleCallAssessmentEngine.performCompleteAssessment(
          fullStoryContent,
          {
            childAge: 10,
            isCollaborativeStory: true,
            storyTitle: storySession.title || 'Collaborative Story',
            expectedGenre: 'creative',
          }
        );

        console.log(`42-factor assessment completed - Overall Score: ${assessment.overallScore}%`);

        // Create comprehensive assessment data structure
        const comprehensiveAssessment = {
          overallScore: assessment.overallScore,
          status: assessment.status,
          statusMessage: assessment.statusMessage,
          allFactors: {
            grammarSyntax: assessment.coreWritingMechanics?.grammarSyntax,
            vocabularyRange: assessment.coreWritingMechanics?.vocabularyRange,
            spellingPunctuation: assessment.coreWritingMechanics?.spellingPunctuation,
            sentenceStructure: assessment.coreWritingMechanics?.sentenceStructure,
            tenseConsistency: assessment.coreWritingMechanics?.tenseConsistency,
            voiceTone: assessment.coreWritingMechanics?.voiceTone,
            plotDevelopmentPacing: assessment.storyElements?.plotDevelopmentPacing,
            characterDevelopment: assessment.storyElements?.characterDevelopment,
            settingWorldBuilding: assessment.storyElements?.settingWorldBuilding,
            dialogueQuality: assessment.storyElements?.dialogueQuality,
            themeRecognition: assessment.storyElements?.themeRecognition,
            conflictResolution: assessment.storyElements?.conflictResolution,
            originalityCreativity: assessment.creativeSkills?.originalityCreativity,
            imageryDescriptiveWriting: assessment.creativeSkills?.imageryDescriptiveWriting,
            sensoryDetailsUsage: assessment.creativeSkills?.sensoryDetailsUsage,
            metaphorFigurativeLanguage: assessment.creativeSkills?.metaphorFigurativeLanguage,
            emotionalDepth: assessment.creativeSkills?.emotionalDepth,
            showVsTellBalance: assessment.creativeSkills?.showVsTellBalance,
            storyArcCompletion: assessment.structureOrganization?.storyArcCompletion,
            paragraphOrganization: assessment.structureOrganization?.paragraphOrganization,
            transitionsBetweenIdeas: assessment.structureOrganization?.transitionsBetweenIdeas,
            openingClosingEffectiveness: assessment.structureOrganization?.openingClosingEffectiveness,
            logicalFlow: assessment.structureOrganization?.logicalFlow,
            foreshadowing: assessment.advancedElements?.foreshadowing,
            symbolismRecognition: assessment.advancedElements?.symbolismRecognition,
            pointOfViewConsistency: assessment.advancedElements?.pointOfViewConsistency,
            moodAtmosphereCreation: assessment.advancedElements?.moodAtmosphereCreation,
            culturalSensitivity: assessment.advancedElements?.culturalSensitivity,
            writingPatternAnalysis: assessment.aiDetectionAnalysis?.writingPatternAnalysis,
            authenticityMarkers: assessment.aiDetectionAnalysis?.authenticityMarkers,
            ageAppropriateLanguage: assessment.aiDetectionAnalysis?.ageAppropriateLanguage,
            personalVoiceRecognition: assessment.aiDetectionAnalysis?.personalVoiceRecognition,
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
          aiDetectionResult: {
            result: assessment.aiDetectionAnalysis?.overallResult,
            confidenceLevel: assessment.aiDetectionAnalysis?.confidenceLevel,
            analysis: assessment.aiDetectionAnalysis?.authenticityMarkers?.analysis,
          },
          grammarScore: assessment.coreWritingMechanics?.grammarSyntax?.score || 0,
          creativityScore: assessment.creativeSkills?.originalityCreativity?.score || 0,
          vocabularyScore: assessment.coreWritingMechanics?.vocabularyRange?.score || 0,
          assessmentVersion: '3.0-42-factor',
          assessmentDate: new Date().toISOString(),
          assessmentType: 'collaborative',
        };
        updateData.assessment = comprehensiveAssessment;
        updateData.overallScore = assessment.overallScore;
        updateData.status = assessment.status;
      } catch (assessmentError) {
        let message = 'Story completed but assessment could not be generated';
        if (assessmentError && typeof assessmentError === 'object' && 'message' in assessmentError) {
          message = (assessmentError as any).message;
        }
        console.error('42-factor assessment failed for collaborative story:', assessmentError);
        updateData.assessment = {
          error: 'Assessment failed',
          message,
          assessmentVersion: 'error',
        };
      }
    }

    await StorySession.findByIdAndUpdate(sessionId, { $set: updateData });

    return NextResponse.json({
      success: true,
      turn: {
        turnNumber,
        childInput: childInput.trim(),
        aiResponse: aiResponse,
      },
      storyCompleted: turnNumber >= 7,
      assessmentReady: turnNumber >= 7,
    });

  } catch (error) {
    console.error('Collaboration error:', error);
    return NextResponse.json(
      { error: 'Failed to process story collaboration' },
      { status: 500 }
    );
  }
}