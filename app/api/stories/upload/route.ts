// // app/api/stories/upload/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/utils/authOptions';
// import { connectToDatabase } from '@/utils/db';
// import StorySession from '@/models/StorySession';
// import { UsageManager } from '@/lib/usage-manager';
// import { SingleCallAssessmentEngine } from '@/lib/ai/SingleCallAssessmentEngine';

// export async function POST(request: NextRequest) {
//   try {
//     console.log('📝 Story upload request received');

//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== 'child') {
//       return NextResponse.json({ error: 'Access denied' }, { status: 403 });
//     }

//     await connectToDatabase();

//     // CHECK USAGE LIMITS BEFORE PROCESSING UPLOAD
//     const canAssess = await UsageManager.canRequestAssessment(session.user.id);
//     if (!canAssess.allowed) {
//       console.log(`❌ Assessment upload denied: ${canAssess.reason}`);
//       return NextResponse.json(
//         {
//           error: canAssess.reason,
//           upgradeRequired: canAssess.upgradeRequired,
//         },
//         { status: 403 }
//       );
//     }

//     console.log('✅ User can request assessment, proceeding with upload...');

//     const formData = await request.formData();
//     const title = formData.get('title') as string;
//     const content = formData.get('content') as string;
//     const file = formData.get('file') as File | null;

//     console.log('📊 Received data:', {
//       title: !!title,
//       content: !!content,
//       file: !!file,
//     });

//     if (!title?.trim()) {
//       return NextResponse.json(
//         { error: 'Story title is required' },
//         { status: 400 }
//       );
//     }

//     // Handle both pasted content and file upload
//     let storyContent = '';
//     if (content?.trim()) {
//       storyContent = content.trim();
//     } else if (file && file.size > 0) {
//       if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
//         storyContent = await file.text();
//       } else {
//         return NextResponse.json(
//           {
//             error:
//               'For now, please paste your text directly or upload a .txt file',
//           },
//           { status: 400 }
//         );
//       }
//     }

//     if (!storyContent?.trim()) {
//       return NextResponse.json(
//         {
//           error:
//             'Please provide story content by pasting text or uploading a .txt file',
//         },
//         { status: 400 }
//       );
//     }

//     const wordCount = storyContent
//       .trim()
//       .split(/\s+/)
//       .filter((word) => word.length > 0).length;

//     if (wordCount < 50) {
//       return NextResponse.json(
//         {
//           error: 'Story must be at least 50 words long',
//         },
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
//       aiOpening: storyContent.trim(),
//       status: 'completed',
//       totalWords: wordCount,
//       childWords: wordCount,
//       currentTurn: 1,
//       apiCallsUsed: 0,
//       maxApiCalls: 1,
//       isUploadedForAssessment: true,
//       storyType: 'uploaded',
//       competitionEligible: wordCount >= 350 && wordCount <= 2000,
//       assessment: {
//         integrityStatus: {
//           status: 'PASS',
//           message: 'Assessment in progress...',
//         },
//       },
//     });

//     await storySession.save();
//     console.log(`✅ Story saved with ID: ${storySession._id}`);

//     // EXACT SAME AI ASSESSMENT CALL AS FREESTYLE STORIES
//     try {
//       console.log(
//         '🎯 Generating advanced AI assessment for story:',
//         storySession.title
//       );

//       const assessment =
//         await SingleCallAssessmentEngine.performCompleteAssessment(
//           storyContent,
//           {
//             childAge: 10, // default
//             storyTitle: storySession.title,
//             isCollaborativeStory: false,
//             expectedGenre: 'creative',
//           }
//         );

//       console.log('✅ Assessment completed successfully');
//       console.log(`📈 Overall Score: ${assessment.overallScore}%`);

//       // ASSESSMENT DATA STRUCTURE FOR NEW ENGINE
//       const assessmentData = {
//         // Legacy fields for backward compatibility
//         grammarScore: assessment.coreWritingSkills.grammar.score,
//         creativityScore: assessment.coreWritingSkills.creativity.score,
//         vocabularyScore: assessment.coreWritingSkills.vocabulary.score,
//         structureScore: assessment.coreWritingSkills.structure.score,
//         characterDevelopmentScore:
//           assessment.storyDevelopment.characterDevelopment.score,
//         plotDevelopmentScore: assessment.storyDevelopment.plotDevelopment.score,
//         overallScore: assessment.overallScore,
//         readingLevel: 75, // Default since not in new structure
//         feedback: assessment.comprehensiveFeedback.teacherAssessment,
//         strengths: assessment.comprehensiveFeedback.strengths,
//         improvements: assessment.comprehensiveFeedback.areasForEnhancement,
//         vocabularyUsed: [],
//         suggestedWords: [],
//         educationalInsights: assessment.comprehensiveFeedback.teacherAssessment,

