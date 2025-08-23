// // app/api/stories/assess/[sessionId]/route.ts - UPDATED FOR SIMPLIFIED ASSESSMENT REQUESTS
// import { NextResponse } from 'next/server';
// import { connectToDatabase } from '@/utils/db';
// import StorySession from '@/models/StorySession';
// import Turn from '@/models/Turn';
// import { AIAssessmentEngine } from '@/lib/ai/ai-assessment-engine';
// import { UsageManager } from '@/lib/usage-manager'; // ADD: Import simplified usage manager
// import type { NextRequest } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/utils/authOptions';
// import mongoose from 'mongoose';

// export async function POST(
//   req: NextRequest,
//   { params }: { params: { sessionId: string } }
// ) {
//   try {
//     await connectToDatabase();
//     const { sessionId } = params;

//     console.log('🔍 Assessment request for sessionId:', sessionId);

//     const userSession = await getServerSession(authOptions);
//     if (!userSession || userSession.user.role !== 'child') {
//       console.log('❌ Unauthorized assessment attempt');
//       return NextResponse.json(
//         { error: 'Access denied. Children only.' },
//         { status: 403 }
//       );
//     }

//     // ADD: Check if user can request assessment using simplified system
//     const canAssess = await UsageManager.canRequestAssessment(userSession.user.id);
//     if (!canAssess.allowed) {
//       console.log(`❌ Assessment request denied: ${canAssess.reason}`);
//       return NextResponse.json(
//         {
//           error: canAssess.reason,
//           upgradeRequired: canAssess.upgradeRequired,
//           usage: canAssess.currentUsage,
//           limits: canAssess.limits
//         },
//         { status: 403 }
//       );
//     }

//     // Find the story session with flexible ID lookup
//     let storySession = null;
//     let actualSessionId = null;

//     if (mongoose.Types.ObjectId.isValid(sessionId)) {
//       storySession = await StorySession.findOne({
//         _id: sessionId,
//         childId: userSession.user.id,
//       });
//       actualSessionId = sessionId;
//     } else if (!isNaN(Number(sessionId))) {
//       storySession = await StorySession.findOne({
//         storyNumber: Number(sessionId),
//         childId: userSession.user.id,
//       });
//       actualSessionId = storySession?._id?.toString();
//     }

//     if (!storySession || !actualSessionId) {
//       console.log('❌ Story session not found:', sessionId);
//       return NextResponse.json({ error: 'Session not found' }, { status: 404 });
//     }

//     // Only allow assessment if story is completed
//     if (storySession.status !== 'completed') {
//       console.log('❌ Story not completed:', storySession.status);
//       return NextResponse.json(
//         {
//           error:
//             'Story not completed. Please finish writing before requesting assessment.',
//         },
//         { status: 400 }
//       );
//     }

//     // SIMPLIFIED: Remove per-story attempt limit check - now handled by total pool
//     const isReassessment = !!storySession.assessment;

//     if (isReassessment) {
//       console.log('🔄 Re-assessment requested for session:', actualSessionId);
//     }

//     console.log('📊 Starting assessment generation...');

//     let storyContent = '';

//     // Handle different story types
//     if (storySession.isUploadedForAssessment) {
//       // For uploaded stories, content is stored in aiOpening
//       storyContent = storySession.aiOpening || '';
//       console.log('📄 Processing uploaded story content');
//     } else {
//       // For collaborative stories, get content from turns
//       const turns = await Turn.find({ sessionId: actualSessionId }).sort({
//         turnNumber: 1,
//       });

//       console.log(`📚 Found ${turns.length} turns for collaborative story`);

//       if (turns.length === 0) {
//         return NextResponse.json(
//           {
//             error:
//               'No story content found. Please write some content before requesting assessment.',
//           },
//           { status: 400 }
//         );
//       }

//       // Aggregate story content from child inputs only
//       storyContent = turns
//         .filter((turn) => turn.childInput?.trim())
//         .map((turn) => turn.childInput.trim())
//         .join('\n\n');
//     }

//     if (!storyContent.trim()) {
//       console.log('❌ No valid story content found');
//       return NextResponse.json(
//         { error: 'No story content available for assessment.' },
//         { status: 400 }
//       );
//     }

