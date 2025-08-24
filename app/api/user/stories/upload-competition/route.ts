// // // app/api/user/stories/upload-competition/route.ts
// // import { NextRequest, NextResponse } from 'next/server';
// // import { getServerSession } from 'next-auth';
// // import { authOptions } from '@/utils/authOptions';
// // import { connectToDatabase } from '@/utils/db';
// // import StorySession from '@/models/StorySession';
// // import User from '@/models/User';
// // import { UsageManager } from '@/lib/usage-manager';
// // import { competitionManager } from '@/lib/competition-manager';

// // export async function POST(request: NextRequest) {
// //   try {
// //     const session = await getServerSession(authOptions);
// //     if (!session || session.user.role !== 'child') {
// //       return NextResponse.json(
// //         { error: 'Access denied. Children only.' },
// //         { status: 403 }
// //       );
// //     }

// //     await connectToDatabase();

// //     // Check competition eligibility
// //     const competitionCheck = await UsageManager.canEnterCompetition(
// //       session.user.id
// //     );
// //     if (!competitionCheck.allowed) {
// //       return NextResponse.json(
// //         { error: competitionCheck.reason },
// //         { status: 403 }
// //       );
// //     }

// //     // Get current competition
// //     const currentCompetition = await competitionManager.getCurrentCompetition();
// //     if (!currentCompetition || currentCompetition.phase !== 'submission') {
// //       return NextResponse.json(
// //         { error: 'No active competition or submission phase has ended' },
// //         { status: 400 }
// //       );
// //     }

// //     // Parse form data
// //     const formData = await request.formData();
// //     const title = formData.get('title') as string;
// //     const file = formData.get('file') as File | null;
// //     const content = formData.get('content') as string | null;

// //     if (!title?.trim()) {
// //       return NextResponse.json(
// //         { error: 'Story title is required' },
// //         { status: 400 }
// //       );
// //     }

// //     let storyContent = '';

// //     // Handle file upload or direct content
// //     if (file && file.size > 0) {
// //       // Accept all file types - PDF, DOCX, TXT
// //       if (file.size > 10 * 1024 * 1024) {
// //         return NextResponse.json(
// //           { error: 'File size must be less than 10MB' },
// //           { status: 400 }
// //         );
// //       }

// //       try {
// //         // Read all file types as text for now
// //         storyContent = await file.text();
// //       } catch (error) {
// //         return NextResponse.json(
// //           { error: 'Failed to read file. Please try uploading again.' },
// //           { status: 400 }
// //         );
// //       }
// //     } else if (content?.trim()) {
// //       storyContent = content.trim();
// //     } else {
// //       return NextResponse.json(
// //         { error: 'Please provide story content' },
// //         { status: 400 }
// //       );
// //     }

// //     // Validate story content
// //     if (!storyContent.trim()) {
// //       return NextResponse.json(
// //         { error: 'Story content cannot be empty' },
// //         { status: 400 }
// //       );
// //     }

// //     // Word count validation for competition
// //     const wordCount = storyContent.trim().split(/\s+/).filter(Boolean).length;
// //     if (wordCount < 100) {
// //       return NextResponse.json(
// //         { error: 'Competition stories must be at least 100 words' },
// //         { status: 400 }
// //       );
// //     }

// //     if (wordCount > 2000) {
// //       return NextResponse.json(
// //         { error: 'Competition stories must be less than 2000 words' },
// //         { status: 400 }
// //       );
// //     }

// //     // Get user for story number generation
// //     const user = await User.findById(session.user.id);
// //     if (!user) {
// //       return NextResponse.json({ error: 'User not found' }, { status: 404 });
// //     }

// //     // Get next story number
// //     const lastSession = await StorySession.findOne({ childId: session.user.id })
// //       .sort({ storyNumber: -1 })
// //       .select('storyNumber')
// //       .lean() as { storyNumber?: number } | null;

// //     const nextStoryNumber = (lastSession?.storyNumber || 0) + 1;

// //     // Create story session for competition
// //     const storySession = await StorySession.create({
// //       childId: session.user.id,
// //       storyNumber: nextStoryNumber,
// //       title: title.trim(),
// //       currentTurn: 7, // Mark as complete
// //       totalWords: wordCount,
// //       childWords: wordCount,
// //       apiCallsUsed: 0,
// //       maxApiCalls: 0,
// //       status: 'completed',
// //       aiOpening: storyContent, // Store the uploaded content
// //       completedAt: new Date(),

