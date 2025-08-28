// // app/api/stories/export/[storyId]/[format]/route.ts
// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/utils/authOptions';
// import { connectToDatabase } from '@/utils/db';
// import StorySession from '@/models/StorySession'; // ADDED: Missing import
// import Turn from '@/models/Turn'; // ADDED: Missing import
// import mongoose from 'mongoose'; // ADDED: Missing import
// import { PDFGenerator } from '@/lib/export/pdf-generator';
// import { WordGenerator } from '@/lib/export/word-generator';

// export async function GET(
//   request: Request,
//   { params }: { params: { storyId: string; format: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || session.user.role !== 'child') {
//       return NextResponse.json(
//         { error: 'Access denied. Children only.' },
//         { status: 403 }
//       );
//     }

//     const { storyId, format } = params;

//     if (!['pdf', 'word'].includes(format)) {
//       return NextResponse.json(
//         { error: 'Invalid format. Use "pdf" or "word".' },
//         { status: 400 }
//       );
//     }

//     await connectToDatabase();

//     // FIXED: Get story from StorySession instead of PublishedStory
//     let storySession = null;
//     let actualSessionId = null;

//     if (mongoose.Types.ObjectId.isValid(storyId)) {
//       storySession = await StorySession.findOne({
//         _id: storyId,
//         childId: session.user.id,
//         status: 'completed',
//       });
//       actualSessionId = storyId;
//     } else if (!isNaN(Number(storyId))) {
//       storySession = await StorySession.findOne({
//         storyNumber: Number(storyId),
//         childId: session.user.id,
//         status: 'completed',
//       });
//       actualSessionId = storySession?._id?.toString();
//     }

//     if (!storySession || !actualSessionId) {
//       return NextResponse.json({ error: 'Story not found' }, { status: 404 });
//     }

//     // Get turns and rebuild content
//     const turns = await Turn.find({ sessionId: actualSessionId })
//       .sort({ turnNumber: 1 })
//       .lean();

//     const storyParts = [];
//     if (storySession.aiOpening) {
//       storyParts.push(storySession.aiOpening);
//     }
//     turns.forEach((turn) => {
//       if (turn.childInput) storyParts.push(turn.childInput);
//       if (turn.aiResponse) storyParts.push(turn.aiResponse);
//     });

//     // Prepare story data for export
//     const storyData = {
//       title: storySession.title,
//       content: storyParts.join('\n\n'),
//       totalWords: storySession.totalWords,
//       authorName: `${session.user.firstName} ${session.user.lastName}`,
//       publishedAt: storySession.updatedAt.toISOString(),
//       elements: storySession.elements,
//       scores: {
//         grammar:
//           storySession.assessment?.grammarScore ||
//           storySession.grammarScore ||
//           0,
//         creativity:
//           storySession.assessment?.creativityScore ||
//           storySession.creativityScore ||
//           0,
//         overall:
//           storySession.assessment?.overallScore ||
//           storySession.overallScore ||
//           0,
//       },
//     };

//     // Rest of export logic remains the same...
//     let fileBlob: Blob;
//     let filename: string;
//     let contentType: string;

//     if (format === 'pdf') {
//       const pdfGenerator = new PDFGenerator();
//       fileBlob = pdfGenerator.generateStoryPDF(storyData);
//       filename = `${storySession.title}.pdf`;
//       contentType = 'application/pdf';
//     } else {
//       const wordGenerator = new WordGenerator();
//       fileBlob = await wordGenerator.generateStoryDocument(storyData);
//       filename = `${storySession.title}.docx`;
//       contentType =
//         'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
//     }

//     const buffer = Buffer.from(await fileBlob.arrayBuffer());

//     return new NextResponse(buffer, {
//       headers: {
//         'Content-Type': contentType,
//         'Content-Disposition': `attachment; filename="${filename}"`,
//         'Content-Length': buffer.length.toString(),
//       },
//     });
//   } catch (error) {
//     console.error('Error exporting story:', error);
//     return NextResponse.json(
//       { error: 'Failed to export story' },
//       { status: 500 }
//     );
//   }
// }

