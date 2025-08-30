interface AssessmentError extends Error {
  code?: string;
  details?: string;
}

interface StorySessionUpdate {
  assessment?: any;
  overallScore?: number;
  status?: 'active' | 'completed' | 'flagged';
  lastAssessedAt?: Date;
  completedAt?: Date;
  currentTurn?: number;
  totalWords?: number;
  childWords?: number;
  apiCallsUsed?: number;
  updatedAt?: Date;
}
// //api/stories/ai-respond/route.ts
// import { NextResponse } from 'next/server';
// import { connectToDatabase } from '@/utils/db';
// import StorySession from '@/models/StorySession';
// import Turn from '@/models/Turn';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/utils/authOptions';
// import { collaborationEngine } from '@/lib/ai/collaboration';
// import { SingleCallAssessmentEngine } from '@/lib/ai/SingleCallAssessmentEngine';
// import mongoose from 'mongoose';
// import type { NextRequest } from 'next/server';
//     if (!sessionId || !childInput?.trim() || !turnNumber) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     let actualSessionId = sessionId;
//     if (!mongoose.Types.ObjectId.isValid(sessionId)) {
//       const sessionByNumber = await StorySession.findOne({
//         storyNumber: Number(sessionId),
//         childId: session.user.id,
//       });
//       if (!sessionByNumber) {
//         return NextResponse.json(
//           { error: 'Session not found' },
//           { status: 404 }
//         );
//       }
//       actualSessionId = sessionByNumber._id.toString();
//     }

//     const storySession = await StorySession.findOne({
//       _id: actualSessionId,
//       childId: session.user.id,
//       status: 'active',
//     });

//     if (!storySession) {
//       return NextResponse.json(
//         { error: 'Active story session not found' },
//         { status: 404 }
//       );
//     }

//     if (storySession.currentTurn !== turnNumber) {
//       return NextResponse.json(
//         { error: 'Turn number mismatch' },
//         { status: 400 }
//       );
//     }

//     if (storySession.apiCallsUsed >= storySession.maxApiCalls) {
//       return NextResponse.json(
//         { error: 'API call limit reached for this session' },
//         { status: 429 }
//       );
//     }

//     const childWords = childInput.trim().split(/\s+/).filter(Boolean).length;

//     // Check if this completes the story (6 turns)
//     const isStoryComplete = turnNumber >= 6;

//     // Generate AI response
//     let aiResponse = '';
//     if (!isStoryComplete) {
//       const allTurns = await Turn.find({ sessionId: actualSessionId })
//         .sort({ turnNumber: 1 })
//         .lean();

//       const storyContext = allTurns
//         .map((turn) => turn.childInput || turn.aiResponse || '')
//         .filter((content) => content.trim())
//         .join('\n\n');

//       try {
//         aiResponse = await collaborationEngine.generateFreeformResponse(
//           childInput.trim(),
//           storyContext,
//           turnNumber
//         );
//       } catch (error) {
//         console.error('AI response generation failed:', error);
//         aiResponse =
//           "That's a wonderful addition to your story! What happens next?";
//       }
//     }

//     // Create the turn record
//     const newTurn = await Turn.create({
//       sessionId: actualSessionId,
//       turnNumber,
//       childInput: childInput.trim(),
//       aiResponse: !isStoryComplete ? aiResponse : '',
//       wordCount: childWords,
//       createdAt: new Date(),
//     });

//     // Update session with lastModifiedAt
//     const updatedSession = await StorySession.findByIdAndUpdate(
//       actualSessionId,
//       {
//         $set: {
//           currentTurn: isStoryComplete ? turnNumber : turnNumber + 1,
//           totalWords: storySession.totalWords + childWords,
//           childWords: storySession.childWords + childWords,
//           apiCallsUsed: storySession.apiCallsUsed + (isStoryComplete ? 0 : 1),
//           status: isStoryComplete ? 'completed' : 'active',
//           lastModifiedAt: new Date(), // Added this line
//           ...(isStoryComplete && { completedAt: new Date() }),
//         },
//       },
//       { new: true }
//     );

//     if (!updatedSession) {
//       return NextResponse.json(
//         { error: 'Failed to update story session' },
//         { status: 500 }
//       );
//     }

