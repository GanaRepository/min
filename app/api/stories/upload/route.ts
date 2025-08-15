// app/api/stories/upload/route.ts - FIXED FOR SIMPLIFIED ASSESSMENT REQUESTS
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import User from '@/models/User';
import { UsageManager } from '@/lib/usage-manager';
import { AIAssessmentEngine } from '@/lib/ai/ai-assessment-engine';
// Add these for file processing
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

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

    // FIXED: Check if user can request assessment using simplified system
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
      const maxSize = 10 * 1024 * 1024; // 10MB for all file types
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: 'File size must be less than 10MB.' },
          { status: 400 }
        );
      }

      try {
        // Process different file types
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
          // Handle .txt files
          storyContent = await file.text();
        } 
        else if (file.type.includes('pdf') || file.name.endsWith('.pdf')) {
          // Handle PDF files
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const pdfData = await pdfParse(buffer);
          storyContent = pdfData.text;
        } 
        else if (file.name.endsWith('.docx') || file.type.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
          // Handle DOCX files
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const result = await mammoth.extractRawText({ buffer });
          storyContent = result.value;
        } 
        else {
          return NextResponse.json(
            { error: 'Unsupported file type. Please upload .txt, .pdf, or .docx files only.' },
            { status: 400 }
          );
        }

        // Clean up extracted text
        storyContent = storyContent.trim().replace(/\s+/g, ' ');
        
      } catch (error) {
        console.error('❌ File processing error:', error);
        return NextResponse.json(
          { 
            error: `Failed to read ${file.name}. Please try uploading a different file or paste your text directly in the text area below.`,
            suggestion: 'copy_paste'
          },
          { status: 400 }
        );
      }
    } 
    else if (content?.trim()) {
      // Use pasted text content
      storyContent = content.trim();
    } 
    else {
      return NextResponse.json(
        { error: 'Please provide story content by either uploading a file (.txt, .pdf, .docx) OR pasting text directly in the text area.' },
        { status: 400 }
      );
    }

    // Validate story content
    if (!storyContent.trim()) {
      return NextResponse.json(
        { error: 'Story content cannot be empty' },
        { status: 400 }
      );
    }

    // Word count validation
    const wordCount = storyContent.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 50) {
      return NextResponse.json(
        {
          error:
            'Story must be at least 50 words long for meaningful assessment',
        },
        { status: 400 }
      );
    }

    if (wordCount > 5000) {
      return NextResponse.json(
        { error: 'Story must be less than 5,000 words for assessment' },
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

    // Fix: Use type assertion and fallback for storyNumber
    const lastStoryNumber = (lastSession as any)?.storyNumber ?? 0;
    const nextStoryNumber = lastStoryNumber + 1;

    console.log(
      `📚 Creating story session #${nextStoryNumber} for user ${user.email}`
    );

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
      maxApiCalls: 0, // No AI collaboration for uploaded stories
      status: 'completed', // Uploaded stories are already complete
      aiOpening: storyContent, // Store the uploaded content here
      completedAt: new Date(),
      assessmentAttempts: 0, // Reset attempts for new upload
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
      console.log(
        `🔍 Plagiarism Score: ${assessmentResult.integrityAnalysis.originalityScore}%`
      );
      console.log(
        `🤖 AI Detection Score: ${assessmentResult.integrityAnalysis.aiDetectionResult.overallScore}%`
      );
      console.log(
        `⚠️ Integrity Risk: ${assessmentResult.integrityAnalysis.integrityRisk}`
      );
      console.log(`📈 Overall Score: ${assessmentResult.overallScore}%`);

      // Update story session with advanced assessment
      await StorySession.findByIdAndUpdate(storySession._id, {
        $set: {
          assessment: {
            // Legacy fields for backward compatibility
            grammarScore: assessmentResult.categoryScores.grammar,
            creativityScore: assessmentResult.categoryScores.creativity,
            vocabularyScore: assessmentResult.categoryScores.vocabulary,
            structureScore: assessmentResult.categoryScores.structure,
            characterDevelopmentScore:
              assessmentResult.categoryScores.characterDevelopment,
            plotDevelopmentScore:
              assessmentResult.categoryScores.plotDevelopment,
            overallScore: assessmentResult.overallScore,
            readingLevel: assessmentResult.categoryScores.readingLevel,
            feedback: assessmentResult.educationalFeedback.teacherComment,
            strengths: assessmentResult.educationalFeedback.strengths,
            improvements: assessmentResult.educationalFeedback.improvements,
            vocabularyUsed: [], // Legacy field
            suggestedWords: [], // Legacy field
            educationalInsights:
              assessmentResult.educationalFeedback.encouragement,

            // NEW: Advanced integrity fields
            plagiarismScore:
              assessmentResult.integrityAnalysis.originalityScore,
            aiDetectionScore:
              assessmentResult.integrityAnalysis.aiDetectionResult.overallScore,
            integrityRisk: assessmentResult.integrityAnalysis.integrityRisk,

            // Store detailed analysis for admin review
            integrityAnalysis: {
              plagiarismResult: {
                score:
                  assessmentResult.integrityAnalysis.plagiarismResult
                    .overallScore,
                riskLevel:
                  assessmentResult.integrityAnalysis.plagiarismResult.riskLevel,
                violationCount:
                  assessmentResult.integrityAnalysis.plagiarismResult.violations
                    ?.length || 0,
                detailedAnalysis:
                  assessmentResult.integrityAnalysis.plagiarismResult
                    .detailedAnalysis,
              },
              aiDetectionResult: {
                score:
                  assessmentResult.integrityAnalysis.aiDetectionResult
                    .overallScore,
                likelihood:
                  assessmentResult.integrityAnalysis.aiDetectionResult
                    .likelihood,
                confidence:
                  assessmentResult.integrityAnalysis.aiDetectionResult
                    .confidence,
                indicatorCount:
                  assessmentResult.integrityAnalysis.aiDetectionResult
                    .indicators?.length || 0,
                detailedAnalysis:
                  assessmentResult.integrityAnalysis.aiDetectionResult
                    .detailedAnalysis,
              },
            },

            // Educational enhancements
            recommendations: assessmentResult.recommendations,
            progressTracking: assessmentResult.progressTracking,

            // Required integrityStatus field
            integrityStatus: {
              status: assessmentResult.integrityAnalysis.integrityRisk === 'critical' ? 'FAIL' : 
                      assessmentResult.integrityAnalysis.integrityRisk === 'high' ? 'WARNING' : 'PASS',
              message: assessmentResult.integrityAnalysis.integrityRisk === 'critical' ? 
                       'Critical integrity issues detected' :
                       assessmentResult.integrityAnalysis.integrityRisk === 'high' ?
                       'High integrity risk detected' :
                       'Integrity check passed'
            },

            // Assessment metadata
            assessmentVersion: '2.0', // Mark as advanced assessment
            assessmentDate: new Date(),
          },
          overallScore: assessmentResult.overallScore,
          status:
            assessmentResult.integrityAnalysis.integrityRisk === 'critical'
              ? 'flagged'
              : 'completed',
        },
      });

      // FIXED: Increment assessment request counter in simplified system
      await UsageManager.incrementAssessmentRequest(session.user.id, storySession._id.toString());

      console.log(
        `📝 Story uploaded and assessed successfully: ${storySession._id}`
      );

      // Prepare response based on integrity risk
      const response = {
        success: true,
        story: {
          id: storySession._id,
          title: storySession.title,
          storyNumber: (storySession as any)?.storyNumber ?? 0,
          wordCount,
          assessmentAttempts: 1, // First attempt after upload
          status: storySession.status,
        },
        assessment: {
          overallScore: assessmentResult.overallScore,
          integrityAnalysis: {
            originalityScore:
              assessmentResult.integrityAnalysis.originalityScore,
            plagiarismScore:
              assessmentResult.integrityAnalysis.plagiarismResult.overallScore,
            aiDetectionScore:
              assessmentResult.integrityAnalysis.aiDetectionResult.overallScore,
            integrityRisk: assessmentResult.integrityAnalysis.integrityRisk,
          },
          educationalFeedback: assessmentResult.educationalFeedback,
          categoryScores: assessmentResult.categoryScores,
        },
        // FIXED: Include updated usage information
        usage: {
          assessmentRequests: canAssess.currentUsage.assessmentRequests + 1,
          limit: canAssess.limits.assessmentRequests,
          remaining: canAssess.limits.assessmentRequests - (canAssess.currentUsage.assessmentRequests + 1)
        },
        message:
          assessmentResult.integrityAnalysis.integrityRisk === 'critical'
            ? 'Story uploaded but flagged for review due to integrity concerns.'
            : 'Story uploaded and assessed successfully!',
      };

      // Add warnings property to response object using type assertion for all usages
      (response as any).warnings = [];
      if (
        assessmentResult.integrityAnalysis.plagiarismResult.riskLevel !== 'low'
      ) {
        (response as any).warnings.push(
          'Potential plagiarism detected. Please ensure all content is original.'
        );
      }
      if (
        assessmentResult.integrityAnalysis.aiDetectionResult.likelihood !==
          'very_low' &&
        assessmentResult.integrityAnalysis.aiDetectionResult.likelihood !==
          'low'
      ) {
        (response as any).warnings.push(
          'Content may be AI-generated. Please submit only your own original writing.'
        );
      }

      return NextResponse.json(response);
    } catch (assessmentError) {
      console.error('❌ Assessment failed:', assessmentError);

      // Still save the story but mark assessment as failed
      await StorySession.findByIdAndUpdate(storySession._id, {
        $set: {
          status: 'completed',
          assessment: {
            overallScore: 0,
            feedback:
              'Assessment temporarily unavailable. Please try again later.',
            error: true,
            errorMessage:
              assessmentError instanceof Error
                ? assessmentError.message
                : 'Unknown error',
            assessmentDate: new Date(),
            integrityStatus: {
              status: 'PASS',
              message: 'Assessment failed - integrity status unknown'
            }
          },
        },
      });

      // FIXED: Still increment usage since story was uploaded
      await UsageManager.incrementAssessmentRequest(session.user.id, storySession._id.toString());

      return NextResponse.json({
        success: true,
        story: {
          id: storySession._id,
          title: storySession.title,
          storyNumber: (storySession as any)?.storyNumber ?? 0,
          wordCount,
          assessmentAttempts: 1,
        },
        // FIXED: Include updated usage information
        usage: {
          assessmentRequests: canAssess.currentUsage.assessmentRequests + 1,
          limit: canAssess.limits.assessmentRequests,
          remaining: canAssess.limits.assessmentRequests - (canAssess.currentUsage.assessmentRequests + 1)
        },
        warning:
          'Story saved successfully, but assessment failed. You can retry assessment from your dashboard.',
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
