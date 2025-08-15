// // app/api/stories/upload/route.ts - FIXED FOR SIMPLIFIED ASSESSMENT REQUESTS
// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/utils/authOptions';
// import { connectToDatabase } from '@/utils/db';
// import StorySession from '@/models/StorySession';
// import User from '@/models/User';
// import { UsageManager } from '@/lib/usage-manager';
// import { AIAssessmentEngine } from '@/lib/ai/ai-assessment-engine';
// // Add these for file processing
// import pdfParse from 'pdf-parse';
// import mammoth from 'mammoth';

// export async function POST(request: NextRequest) {
//   try {
//     console.log('📝 Story upload request received');

//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== 'child') {
//       console.log('❌ Unauthorized upload attempt');
//       return NextResponse.json(
//         { error: 'Access denied. Children only.' },
//         { status: 403 }
//       );
//     }

//     await connectToDatabase();

//     // FIXED: Check if user can request assessment using simplified system
//     const canAssess = await UsageManager.canRequestAssessment(session.user.id);
//     if (!canAssess.allowed) {
//       console.log(`❌ Upload denied: ${canAssess.reason}`);
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
//       // File size validation
//       const maxSize = 10 * 1024 * 1024; // 10MB for all file types
//       if (file.size > maxSize) {
//         return NextResponse.json(
//           { error: 'File size must be less than 10MB.' },
//           { status: 400 }
//         );
//       }

//       try {
//         // Process different file types
//         if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
//           // Handle .txt files
//           storyContent = await file.text();
//         } 
//         else if (file.type.includes('pdf') || file.name.endsWith('.pdf')) {
//           // Handle PDF files
//           const arrayBuffer = await file.arrayBuffer();
//           const buffer = Buffer.from(arrayBuffer);
//           const pdfData = await pdfParse(buffer);
//           storyContent = pdfData.text;
//         } 
//         else if (file.name.endsWith('.docx') || file.type.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
//           // Handle DOCX files
//           const arrayBuffer = await file.arrayBuffer();
//           const buffer = Buffer.from(arrayBuffer);
//           const result = await mammoth.extractRawText({ buffer });
//           storyContent = result.value;
//         } 
//         else {
//           return NextResponse.json(
//             { error: 'Unsupported file type. Please upload .txt, .pdf, or .docx files only.' },
//             { status: 400 }
//           );
//         }

//         // Clean up extracted text
//         storyContent = storyContent.trim().replace(/\s+/g, ' ');
        
//       } catch (error) {
//         console.error('❌ File processing error:', error);
//         return NextResponse.json(
//           { 
//             error: `Failed to read ${file.name}. Please try uploading a different file or paste your text directly in the text area below.`,
//             suggestion: 'copy_paste'
//           },
//           { status: 400 }
//         );
//       }
//     } 
//     else if (content?.trim()) {
//       // Use pasted text content
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

//     // Word count validation
//     const wordCount = storyContent.trim().split(/\s+/).filter(Boolean).length;
//     if (wordCount < 50) {
//       return NextResponse.json(
//         {
//           error:
//             'Story must be at least 50 words long for meaningful assessment',
//         },
//         { status: 400 }
//       );
//     }

//     if (wordCount > 5000) {
//       return NextResponse.json(
//         { error: 'Story must be less than 5,000 words for assessment' },
//         { status: 400 }
//       );
//     }

//     console.log(`📊 Story validation passed: ${wordCount} words`);

//     // Get user for story number generation
//     const user = await User.findById(session.user.id);
//     if (!user) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }

//     // Get next story number
//     const lastSession = await StorySession.findOne({ childId: session.user.id })
//       .sort({ storyNumber: -1 })
//       .select('storyNumber')
//       .lean();

//     // Fix: Use type assertion and fallback for storyNumber
//     const lastStoryNumber = (lastSession as any)?.storyNumber ?? 0;
//     const nextStoryNumber = lastStoryNumber + 1;

//     console.log(
//       `📚 Creating story session #${nextStoryNumber} for user ${user.email}`
//     );

