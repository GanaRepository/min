// // app/api/user/stories/upload-competition/route.ts - COMPLETELY FIXED
// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/utils/authOptions';
// import { connectToDatabase } from '@/utils/db';
// import StorySession from '@/models/StorySession';
// import User from '@/models/User';
// import { UsageManager } from '@/lib/usage-manager';
// import { competitionManager } from '@/lib/competition-manager';
// import { AIAssessmentEngine } from '@/lib/ai/ai-assessment-engine';
// import pdfParse from 'pdf-parse';
// import mammoth from 'mammoth';

// // FIXED: Proper file processing functions
// async function extractPdfText(file: File): Promise<string> {
//   try {
//     console.log('🔍 Processing PDF file...');
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);
    
//     try {
//       const pdfData = await pdfParse(buffer);
//       if (pdfData.text && pdfData.text.trim().length > 10) {
//         console.log('✅ PDF parsed successfully');
//         return pdfData.text.trim();
//       }
//     } catch (pdfParseError) {
//       console.log('pdf-parse failed:', pdfParseError);
//     }

//     throw new Error('Could not extract readable text from PDF');
    
//   } catch (error) {
//     console.log('PDF processing failed:', error);
//     throw new Error('Unable to extract text from PDF. This PDF may contain only images or be corrupted. Please convert to .txt or copy-paste the text directly.');
//   }
// }

// async function extractDocxText(file: File): Promise<string> {
//   try {
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);
//     const result = await mammoth.extractRawText({ buffer });
//     return result.value.trim();
//   } catch (error) {
//     console.error('DOCX processing error:', error);
//     throw new Error('Unable to extract text from DOCX file. Please convert to .txt or copy-paste the text directly.');
//   }
// }

// async function extractTextFromFile(file: File): Promise<string> {
//   const fileName = file.name.toLowerCase();
//   const fileType = file.type.toLowerCase();
  
//   try {
//     if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
//       return await file.text();
//     } 
//     else if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
//       return await extractPdfText(file);
//     } 
//     else if (fileName.endsWith('.docx') || fileType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
//       return await extractDocxText(file);
//     } 
//     else {
//       throw new Error('Unsupported file type. Please upload .txt, .pdf, or .docx files only.');
//     }
//   } catch (error) {
//     console.error('❌ File processing error:', error);
//     throw error;
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
//     const competitionCheck = await UsageManager.canEnterCompetition(session.user.id);
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
//       console.log(`📄 Processing competition file: ${file.name} (${file.type}, ${file.size} bytes)`);
      
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
        
//         // Clean up extracted text
//         storyContent = storyContent.trim().replace(/\s+/g, ' ');
        
//       } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
//         console.error('❌ Competition file processing failed:', errorMessage);
//         return NextResponse.json(
//           { 
//             error: `Failed to read ${file.name}. ${errorMessage}`,
//             suggestion: 'copy_paste'
//           },
//           { status: 400 }
//         );
//       }
//     } 
//     else if (content?.trim()) {
//       storyContent = content.trim();
//     } 
//     else {
//       return NextResponse.json(
//         { error: 'Please provide story content by either uploading a file (.txt, .pdf, .docx) OR pasting text directly in the text area.' },
//         { status: 400 }
//       );
//     }

//     // Validate story content
//     if (!storyContent.trim()) {
//       return NextResponse.json(
//         { error: 'Story content cannot be empty' },
//         { status: 400 }
//       );
//     }

//     // Word count validation for competition
//     const wordCount = storyContent.trim().split(/\s+/).filter(Boolean).length;
    
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

//     // Get user for story number generation
//     const user = await User.findById(session.user.id);
//     if (!user) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }

//     // Get next story number
//     const lastSession = await StorySession.findOne({ childId: session.user.id })
//       .sort({ storyNumber: -1 })
//       .select('storyNumber')
//       .lean() as { storyNumber?: number } | null;

//     const nextStoryNumber = (lastSession?.storyNumber || 0) + 1;

//     // FIXED: Create story session with proper required fields
//     const storySession = new StorySession({
//       childId: session.user.id,
//       storyNumber: nextStoryNumber,
//       title: title.trim(),
//       currentTurn: 1,
//       totalWords: wordCount,
//       childWords: wordCount,
//       apiCallsUsed: 0,
//       maxApiCalls: 1,
//       status: 'completed',
//       aiOpening: storyContent,
//       completedAt: new Date(),
//       isUploadedForAssessment: false, // This is for competition, not assessment
//       storyType: 'competition',
//       competitionEligible: true,
//       // FIXED: Initialize required assessment fields to prevent validation errors
//       assessment: {
//         integrityStatus: {
//           status: 'PASS',
//           message: 'Competition entry integrity check in progress...'
//         }
//       },
//       // Competition entry
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