// //       // Publication fields - Don't auto-publish, let user pay $10
// //       isPublished: false, // User must pay $10 to publish in anthology
// //       competitionEligible: true, // Free competition eligibility

// //       // Competition entry
// //       competitionEntries: [
// //         {
// //           competitionId: currentCompetition._id,
// //           submittedAt: new Date(),
// //           phase: 'submission',
// //         },
// //       ],
// //     });

// //     // Increment competition entry counter
// //     await UsageManager.incrementCompetitionEntry(session.user.id);

// //     return NextResponse.json({
// //       success: true,
// //       story: {
// //         id: storySession._id,
// //         title: storySession.title,
// //         storyNumber: storySession.storyNumber,
// //         wordCount,
// //         submittedToCompetition: true,
// //         competitionId: currentCompetition._id,
// //         isPublished: false,
// //         competitionEligible: true,
// //       },
// //       message: 'Story uploaded and submitted to competition successfully! You can pay $10 to publish it in our anthology.',
// //     });
// //   } catch (error) {
// //     console.error('Competition upload error:', error);
// //     return NextResponse.json(
// //       {
// //         error: 'Failed to upload story for competition',
// //         details: error instanceof Error ? error.message : 'Unknown error',
// //       },
// //       { status: 500 }
// //     );
// //   }
// // }

// // app/api/user/stories/upload-competition/route.ts - FIXED TO UPDATE COMPETITION STATS
// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/utils/authOptions';
// import { connectToDatabase } from '@/utils/db';
// import StorySession from '@/models/StorySession';
// import Competition from '@/models/Competition';
// import User from '@/models/User';
// import { UsageManager } from '@/lib/usage-manager';
// import { competitionManager } from '@/lib/competition-manager';
// import pdfParse from 'pdf-parse';
// import mammoth from 'mammoth';

// async function extractTextFromFile(file: File): Promise<string> {
//   const fileName = file.name.toLowerCase();
//   const fileType = file.type.toLowerCase();

//   try {
//     if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
//       return await file.text();
//     } else if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
//       const arrayBuffer = await file.arrayBuffer();
//       const buffer = Buffer.from(arrayBuffer);
//       const pdfData = await pdfParse(buffer);
//       return pdfData.text.trim();
//     } else if (
//       fileName.endsWith('.docx') ||
//       fileType.includes('wordprocessingml')
//     ) {
//       const arrayBuffer = await file.arrayBuffer();
//       const buffer = Buffer.from(arrayBuffer);
//       const result = await mammoth.extractRawText({ buffer });
//       return result.value.trim();
//     } else {
//       throw new Error(
//         'Unsupported file type. Please upload .txt, .pdf, or .docx files only.'
//       );
//     }
//   } catch (error) {
//     throw new Error(
//       'Failed to extract text from file. Please try a different file or paste text directly.'
//     );
//   }
// }

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

//     // Parse form data
//     const formData = await request.formData();
//     const title = formData.get('title') as string;
//     const file = formData.get('file') as File | null;
//     const content = formData.get('content') as string | null;

//     if (!title?.trim()) {
//       return NextResponse.json(
//         { error: 'Story title is required' },
//         { status: 400 }
//       );
//     }

//     let storyContent = '';

//     // Handle file upload or direct content
//     if (file && file.size > 0) {
//       if (file.size > 10 * 1024 * 1024) {
//         return NextResponse.json(
//           { error: 'File size must be less than 10MB' },
//           { status: 400 }
//         );
//       }

//       try {
//         storyContent = await extractTextFromFile(file);
//         if (!storyContent || storyContent.trim().length < 10) {
//           throw new Error('No readable text found in file');
//         }
//         storyContent = storyContent.trim().replace(/\s+/g, ' ');
//       } catch (error) {
//         return NextResponse.json(
//           {
//             error: `Failed to read ${file.name}. Please try uploading a different file or paste text directly.`,
//           },
//           { status: 400 }
//         );
//       }
//     } else if (content?.trim()) {
//       storyContent = content.trim();
//     } else {
//       return NextResponse.json(
//         {
//           error:
//             'Please provide story content by uploading a file or pasting text.',
//         },
//         { status: 400 }
//       );
//     }