//     // Create story session for assessment
//     const storySession = await StorySession.create({
//       childId: session.user.id,
//       storyNumber: nextStoryNumber,
//       title: title.trim(),
//       storyMode: 'freeform',
//       isUploadedForAssessment: true,
//       currentTurn: 1,
//       totalWords: wordCount,
//       childWords: wordCount,
//       apiCallsUsed: 0,
//       maxApiCalls: 0, // No AI collaboration for uploaded stories
//       status: 'completed', // Uploaded stories are already complete
//       aiOpening: storyContent, // Store the uploaded content here
//       completedAt: new Date(),
//       assessmentAttempts: 0, // Reset attempts for new upload
//     });

//     console.log(`✅ Story session created: ${storySession._id}`);

//     // Run advanced assessment
//     try {
//       console.log('🔍 Starting advanced assessment...');

//       const assessmentResult = await AIAssessmentEngine.assessUploadedStory(
//         storyContent,
//         title.trim(),
//         session.user.id
//       );

//       console.log('📊 Assessment completed successfully');
//       console.log(
//         `🔍 Plagiarism Score: ${assessmentResult.integrityAnalysis.originalityScore}%`
//       );
//       console.log(
//         `🤖 AI Detection Score: ${assessmentResult.integrityAnalysis.aiDetectionResult.overallScore}%`
//       );
//       console.log(
//         `⚠️ Integrity Risk: ${assessmentResult.integrityAnalysis.integrityRisk}`
//       );
//       console.log(`📈 Overall Score: ${assessmentResult.overallScore}%`);

//       // Update story session with advanced assessment
//       await StorySession.findByIdAndUpdate(storySession._id, {
//         $set: {
//           assessment: {
//             // Legacy fields for backward compatibility
//             grammarScore: assessmentResult.categoryScores.grammar,
//             creativityScore: assessmentResult.categoryScores.creativity,
//             vocabularyScore: assessmentResult.categoryScores.vocabulary,
//             structureScore: assessmentResult.categoryScores.structure,
//             characterDevelopmentScore:
//               assessmentResult.categoryScores.characterDevelopment,
//             plotDevelopmentScore:
//               assessmentResult.categoryScores.plotDevelopment,
//             overallScore: assessmentResult.overallScore,
//             readingLevel: assessmentResult.categoryScores.readingLevel,
//             feedback: assessmentResult.educationalFeedback.teacherComment,
//             strengths: assessmentResult.educationalFeedback.strengths,
//             improvements: assessmentResult.educationalFeedback.improvements,
//             vocabularyUsed: [], // Legacy field
//             suggestedWords: [], // Legacy field
//             educationalInsights:
//               assessmentResult.educationalFeedback.encouragement,

//             // NEW: Advanced integrity fields
//             plagiarismScore:
//               assessmentResult.integrityAnalysis.originalityScore,
//             aiDetectionScore:
//               assessmentResult.integrityAnalysis.aiDetectionResult.overallScore,
//             integrityRisk: assessmentResult.integrityAnalysis.integrityRisk,

//             // Store detailed analysis for admin review
//             integrityAnalysis: {
//               plagiarismResult: {
//                 score:
//                   assessmentResult.integrityAnalysis.plagiarismResult
//                     .overallScore,
//                 riskLevel:
//                   assessmentResult.integrityAnalysis.plagiarismResult.riskLevel,
//                 violationCount:
//                   assessmentResult.integrityAnalysis.plagiarismResult.violations
//                     ?.length || 0,
//                 detailedAnalysis:
//                   assessmentResult.integrityAnalysis.plagiarismResult
//                     .detailedAnalysis,
//               },
//               aiDetectionResult: {
//                 score:
//                   assessmentResult.integrityAnalysis.aiDetectionResult
//                     .overallScore,
//                 likelihood:
//                   assessmentResult.integrityAnalysis.aiDetectionResult
//                     .likelihood,
//                 confidence:
//                   assessmentResult.integrityAnalysis.aiDetectionResult
//                     .confidence,
//                 indicatorCount:
//                   assessmentResult.integrityAnalysis.aiDetectionResult
//                     .indicators?.length || 0,
//                 detailedAnalysis:
//                   assessmentResult.integrityAnalysis.aiDetectionResult
//                     .detailedAnalysis,
//               },
//             },