//     let assessment = null;
//     if (isStoryComplete) {
//       try {
//         console.log(
//           '🎯 Story completed! Auto-generating detailed assessment...'
//         );

//         const allTurns = await Turn.find({ sessionId: actualSessionId })
//           .sort({ turnNumber: 1 })
//           .lean();

//         const storyContent = allTurns
//           .filter((turn) => turn.childInput)
//           .map((turn) => turn.childInput)
//           .join(' ');

//         // ✅ FIXED: Use comprehensive assessment engine
//         const comprehensiveAssessment =
//           await SingleCallAssessmentEngine.performCompleteAssessment(
//             storyContent,
//             {
//               childAge: 10,
//               isCollaborativeStory: true,
//               storyTitle: updatedSession.title,
//               expectedGenre: 'creative',
//             }
//           );

//         console.log('✅ Comprehensive assessment completed');
//         console.log(
//           `📊 Overall Score: ${comprehensiveAssessment.overallScore}%`
//         );
//         console.log(
//           `🔍 AI Detection: ${comprehensiveAssessment.integrityAnalysis.aiDetection.aiLikelihood}`
//         );
//         console.log(
//           `⚠️ Integrity Risk: ${comprehensiveAssessment.integrityAnalysis.aiDetection.riskLevel}`
//         );

//         await StorySession.findByIdAndUpdate(actualSessionId, {
//           $set: {
//             assessment: {
//               // Legacy fields for backward compatibility
//               grammarScore:
//                 comprehensiveAssessment.coreWritingSkills.grammar.score,
//               creativityScore:
//                 comprehensiveAssessment.coreWritingSkills.creativity.score,
//               overallScore: comprehensiveAssessment.overallScore,
//               vocabularyScore:
//                 comprehensiveAssessment.coreWritingSkills.vocabulary.score,
//               structureScore:
//                 comprehensiveAssessment.coreWritingSkills.structure.score,
//               characterDevelopmentScore:
//                 comprehensiveAssessment.storyDevelopment.characterDevelopment
//                   .score,
//               plotDevelopmentScore:
//                 comprehensiveAssessment.storyDevelopment.plotDevelopment.score,
//               readingLevel: 75, // Default since not in new structure
//               feedback:
//                 comprehensiveAssessment.comprehensiveFeedback.teacherAssessment,
//               strengths:
//                 comprehensiveAssessment.comprehensiveFeedback.strengths,
//               improvements:
//                 comprehensiveAssessment.comprehensiveFeedback
//                   .areasForEnhancement,
//               vocabularyUsed: [],
//               suggestedWords: [],
//               educationalInsights:
//                 comprehensiveAssessment.comprehensiveFeedback.teacherAssessment,

//               // ✅ ADVANCED INTEGRITY ANALYSIS (The missing piece!)
//               plagiarismScore:
//                 comprehensiveAssessment.integrityAnalysis.plagiarismCheck
//                   .originalityScore,
//               aiDetectionScore:
//                 comprehensiveAssessment.integrityAnalysis.aiDetection
//                   .confidenceLevel,
//               integrityRisk:
//                 comprehensiveAssessment.integrityAnalysis.aiDetection.riskLevel,
//               integrityStatus: {
//                 status: comprehensiveAssessment.integrityAnalysis.overallStatus,
//                 message: comprehensiveAssessment.integrityAnalysis.message,
//               },
//               integrityAnalysis: comprehensiveAssessment.integrityAnalysis,

//               // ✅ ADVANCED ANALYSIS
//               recommendations:
//                 comprehensiveAssessment.comprehensiveFeedback.nextSteps,
//               progressTracking: comprehensiveAssessment.advancedElements,
//               assessmentVersion: '2.0',
//               assessmentDate: new Date().toISOString(),
//             },
//             status:
//               comprehensiveAssessment.integrityAnalysis.aiDetection
//                 .riskLevel === 'critical'
//                 ? 'flagged'
//                 : 'completed',
//             lastAssessedAt: new Date(),
//             assessmentAttempts: 1,
//           },
//         });

//         console.log('✅ Assessment saved to database successfully!');