//         // Advanced fields
//         integrityAnalysis: assessment.integrityAnalysis,
//         recommendations: assessment.comprehensiveFeedback.nextSteps,
//         progressTracking: assessment.advancedElements,
//         assessmentVersion: '2.0',
//         assessmentDate: new Date().toISOString(),
//       };

//       // Update story session with assessment
//       await StorySession.findByIdAndUpdate(storySession._id, {
//         $set: {
//           assessment: assessmentData,
//           overallScore: assessment.overallScore,
//           grammarScore: assessment.coreWritingSkills.grammar.score,
//           creativityScore: assessment.coreWritingSkills.creativity.score,
//           status:
//             assessment.integrityAnalysis.overallStatus === 'FAIL'
//               ? 'flagged'
//               : 'completed',
//           lastAssessedAt: new Date(),
//           assessmentAttempts: 1,
//         },
//       });

//       await UsageManager.incrementAssessmentRequest(
//         session.user.id,
//         storySession._id.toString()
//       );

//       return NextResponse.json({
//         success: true,
//         storyId: storySession._id,
//         story: {
//           id: storySession._id,
//           title: storySession.title,
//           wordCount,
//           storyNumber: storySession.storyNumber,
//         },
//         assessment: {
//           overallScore: assessment.overallScore,
//           integrityStatus: 'PASS',
//         },
//         message: 'Story uploaded and assessed successfully!',
//       });
//     } catch (assessmentError) {
//       console.error('❌ Assessment failed:', assessmentError);
//       return NextResponse.json(
//         {
//           error: 'AI assessment unavailable. Please try again later.',
//           details:
//             assessmentError instanceof Error
//               ? assessmentError.message
//               : 'Unknown error',
//         },
//         { status: 500 }
//       );
//     }
//   } catch (error) {
//     console.error('❌ Upload error:', error);
//     return NextResponse.json(
//       {
//         error: 'Upload failed',
//         details: error instanceof Error ? error.message : 'Unknown error',
//       },
//       { status: 500 }
//     );
//   }
// }