//             // Educational enhancements
//             recommendations: assessmentResult.recommendations,
//             progressTracking: assessmentResult.progressTracking,

//             // Required integrityStatus field
//             integrityStatus: {
//               status: assessmentResult.integrityAnalysis.integrityRisk === 'critical' ? 'FAIL' : 
//                       assessmentResult.integrityAnalysis.integrityRisk === 'high' ? 'WARNING' : 'PASS',
//               message: assessmentResult.integrityAnalysis.integrityRisk === 'critical' ? 
//                        'Critical integrity issues detected' :
//                        assessmentResult.integrityAnalysis.integrityRisk === 'high' ?
//                        'High integrity risk detected' :
//                        'Integrity check passed'
//             },

//             // Assessment metadata
//             assessmentVersion: '2.0', // Mark as advanced assessment
//             assessmentDate: new Date(),
//           },
//           overallScore: assessmentResult.overallScore,
//           status:
//             assessmentResult.integrityAnalysis.integrityRisk === 'critical'
//               ? 'flagged'
//               : 'completed',
//         },
//       });

//       // FIXED: Increment assessment request counter in simplified system
//       await UsageManager.incrementAssessmentRequest(session.user.id, storySession._id.toString());

//       console.log(
//         `📝 Story uploaded and assessed successfully: ${storySession._id}`
//       );

//       // Prepare response based on integrity risk
//       const response = {
//         success: true,
//         story: {
//           id: storySession._id,
//           title: storySession.title,
//           storyNumber: (storySession as any)?.storyNumber ?? 0,
//           wordCount,
//           assessmentAttempts: 1, // First attempt after upload
//           status: storySession.status,
//         },
//         assessment: {
//           overallScore: assessmentResult.overallScore,
//           integrityAnalysis: {
//             originalityScore:
//               assessmentResult.integrityAnalysis.originalityScore,
//             plagiarismScore:
//               assessmentResult.integrityAnalysis.plagiarismResult.overallScore,
//             aiDetectionScore:
//               assessmentResult.integrityAnalysis.aiDetectionResult.overallScore,
//             integrityRisk: assessmentResult.integrityAnalysis.integrityRisk,
//           },
//           educationalFeedback: assessmentResult.educationalFeedback,
//           categoryScores: assessmentResult.categoryScores,
//         },
//         // FIXED: Include updated usage information
//         usage: {
//           assessmentRequests: canAssess.currentUsage.assessmentRequests + 1,
//           limit: canAssess.limits.assessmentRequests,
//           remaining: canAssess.limits.assessmentRequests - (canAssess.currentUsage.assessmentRequests + 1)
//         },
//         message:
//           assessmentResult.integrityAnalysis.integrityRisk === 'critical'
//             ? 'Story uploaded but flagged for review due to integrity concerns.'
//             : 'Story uploaded and assessed successfully!',
//       };

//       // Add warnings property to response object using type assertion for all usages
//       (response as any).warnings = [];
//       if (
//         assessmentResult.integrityAnalysis.plagiarismResult.riskLevel !== 'low'
//       ) {
//         (response as any).warnings.push(
//           'Potential plagiarism detected. Please ensure all content is original.'
//         );
//       }
//       if (
//         assessmentResult.integrityAnalysis.aiDetectionResult.likelihood !==
//           'very_low' &&
//         assessmentResult.integrityAnalysis.aiDetectionResult.likelihood !==
//           'low'
//       ) {
//         (response as any).warnings.push(
//           'Content may be AI-generated. Please submit only your own original writing.'
//         );
//       }

//       return NextResponse.json(response);
//     } catch (assessmentError) {
//       console.error('❌ Assessment failed:', assessmentError);

//       // Still save the story but mark assessment as failed
//       await StorySession.findByIdAndUpdate(storySession._id, {
//         $set: {
//           status: 'completed',
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
//         },
//       });