//         // Return assessment in legacy format for frontend compatibility
//         assessment = {
//           grammarScore: comprehensiveAssessment.coreWritingSkills.grammar.score,
//           creativityScore:
//             comprehensiveAssessment.coreWritingSkills.creativity.score,
//           vocabularyScore:
//             comprehensiveAssessment.coreWritingSkills.vocabulary.score,
//           structureScore:
//             comprehensiveAssessment.coreWritingSkills.structure.score,
//           characterDevelopmentScore:
//             comprehensiveAssessment.storyDevelopment.characterDevelopment.score,
//           plotDevelopmentScore:
//             comprehensiveAssessment.storyDevelopment.plotDevelopment.score,
//           overallScore: comprehensiveAssessment.overallScore,
//           readingLevel: 75, // Default since not in new structure
//           feedback:
//             comprehensiveAssessment.comprehensiveFeedback.teacherAssessment,
//           strengths: comprehensiveAssessment.comprehensiveFeedback.strengths,
//           improvements:
//             comprehensiveAssessment.comprehensiveFeedback.areasForEnhancement,
//           vocabularyUsed: [],
//           suggestedWords: [],
//           educationalInsights:
//             comprehensiveAssessment.comprehensiveFeedback.teacherAssessment,

//           // ✅ NEW: Include integrity analysis for frontend
//           integrityAnalysis: comprehensiveAssessment.integrityAnalysis,
//           integrityStatus: {
//             status: comprehensiveAssessment.integrityAnalysis.overallStatus,
//             message: comprehensiveAssessment.integrityAnalysis.message,
//           },
//         };
//       } catch (error) {
//         console.error('❌ Auto-assessment failed:', error);
//         // Fallback to basic assessment
//         assessment = {
//           grammarScore: 75,
//           creativityScore: 80,
//           vocabularyScore: 70,
//           structureScore: 75,
//           characterDevelopmentScore: 70,
//           plotDevelopmentScore: 75,
//           overallScore: 74,
//           readingLevel: 'Elementary',
//           feedback:
//             'Story completed successfully! Great work on your creative writing.',
//           strengths: ['Creative ideas', 'Story completion'],
//           improvements: ['Continue practicing writing skills'],
//           vocabularyUsed: [],
//           suggestedWords: [],
//           educationalInsights: 'Keep writing and exploring your creativity!',
//           integrityStatus: {
//             status: 'PASS',
//             message: 'Assessment unavailable but story completed',
//           },
//         };
//       }
//     }

