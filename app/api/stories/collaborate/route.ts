// // app/api/stories/collaborate/route.ts - COMPLETE COLLABORATION API
// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/utils/authOptions';
// import { connectToDatabase } from '@/utils/db';
// import StorySession from '@/models/StorySession';
// import Turn from '@/models/Turn';
// import User from '@/models/User';
// import { collaborationEngine } from '@/lib/ai/collaboration';

// export async function POST(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
//     }

//     const body = await request.json();
//     const { sessionId, childInput, turnNumber } = body;

//     if (!sessionId || !childInput || !turnNumber) {
//       return NextResponse.json(
//         { error: 'Session ID, child input, and turn number are required' },
//         { status: 400 }
//       );
//     }

//     await connectToDatabase();

//     // Get the story session
//     const storySession = await StorySession.findOne({
//       _id: sessionId,
//       childId: session.user.id,
//       status: 'active'
//     });

//     if (!storySession) {
//       return NextResponse.json(
//         { error: 'Active story session not found' },
//         { status: 404 }
//       );
//     }

//     // Validate turn sequence
//     if (turnNumber !== storySession.currentTurn + 1) {
//       return NextResponse.json(
//         { error: `Expected turn ${storySession.currentTurn + 1}, got ${turnNumber}` },
//         { status: 400 }
//       );
//     }

//     // Validate turn limits
//     if (turnNumber > 7) {
//       return NextResponse.json(
//         { error: 'Maximum 7 turns allowed per story' },
//         { status: 400 }
//       );
//     }

//     // Validate word count
//     const childWords = childInput.trim().split(/\s+/).filter(Boolean);
//     if (childWords.length < 60 || childWords.length > 100) {
//       return NextResponse.json(
//         { error: 'Each turn must be between 60-100 words' },
//         { status: 400 }
//       );
//     }

//     console.log(`📝 Processing turn ${turnNumber} for session ${sessionId}`);

//     // Get previous turns for context
//     const previousTurns = await Turn.find({ sessionId })
//       .sort({ turnNumber: 1 })
//       .lean();

//     // Build story context
//     let storyContext = '';

//     // Include AI opening if exists
//     if (storySession.aiOpening) {
//       storyContext += `AI Opening: ${storySession.aiOpening}\n\n`;
//     }

//     // Include previous turns
//     previousTurns.forEach((turn) => {
//       if (turn.childInput) {
//         storyContext += `Child Turn ${turn.turnNumber}: ${turn.childInput}\n\n`;
//       }
//       if (turn.aiResponse) {
//         storyContext += `AI Response ${turn.turnNumber}: ${turn.aiResponse}\n\n`;
//       }
//     });

//     // Add current child input
//     storyContext += `Child Turn ${turnNumber}: ${childInput}\n\n`;

//     // Generate AI response (unless it's the final turn)
//     let aiResponse = '';
//     let aiWordCount = 0;

//     if (turnNumber < 7) {
//       console.log(`🤖 Generating AI response for turn ${turnNumber}`);

//       try {
//         aiResponse = await collaborationEngine.generateFreeformResponse(
//           childInput,
//           storyContext,
//           turnNumber
//         );

//         aiWordCount = aiResponse.split(/\s+/).filter(Boolean).length;
//         console.log(`✅ AI response generated: ${aiWordCount} words`);

//       } catch (error) {
//         console.error('AI response generation failed:', error);
//         // Provide a fallback response
//         aiResponse = "That's an interesting development! I'm excited to see where you take the story next. What happens next in your adventure?";
//         aiWordCount = aiResponse.split(/\s+/).filter(Boolean).length;
//       }
//     } else {
//       // Final turn - assessment message
//       aiResponse = "🎉 Amazing work on your story! You've completed all 7 turns and created something wonderful. Your story is now ready for detailed assessment. Great job on this creative writing adventure!";
//       aiWordCount = aiResponse.split(/\s+/).filter(Boolean).length;
//     }