//     const wordCount = storyContent.trim().split(/\s+/).filter(Boolean).length;
//     console.log(`📊 Story content: ${wordCount} words`);

//     if (wordCount < 50) {
//       return NextResponse.json(
//         {
//           error:
//             'Story must be at least 50 words long for meaningful assessment.',
//         },
//         { status: 400 }
//       );
//     }

//     try {
//       // Use advanced assessment engine
//       console.log('🚀 Running advanced assessment...');

//       const assessment = await AIAssessmentEngine.assessStory(
//         storyContent,
//         actualSessionId,
//         userSession.user.id
//       );

//       console.log('✅ Assessment completed successfully');
//       console.log(`📈 Overall Score: ${assessment.overallScore}%`);
//       console.log(
//         `🔍 Plagiarism Score: ${assessment.integrityAnalysis.originalityScore}%`
//       );
//       console.log(
//         `🤖 AI Detection Score: ${assessment.integrityAnalysis.aiDetectionResult.overallScore}%`
//       );
//       console.log(
//         `⚠️ Integrity Risk: ${assessment.integrityAnalysis.integrityRisk}`
//       );

//       // Prepare assessment data for storage
//       const assessmentData = {
//         // Legacy fields for backward compatibility
//         grammarScore: assessment.categoryScores.grammar,
//         creativityScore: assessment.categoryScores.creativity,
//         vocabularyScore: assessment.categoryScores.vocabulary,
//         structureScore: assessment.categoryScores.structure,
//         characterDevelopmentScore:
//           assessment.categoryScores.characterDevelopment,
//         plotDevelopmentScore: assessment.categoryScores.plotDevelopment,
//         overallScore: assessment.overallScore,
//         readingLevel: assessment.categoryScores.readingLevel,
//         feedback: assessment.educationalFeedback.teacherComment,
//         strengths: assessment.educationalFeedback.strengths,
//         improvements: assessment.educationalFeedback.improvements,
//         vocabularyUsed: [], // Legacy field
//         suggestedWords: [], // Legacy field
//         educationalInsights: assessment.educationalFeedback.encouragement,

//         // NEW: Advanced integrity fields
//         plagiarismScore: assessment.integrityAnalysis.originalityScore,
//         aiDetectionScore:
//           assessment.integrityAnalysis.aiDetectionResult.overallScore,
//         integrityRisk: assessment.integrityAnalysis.integrityRisk,

//         // Store detailed analysis for admin review
//         integrityAnalysis: {
//           plagiarismResult: {
//             score: assessment.integrityAnalysis.plagiarismResult.overallScore,
//             riskLevel: assessment.integrityAnalysis.plagiarismResult.riskLevel,
//             violationCount:
//               assessment.integrityAnalysis.plagiarismResult.violations
//                 ?.length || 0,
//             detailedAnalysis:
//               assessment.integrityAnalysis.plagiarismResult.detailedAnalysis,
//           },
//           aiDetectionResult: {
//             score: assessment.integrityAnalysis.aiDetectionResult.overallScore,
//             likelihood:
//               assessment.integrityAnalysis.aiDetectionResult.likelihood,
//             confidence:
//               assessment.integrityAnalysis.aiDetectionResult.confidence,
//             indicatorCount:
//               assessment.integrityAnalysis.aiDetectionResult.indicators
//                 ?.length || 0,
//             detailedAnalysis:
//               assessment.integrityAnalysis.aiDetectionResult.detailedAnalysis,
//           },
//         },

//         // Required integrityStatus field
//         integrityStatus: {
//           status: assessment.integrityAnalysis.integrityRisk === 'critical' ? 'FAIL' :
//                   assessment.integrityAnalysis.integrityRisk === 'high' ? 'WARNING' : 'PASS',
//           message: assessment.integrityAnalysis.integrityRisk === 'critical' ?
//                    'Critical integrity issues detected' :
//                    assessment.integrityAnalysis.integrityRisk === 'high' ?
//                    'High integrity risk detected' :
//                    'Integrity check passed'
//         },

//         // Educational enhancements
//         recommendations: assessment.recommendations,
//         progressTracking: assessment.progressTracking,

//         // Assessment metadata
//         assessmentVersion: '2.0', // Mark as advanced assessment
//         assessmentDate: new Date(),
//         isReassessment,
//       };