//     if (!storyContent.trim()) {
//       return NextResponse.json(
//         { error: 'Story content cannot be empty' },
//         { status: 400 }
//       );
//     }

//     // Word count validation for competition
//     const wordCount = storyContent.trim().split(/\s+/).filter(Boolean).length;

//     if (wordCount < 100) {
//       return NextResponse.json(
//         { error: 'Competition stories must be at least 100 words' },
//         { status: 400 }
//       );
//     }

//     if (wordCount > 2000) {
//       return NextResponse.json(
//         { error: 'Competition stories must be less than 2000 words' },
//         { status: 400 }
//       );
//     }

//     // Get user for story number generation
//     const user = await User.findById(session.user.id);
//     if (!user) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }

//     // Get next story number
//     const lastSession = (await StorySession.findOne({
//       childId: session.user.id,
//     })
//       .sort({ storyNumber: -1 })
//       .select('storyNumber')
//       .lean()) as { storyNumber?: number } | null;

//     const nextStoryNumber = (lastSession?.storyNumber || 0) + 1;

//     // Create story session for competition
//     const storySession = await StorySession.create({
//       childId: session.user.id,
//       storyNumber: nextStoryNumber,
//       title: title.trim(),
//       currentTurn: 7, // Mark as complete
//       totalWords: wordCount,
//       childWords: wordCount,
//       apiCallsUsed: 0,
//       maxApiCalls: 0,
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

//     console.log(`✅ Competition story saved with ID: ${storySession._id}`);

//     // 🔧 CRITICAL FIX: Update competition statistics properly
//     // Count existing submissions for this user to determine if this is their first submission
//     const userSubmissionsCount = await StorySession.countDocuments({
//       childId: session.user.id,
//       'competitionEntries.competitionId': currentCompetition._id,
//     });

//     const isFirstSubmissionFromUser = userSubmissionsCount === 1;

//     // Update competition totals
//     await Competition.findByIdAndUpdate(currentCompetition._id, {
//       $inc: {
//         totalSubmissions: 1,
//         ...(isFirstSubmissionFromUser && { totalParticipants: 1 }),
//       },
//     });

//     console.log(
//       `📊 Updated competition stats: +1 submission${isFirstSubmissionFromUser ? ', +1 participant' : ''}`
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
//         isPublished: false,
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

// app/api/user/stories/upload-competition/route.ts - FIXED (Text Only)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Competition from '@/models/Competition';
import User from '@/models/User';
import { UsageManager } from '@/lib/usage-manager';
import { competitionManager } from '@/lib/competition-manager';
import { ComprehensiveAssessmentEngine } from '@/lib/ai/comprehensive-assessment-engine';