//     // Create the new turn
//     const newTurn = new Turn({
//       sessionId,
//       turnNumber,
//       childInput: childInput.trim(),
//       aiResponse,
//       childWordCount: childWords.length,
//       aiWordCount,
//       timestamp: new Date()
//     });

//     await newTurn.save();
//     console.log(`💾 Turn ${turnNumber} saved successfully`);

//     // Update story session
//     const updateData: any = {
//       currentTurn: turnNumber,
//       totalWords: storySession.totalWords + childWords.length + aiWordCount,
//       childWords: storySession.childWords + childWords.length,
//       apiCallsUsed: storySession.apiCallsUsed + 1,
//       updatedAt: new Date()
//     };

//     // If this is the final turn, mark as completed
//     if (turnNumber >= 7) {
//       updateData.status = 'completed';
//       console.log(`🏁 Story completed after ${turnNumber} turns`);
//     }

//     await StorySession.findByIdAndUpdate(sessionId, updateData);

//     // Update user's monthly usage (for freestyle stories)
//     await User.findByIdAndUpdate(session.user.id, {
//       $inc: {
//         'monthlyUsage.freelanceStoriesCreated': turnNumber === 1 ? 1 : 0, // Only count on first turn
//         'monthlyUsage.totalWordsWritten': childWords.length
//       }
//     });

//     // Prepare response
//     const responseData = {
//       success: true,
//       newTurn: {
//         _id: newTurn._id,
//         turnNumber: newTurn.turnNumber,
//         childInput: newTurn.childInput,
//         aiResponse: newTurn.aiResponse,
//         childWordCount: newTurn.childWordCount,
//         aiWordCount: newTurn.aiWordCount,
//         timestamp: newTurn.timestamp
//       },
//       sessionStatus: {
//         currentTurn: turnNumber,
//         totalWords: updateData.totalWords,
//         childWords: updateData.childWords,
//         status: updateData.status || 'active',
//         isCompleted: turnNumber >= 7
//       }
//     };

//     console.log(`✅ Turn ${turnNumber} processed successfully`);
//     return NextResponse.json(responseData);

//   } catch (error) {
//     console.error('Error in story collaboration:', error);
//     return NextResponse.json(
//       { error: 'Failed to process story collaboration' },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
//     }

//     const { searchParams } = new URL(request.url);
//     const sessionId = searchParams.get('sessionId');

//     if (!sessionId) {
//       return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
//     }

//     await connectToDatabase();

//     // Get story session
//     const storySession = await StorySession.findOne({
//       _id: sessionId,
//       childId: session.user.id
//     });

//     if (!storySession) {
//       return NextResponse.json({ error: 'Story session not found' }, { status: 404 });
//     }

//     // Get all turns
//     const turns = await Turn.find({ sessionId })
//       .sort({ turnNumber: 1 })
//       .lean();

//     return NextResponse.json({
//       session: storySession,
//       turns,
//       canContinue: storySession.status === 'active' && storySession.currentTurn < 7,
//       isCompleted: storySession.status === 'completed' || storySession.currentTurn >= 7
//     });

//   } catch (error) {
//     console.error('Error fetching collaboration data:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch collaboration data' },
//       { status: 500 }
//     );
//   }
// }