//       // Save assessment to session
//       const updateData = {
//         assessment: assessmentData,
//         overallScore: assessment.overallScore,
//         grammarScore: assessment.categoryScores.grammar,
//         creativityScore: assessment.categoryScores.creativity,
//         feedback: assessment.educationalFeedback.teacherComment,
//         status:
//           assessment.integrityAnalysis.integrityRisk === 'critical'
//             ? 'flagged'
//             : 'completed',
//         // SIMPLIFIED: Increment assessment attempts but no per-story limit
//         assessmentAttempts: (storySession.assessmentAttempts || 0) + 1,
//         lastAssessedAt: new Date(),
//       };

//       await StorySession.findByIdAndUpdate(
//         actualSessionId,
//         { $set: updateData },
//         { new: true }
//       );

//       // ADD: Increment assessment request counter in simplified system
//       await UsageManager.incrementAssessmentRequest(userSession.user.id, actualSessionId);

//       console.log(`📝 Assessment saved for session: ${actualSessionId}`);

//       // Prepare response with updated usage info
//       const response = {
//         success: true,
//         assessment: {
//           // Full assessment data for frontend
//           overallScore: assessment.overallScore,
//           categoryScores: assessment.categoryScores,
//           integrityAnalysis: {
//             originalityScore: assessment.integrityAnalysis.originalityScore,
//             plagiarismScore:
//               assessment.integrityAnalysis.plagiarismResult.overallScore,
//             aiDetectionScore:
//               assessment.integrityAnalysis.aiDetectionResult.overallScore,
//             integrityRisk: assessment.integrityAnalysis.integrityRisk,
//             plagiarismRiskLevel:
//               assessment.integrityAnalysis.plagiarismResult.riskLevel,
//             aiDetectionLikelihood:
//               assessment.integrityAnalysis.aiDetectionResult.likelihood,
//           },
//           educationalFeedback: assessment.educationalFeedback,
//           recommendations: assessment.recommendations,
//           progressTracking: assessment.progressTracking,

//           // Assessment metadata
//           assessmentDate: new Date(),
//           attemptNumber: (storySession.assessmentAttempts || 0) + 1,
//           // SIMPLIFIED: Remove per-story maxAttempts
//           isReassessment,
//         },
//         // ADD: Include updated usage information
//         usage: {
//           assessmentRequests: canAssess.currentUsage.assessmentRequests + 1,
//           limit: canAssess.limits.assessmentRequests,
//           remaining: canAssess.limits.assessmentRequests - (canAssess.currentUsage.assessmentRequests + 1)
//         },
//         message:
//           assessment.integrityAnalysis.integrityRisk === 'critical'
//             ? 'Assessment completed but story flagged for review due to integrity concerns.'
//             : 'Assessment completed successfully!',
//       };

//       // Add warnings for integrity issues
//       if (assessment.integrityAnalysis.integrityRisk !== 'low') {
//         (response as any).warnings = [];
//         if (assessment.integrityAnalysis.plagiarismResult.riskLevel !== 'low') {
//           (response as any).warnings.push({
//             type: 'plagiarism',
//             message:
//               'Potential plagiarism detected. Please ensure all content is original.',
//             severity: assessment.integrityAnalysis.plagiarismResult.riskLevel,
//             score: assessment.integrityAnalysis.plagiarismResult.overallScore,
//           });
//         }
//         if (
//           assessment.integrityAnalysis.aiDetectionResult.likelihood !==
//             'very_low' &&
//           assessment.integrityAnalysis.aiDetectionResult.likelihood !== 'low'
//         ) {
//           (response as any).warnings.push({
//             type: 'ai_content',
//             message:
//               'Content may be AI-generated. Please submit only your own original writing.',
//             severity: assessment.integrityAnalysis.aiDetectionResult.likelihood,
//             score: assessment.integrityAnalysis.aiDetectionResult.overallScore,
//           });
//         }
//       }

//       return NextResponse.json(response);
//     } catch (assessmentError) {
//       console.error('❌ Assessment generation failed:', assessmentError);