//       // FIXED: Still increment usage since story was uploaded
//       await UsageManager.incrementAssessmentRequest(session.user.id, storySession._id.toString());

//       return NextResponse.json({
//         success: true,
//         story: {
//           id: storySession._id,
//           title: storySession.title,
//           storyNumber: (storySession as any)?.storyNumber ?? 0,
//           wordCount,
//           assessmentAttempts: 1,
//         },
//         // FIXED: Include updated usage information
//         usage: {
//           assessmentRequests: canAssess.currentUsage.assessmentRequests + 1,
//           limit: canAssess.limits.assessmentRequests,
//           remaining: canAssess.limits.assessmentRequests - (canAssess.currentUsage.assessmentRequests + 1)
//         },
//         warning:
//           'Story saved successfully, but assessment failed. You can retry assessment from your dashboard.',
//         error: 'Assessment service temporarily unavailable',
//       });
//     }
//   } catch (error) {
//     console.error('❌ Upload error:', error);
//     return NextResponse.json(
//       {
//         error: 'Failed to upload story',
//         details: error instanceof Error ? error.message : 'Unknown error',
//       },
//       { status: 500 }
//     );
//   }
// }

// app/api/stories/upload/route.ts - FIXED WITH CORRECT IMPORTS
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import User from '@/models/User';
import { UsageManager } from '@/lib/usage-manager';
import { AIAssessmentEngine } from '@/lib/ai/ai-assessment-engine';

// Helper function to extract text from PDF with proper fallbacks
async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    // First try: pdf-parse (most reliable)
    const pdfParse = await import('pdf-parse');
    const pdf = await pdfParse.default(buffer);
    return pdf.text;
  } catch (error) {
    console.error('pdf-parse failed:', error);
    
    // Second try: pdf2pic or simple text extraction
    try {
      // Try a different approach - look for text patterns in buffer
      const bufferString = buffer.toString('utf8');
      // Basic PDF text extraction (very rudimentary)
      const textMatches = bufferString.match(/BT\s*.*?\s*ET/g);
      if (textMatches && textMatches.length > 0) {
        let extractedText = textMatches
          .map(match => match.replace(/BT\s*|\s*ET/g, ''))
          .join(' ')
          .replace(/[^\w\s.,!?;:'"()-]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (extractedText.length > 10) {
          return extractedText;
        }
      }
      
      throw new Error('Could not extract readable text from PDF');
    } catch (fallbackError) {
      console.error('All PDF parsing methods failed:', fallbackError);
      throw new Error('Unable to extract text from PDF. This PDF may contain only images or be corrupted. Please convert to .txt or copy-paste the text directly.');
    }
  }
}