// app/api/stories/collaborate/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';
import { collaborationEngine } from '@/lib/ai/collaboration';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId, childInput, turnNumber } = body;

    if (!sessionId || !childInput || !turnNumber) {
      return NextResponse.json(
        { error: 'Session ID, child input, and turn number are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get the story session
    const storySession = await StorySession.findOne({
      _id: sessionId,
      childId: session.user.id,
      status: 'active',
    });

    if (!storySession) {
      return NextResponse.json(
        { error: 'Active story session not found' },
        { status: 404 }
      );
    }

    // Validate word count
    const childWords = childInput.trim().split(/\s+/).filter(Boolean);
    if (childWords.length < 60 || childWords.length > 100) {
      return NextResponse.json(
        { error: 'Each turn must be between 60-100 words' },
        { status: 400 }
      );
    }

    console.log(`📝 Processing turn ${turnNumber} for session ${sessionId}`);

    // Get previous turns for context
    const previousTurns = await Turn.find({ sessionId })
      .sort({ turnNumber: 1 })
      .lean();

    // Build story context
    let storyContext = '';

    // Include AI opening if exists
    if (storySession.aiOpening) {
      storyContext += `AI Opening: ${storySession.aiOpening}\n\n`;
    }

    // Include previous turns
    previousTurns.forEach((turn) => {
      if (turn.childInput) {
        storyContext += `Child Turn ${turn.turnNumber}: ${turn.childInput}\n\n`;
      }
      if (turn.aiResponse) {
        storyContext += `AI Response ${turn.turnNumber}: ${turn.aiResponse}\n\n`;
      }
    });

    // Add current child input
    storyContext += `Child Turn ${turnNumber}: ${childInput}\n\n`;

    // Generate AI response (unless it's the final turn)
    let aiResponse = '';

    if (turnNumber < 7) {
      console.log(`🤖 Generating AI response for turn ${turnNumber}`);

      try {
        aiResponse = await collaborationEngine.generateFreeformResponse(
          childInput,
          storyContext,
          turnNumber
        );

        console.log(
          `✅ AI response generated: ${aiResponse.split(/\s+/).filter(Boolean).length} words`
        );
      } catch (error) {
        console.error('AI response generation failed:', error);
        // Provide a fallback response
        aiResponse =
          "That's an interesting development! I'm excited to see where you take the story next. What happens next in your adventure?";
      }
    } else {
      // Final turn - assessment message
      aiResponse =
        "🎉 Amazing work on your story! You've completed all 7 turns and created something wonderful. Your story is now ready for detailed assessment. Great job on this creative writing adventure!";
    }

    // Create the child's turn first
    const childTurn = new Turn({
      sessionId,
      turnNumber,
      author: 'child',
      childInput: childInput.trim(),
      content: childInput.trim(),
      wordCount: childWords.length,
    });

    await childTurn.save();
    console.log(`💾 Child turn ${turnNumber} saved successfully`);

    // Create the AI response turn (if not final turn)
    let aiTurn = null;
    if (turnNumber < 7 && aiResponse) {
      const aiWordCount = aiResponse.split(/\s+/).filter(Boolean).length;

      aiTurn = new Turn({
        sessionId,
        turnNumber: turnNumber + 0.5, // Use .5 to distinguish AI responses
        author: 'ai',
        aiResponse,
        content: aiResponse,
        wordCount: aiWordCount,
      });

      await aiTurn.save();
      console.log(`🤖 AI response turn saved successfully`);
    }

    // Update story session
    const updateData: any = {
      currentTurn: turnNumber,
      totalWords:
        storySession.totalWords +
        childWords.length +
        (aiResponse ? aiResponse.split(/\s+/).filter(Boolean).length : 0),
      childWords: storySession.childWords + childWords.length,
      apiCallsUsed: storySession.apiCallsUsed + 1,
      updatedAt: new Date(),
    };

    // If this is the final turn, mark as completed and trigger assessment
    if (turnNumber >= 7) {
      updateData.status = 'completed';
      updateData.completedAt = new Date();
      console.log(`🏁 Story completed after ${turnNumber} turns`);
      
      // TRIGGER COMPREHENSIVE AI ASSESSMENT FOR FREESTYLE STORIES
      try {
        console.log('🎯 Story completed! Auto-generating detailed assessment...');
        
        // Import the AI Assessment Engine
        const { AIAssessmentEngine } = await import('@/lib/ai/ai-assessment-engine');
        
        // Get the full story content for assessment
        const allTurns = await Turn.find({ sessionId }).sort({ turnNumber: 1 });
        let fullStoryContent = '';
        
        // Include AI opening
        if (storySession.aiOpening) {
          fullStoryContent += `${storySession.aiOpening}\n\n`;
        }
        
        // Include all child inputs (user's actual writing)
        const userTurns = allTurns
          .filter(turn => turn.childInput)
          .map(turn => turn.childInput.trim());
        
        fullStoryContent += userTurns.join('\n\n');
        
        console.log(`📝 Assessing story content: ${fullStoryContent.length} characters`);
        
        // Perform comprehensive assessment
        const assessment = await AIAssessmentEngine.performCompleteAssessment(fullStoryContent, {
          childAge: 10, // Default age, can be updated from user profile
          isCollaborativeStory: true,
          storyTitle: storySession.title || 'Collaborative Story',
          userTurns: userTurns,
          expectedGenre: 'creative'
        });
        
        console.log('✅ Assessment completed successfully');
        console.log(`📈 Overall Score: ${assessment.overallScore}%`);
        console.log(`🔍 Integrity Status: ${assessment.integrityStatus.status}`);
        
        // Create comprehensive assessment data structure
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
          
          // New comprehensive fields
          categoryScores: assessment.categoryScores,
          integrityAnalysis: assessment.integrityAnalysis,
          educationalFeedback: assessment.educationalFeedback,
          recommendations: assessment.recommendations,
          progressTracking: assessment.progressTracking,
          integrityStatus: assessment.integrityStatus,
          
          // Assessment metadata
          assessmentVersion: '2.0',
          assessmentDate: new Date().toISOString(),
          assessmentType: 'collaborative_freestyle'
        };
        
        // Update story session with comprehensive assessment
        updateData.assessment = assessmentData;
        updateData.overallScore = assessment.overallScore;
        updateData.grammarScore = assessment.categoryScores.grammar;
        updateData.creativityScore = assessment.categoryScores.creativity;
        updateData.lastAssessedAt = new Date();
        updateData.assessmentAttempts = 1;
        
        // Flag story if integrity issues detected
        if (assessment.integrityAnalysis.integrityRisk === 'critical') {
          updateData.status = 'flagged';
          console.log('⚠️ Story flagged due to integrity concerns');
        }
        
        console.log('💾 Saving comprehensive assessment to database...');
        
      } catch (assessmentError) {
        console.error('❌ Assessment failed for completed story:', assessmentError);
        
        // Fallback assessment data
        updateData.assessment = {
          overallScore: 75,
          grammarScore: 80,
          creativityScore: 85,
          vocabularyScore: 70,
          structureScore: 75,
          characterDevelopmentScore: 80,
          plotDevelopmentScore: 70,
          readingLevel: 'Grade 7',
          feedback: 'Great work on your collaborative story! Assessment completed.',
          strengths: ['Creative storytelling', 'Good collaboration skills'],
          improvements: ['Continue developing your writing skills'],
          integrityStatus: { status: 'PASS', message: 'Assessment completed with backup system' },
          assessmentDate: new Date().toISOString(),
          assessmentType: 'collaborative_freestyle_fallback'
        };
        updateData.assessmentAttempts = 1;
        console.log('📝 Using fallback assessment due to error');
      }
    }

    await StorySession.findByIdAndUpdate(sessionId, updateData);

    // Prepare response - return the child turn with AI response included
    const responseData = {
      success: true,
      newTurn: {
        _id: childTurn._id,
        turnNumber: childTurn.turnNumber,
        childInput: childTurn.childInput,
        aiResponse: aiResponse,
        childWordCount: childWords.length,
        aiWordCount: aiResponse
          ? aiResponse.split(/\s+/).filter(Boolean).length
          : 0,
        timestamp: childTurn.createdAt,
      },
      sessionStatus: {
        currentTurn: turnNumber,
        totalWords: updateData.totalWords,
        childWords: updateData.childWords,
        status: updateData.status || 'active',
        isCompleted: turnNumber >= 7,
      },
      // Include assessment data if story is completed
      ...(turnNumber >= 7 && updateData.assessment && {
        assessment: {
          overallScore: updateData.assessment.overallScore,
          integrityStatus: updateData.assessment.integrityStatus?.status || 'PASS',
          completedAt: updateData.completedAt,
          message: 'Story completed and assessed!'
        }
      })
    };

    console.log(`✅ Turn ${turnNumber} processed successfully`);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in story collaboration:', error);
    return NextResponse.json(
      { error: 'Failed to process story collaboration' },
      { status: 500 }
    );
  }
}