//       // Save error state to session
//       await StorySession.findByIdAndUpdate(actualSessionId, {
//         $set: {
//           assessment: {
//             overallScore: 0,
//             feedback:
//               'Assessment temporarily unavailable. Please try again later.',
//             error: true,
//             errorMessage:
//               assessmentError instanceof Error
//                 ? assessmentError.message
//                 : 'Unknown error',
//             assessmentDate: new Date(),
//             integrityStatus: {
//               status: 'PASS',
//               message: 'Assessment failed - integrity status unknown'
//             }
//           },
//           assessmentAttempts: (storySession.assessmentAttempts || 0) + 1,
//         },
//       });

//       // Still increment usage counter even if assessment fails
//       await UsageManager.incrementAssessmentRequest(userSession.user.id, actualSessionId);

//       return NextResponse.json(
//         {
//           error: 'Assessment generation failed',
//           details:
//             assessmentError instanceof Error
//               ? assessmentError.message
//               : 'Unknown error',
//           retryable: true,
//           // SIMPLIFIED: Show remaining assessment requests instead of per-story attempts
//           usage: {
//             assessmentRequests: canAssess.currentUsage.assessmentRequests + 1,
//             limit: canAssess.limits.assessmentRequests,
//             remaining: canAssess.limits.assessmentRequests - (canAssess.currentUsage.assessmentRequests + 1)
//           }
//         },
//         { status: 500 }
//       );
//     }
//   } catch (error) {
//     console.error('❌ Assessment endpoint error:', error);
//     return NextResponse.json(
//       {
//         error: 'Failed to process assessment request',
//         details: error instanceof Error ? error.message : 'Unknown error',
//       },
//       { status: 500 }
//     );
//   }
// }

// // GET endpoint to retrieve existing assessment (keep existing functionality)
// export async function GET(
//   req: NextRequest,
//   { params }: { params: { sessionId: string } }
// ) {
//   try {
//     await connectToDatabase();
//     const { sessionId } = params;

//     const userSession = await getServerSession(authOptions);
//     if (!userSession || userSession.user.role !== 'child') {
//       return NextResponse.json(
//         { error: 'Access denied. Children only.' },
//         { status: 403 }
//       );
//     }

//     // Find the story session
//     let storySession = null;

//     if (mongoose.Types.ObjectId.isValid(sessionId)) {
//       storySession = await StorySession.findOne({
//         _id: sessionId,
//         childId: userSession.user.id,
//       });
//     } else if (!isNaN(Number(sessionId))) {
//       storySession = await StorySession.findOne({
//         storyNumber: Number(sessionId),
//         childId: userSession.user.id,
//       });
//     }

//     if (!storySession) {
//       return NextResponse.json({ error: 'Session not found' }, { status: 404 });
//     }

//     if (!storySession.assessment) {
//       // SIMPLIFIED: Check if user can make assessment requests instead of per-story attempts
//       const canAssess = await UsageManager.canRequestAssessment(userSession.user.id);

//       return NextResponse.json(
//         {
//           error: 'No assessment available for this story',
//           canAssess: storySession.status === 'completed' && canAssess.allowed,
//           usage: canAssess.currentUsage,
//           limits: canAssess.limits,
//           message: canAssess.allowed ?
//             'You can request an assessment for this story' :
//             canAssess.reason
//         },
//         { status: 404 }
//       );
//     }

//     // Return existing assessment (keep existing response structure)
//     const response = {
//       success: true,
//       assessment: {
//         overallScore: storySession.assessment.overallScore || 0,
//         categoryScores: {
//           grammar: storySession.assessment.grammarScore || 0,
//           creativity: storySession.assessment.creativityScore || 0,
//           vocabulary: storySession.assessment.vocabularyScore || 0,
//           structure: storySession.assessment.structureScore || 0,
//           characterDevelopment:
//             storySession.assessment.characterDevelopmentScore || 0,
//           plotDevelopment: storySession.assessment.plotDevelopmentScore || 0,
//           readingLevel: storySession.assessment.readingLevel || 'Not assessed',
//         },
//         integrityAnalysis: {
//           originalityScore: storySession.assessment.plagiarismScore || 0,
//           plagiarismScore: storySession.assessment.plagiarismScore || 0,
//           aiDetectionScore: storySession.assessment.aiDetectionScore || 0,
//           integrityRisk: storySession.assessment.integrityRisk || 'unknown',
//           plagiarismRiskLevel:
//             storySession.assessment.integrityAnalysis?.plagiarismResult
//               ?.riskLevel || 'unknown',
//           aiDetectionLikelihood:
//             storySession.assessment.integrityAnalysis?.aiDetectionResult
//               ?.likelihood || 'unknown',
//         },
//         educationalFeedback: {
//           teacherComment: storySession.assessment.feedback || '',
//           strengths: storySession.assessment.strengths || [],
//           improvements: storySession.assessment.improvements || [],
//           encouragement: storySession.assessment.educationalInsights || '',
//           nextSteps: [],
//         },
//         recommendations: storySession.assessment.recommendations || {
//           immediate: [],
//           longTerm: [],
//           practiceExercises: [],
//         },
//         progressTracking: storySession.assessment.progressTracking || null,