// Helper function to extract text from DOCX
async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    // First try: mammoth
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('mammoth failed:', error);
    
    // Second try: manual ZIP extraction
    try {
      const JSZip = await import('jszip');
      const zip = new JSZip.default();
      const zipContent = await zip.loadAsync(buffer);
      
      // Extract document.xml which contains the text
      const documentXml = await zipContent.file('word/document.xml')?.async('text');
      if (documentXml) {
        // Basic XML text extraction
        let textOnly = documentXml
          .replace(/<w:t[^>]*>/g, '')
          .replace(/<\/w:t>/g, ' ')
          .replace(/<[^>]*>/g, '')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (textOnly.length > 10) {
          return textOnly;
        }
      }
      
      throw new Error('Could not find readable content in DOCX');
    } catch (fallbackError) {
      console.error('All DOCX parsing methods failed:', fallbackError);
      throw new Error('Unable to extract text from DOCX. Please save as .txt or copy-paste the text directly.');
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Story upload request received');

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'child') {
      console.log('❌ Unauthorized upload attempt');
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Check if user can request assessment
    const canAssess = await UsageManager.canRequestAssessment(session.user.id);
    if (!canAssess.allowed) {
      console.log(`❌ Upload denied: ${canAssess.reason}`);
      return NextResponse.json(
        {
          error: canAssess.reason,
          upgradeRequired: canAssess.upgradeRequired,
          usage: canAssess.currentUsage,
          limits: canAssess.limits
        },
        { status: 403 }
      );
    }

    // Parse form data
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

    // Handle file upload or direct content
    if (file && file.size > 0) {
      // File size validation
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: 'File size must be less than 10MB.' },
          { status: 400 }
        );
      }

      try {
        console.log(`📄 Processing file: ${file.name} (${file.type}, ${file.size} bytes)`);
        
        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Process different file types
        if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
          // Handle .txt files
          storyContent = new TextDecoder('utf-8').decode(buffer);
          console.log('✅ TXT file processed successfully');
        } 
        else if (file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf')) {
          // Handle PDF files
          console.log('🔍 Processing PDF file...');
          try {
            storyContent = await extractPdfText(buffer);
            console.log('✅ PDF file processed successfully');
          } catch (pdfError) {
            console.error('PDF processing failed:', pdfError);
            return NextResponse.json(
              { 
                error: `Failed to process PDF file: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`,
                suggestion: 'copy_paste',
                details: 'PDFs with images or complex formatting may not work. Please copy-paste your text directly or save as .txt file.'
              },
              { status: 400 }
            );
          }
        } 
        else if (
          file.name.toLowerCase().endsWith('.docx') || 
          file.type.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        ) {
          // Handle DOCX files
          console.log('🔍 Processing DOCX file...');
          try {
            storyContent = await extractDocxText(buffer);
            console.log('✅ DOCX file processed successfully');
          } catch (docxError) {
            console.error('DOCX processing failed:', docxError);
            return NextResponse.json(
              { 
                error: `Failed to process DOCX file: ${docxError instanceof Error ? docxError.message : 'Unknown error'}`,
                suggestion: 'copy_paste',
                details: 'Complex DOCX formatting may not work. Please copy-paste your text directly or save as .txt file.'
              },
              { status: 400 }
            );
          }
        } 
        else {
          return NextResponse.json(
            { 
              error: 'Unsupported file type. Please upload .txt, .pdf, or .docx files only.',
              fileType: file.type,
              fileName: file.name
            },
            { status: 400 }
          );
        }

        // Clean up extracted text
        storyContent = storyContent
          .trim()
          .replace(/\s+/g, ' ')
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove control characters
          .replace(/[^\w\s.,!?;:'"()\-]/g, ' ') // Keep only readable characters
          .replace(/\s+/g, ' ')
          .trim();
        
        console.log(`📊 Extracted ${storyContent.length} characters from ${file.name}`);
        
      } catch (error) {
        console.error('❌ File processing error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown processing error';
        
        return NextResponse.json(
          { 
            error: `Failed to process ${file.name}: ${errorMessage}`,
            suggestion: 'copy_paste',
            details: 'File processing failed. Please copy-paste your text directly or try a different file format.'
          },
          { status: 400 }
        );
      }
    } 
    else if (content?.trim()) {
      // Use pasted text content
      storyContent = content.trim();
      console.log('✅ Using pasted text content');
    } 
    else {
      return NextResponse.json(
        { error: 'Please provide story content by either uploading a file (.txt, .pdf, .docx) OR pasting text directly.' },
        { status: 400 }
      );
    }

    // Validate story content
    if (!storyContent.trim()) {
      return NextResponse.json(
        { 
          error: 'Story content appears to be empty after processing.',
          suggestion: 'copy_paste',
          details: 'The file may be corrupted, contain only images, or have formatting issues. Please copy-paste your text directly.'
        },
        { status: 400 }
      );
    }

    // Word count validation
    const wordCount = storyContent.trim().split(/\s+/).filter(Boolean).length;
    console.log(`📊 Word count: ${wordCount}`);
    
    if (wordCount < 50) {
      return NextResponse.json(
        {
          error: 'Story must be at least 50 words long for meaningful assessment',
          currentWords: wordCount
        },
        { status: 400 }
      );
    }

    if (wordCount > 5000) {
      return NextResponse.json(
        { 
          error: 'Story must be less than 5,000 words for assessment',
          currentWords: wordCount
        },
        { status: 400 }
      );
    }

    console.log(`📊 Story validation passed: ${wordCount} words`);

    // Get user for story number generation
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get next story number
    const lastSession = await StorySession.findOne({ childId: session.user.id })
      .sort({ storyNumber: -1 })
      .select('storyNumber')
      .lean();

    const lastStoryNumber = (lastSession as any)?.storyNumber ?? 0;
    const nextStoryNumber = lastStoryNumber + 1;

    console.log(`📚 Creating story session #${nextStoryNumber} for user ${user.email}`);

    // Create story session for assessment
    const storySession = await StorySession.create({
      childId: session.user.id,
      storyNumber: nextStoryNumber,
      title: title.trim(),
      storyMode: 'freeform',
      isUploadedForAssessment: true,
      currentTurn: 1,
      totalWords: wordCount,
      childWords: wordCount,
      apiCallsUsed: 0,
      maxApiCalls: 0,
      status: 'completed',
      aiOpening: storyContent,
      completedAt: new Date(),
      assessmentAttempts: 0,
    });

    console.log(`✅ Story session created: ${storySession._id}`);

    // Run advanced assessment
    try {
      console.log('🔍 Starting advanced assessment...');

      const assessmentResult = await AIAssessmentEngine.assessUploadedStory(
        storyContent,
        title.trim(),
        session.user.id
      );

      console.log('📊 Assessment completed successfully');

      // Update story session with assessment
      await StorySession.findByIdAndUpdate(storySession._id, {
        $set: {
          assessment: {
            grammarScore: assessmentResult.categoryScores.grammar,
            creativityScore: assessmentResult.categoryScores.creativity,
            vocabularyScore: assessmentResult.categoryScores.vocabulary,
            structureScore: assessmentResult.categoryScores.structure,
            characterDevelopmentScore: assessmentResult.categoryScores.characterDevelopment,
            plotDevelopmentScore: assessmentResult.categoryScores.plotDevelopment,
            overallScore: assessmentResult.overallScore,
            readingLevel: assessmentResult.categoryScores.readingLevel,
            feedback: assessmentResult.educationalFeedback.teacherComment,
            strengths: assessmentResult.educationalFeedback.strengths,
            improvements: assessmentResult.educationalFeedback.improvements,
            vocabularyUsed: [],
            suggestedWords: [],
            educationalInsights: assessmentResult.educationalFeedback.encouragement,
            plagiarismScore: assessmentResult.integrityAnalysis.originalityScore,
            aiDetectionScore: assessmentResult.integrityAnalysis.aiDetectionResult.overallScore,
            integrityRisk: assessmentResult.integrityAnalysis.integrityRisk,
            integrityAnalysis: {
              plagiarismResult: {
                score: assessmentResult.integrityAnalysis.plagiarismResult.overallScore,
                riskLevel: assessmentResult.integrityAnalysis.plagiarismResult.riskLevel,
                violationCount: assessmentResult.integrityAnalysis.plagiarismResult.violations?.length || 0,
                detailedAnalysis: assessmentResult.integrityAnalysis.plagiarismResult.detailedAnalysis,
              },
              aiDetectionResult: {
                score: assessmentResult.integrityAnalysis.aiDetectionResult.overallScore,
                likelihood: assessmentResult.integrityAnalysis.aiDetectionResult.likelihood,
                confidence: assessmentResult.integrityAnalysis.aiDetectionResult.confidence,
                indicatorCount: assessmentResult.integrityAnalysis.aiDetectionResult.indicators?.length || 0,
                detailedAnalysis: assessmentResult.integrityAnalysis.aiDetectionResult.detailedAnalysis,
              },
            },
            recommendations: assessmentResult.recommendations,
            progressTracking: assessmentResult.progressTracking,
            integrityStatus: {
              status: assessmentResult.integrityAnalysis.integrityRisk === 'critical' ? 'FAIL' : 
                      assessmentResult.integrityAnalysis.integrityRisk === 'high' ? 'WARNING' : 'PASS',
              message: assessmentResult.integrityAnalysis.integrityRisk === 'critical' ? 
                       'Critical integrity issues detected' :
                       assessmentResult.integrityAnalysis.integrityRisk === 'high' ?
                       'High integrity risk detected' :
                       'Integrity check passed'
            },
            assessmentVersion: '2.0',
            assessmentDate: new Date(),
          },
          overallScore: assessmentResult.overallScore,
          status: assessmentResult.integrityAnalysis.integrityRisk === 'critical' ? 'flagged' : 'completed',
        },
      });

      // Increment assessment request counter
      await UsageManager.incrementAssessmentRequest(session.user.id, storySession._id.toString());

      console.log(`📝 Story uploaded and assessed successfully: ${storySession._id}`);

      // Prepare response
      const response = {
        success: true,
        story: {
          id: storySession._id,
          title: storySession.title,
          storyNumber: nextStoryNumber,
          wordCount,
          assessmentAttempts: 1,
          status: storySession.status,
        },
        assessment: {
          overallScore: assessmentResult.overallScore,
          integrityAnalysis: {
            originalityScore: assessmentResult.integrityAnalysis.originalityScore,
            plagiarismScore: assessmentResult.integrityAnalysis.plagiarismResult.overallScore,
            aiDetectionScore: assessmentResult.integrityAnalysis.aiDetectionResult.overallScore,
            integrityRisk: assessmentResult.integrityAnalysis.integrityRisk,
          },
          educationalFeedback: assessmentResult.educationalFeedback,
          categoryScores: assessmentResult.categoryScores,
        },
        usage: {
          assessmentRequests: canAssess.currentUsage.assessmentRequests + 1,
          limit: canAssess.limits.assessmentRequests,
          remaining: canAssess.limits.assessmentRequests - (canAssess.currentUsage.assessmentRequests + 1)
        },
        message: assessmentResult.integrityAnalysis.integrityRisk === 'critical'
          ? 'Story uploaded but flagged for review due to integrity concerns.'
          : 'Story uploaded and assessed successfully!',
      };

      // Add warnings
      (response as any).warnings = [];
      if (assessmentResult.integrityAnalysis.plagiarismResult.riskLevel !== 'low') {
        (response as any).warnings.push('Potential plagiarism detected. Please ensure all content is original.');
      }
      if (
        assessmentResult.integrityAnalysis.aiDetectionResult.likelihood !== 'very_low' &&
        assessmentResult.integrityAnalysis.aiDetectionResult.likelihood !== 'low'
      ) {
        (response as any).warnings.push('Content may be AI-generated. Please submit only your own original writing.');
      }

      return NextResponse.json(response);
      
    } catch (assessmentError) {
      console.error('❌ Assessment failed:', assessmentError);

      // Save story but mark assessment as failed
      await StorySession.findByIdAndUpdate(storySession._id, {
        $set: {
          status: 'completed',
          assessment: {
            overallScore: 0,
            feedback: 'Assessment temporarily unavailable. Please try again later.',
            error: true,
            errorMessage: assessmentError instanceof Error ? assessmentError.message : 'Unknown error',
            assessmentDate: new Date(),
            integrityStatus: {
              status: 'PASS',
              message: 'Assessment failed - integrity status unknown'
            }
          },
        },
      });

      // Still increment usage since story was uploaded
      await UsageManager.incrementAssessmentRequest(session.user.id, storySession._id.toString());

      return NextResponse.json({
        success: true,
        story: {
          id: storySession._id,
          title: storySession.title,
          storyNumber: nextStoryNumber,
          wordCount,
          assessmentAttempts: 1,
        },
        usage: {
          assessmentRequests: canAssess.currentUsage.assessmentRequests + 1,
          limit: canAssess.limits.assessmentRequests,
          remaining: canAssess.limits.assessmentRequests - (canAssess.currentUsage.assessmentRequests + 1)
        },
        warning: 'Story saved successfully, but assessment failed. You can retry assessment from your dashboard.',
        error: 'Assessment service temporarily unavailable',
      });
    }
  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload story',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to upload stories.' },
    { status: 405 }
  );
}