export async function POST(request: NextRequest) {
  try {
    console.log('🏆 Competition story upload request received');

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Check competition eligibility
    const competitionCheck = await UsageManager.canEnterCompetition(
      session.user.id
    );
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

    if (!storyContent) {
      return NextResponse.json(
        { error: 'Story content cannot be empty' },
        { status: 400 }
      );
    }

    // Word count validation for competition
    const wordCount = storyContent.split(/\s+/).filter(Boolean).length;

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

    // Get user for story number generation
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get next story number
    const userStoryCount = await StorySession.countDocuments({
      childId: session.user.id,
    });
    const nextStoryNumber = userStoryCount + 1;

    // ✅ CRITICAL: Run AI Assessment BEFORE allowing competition entry
    console.log('🤖 Running ADVANCED AI Assessment for competition entry...');

    let assessmentResult;
    try {
      assessmentResult = await ComprehensiveAssessmentEngine.performCompleteAssessment(
        storyContent,
        {
          childAge: 10, // default
          isCollaborativeStory: false,
          storyTitle: title,
          expectedGenre: 'creative',
        }
      );

      console.log(
        `📊 Competition Assessment - Overall: ${assessmentResult.overallScore}%`
      );
      console.log(
        `🔍 AI Detection: ${assessmentResult.integrityAnalysis.aiDetection.aiLikelihood}`
      );
      console.log(
        `⚠️ Integrity Risk: ${assessmentResult.integrityAnalysis.aiDetection.riskLevel}`
      );

      // ✅ ASSESSMENT COMPLETE: Save with full assessment data
      // No blocking - let competition-manager filter later through tier system
    } catch (error) {
      console.error('❌ AI Assessment failed for competition entry:', error);

      // For competition entries, we should fail safely rather than allow potentially problematic content
      return NextResponse.json(
        {
          error: 'Unable to verify story quality and integrity',
          details:
            'Please try submitting again. If the problem persists, contact support.',
        },
        { status: 500 }
      );
    }

    // ✅ CREATE STORY SESSION WITH FULL ASSESSMENT DATA
    const storySession = await StorySession.create({
      childId: session.user.id,
      storyNumber: nextStoryNumber,
      title: title.trim(),
      currentTurn: 7, // Mark as complete
      totalWords: wordCount,
      childWords: wordCount,
      apiCallsUsed: 0,
      maxApiCalls: 0,
      status: 'completed',
      aiOpening: storyContent,
      completedAt: new Date(),
      isUploadedForAssessment: false,
      storyType: 'competition',
      competitionEligible: true,

      // ✅ STORE COMPLETE ASSESSMENT DATA
      assessment: {
        grammarScore: assessmentResult.coreWritingSkills.grammar.score,
        creativityScore: assessmentResult.coreWritingSkills.creativity.score,
        vocabularyScore: assessmentResult.coreWritingSkills.vocabulary.score,
        structureScore: assessmentResult.coreWritingSkills.structure.score,
        characterDevelopmentScore: assessmentResult.storyDevelopment.characterDevelopment.score,
        plotDevelopmentScore: assessmentResult.storyDevelopment.plotDevelopment.score,
        overallScore: assessmentResult.overallScore,
        readingLevel: 75, // Default since not in new structure
        feedback: assessmentResult.comprehensiveFeedback.teacherAssessment,
        strengths: assessmentResult.comprehensiveFeedback.strengths,
        improvements: assessmentResult.comprehensiveFeedback.areasForEnhancement,

        // ✅ INTEGRITY ANALYSIS (The missing piece!)
        plagiarismScore: assessmentResult.integrityAnalysis.plagiarismCheck.originalityScore,
        aiDetectionScore: assessmentResult.integrityAnalysis.aiDetection.confidenceLevel,
        integrityRisk: assessmentResult.integrityAnalysis.aiDetection.riskLevel,
        integrityStatus: {
          status: assessmentResult.integrityAnalysis.overallStatus,
          message: assessmentResult.integrityAnalysis.message
        },
        integrityAnalysis: assessmentResult.integrityAnalysis,

        // ✅ ADVANCED ANALYSIS
        recommendations: assessmentResult.comprehensiveFeedback.nextSteps,
        progressTracking: assessmentResult.advancedElements,
        assessmentVersion: '2.0',
        assessmentDate: new Date().toISOString(),
      },

      competitionEntries: [
        {
          competitionId: currentCompetition._id,
          submittedAt: new Date(),
          phase: 'submission',
        },
      ],
    });

    // ✅ USE COMPETITION MANAGER for stats update
    await competitionManager.updateCompetitionStats(currentCompetition._id);

    return NextResponse.json({
      success: true,
      storyId: storySession._id,
      story: {
        id: storySession._id,
        title: storySession.title,
        storyNumber: storySession.storyNumber,
        wordCount,
        submittedToCompetition: true,
        competitionId: currentCompetition._id,
        isPublished: false,
        competitionEligible: true,
        assessmentScore: assessmentResult.overallScore,
        integrityStatus: assessmentResult.integrityAnalysis.overallStatus,
      },
      competition: {
        id: currentCompetition._id,
        month: currentCompetition.month,
        phase: currentCompetition.phase,
      },
      assessment: {
        overallScore: assessmentResult.overallScore,
        integrityStatus: {
          status: assessmentResult.integrityAnalysis.overallStatus,
          message: assessmentResult.integrityAnalysis.message
        },
        feedback: assessmentResult.comprehensiveFeedback.teacherAssessment,
      },
      message: 'Story assessed and submitted to competition successfully!',
    });
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