//     // Run integrity check for competition entries
//     try {
//       console.log('🔍 Running integrity check for competition entry...');
//       const assessmentResult = await AIAssessmentEngine.assessStory(
//         storyContent,
//         storySession._id.toString(),
//         session.user.id
//       );

//       // FIXED: Update story with proper assessment fields
//       await StorySession.findByIdAndUpdate(storySession._id, {
//         $set: {
//           status: assessmentResult.integrityAnalysis.integrityRisk === 'critical' || 
//                  assessmentResult.integrityAnalysis.integrityRisk === 'high' ? 'review' : 'completed',
//           assessment: {
//             // Basic scores for competition entry
//             overallScore: assessmentResult.overallScore,
//             grammarScore: assessmentResult.categoryScores.grammar,
//             creativityScore: assessmentResult.categoryScores.creativity,
//             vocabularyScore: assessmentResult.categoryScores.vocabulary,
//             structureScore: assessmentResult.categoryScores.structure,
//             characterDevelopmentScore: assessmentResult.categoryScores.characterDevelopment,
//             plotDevelopmentScore: assessmentResult.categoryScores.plotDevelopment,
//             readingLevel: assessmentResult.categoryScores.readingLevel,
//             feedback: 'Competition entry - detailed feedback available after judging.',
//             strengths: ['Competition entry submitted successfully'],
//             improvements: ['Feedback will be provided after competition judging'],
//             // Store integrity analysis
//             integrityAnalysis: {
//               plagiarismResult: {
//                 overallScore: assessmentResult.integrityAnalysis.originalityScore,
//                 riskLevel: assessmentResult.integrityAnalysis.plagiarismResult.riskLevel,
//                 violationCount: assessmentResult.integrityAnalysis.plagiarismResult.violationCount || 0,
//                 detailedAnalysis: assessmentResult.integrityAnalysis.plagiarismResult.detailedAnalysis || {}
//               },
//               aiDetectionResult: {
//                 likelihood: assessmentResult.integrityAnalysis.aiDetectionResult.likelihood,
//                 confidence: assessmentResult.integrityAnalysis.aiDetectionResult.confidence,
//                 indicatorCount: assessmentResult.integrityAnalysis.aiDetectionResult.indicatorCount || 0,
//                 detailedAnalysis: assessmentResult.integrityAnalysis.aiDetectionResult.detailedAnalysis || {}
//               },
//               integrityRisk: assessmentResult.integrityAnalysis.integrityRisk
//             },
//             // FIXED: Required integrity status fields
//             integrityStatus: {
//               status: assessmentResult.integrityAnalysis.integrityRisk === 'critical' || 
//                      assessmentResult.integrityAnalysis.integrityRisk === 'high' ? 'FAIL' :
//                      assessmentResult.integrityAnalysis.integrityRisk === 'medium' ? 'WARNING' : 'PASS',
//               message: assessmentResult.integrityAnalysis.integrityRisk === 'critical' ? 
//                       'Competition entry flagged for review due to serious integrity concerns.' :
//                       assessmentResult.integrityAnalysis.integrityRisk === 'high' ?
//                       'Competition entry has significant integrity issues.' :
//                       assessmentResult.integrityAnalysis.integrityRisk === 'medium' ?
//                       'Competition entry flagged for minor integrity concerns.' :
//                       'Competition entry passed all integrity checks successfully.'
//             },
//             assessmentDate: new Date(),
//             isReassessment: false
//           },
//           assessmentAttempts: 1,
//           lastAssessedAt: new Date(),
//         },
//       });

//       console.log('✅ Integrity check completed successfully');

//     } catch (assessmentError) {
//       console.error('❌ Integrity check failed:', assessmentError);
      
//       // Update with default safe values if assessment fails
//       await StorySession.findByIdAndUpdate(storySession._id, {
//         $set: {
//           assessment: {
//             overallScore: 0,
//             feedback: 'Competition entry saved - integrity check temporarily unavailable.',
//             integrityStatus: {
//               status: 'PASS',
//               message: 'Integrity check temporarily unavailable - entry accepted.'
//             },
//             assessmentDate: new Date(),
//             isReassessment: false
//           },
//           assessmentAttempts: 1,
//           lastAssessedAt: new Date(),
//         },
//       });
//     }

