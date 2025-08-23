// app/api/stories/session/[sessionId]/turns/route.ts - TURNS API
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import StorySession from '@/models/StorySession';
import Turn from '@/models/Turn';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify session ownership
    const storySession = await StorySession.findOne({
      _id: sessionId,
      childId: session.user.id,
    });

    if (!storySession) {
      return NextResponse.json(
        { error: 'Story session not found' },
        { status: 404 }
      );
    }

    // Get all turns for this session
    const turns = await Turn.find({ sessionId }).sort({ turnNumber: 1 }).lean();

    // FIXED: Separate child turns from AI responses for proper counting
    const childTurns = turns.filter(turn => turn.childInput && turn.childInput.trim());
    const aiTurns = turns.filter(turn => turn.aiResponse && turn.aiResponse.trim());

    // Calculate statistics
    const stats = {
      totalTurns: turns.length,
      childTurns: childTurns.length,
      aiTurns: aiTurns.length,
      totalWords: turns.reduce(
        (sum, turn) =>
          sum + (turn.childWordCount || turn.wordCount || 0),
        0
      ),
      childWords: childTurns.reduce(
        (sum, turn) => sum + (turn.childWordCount || turn.wordCount || 0),
        0
      ),
      aiWords: aiTurns.reduce((sum, turn) => sum + (turn.aiWordCount || turn.wordCount || 0), 0),
      averageWordsPerTurn:
        childTurns.length > 0
          ? Math.round(
              childTurns.reduce((sum, turn) => sum + (turn.childWordCount || turn.wordCount || 0), 0) /
                childTurns.length
            )
          : 0,
    };

    // FIXED: Return properly structured turns data
    const structuredTurns = turns.map((turn) => ({
      _id: turn._id,
      turnNumber: turn.turnNumber,
      childInput: turn.childInput || null,
      aiResponse: turn.aiResponse || null,
      childWordCount: turn.childWordCount || (turn.childInput ? turn.wordCount : 0),
      aiWordCount: turn.aiWordCount || (turn.aiResponse ? turn.wordCount : 0),
      timestamp: turn.timestamp || turn.createdAt,
      author: turn.author || (turn.childInput ? 'child' : 'ai'),
    }));

    return NextResponse.json({
      success: true,
      turns: structuredTurns,
      childTurnsOnly: childTurns.map((turn) => ({
        _id: turn._id,
        turnNumber: turn.turnNumber,
        childInput: turn.childInput,
        childWordCount: turn.childWordCount || turn.wordCount,
        timestamp: turn.timestamp || turn.createdAt,
      })),
      stats,
      sessionInfo: {
        title: storySession.title,
        status: storySession.status,
        currentTurn: storySession.currentTurn,
        maxTurns: 7,
        actualChildTurns: childTurns.length,
        nextTurnNumber: childTurns.length + 1,
        canContinue:
          storySession.status === 'active' && childTurns.length < 7,
      },
    });
  } catch (error) {
    console.error('Error fetching turns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch turns' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { sessionId } = params;
    const body = await request.json();
    const { action, turnId, content } = body;

    await connectToDatabase();

    // Verify session ownership
    const storySession = await StorySession.findOne({
      _id: sessionId,
      childId: session.user.id,
    });

    if (!storySession) {
      return NextResponse.json(
        { error: 'Story session not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'edit_turn':
        if (!turnId || !content) {
          return NextResponse.json(
            { error: 'Turn ID and content required for editing' },
            { status: 400 }
          );
        }

        // Validate word count
        const words = content.trim().split(/\s+/).filter(Boolean);
        if (words.length < 60 || words.length > 100) {
          return NextResponse.json(
            { error: 'Turn content must be between 60-100 words' },
            { status: 400 }
          );
        }

        // Update the turn
        const updatedTurn = await Turn.findOneAndUpdate(
          { _id: turnId, sessionId },
          {
            childInput: content.trim(),
            childWordCount: words.length,
            updatedAt: new Date(),
          },
          { new: true }
        );

        if (!updatedTurn) {
          return NextResponse.json(
            { error: 'Turn not found' },
            { status: 404 }
          );
        }

        // Recalculate session word counts
        const allTurns = await Turn.find({ sessionId });
        const totalChildWords = allTurns.reduce(
          (sum, turn) => sum + (turn.childWordCount || 0),
          0
        );
        const totalWords = allTurns.reduce(
          (sum, turn) =>
            sum + (turn.childWordCount || 0) + (turn.aiWordCount || 0),
          0
        );

        await StorySession.findByIdAndUpdate(sessionId, {
          childWords: totalChildWords,
          totalWords: totalWords,
          lastModifiedAt: new Date(),
        });

        return NextResponse.json({
          success: true,
          updatedTurn: {
            _id: updatedTurn._id,
            turnNumber: updatedTurn.turnNumber,
            childInput: updatedTurn.childInput,
            aiResponse: updatedTurn.aiResponse,
            childWordCount: updatedTurn.childWordCount,
            aiWordCount: updatedTurn.aiWordCount,
            timestamp: updatedTurn.timestamp,
          },
        });

      case 'delete_turn':
        if (!turnId) {
          return NextResponse.json(
            { error: 'Turn ID required for deletion' },
            { status: 400 }
          );
        }

        // Only allow deletion of the last turn and only if story is not completed
        if (storySession.status === 'completed') {
          return NextResponse.json(
            { error: 'Cannot delete turns from completed stories' },
            { status: 400 }
          );
        }

        const turnToDelete = await Turn.findOne({ _id: turnId, sessionId });
        if (!turnToDelete) {
          return NextResponse.json(
            { error: 'Turn not found' },
            { status: 404 }
          );
        }

        if (turnToDelete.turnNumber !== storySession.currentTurn) {
          return NextResponse.json(
            { error: 'Can only delete the most recent turn' },
            { status: 400 }
          );
        }

        await Turn.findByIdAndDelete(turnId);

        // Update session to previous turn
        const remainingTurns = await Turn.find({ sessionId });
        const newCurrentTurn = remainingTurns.length;
        const newChildWords = remainingTurns.reduce(
          (sum, turn) => sum + (turn.childWordCount || 0),
          0
        );
        const newTotalWords = remainingTurns.reduce(
          (sum, turn) =>
            sum + (turn.childWordCount || 0) + (turn.aiWordCount || 0),
          0
        );

        await StorySession.findByIdAndUpdate(sessionId, {
          currentTurn: newCurrentTurn,
          childWords: newChildWords,
          totalWords: newTotalWords,
          status: 'active', // Reactivate if it was completed
          lastModifiedAt: new Date(),
        });

        return NextResponse.json({
          success: true,
          deletedTurnNumber: turnToDelete.turnNumber,
          newCurrentTurn: newCurrentTurn,
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error managing turns:', error);
    return NextResponse.json(
      { error: 'Failed to manage turn' },
      { status: 500 }
    );
  }
}