// app/api/stories/upload/route.ts - Updated for 42-Factor Assessment

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import { UsageManager } from '@/lib/usage-manager';
import { SingleCallAssessmentEngine } from '@/lib/ai/SingleCallAssessmentEngine';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Story upload request received');

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'child') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await connectToDatabase();

    const canAssess = await UsageManager.canRequestAssessment(session.user.id);
    if (!canAssess.allowed) {
      console.log(`❌ Assessment upload denied: ${canAssess.reason}`);
      return NextResponse.json(
        {
          error: canAssess.reason,
          upgradeRequired: canAssess.upgradeRequired,
        },
        { status: 403 }
      );
    }

    console.log('✅ User can request assessment, proceeding with upload...');

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const file = formData.get('file') as File | null;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Story title is required' }, { status: 400 });
    }

    let storyContent = '';
    if (file) {
      // Handle file upload logic here
      storyContent = await file.text();
    } else if (content?.trim()) {
      storyContent = content.trim();
    } else {
      return NextResponse.json({ error: 'Story content is required' }, { status: 400 });
    }

    const wordCount = storyContent.split(/\s+/).filter(Boolean).length;
    if (wordCount < 10) {
      return NextResponse.json({ error: 'Story must be at least 10 words long' }, { status: 400 });
    }

    // Count user's existing stories to set storyNumber
    const userStoryCount = await StorySession.countDocuments({
      childId: session.user.id,
    });
    const nextStoryNumber = userStoryCount + 1;

    // Create story session with required storyNumber
    const storySession = new StorySession({
      childId: session.user.id,
      title: title.trim(),
      content: storyContent,
      storyNumber: nextStoryNumber,
      status: 'completed',
      totalWords: wordCount,
      childWords: wordCount,
      currentTurn: 1,
      isUploadedForAssessment: true,
      storyType: 'uploaded',
      competitionEligible: wordCount >= 350 && wordCount <= 2000,
    });

    await storySession.save();
    console.log(`✅ Story saved with ID: ${storySession._id}`);

    try {
      console.log('🎯 Generating 42-factor AI assessment for story:', storySession.title);

      const assessment = await SingleCallAssessmentEngine.performCompleteAssessment(
        storyContent,
        {
          childAge: 10,
          storyTitle: storySession.title,
          isCollaborativeStory: false,
          expectedGenre: 'creative',
        }
      );

      console.log('✅ 42-factor assessment completed successfully');
      console.log(`📈 Overall Score: ${assessment.overallScore}%`);

      // Store comprehensive 42-factor assessment
      const comprehensiveAssessment = {
        // Overall metrics
        overallScore: assessment.overallScore,
        status: assessment.status,
        statusMessage: assessment.statusMessage,
        
        // All 42 factors organized by category
        coreWritingMechanics: {
          grammarSyntax: assessment.coreWritingMechanics?.grammarSyntax,
          vocabularyRange: assessment.coreWritingMechanics?.vocabularyRange,
          spellingPunctuation: assessment.coreWritingMechanics?.spellingPunctuation,
          sentenceStructure: assessment.coreWritingMechanics?.sentenceStructure,
          tenseConsistency: assessment.coreWritingMechanics?.tenseConsistency,
          voiceTone: assessment.coreWritingMechanics?.voiceTone,
        },
        
        storyElements: {
          plotDevelopmentPacing: assessment.storyElements?.plotDevelopmentPacing,
          characterDevelopment: assessment.storyElements?.characterDevelopment,
          settingWorldBuilding: assessment.storyElements?.settingWorldBuilding,
          dialogueQuality: assessment.storyElements?.dialogueQuality,
          themeRecognition: assessment.storyElements?.themeRecognition,
          conflictResolution: assessment.storyElements?.conflictResolution,
        },
        
        creativeSkills: {
          originalityCreativity: assessment.creativeSkills?.originalityCreativity,
          imageryDescriptiveWriting: assessment.creativeSkills?.imageryDescriptiveWriting,
          sensoryDetailsUsage: assessment.creativeSkills?.sensoryDetailsUsage,
          metaphorFigurativeLanguage: assessment.creativeSkills?.metaphorFigurativeLanguage,
          emotionalDepth: assessment.creativeSkills?.emotionalDepth,
          showVsTellBalance: assessment.creativeSkills?.showVsTellBalance,
        },
        
        structureOrganization: {
          storyArcCompletion: assessment.structureOrganization?.storyArcCompletion,
          paragraphOrganization: assessment.structureOrganization?.paragraphOrganization,
          transitionsBetweenIdeas: assessment.structureOrganization?.transitionsBetweenIdeas,
          openingClosingEffectiveness: assessment.structureOrganization?.openingClosingEffectiveness,
          logicalFlow: assessment.structureOrganization?.logicalFlow,
        },
        
        advancedElements: {
          foreshadowing: assessment.advancedElements?.foreshadowing,
          symbolismRecognition: assessment.advancedElements?.symbolismRecognition,
          pointOfViewConsistency: assessment.advancedElements?.pointOfViewConsistency,
          moodAtmosphereCreation: assessment.advancedElements?.moodAtmosphereCreation,
          culturalSensitivity: assessment.advancedElements?.culturalSensitivity,
        },
        
        aiDetectionAnalysis: {
          writingPatternAnalysis: assessment.aiDetectionAnalysis?.writingPatternAnalysis,
          authenticityMarkers: assessment.aiDetectionAnalysis?.authenticityMarkers,
          ageAppropriateLanguage: assessment.aiDetectionAnalysis?.ageAppropriateLanguage,
          personalVoiceRecognition: assessment.aiDetectionAnalysis?.personalVoiceRecognition,
          overallResult: assessment.aiDetectionAnalysis?.overallResult,
          confidenceLevel: assessment.aiDetectionAnalysis?.confidenceLevel,
        },
        
        educationalFeedback: {
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
        
        // Legacy compatibility fields
        grammarScore: assessment.coreWritingMechanics?.grammarSyntax?.score || 0,
        creativityScore: assessment.creativeSkills?.originalityCreativity?.score || 0,
        vocabularyScore: assessment.coreWritingMechanics?.vocabularyRange?.score || 0,
        structureScore: assessment.coreWritingMechanics?.sentenceStructure?.score || 0,
        
        // Assessment metadata
        assessmentVersion: '3.0-42-factor',
        assessmentDate: new Date().toISOString(),
        assessmentType: 'comprehensive',
      };

      // Update story session with comprehensive assessment
      await StorySession.findByIdAndUpdate(storySession._id, {
        $set: {
          assessment: comprehensiveAssessment,
          overallScore: assessment.overallScore,
          // Status is for admin workflow only, does not affect assessment completeness
          status: assessment.status, // Always store AI's status, do not filter or conditionally set
          lastAssessedAt: new Date(),
        },
      });

      await UsageManager.incrementAssessmentRequest(session.user.id, storySession._id.toString());

      return NextResponse.json({
        success: true,
        storyId: storySession._id,
        story: {
          id: storySession._id,
          title: storySession.title,
          wordCount,
          storyNumber: storySession.storyNumber,
        },
        assessment: {
          overallScore: assessment.overallScore,
          status: assessment.status,
          comprehensiveData: comprehensiveAssessment,
        },
        message: 'Story uploaded and comprehensively assessed with 42 factors!',
      });
      
    } catch (assessmentError) {
      console.error('❌ 42-factor assessment failed:', assessmentError);
      let message = 'Unknown error';
      if (assessmentError && typeof assessmentError === 'object' && 'message' in assessmentError) {
        message = (assessmentError as any).message;
      }
      throw new Error(`Assessment failed: ${message}`);
    }
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json(
      {
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