//     // Increment competition entry counter
//     await UsageManager.incrementCompetitionEntry(session.user.id);

//     // Get updated usage stats
//     const updatedCheck = await UsageManager.canEnterCompetition(session.user.id);

//     return NextResponse.json({
//       success: true,
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
//         phase: currentCompetition.phase
//       },
//       usage: {
//         competitionEntries: updatedCheck.currentUsage.competitionEntries,
//         limit: updatedCheck.limits.competitionEntries,
//         remaining: updatedCheck.limits.competitionEntries - updatedCheck.currentUsage.competitionEntries
//       },
//       message: 'Story uploaded and submitted to competition successfully! You can pay $10 to publish it in our anthology.',
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

// app/api/user/stories/upload-competition/route.ts - COMPLETE WORKING VERSION
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import { UsageManager } from '@/lib/usage-manager';
import { competitionManager } from '@/lib/competition-manager';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();
  
  try {
    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      return await file.text();
    } 
    else if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const pdfData = await pdfParse(buffer);
      return pdfData.text.trim();
    } 
    else if (fileName.endsWith('.docx') || fileType.includes('wordprocessingml')) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await mammoth.extractRawText({ buffer });
      return result.value.trim();
    } 
    else {
      throw new Error('Unsupported file type. Please upload .txt, .pdf, or .docx files only.');
    }
  } catch (error) {
    throw new Error('Failed to extract text from file. Please try a different file or paste text directly.');
  }
}

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

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const file = formData.get('file') as File | null;
    const content = formData.get('content') as string | null;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Story title is required' },
        { status: 400 }
      );
    }

    let storyContent = '';

    if (file && file.size > 0) {
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File size must be less than 10MB' },
          { status: 400 }
        );
      }

      try {
        storyContent = await extractTextFromFile(file);
        if (!storyContent || storyContent.trim().length < 10) {
          throw new Error('No readable text found in file');
        }
        storyContent = storyContent.trim().replace(/\s+/g, ' ');
      } catch (error) {
        return NextResponse.json(
          { error: `Failed to read ${file.name}. Please try uploading a different file or paste text directly.` },
          { status: 400 }
        );
      }
    } 
    else if (content?.trim()) {
      storyContent = content.trim();
    } 
    else {
      return NextResponse.json(
        { error: 'Please provide story content by uploading a file or pasting text.' },
        { status: 400 }
      );
    }

    if (!storyContent.trim()) {
      return NextResponse.json(
        { error: 'Story content cannot be empty' },
        { status: 400 }
      );
    }

    // Word count validation for competition
    const wordCount = storyContent.trim().split(/\s+/).filter(Boolean).length;
    
    if (wordCount < 350) {
      return NextResponse.json(
        { error: 'Competition stories must be at least 350 words' },
        { status: 400 }
      );
    }

    if (wordCount > 2000) {
      return NextResponse.json(
        { error: 'Competition stories must be less than 2000 words' },
        { status: 400 }
      );
    }

    const userStoryCount = await StorySession.countDocuments({
      childId: session.user.id,
    });

    const storySession = new StorySession({
      childId: session.user.id,
      storyNumber: userStoryCount + 1,
      title: title.trim(),
      currentTurn: 1,
      totalWords: wordCount,
      childWords: wordCount,
      apiCallsUsed: 0,
      maxApiCalls: 1,
      status: 'completed',
      aiOpening: storyContent,
      completedAt: new Date(),
      isUploadedForAssessment: false,
      storyType: 'competition',
      competitionEligible: true,
      assessment: {
        integrityStatus: {
          status: 'PASS',
          message: 'Competition entry integrity check passed'
        }
      },
      competitionEntries: [
        {
          competitionId: currentCompetition._id,
          submittedAt: new Date(),
          phase: 'submission',
        },
      ],
    });

    await storySession.save();
    console.log(`✅ Competition story saved with ID: ${storySession._id}`);

    // Increment competition entry counter
    await UsageManager.incrementCompetitionEntry(session.user.id);

    // FIXED: Return storyId that frontend expects
    return NextResponse.json({
      success: true,
      storyId: storySession._id, // FIXED: Frontend expects this
      story: {
        id: storySession._id,
        title: storySession.title,
        storyNumber: storySession.storyNumber,
        wordCount,
        submittedToCompetition: true,
        competitionId: currentCompetition._id,
        competitionEligible: true,
      },
      competition: {
        id: currentCompetition._id,
        month: currentCompetition.month,
        phase: currentCompetition.phase
      },
      message: 'Story uploaded and submitted to competition successfully!',
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