// app/api/stories/export/[storyId]/[format]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import mongoose from 'mongoose';
import { PDFGenerator } from '@/lib/export/pdf-generator';
import { WordGenerator } from '@/lib/export/word-generator';

export async function GET(
  request: Request,
  { params }: { params: { storyId: string; format: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const { storyId, format } = params;

    if (!['pdf', 'word'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use "pdf" or "word".' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get story from StorySession
    let storySession = null;
    let actualSessionId = null;

    if (mongoose.Types.ObjectId.isValid(storyId)) {
      storySession = await StorySession.findOne({
        _id: storyId,
        childId: session.user.id,
        status: 'completed',
      });
      actualSessionId = storyId;
    } else if (!isNaN(Number(storyId))) {
      storySession = await StorySession.findOne({
        storyNumber: Number(storyId),
        childId: session.user.id,
        status: 'completed',
      });
      actualSessionId = storySession?._id?.toString();
    }

    if (!storySession || !actualSessionId) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Get turns and rebuild content
    const turns = await Turn.find({ sessionId: actualSessionId })
      .sort({ turnNumber: 1 })
      .lean();

    const storyParts = [];
    if (storySession.aiOpening) {
      storyParts.push(storySession.aiOpening);
    }
    turns.forEach((turn) => {
      if (turn.childInput) storyParts.push(turn.childInput);
      if (turn.aiResponse) storyParts.push(turn.aiResponse);
    });

    // Transform assessment data to match the expected format
    const transformAssessment = (assessment: any) => {
      if (!assessment) return undefined;

      return {
        overallScore: assessment.overallScore,
        integrityAnalysis: {
          overallStatus: assessment.integrityStatus?.status === 'PASS' ? 'Original Human Writing' :
                        assessment.integrityStatus?.status === 'WARNING' ? 'Possible AI Content Detected' :
                        'High AI Content Detected',
          aiDetection: assessment.integrityAnalysis?.aiDetectionResult ? {
            humanLikeScore: 100 - (assessment.integrityAnalysis.aiDetectionResult.confidence || 0),
            aiLikelihood: assessment.integrityAnalysis.aiDetectionResult.likelihood || 'Low',
            riskLevel: assessment.integrityStatus?.status === 'PASS' ? 'Low' :
                      assessment.integrityStatus?.status === 'WARNING' ? 'Medium' : 'High'
          } : undefined,
          plagiarismCheck: assessment.integrityAnalysis?.plagiarismResult ? {
            originalityScore: assessment.integrityAnalysis.plagiarismResult.overallScore || 100,
            riskLevel: assessment.integrityAnalysis.plagiarismResult.riskLevel || 'Low'
          } : undefined,
        },
        coreWritingSkills: {
          grammar: assessment.grammarScore ? {
            score: assessment.grammarScore,
            feedback: assessment.feedback || 'No specific feedback available for grammar.'
          } : undefined,
          vocabulary: assessment.vocabularyScore ? {
            score: assessment.vocabularyScore,
            feedback: assessment.feedback || 'No specific feedback available for vocabulary.'
          } : undefined,
          creativity: assessment.creativityScore ? {
            score: assessment.creativityScore,
            feedback: assessment.feedback || 'No specific feedback available for creativity.'
          } : undefined,
          structure: assessment.structureScore ? {
            score: assessment.structureScore,
            feedback: assessment.feedback || 'No specific feedback available for structure.'
          } : undefined,
        },
        storyDevelopment: {
          characterDevelopment: assessment.characterDevelopmentScore ? {
            score: assessment.characterDevelopmentScore,
            feedback: 'Character development shows thoughtful consideration of personality traits and growth.'
          } : undefined,
          plotDevelopment: assessment.plotDevelopmentScore ? {
            score: assessment.plotDevelopmentScore,
            feedback: 'Plot development demonstrates understanding of story structure and pacing.'
          } : undefined,
          descriptiveWriting: assessment.descriptiveScore ? {
            score: assessment.descriptiveScore,
            feedback: 'Descriptive writing enhances the reader\'s ability to visualize scenes and emotions.'
          } : undefined,
        },
        advancedElements: {
          sensoryDetails: assessment.descriptiveScore ? {
            score: assessment.descriptiveScore,
            feedback: 'Use of sensory details helps create immersive reading experiences.'
          } : undefined,
          plotLogic: assessment.structureScore ? {
            score: assessment.structureScore,
            feedback: 'Story logic and consistency contribute to reader engagement.'
          } : undefined,
          themeRecognition: assessment.themeScore ? {
            score: assessment.themeScore,
            feedback: 'Thematic elements add depth and meaning to the narrative.'
          } : undefined,
          problemSolving: assessment.plotDevelopmentScore ? {
            score: assessment.plotDevelopmentScore,
            feedback: 'Problem-solving elements demonstrate creative thinking and resolution skills.'
          } : undefined,
        },
        comprehensiveFeedback: {
          strengths: assessment.strengths || [],
          areasForEnhancement: assessment.improvements || [],
          nextSteps: assessment.improvements ? 
            assessment.improvements.map((improvement: string) => 
              `Focus on: ${improvement.toLowerCase()}`
            ) : [],
          teacherAssessment: assessment.feedback || assessment.encouragement || 
            'This story demonstrates creativity and effort. Continue practicing to develop your writing skills further.',
        },
        ageAnalysis: {
          ageAppropriateness: assessment.overallScore || 85,
          readingLevel: assessment.readingLevel || 'Grade Level Appropriate',
          contentSuitability: 'Suitable for intended age group with positive themes and appropriate language.',
        },
      };
    };

    // Prepare comprehensive story data for export
    const storyData = {
      title: storySession.title,
      content: storyParts.join('\n\n'),
      totalWords: storySession.totalWords || storyParts.join(' ').split(' ').length,
      authorName: `${session.user.firstName} ${session.user.lastName}`,
      publishedAt: storySession.updatedAt.toISOString(),
      elements: storySession.elements ? {
        genre: storySession.elements.genre || 'Creative Writing',
        character: storySession.elements.character || 'Original Character',
        setting: storySession.elements.setting || 'Imaginative Setting',
        theme: storySession.elements.theme || 'Creative Theme',
        mood: storySession.elements.mood || 'Engaging',
        tone: storySession.elements.tone || 'Narrative'
      } : {
        genre: 'Creative Writing',
        character: 'Original Character',
        setting: 'Imaginative Setting',
        theme: 'Creative Theme',
        mood: 'Engaging',
        tone: 'Narrative'
      },
      scores: storySession.assessment ? {
        grammar: storySession.assessment.grammarScore || 0,
        creativity: storySession.assessment.creativityScore || 0,
        overall: storySession.assessment.overallScore || 0,
      } : undefined,
      // Include comprehensive assessment data
      assessment: transformAssessment(storySession.assessment),
    };

    // Generate the appropriate file format
    let fileBlob: Blob;
    let filename: string;
    let contentType: string;

    if (format === 'pdf') {
      const pdfGenerator = new PDFGenerator();
      fileBlob = pdfGenerator.generateStoryPDF(storyData);
      filename = `${storySession.title.replace(/[^a-zA-Z0-9]/g, '_')}_Assessment_Report.pdf`;
      contentType = 'application/pdf';
    } else {
      const wordGenerator = new WordGenerator();
      fileBlob = await wordGenerator.generateStoryDocument(storyData);
      filename = `${storySession.title.replace(/[^a-zA-Z0-9]/g, '_')}_Assessment_Report.docx`;
      contentType =
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    const buffer = Buffer.from(await fileBlob.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error exporting story:', error);
    return NextResponse.json(
      { error: 'Failed to export story' },
      { status: 500 }
    );
  }
}
