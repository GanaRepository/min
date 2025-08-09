// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/utils/authOptions';
// import { connectToDatabase } from '@/utils/db';
// import StorySession from '@/models/StorySession';
// import Turn from '@/models/Turn';
// import { collaborationEngine } from '@/lib/ai/collaboration';
// import { checkRateLimit } from '@/lib/rate-limiter';
// import { Types } from 'mongoose';

// interface AIRespondRequest {
//   sessionId: string;
//   childInput: string;
//   turnNumber: number;
// }

// export async function POST(request: Request) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || session.user.role !== 'child') {
//       return NextResponse.json(
//         { error: 'Access denied. Children only.' },
//         { status: 403 }
//       );
//     }

//     const rateCheck = checkRateLimit(session.user.id, 'story-submit');
//     if (!rateCheck.allowed) {
//       return NextResponse.json(
//         {
//           error: rateCheck.message,
//           retryAfter: rateCheck.retryAfter,
//         },
//         { status: 429 }
//       );
//     }

//     const body: AIRespondRequest = await request.json();
//     const { sessionId, childInput, turnNumber } = body;

//     if (!sessionId || !childInput || !turnNumber) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     const trimmedInput = childInput.trim();
//     if (!trimmedInput) {
//       return NextResponse.json(
//         { error: 'Child input cannot be empty' },
//         { status: 400 }
//       );
//     }

//     const wordCount = trimmedInput.split(/\s+/).filter(Boolean).length;
//     if (wordCount < 60) {
//       return NextResponse.json(
//         { error: 'Please write at least 60 words to continue your story.' },
//         { status: 400 }
//       );
//     }

//     await connectToDatabase();

//     let storySession = null;

//     if (Types.ObjectId.isValid(sessionId)) {
//       storySession = await StorySession.findOne({
//         _id: sessionId,
//         childId: session.user.id,
//         status: { $in: ['active', 'paused'] },
//       });
//     }

//     if (!storySession && !isNaN(Number(sessionId))) {
//       storySession = await StorySession.findOne({
//         storyNumber: Number(sessionId),
//         childId: session.user.id,
//         status: { $in: ['active', 'paused'] },
//       });
//     }

//     if (!storySession) {
//       return NextResponse.json(
//         { error: 'Story session not found or not accessible' },
//         { status: 404 }
//       );
//     }

//     if (storySession.status === 'paused') {
//       storySession = await StorySession.findByIdAndUpdate(
//         storySession._id,
//         {
//           status: 'active',
//           resumedAt: new Date(),
//         },
//         { new: true }
//       );
//     }

//     if (!storySession) {
//       return NextResponse.json(
//         { error: 'Failed to resume story session' },
//         { status: 500 }
//       );
//     }

//     if (storySession.apiCallsUsed >= storySession.maxApiCalls) {
//       return NextResponse.json(
//         { error: 'API call limit reached' },
//         { status: 400 }
//       );
//     }

//     const actualSessionId = storySession._id.toString();
//     const previousTurns = await Turn.find({ sessionId: actualSessionId })
//       .sort({ turnNumber: 1 })
//       .lean();

//     const aiResponse = await collaborationEngine.generateContextualResponse(
//       null,
//       previousTurns.map((turn: any) => ({
//         childInput: turn.childInput,
//         aiResponse: turn.aiResponse,
//       })),
//       trimmedInput,
//       turnNumber
//     );

//     const aiWordCount = aiResponse.trim().split(/\s+/).filter(Boolean).length;

//     const turn = await Turn.create({
//       sessionId: actualSessionId,
//       turnNumber,
//       childInput: trimmedInput,
//       aiResponse,
//       childWordCount: wordCount,
//       aiWordCount: aiWordCount,
//     });

//     // Check if story is complete - different limits for guided vs freeform
//     const maxTurns = 7;
//     const isStoryComplete = turnNumber >= maxTurns;

//     const updatedSession = await StorySession.findByIdAndUpdate(
//       storySession._id,
//       {
//         $inc: {
//           totalWords: wordCount + aiWordCount,
//           childWords: wordCount,
//           apiCallsUsed: 1,
//         },
//         $set: {
//           currentTurn: turnNumber + 1,
//           status: isStoryComplete ? 'completed' : 'active',
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

//         const storyTheme = null;
//         const storyGenre = null;

//         assessment = await collaborationEngine.generateAssessment(
//           storyContent,
//           null,
//           {
//             totalWords: updatedSession.childWords,
//             turnCount: allTurns.length,
//             storyTheme: typeof storyTheme === 'string' ? storyTheme : '',
//             storyGenre: typeof storyGenre === 'string' ? storyGenre : '',
//             storyMode: 'freeform',
//           }
//         );

