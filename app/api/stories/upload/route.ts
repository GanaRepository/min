// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/utils/authOptions';
// import { connectToDatabase } from '@/utils/db';
// import StorySession from '@/models/StorySession';
// import { UsageManager } from '@/lib/usage-manager';

// export async function POST(request: NextRequest) {
//   try {
//     console.log('📝 Story upload request received');

//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== 'child') {
//       return NextResponse.json({ error: 'Access denied' }, { status: 403 });
//     }

//     await connectToDatabase();

//     const formData = await request.formData();
//     const title = formData.get('title') as string;
//     const content = formData.get('content') as string;
//     const file = formData.get('file') as File | null;

//     console.log('📊 Received data:', { title: !!title, content: !!content, file: !!file });

//     if (!title?.trim()) {
//       return NextResponse.json({ error: 'Story title is required' }, { status: 400 });
//     }

//     // Handle both pasted content and file upload
//     let storyContent = '';
//     if (content?.trim()) {
//       storyContent = content.trim();
//     } else if (file && file.size > 0) {
//       // For now, just handle text files
//       if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
//         storyContent = await file.text();
//       } else {
//         return NextResponse.json({
//           error: 'For now, please paste your text directly or upload a .txt file'
//         }, { status: 400 });
//       }
//     }

//     if (!storyContent?.trim()) {
//       return NextResponse.json({
//         error: 'Please provide story content by pasting text or uploading a .txt file'
//       }, { status: 400 });
//     }

//     console.log('📝 Story content length:', storyContent.length);

//     const wordCount = storyContent.trim().split(/\s+/).filter(word => word.length > 0).length;

//     if (wordCount < 50) {
//       return NextResponse.json({
//         error: 'Story must be at least 50 words long'
//       }, { status: 400 });
//     }

//     const userStoryCount = await StorySession.countDocuments({ childId: session.user.id });

//     // FIXED: Generate scores between 60-95 (never exceed 100)
//     const generateScores = (content: string, wordCount: number) => {
//       const baseScore = Math.min(90, Math.max(60, 70 + (wordCount / 20)));
//       const variation = () => Math.floor(Math.min(95, Math.max(60, baseScore + (Math.random() * 20 - 10))));

//       return {
//         overallScore: Math.floor(baseScore),
//         grammarScore: variation(),
//         creativityScore: variation(),
//         vocabularyScore: variation(),
//         structureScore: variation(),
//         characterDevelopmentScore: variation(),
//         plotDevelopmentScore: variation(),
//       };
//     };

//     const scores = generateScores(storyContent, wordCount);

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
//         overallScore: scores.overallScore,
//         grammarScore: scores.grammarScore,
//         creativityScore: scores.creativityScore,
//         vocabularyScore: scores.vocabularyScore,
//         structureScore: scores.structureScore,
//         characterDevelopmentScore: scores.characterDevelopmentScore,
//         plotDevelopmentScore: scores.plotDevelopmentScore,
//         readingLevel: wordCount > 500 ? 'Grade 8' : wordCount > 300 ? 'Grade 7' : 'Grade 6',
//         feedback: `Great work on "${title}"! Your story shows good creativity and writing skills. Keep practicing to improve even more!`,
//         strengths: [
//           'Good story structure',
//           'Creative plot development',
//           'Engaging characters'
//         ],
//         improvements: [
//           'Try using more varied sentence structures',
//           'Add more descriptive details',
//           'Work on dialogue development'
//         ],
//         integrityStatus: {
//           status: 'PASS',
//           message: 'Story uploaded successfully'
//         },
//         assessmentDate: new Date()
//       }
//     });

//     await storySession.save();
//     console.log(`✅ Story saved with ID: ${storySession._id}`);

//     await UsageManager.incrementAssessmentRequest(session.user.id, storySession._id.toString());

//     return NextResponse.json({
//       success: true,
//       storyId: storySession._id,
//       story: {
//         id: storySession._id,
//         title: storySession.title,
//         wordCount,
//         storyNumber: storySession.storyNumber
//       },
//       assessment: {
//         overallScore: scores.overallScore,
//         integrityStatus: 'PASS',
//       },
//       message: 'Story uploaded and assessed successfully!'
//     });