//         // Assessment metadata
//         assessmentDate:
//           storySession.assessment.assessmentDate || storySession.lastAssessedAt,
//         attemptNumber: storySession.assessmentAttempts || 1,
//         // SIMPLIFIED: Remove maxAttempts from response
//         isReassessment: storySession.assessmentAttempts > 1,
//       },
//       storyInfo: {
//         id: storySession._id,
//         title: storySession.title,
//         storyNumber: storySession.storyNumber,
//         status: storySession.status,
//         wordCount: storySession.totalWords || 0,
//         userWordCount: storySession.childWords || 0,
//         createdAt: storySession.createdAt,
//         completedAt: storySession.completedAt,
//       },
//     };

//     return NextResponse.json(response);
//   } catch (error) {
//     console.error('❌ Get assessment error:', error);
//     return NextResponse.json(
//       {
//         error: 'Failed to retrieve assessment',
//         details: error instanceof Error ? error.message : 'Unknown error',
//       },
//       { status: 500 }
//     );
//   }
// }

// app/api/stories/assess/[sessionId]/route.ts - CORRECTED WITH EXACT SIGNATURE
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import { AIAssessmentEngine } from '@/lib/ai/ai-assessment-engine';
import { UsageManager } from '@/lib/usage-manager';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import mongoose from 'mongoose';

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    await connectToDatabase();
    const { sessionId } = params;

    console.log('🔍 Assessment request for sessionId:', sessionId);

    const userSession = await getServerSession(authOptions);
    if (!userSession || userSession.user.role !== 'child') {
      console.log('❌ Unauthorized assessment attempt');
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    // SIMPLIFIED POOL SYSTEM: Check total pool of assessments
    const canAssess = await UsageManager.canRequestAssessment(
      userSession.user.id
    );
    if (!canAssess.allowed) {
      console.log(`❌ Assessment request denied: ${canAssess.reason}`);
      return NextResponse.json(
        {
          error: canAssess.reason,
          upgradeRequired: canAssess.upgradeRequired,
          usage: canAssess.currentUsage,
          limits: canAssess.limits,
        },
        { status: 403 }
      );
    }

    // Find the story session with flexible ID lookup
    let storySession = null;
    let actualSessionId = null;

    if (mongoose.Types.ObjectId.isValid(sessionId)) {
      storySession = await StorySession.findOne({
        _id: sessionId,
        childId: userSession.user.id,
      });
      actualSessionId = sessionId;
    } else if (!isNaN(Number(sessionId))) {
      storySession = await StorySession.findOne({
        storyNumber: Number(sessionId),
        childId: userSession.user.id,
      });
      actualSessionId = storySession?._id?.toString();
    }

    if (!storySession || !actualSessionId) {
      console.log('❌ Story session not found:', sessionId);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Only allow assessment if story is completed
    if (storySession.status !== 'completed') {
      console.log('❌ Story not completed:', storySession.status);
      return NextResponse.json(
        {
          error:
            'Story not completed. Please finish writing before requesting assessment.',
        },
        { status: 400 }
      );
    }

    // SIMPLIFIED POOL SYSTEM: No per-story limits, just check total pool
    const isReassessment = !!(storySession as any).assessment?.overallScore;

    if (isReassessment) {
      console.log('🔄 Re-assessment requested for session:', actualSessionId);
      console.log('ℹ️ Using simple pool system - no per-story limits');
    } else {
      console.log(
        '🆕 Initial assessment requested for session:',
        actualSessionId
      );
    }

    // Get story content based on story type
    let storyContent = '';

    if (
      (storySession as any).isUploadedForAssessment &&
      (storySession as any).aiOpening
    ) {
      // For uploaded stories, content is in aiOpening
      storyContent = (storySession as any).aiOpening;
      console.log('📄 Processing uploaded story content');
    } else {
      // For collaborative stories, get all turns
      const turns = await Turn.find({ sessionId: actualSessionId })
        .sort({ turnNumber: 1 })
        .lean();

      console.log(`📚 Found ${turns.length} turns for collaborative story`);

      if (turns.length === 0) {
        return NextResponse.json(
          {
            error:
              'No story content found. Please write some content before requesting assessment.',
          },
          { status: 400 }
        );
      }

      // For collaborative stories, use only child inputs
      const childInputs = turns
        .filter((turn: any) => turn.childInput?.trim())
        .map((turn: any) => turn.childInput.trim());

      if (childInputs.length === 0) {
        return NextResponse.json(
          { error: 'No user content found for assessment.' },
          { status: 400 }
        );
      }

      storyContent = childInputs.join('\n\n');
    }

    if (!storyContent.trim()) {
      return NextResponse.json(
        {
          error:
            'Story content is empty. Please add content before assessment.',
        },
        { status: 400 }
      );
    }

    console.log(`📝 Story content length: ${storyContent.length} characters`);

    // CORRECTED: Use exact method signature from your existing code
    console.log('🤖 Starting AI assessment...');

    const assessment = await AIAssessmentEngine.assessStory(
      storyContent, // Parameter 1: storyContent
      actualSessionId, // Parameter 2: sessionId
      userSession.user.id // Parameter 3: userId
    );

    console.log('✅ Assessment completed successfully');
    console.log(`📈 Overall Score: ${assessment.overallScore}%`);
    console.log(
      `🔍 Plagiarism Score: ${assessment.integrityAnalysis.originalityScore}%`
    );
    console.log(
      `🤖 AI Detection Score: ${assessment.integrityAnalysis.aiDetectionResult.overallScore}%`
    );
    console.log(
      `⚠️ Integrity Risk: ${assessment.integrityAnalysis.integrityRisk}`
    );

    // POOL SYSTEM: Record assessment request (any type - upload or re-assess)
    await UsageManager.incrementAssessmentRequest(
      userSession.user.id,
      actualSessionId
    );

    // Prepare assessment data for storage (matching your existing structure)
    const assessmentData = {
      // Legacy fields for backward compatibility
      grammarScore: assessment.categoryScores.grammar,
      creativityScore: assessment.categoryScores.creativity,
      vocabularyScore: assessment.categoryScores.vocabulary,
      structureScore: assessment.categoryScores.structure,
      characterDevelopmentScore: assessment.categoryScores.characterDevelopment,
      plotDevelopmentScore: assessment.categoryScores.plotDevelopment,
      overallScore: assessment.overallScore,
      readingLevel: assessment.categoryScores.readingLevel,
      feedback: assessment.educationalFeedback.teacherComment,
      strengths: assessment.educationalFeedback.strengths,
      improvements: assessment.educationalFeedback.improvements,
      vocabularyUsed: [],
      suggestedWords: [],
      educationalInsights: assessment.educationalFeedback.encouragement,

      // NEW: Additional assessment categories
      descriptiveWritingScore: assessment.categoryScores.descriptiveWriting,
      sensoryDetailsScore: assessment.categoryScores.sensoryDetails,
      plotLogicScore: assessment.categoryScores.plotLogic,
      causeEffectScore: assessment.categoryScores.causeEffect,
      problemSolvingScore: assessment.categoryScores.problemSolving,
      themeRecognitionScore: assessment.categoryScores.themeRecognition,
      ageAppropriatenessScore: assessment.categoryScores.ageAppropriateness,

      // NEW: Full category scores object for advanced assessment display
      categoryScores: assessment.categoryScores,

      // Advanced fields
      plagiarismScore: assessment.integrityAnalysis.originalityScore,
      aiDetectionScore:
        assessment.integrityAnalysis.aiDetectionResult.overallScore,
      integrityRisk: assessment.integrityAnalysis.integrityRisk,
      integrityAnalysis: assessment.integrityAnalysis,
      recommendations: assessment.recommendations,
      progressTracking: assessment.progressTracking,
      assessmentVersion: '2.0',
      assessmentDate: new Date().toISOString(),
    };

    // Update story session with assessment results - HUMAN-FIRST APPROACH
    const updateData = {
      assessment: assessmentData,
      overallScore: assessment.overallScore,
      grammarScore: assessment.categoryScores.grammar,
      creativityScore: assessment.categoryScores.creativity,
      lastAssessedAt: new Date(),
      // HUMAN-FIRST: Always keep as completed, add flags for mentor review
      status: 'completed',
      // Add integrity flags for mentor/admin review if concerns exist
      ...((assessment.integrityAnalysis?.integrityRisk === 'critical' ||
        assessment.integrityAnalysis?.integrityRisk === 'high' ||
        assessment.integrityAnalysis?.aiDetectionResult?.likelihood ===
          'high' ||
        assessment.integrityAnalysis?.aiDetectionResult?.likelihood ===
          'very_high') && {
        integrityFlags: {
          needsReview: true,
          aiDetectionLevel:
            assessment.integrityAnalysis.aiDetectionResult?.likelihood ||
            'unknown',
          plagiarismRisk:
            assessment.integrityAnalysis.plagiarismResult?.riskLevel || 'low',
          integrityRisk: assessment.integrityAnalysis.integrityRisk,
          flaggedAt: new Date(),
          reviewStatus: 'pending_mentor_review',
        },
      }),
      // POOL SYSTEM: Just increment total attempts, no per-story restrictions
      $inc: { assessmentAttempts: 1 },
    };

    await StorySession.findByIdAndUpdate(actualSessionId, updateData);

    console.log('✅ Assessment completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Story assessed successfully',
      assessment: assessmentData,
      sessionId: actualSessionId,
      isReassessment,
      attemptsUsed: ((storySession as any).assessmentAttempts || 0) + 1,
      // POOL SYSTEM: Can reassess any story as long as pool has credits
      canRequestMore:
        canAssess.currentUsage?.assessmentRequests <
        canAssess.limits?.assessmentRequests,
      poolCreditsRemaining:
        canAssess.limits?.assessmentRequests -
        (canAssess.currentUsage?.assessmentRequests || 0) -
        1,
    });
  } catch (error) {
    console.error('❌ Assessment error:', error);
    return NextResponse.json(
      {
        error:
          'Assessment service temporarily unavailable. Please try again later.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check assessment eligibility
export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    await connectToDatabase();
    const { sessionId } = params;

    const userSession = await getServerSession(authOptions);
    if (!userSession || userSession.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    // Check if user can request assessment using pool system
    const canAssess = await UsageManager.canRequestAssessment(
      userSession.user.id
    );

    // Find the story
    let storySession = null;
    if (mongoose.Types.ObjectId.isValid(sessionId)) {
      storySession = await StorySession.findOne({
        _id: sessionId,
        childId: userSession.user.id,
      }).lean();
    } else if (!isNaN(Number(sessionId))) {
      storySession = await StorySession.findOne({
        storyNumber: Number(sessionId),
        childId: userSession.user.id,
      }).lean();
    }

    if (!storySession) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Check story eligibility
    const isCompleted = (storySession as any).status === 'completed';
    const hasAssessment = !!(storySession as any).assessment?.overallScore;

    return NextResponse.json({
      success: true,
      eligible: canAssess.allowed && isCompleted,
      canAssess: canAssess.allowed,
      isCompleted,
      hasAssessment,
      isReassessment: hasAssessment,
      usage: canAssess.currentUsage,
      limits: canAssess.limits,
      reason: !canAssess.allowed
        ? canAssess.reason
        : !isCompleted
          ? 'Story must be completed before assessment'
          : undefined,
      upgradeRequired: canAssess.upgradeRequired,
      currentAttempts: (storySession as any).assessmentAttempts || 0,
      poolCreditsRemaining:
        canAssess.limits?.assessmentRequests -
        (canAssess.currentUsage?.assessmentRequests || 0),
    });
  } catch (error) {
    console.error('❌ Error checking assessment eligibility:', error);
    return NextResponse.json(
      { error: 'Failed to check assessment eligibility' },
      { status: 500 }
    );
  }
}