//         await StorySession.findByIdAndUpdate(actualSessionId, {
//           $set: {
//             assessment: {
//               grammarScore: assessment.grammarScore,
//               creativityScore: assessment.creativityScore,
//               overallScore: assessment.overallScore,
//               feedback: assessment.feedback,
//               readingLevel: assessment.readingLevel,
//               vocabularyScore: assessment.vocabularyScore,
//               structureScore: assessment.structureScore,
//               characterDevelopmentScore: assessment.characterDevelopmentScore,
//               plotDevelopmentScore: assessment.plotDevelopmentScore,
//               strengths: assessment.strengths,
//               improvements: assessment.improvements,
//               vocabularyUsed: assessment.vocabularyUsed,
//               suggestedWords: assessment.suggestedWords,
//               educationalInsights: assessment.educationalInsights,
//             },
//             overallScore: assessment.overallScore,
//             grammarScore: assessment.grammarScore,
//             creativityScore: assessment.creativityScore,
//             feedback: assessment.feedback,
//           },
//         });

//         console.log('✅ Assessment saved to database successfully!');
//       } catch (assessmentError) {
//         console.error(
//           '❌ Failed to auto-generate assessment:',
//           assessmentError
//         );
//       }
//     }

//     return NextResponse.json({
//       success: true,
//       turn: {
//         id: turn._id,
//         turnNumber: turn.turnNumber,
//         childInput: turn.childInput,
//         aiResponse: turn.aiResponse,
//         childWordCount: turn.childWordCount,
//         aiWordCount: turn.aiWordCount,
//       },
//       session: {
//         currentTurn: updatedSession.currentTurn,
//         totalWords: updatedSession.totalWords,
//         childWords: updatedSession.childWords,
//         apiCallsUsed: updatedSession.apiCallsUsed,
//         maxApiCalls: updatedSession.maxApiCalls,
//         status: updatedSession.status,
//         isComplete: isStoryComplete,
//       },
//       ...(assessment && {
//         assessment: {
//           grammarScore: assessment.grammarScore,
//           creativityScore: assessment.creativityScore,
//           overallScore: assessment.overallScore,
//           feedback: assessment.feedback,
//         },
//       }),
//     });
//   } catch (error) {
//     console.error('❌ Error in ai-respond API:', error);
//     return NextResponse.json(
//       { error: 'Failed to generate AI response' },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import { collaborationEngine } from '@/lib/ai/collaboration';
import { checkRateLimit } from '@/lib/rate-limiter';
import { Types } from 'mongoose';