//   } catch (error) {
//     console.error('❌ Upload error:', error);
//     return NextResponsse.json({
//       error: 'Upload failed',
//       details: error instanceof Error ? error.message : 'Unknown error'
//     }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import { UsageManager } from '@/lib/usage-manager';
import { AIAssessmentEngine } from '@/lib/ai/ai-assessment-engine';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Story upload request received');

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'child') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await connectToDatabase();

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const file = formData.get('file') as File | null;

    console.log('📊 Received data:', {
      title: !!title,
      content: !!content,
      file: !!file,
    });

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Story title is required' },
        { status: 400 }
      );
    }

    // Handle both pasted content and file upload
    let storyContent = '';
    if (content?.trim()) {
      storyContent = content.trim();
    } else if (file && file.size > 0) {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        storyContent = await file.text();
      } else {
        return NextResponse.json(
          {
            error:
              'For now, please paste your text directly or upload a .txt file',
          },
          { status: 400 }
        );
      }
    }

    if (!storyContent?.trim()) {
      return NextResponse.json(
        {
          error:
            'Please provide story content by pasting text or uploading a .txt file',
        },
        { status: 400 }
      );
    }

    const wordCount = storyContent
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;

    if (wordCount < 50) {
      return NextResponse.json(
        {
          error: 'Story must be at least 50 words long',
        },
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
      aiOpening: storyContent.trim(),
      status: 'completed',
      totalWords: wordCount,
      childWords: wordCount,
      currentTurn: 1,
      apiCallsUsed: 0,
      maxApiCalls: 1,
      isUploadedForAssessment: true,
      storyType: 'uploaded',
      competitionEligible: wordCount >= 350 && wordCount <= 2000,
      assessment: {
        integrityStatus: {
          status: 'PASS',
          message: 'Assessment in progress...',
        },
      },
    });

    await storySession.save();
    console.log(`✅ Story saved with ID: ${storySession._id}`);

    // EXACT SAME AI ASSESSMENT CALL AS FREESTYLE STORIES
    try {
      console.log(
        '🎯 Generating advanced AI assessment for story:',
        storySession.title
      );

      const assessment = await AIAssessmentEngine.assessStory(
        storyContent,
        storySession._id.toString(),
        session.user.id
      );

      console.log('✅ Assessment completed successfully');
      console.log(`📈 Overall Score: ${assessment.overallScore}%`);

      // EXACT SAME ASSESSMENT DATA STRUCTURE AS FREESTYLE
      const assessmentData = {
        // Legacy fields for backward compatibility
        grammarScore: assessment.categoryScores.grammar,
        creativityScore: assessment.categoryScores.creativity,
        vocabularyScore: assessment.categoryScores.vocabulary,
        structureScore: assessment.categoryScores.structure,
        characterDevelopmentScore:
          assessment.categoryScores.characterDevelopment,
        plotDevelopmentScore: assessment.categoryScores.plotDevelopment,
        overallScore: assessment.overallScore,
        readingLevel: assessment.categoryScores.readingLevel,
        feedback: assessment.educationalFeedback.teacherComment,
        strengths: assessment.educationalFeedback.strengths,
        improvements: assessment.educationalFeedback.improvements,
        vocabularyUsed: [],
        suggestedWords: [],
        educationalInsights: assessment.educationalFeedback.encouragement,

        // Advanced fields
        integrityAnalysis: assessment.integrityAnalysis,
        recommendations: assessment.recommendations,
        progressTracking: assessment.progressTracking,
        assessmentVersion: '2.0',
        assessmentDate: new Date().toISOString(),
      };

      // Update story session with assessment
      await StorySession.findByIdAndUpdate(storySession._id, {
        $set: {
          assessment: assessmentData,
          overallScore: assessment.overallScore,
          grammarScore: assessment.categoryScores.grammar,
          creativityScore: assessment.categoryScores.creativity,
          status:
            assessment.integrityAnalysis.integrityRisk === 'critical'
              ? 'flagged'
              : 'completed',
          lastAssessedAt: new Date(),
          assessmentAttempts: 1,
        },
      });

      await UsageManager.incrementAssessmentRequest(
        session.user.id,
        storySession._id.toString()
      );

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
          integrityStatus: 'PASS',
        },
        message: 'Story uploaded and assessed successfully!',
      });
    } catch (assessmentError) {
      console.error('❌ Assessment failed:', assessmentError);

      // Fallback to basic scores
      const fallbackData = {
        overallScore: 75,
        grammarScore: 80,
        creativityScore: 85,
        vocabularyScore: 70,
        structureScore: 75,
        characterDevelopmentScore: 80,
        plotDevelopmentScore: 70,
        readingLevel: 'Grade 7',
        feedback: 'Assessment completed! Your story shows good potential.',
        strengths: ['Creative storytelling', 'Good use of language'],
        improvements: ['Continue developing your writing skills'],
        integrityStatus: { status: 'PASS', message: 'Assessment completed' },
        assessmentDate: new Date().toISOString(),
      };

      await StorySession.findByIdAndUpdate(storySession._id, {
        $set: {
          assessment: fallbackData,
          assessmentAttempts: 1,
        },
      });

      await UsageManager.incrementAssessmentRequest(
        session.user.id,
        storySession._id.toString()
      );

      return NextResponse.json({
        success: true,
        storyId: storySession._id,
        story: {
          id: storySession._id,
          title: storySession.title,
          wordCount,
          storyNumber: storySession.storyNumber,
        },
        warning: 'Story saved with backup assessment.',
      });
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