//     return NextResponse.json({
//       success: true,
//       turn: newTurn,
//       session: updatedSession,
//       assessment,
//       message: isStoryComplete
//         ? 'Story completed! Assessment generated.'
//         : 'Turn submitted successfully!',
//     });
//   } catch (error) {
//     console.error('Story submission error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// app/api/stories/ai-respond/route.ts - Updated for 42-Factor Assessment

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
        { error: 'Maximum story turns reached. Story is ready for assessment!' },
        { status: 403 }
      );
    }

    const turnNumber = storySession.currentTurn;
    console.log(`Processing turn ${turnNumber} for story session ${sessionId}`);

    // Check if this is the final turn (7th turn triggers assessment)
    if (turnNumber >= 7) {
      console.log('Story has reached completion - triggering comprehensive 42-factor assessment');
      
      try {
        // Get all story content for assessment
        const allTurns = await Turn.find({ sessionId }).sort({ turnNumber: 1 });
        let fullStoryContent = '';

        if (storySession.aiOpening) {
          fullStoryContent += `${storySession.aiOpening}\n\n`;
        }

        // Add current child input
        const allChildInputs = allTurns
          .map((turn) => turn.childInput)
          .filter(Boolean)
          .concat([childInput.trim()]);

        fullStoryContent += allChildInputs.join('\n\n');

        console.log(`Starting final 42-factor assessment for ${fullStoryContent.length} characters`);

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

        console.log(`Final assessment completed - Overall Score: ${assessment.overallScore}%`);

        // Save the final turn
        const finalTurn = new Turn({
          sessionId: new mongoose.Types.ObjectId(sessionId),
          turnNumber,
          childInput: childInput.trim(),
          aiResponse: "Congratulations! You've completed your story! Let's see your comprehensive assessment results.",
          timestamp: new Date(),
        });

        await finalTurn.save();

        // Create comprehensive assessment structure
        const comprehensiveAssessment = {
          overallScore: assessment.overallScore,
          status: assessment.status,
          statusMessage: assessment.statusMessage,
          
          // All 42 factors
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
            
            // Creative Skills (13-18)
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
            
            // AI Detection (29-32)
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
          
          aiDetectionResult: {
            result: assessment.aiDetectionAnalysis?.overallResult,
            confidenceLevel: assessment.aiDetectionAnalysis?.confidenceLevel,
            analysis: assessment.aiDetectionAnalysis?.authenticityMarkers?.analysis,
          },
          
          // Legacy compatibility
          grammarScore: assessment.coreWritingMechanics?.grammarSyntax?.score || 0,
          creativityScore: assessment.creativeSkills?.originalityCreativity?.score || 0,
          vocabularyScore: assessment.coreWritingMechanics?.vocabularyRange?.score || 0,
          
          assessmentVersion: '3.0-42-factor',
          assessmentDate: new Date().toISOString(),
          assessmentType: 'collaborative',
        };

        // Update session with comprehensive assessment and mark as completed
        await StorySession.findByIdAndUpdate(sessionId, {
          $set: {
            status: assessment.status, // Always use AI's determination directly
            completedAt: new Date(),
            currentTurn: turnNumber + 1,
            apiCallsUsed: storySession.apiCallsUsed + 1,
            assessment: {
              ...comprehensiveAssessment,
              note: 'Complete 42-factor analysis provided regardless of status - flagging for admin review only',
            },
            overallScore: assessment.overallScore,
            totalWords: fullStoryContent.split(/\s+/).filter(Boolean).length,
            childWords: allChildInputs.join(' ').split(/\s+/).filter(Boolean).length,
          },
        });

        return NextResponse.json({
          success: true,
          storyCompleted: true,
          assessmentReady: true,
          turn: {
            turnNumber,
            childInput: childInput.trim(),
            aiResponse: finalTurn.aiResponse,
          },
          assessment: {
            overallScore: assessment.overallScore,
            status: assessment.status,
            message: 'Your story has been completed and assessed with our comprehensive 42-factor system!',
          },
        });

      } catch (assessmentError) {
        console.error('42-factor assessment failed for collaborative story:', assessmentError);
        
        // Still save the turn but mark assessment as failed
        const finalTurn = new Turn({
          sessionId: new mongoose.Types.ObjectId(sessionId),
          turnNumber,
          childInput: childInput.trim(),
          aiResponse: "Congratulations! You've completed your story! Assessment will be available shortly.",
          timestamp: new Date(),
        });

        await finalTurn.save();

        await StorySession.findByIdAndUpdate(sessionId, {
          $set: {
            status: 'completed',
            completedAt: new Date(),
            currentTurn: turnNumber + 1,
            apiCallsUsed: storySession.apiCallsUsed + 1,
            assessment: {
              error: 'Assessment temporarily unavailable',
              message: 'Story completed successfully. Assessment will be generated shortly.',
            },
          },
        });

        return NextResponse.json({
          success: true,
          storyCompleted: true,
          assessmentReady: false,
          turn: {
            turnNumber,
            childInput: childInput.trim(),
            aiResponse: finalTurn.aiResponse,
          },
          message: 'Story completed! Assessment will be available shortly.',
        });
      }
    }

    // Normal turn processing (not final turn)
    const childWords = childInput.trim().split(/\s+/).filter(Boolean);

    // Build context for AI response
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
    await StorySession.findByIdAndUpdate(sessionId, {
      $set: {
        currentTurn: turnNumber + 1,
        totalWords: storySession.totalWords + childWords.length + aiResponse.split(/\s+/).filter(Boolean).length,
        childWords: storySession.childWords + childWords.length,
        apiCallsUsed: storySession.apiCallsUsed + 1,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      storyCompleted: false,
      turn: {
        turnNumber,
        childInput: childInput.trim(),
        aiResponse: aiResponse,
      },
      turnsRemaining: Math.max(0, 7 - (turnNumber + 1)),
    });

  } catch (error) {
    console.error('AI respond error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    );
  }
}