interface AIRespondRequest {
  sessionId: string;
  childInput: string;
  turnNumber: number;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'child') {
      return NextResponse.json(
        { error: 'Access denied. Children only.' },
        { status: 403 }
      );
    }

    const rateCheck = checkRateLimit(session.user.id, 'story-submit');
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: rateCheck.message,
          retryAfter: rateCheck.retryAfter,
        },
        { status: 429 }
      );
    }

    const body: AIRespondRequest = await request.json();
    const { sessionId, childInput, turnNumber } = body;

    if (!sessionId || !childInput || !turnNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const trimmedInput = childInput.trim();
    if (!trimmedInput) {
      return NextResponse.json(
        { error: 'Child input cannot be empty' },
        { status: 400 }
      );
    }

    const wordCount = trimmedInput.split(/\s+/).filter(Boolean).length;
    if (wordCount < 60) {
      return NextResponse.json(
        { error: 'Please write at least 60 words to continue your story.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let storySession = null;

    if (Types.ObjectId.isValid(sessionId)) {
      storySession = await StorySession.findOne({
        _id: sessionId,
        childId: session.user.id,
        status: { $in: ['active', 'paused'] },
      });
    }

    if (!storySession && !isNaN(Number(sessionId))) {
      storySession = await StorySession.findOne({
        storyNumber: Number(sessionId),
        childId: session.user.id,
        status: { $in: ['active', 'paused'] },
      });
    }

    if (!storySession) {
      return NextResponse.json(
        { error: 'Story session not found or not accessible' },
        { status: 404 }
      );
    }

    if (storySession.status === 'paused') {
      storySession = await StorySession.findByIdAndUpdate(
        storySession._id,
        {
          status: 'active',
          resumedAt: new Date(),
        },
        { new: true }
      );
    }

    if (!storySession) {
      return NextResponse.json(
        { error: 'Failed to resume story session' },
        { status: 500 }
      );
    }

    if (storySession.apiCallsUsed >= storySession.maxApiCalls) {
      return NextResponse.json(
        { error: 'API call limit reached' },
        { status: 400 }
      );
    }

    const actualSessionId = storySession._id.toString();
    const previousTurns = await Turn.find({ sessionId: actualSessionId })
      .sort({ turnNumber: 1 })
      .lean();

    const aiResponse = await collaborationEngine.generateContextualResponse(
      null,
      previousTurns.map((turn: any) => ({
        childInput: turn.childInput,
        aiResponse: turn.aiResponse,
      })),
      trimmedInput,
      turnNumber
    );

    const aiWordCount = aiResponse.trim().split(/\s+/).filter(Boolean).length;

    const turn = await Turn.create({
      sessionId: actualSessionId,
      turnNumber,
      childInput: trimmedInput,
      aiResponse,
      childWordCount: wordCount,
      aiWordCount: aiWordCount,
    });

    // Check if story is complete - different limits for guided vs freeform
    const maxTurns = 7;
    const isStoryComplete = turnNumber >= maxTurns;

    const updatedSession = await StorySession.findByIdAndUpdate(
      storySession._id,
      {
        $inc: {
          totalWords: wordCount + aiWordCount,
          childWords: wordCount,
          apiCallsUsed: 1,
        },
        $set: {
          currentTurn: turnNumber + 1,
          status: isStoryComplete ? 'completed' : 'active',
          ...(isStoryComplete && { completedAt: new Date() }),
        },
      },
      { new: true }
    );

    if (!updatedSession) {
      return NextResponse.json(
        { error: 'Failed to update story session' },
        { status: 500 }
      );
    }

    let assessment = null;
    if (isStoryComplete) {
      try {
        console.log(
          '🎯 Story completed! Auto-generating detailed assessment...'
        );

        const allTurns = await Turn.find({ sessionId: actualSessionId })
          .sort({ turnNumber: 1 })
          .lean();

        const storyContent = allTurns
          .filter((turn) => turn.childInput)
          .map((turn) => turn.childInput)
          .join(' ');

        assessment = await collaborationEngine.generateAssessment(
          storyContent,
          null,
          {
            totalWords: updatedSession.childWords,
            turnCount: allTurns.length,
            storyTheme: '',
            storyGenre: '',
            storyMode: 'freeform',
          }
        );

        await StorySession.findByIdAndUpdate(actualSessionId, {
          $set: {
            assessment: {
              grammarScore: assessment.grammarScore,
              creativityScore: assessment.creativityScore,
              overallScore: assessment.overallScore,
              feedback: assessment.feedback,
              readingLevel: assessment.readingLevel,
              vocabularyScore: assessment.vocabularyScore,
              structureScore: assessment.structureScore,
              characterDevelopmentScore: assessment.characterDevelopmentScore,
              plotDevelopmentScore: assessment.plotDevelopmentScore,
              strengths: assessment.strengths,
              improvements: assessment.improvements,
              vocabularyUsed: assessment.vocabularyUsed,
              suggestedWords: assessment.suggestedWords,
              educationalInsights: assessment.educationalInsights,
            },
            overallScore: assessment.overallScore,
            grammarScore: assessment.grammarScore,
            creativityScore: assessment.creativityScore,
            feedback: assessment.feedback,
          },
        });

        console.log('✅ Assessment saved to database successfully!');
      } catch (assessmentError) {
        console.error(
          '❌ Failed to auto-generate assessment:',
          assessmentError
        );
      }
    }

    return NextResponse.json({
      success: true,
      turn: {
        id: turn._id,
        turnNumber: turn.turnNumber,
        childInput: turn.childInput,
        aiResponse: turn.aiResponse,
        childWordCount: turn.childWordCount,
        aiWordCount: turn.aiWordCount,
      },
      session: {
        currentTurn: updatedSession.currentTurn,
        totalWords: updatedSession.totalWords,
        childWords: updatedSession.childWords,
        apiCallsUsed: updatedSession.apiCallsUsed,
        maxApiCalls: updatedSession.maxApiCalls,
        status: updatedSession.status,
        isComplete: isStoryComplete,
      },
      ...(assessment && {
        assessment: {
          grammarScore: assessment.grammarScore,
          creativityScore: assessment.creativityScore,
          overallScore: assessment.overallScore,
          feedback: assessment.feedback,
        },
      }),
    });
  } catch (error) {
    console.error('❌ Error in ai-respond API:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    );
  }
}
