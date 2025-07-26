// Create utils/sessionHelpers.ts
import mongoose from 'mongoose';
import StorySession from '@/models/StorySession';

export async function getActiveStorySession(sessionId: string, userId: string) {
  let storySession = null;

  // Try to find by MongoDB ObjectId first
  if (mongoose.Types.ObjectId.isValid(sessionId)) {
    storySession = await StorySession.findOne({
      _id: sessionId,
      childId: userId,
    });
  }

  // If not found by ObjectId, try by storyNumber
  if (!storySession && !isNaN(Number(sessionId))) {
    storySession = await StorySession.findOne({
      storyNumber: Number(sessionId),
      childId: userId,
    });
  }

  if (!storySession) {
    throw new Error('Story session not found');
  }

  // Auto-resume if paused and accessing the story
  if (storySession.status === 'paused') {
    storySession = await StorySession.findByIdAndUpdate(
      storySession._id,
      {
        status: 'active',
        resumedAt: new Date(),
      },
      { new: true }
    );
    
    console.log('Auto-resumed story session:', storySession._id);
  }

  return storySession;
}

// Use this helper in story page component
// Update fetchStorySession in story/[sessionId]/page.tsx:
