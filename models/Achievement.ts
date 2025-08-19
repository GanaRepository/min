// models/Achievement.ts - COMPLETE FIXED VERSION
import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  _id: mongoose.Types.ObjectId;
  childId: mongoose.Types.ObjectId;

  // Achievement details
  achievementType:
    | 'writing'
    | 'creativity'
    | 'competition'
    | 'milestone'
    | 'consistency'
    | 'improvement';
  title: string;
  description: string;
  icon: string;
  color: string;

  // Achievement criteria
  criteria: {
    triggerType:
      | 'story_count'
      | 'word_count'
      | 'score_threshold'
      | 'competition_rank'
      | 'streak'
      | 'improvement';
    threshold?: number;
    comparison?: 'gte' | 'lte' | 'eq';
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  };

  // Achievement context
  relatedStoryId?: mongoose.Types.ObjectId;
  relatedCompetitionId?: mongoose.Types.ObjectId;
  achievementData?: {
    scoreAchieved?: number;
    rankAchieved?: number;
    streakLength?: number;
    wordsWritten?: number;
    storiesCompleted?: number;
    improvementPercentage?: number;
  };

  // Status
  isVisible: boolean;
  isSpecial: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

  // Timestamps
  earnedAt: Date;
  notifiedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    childId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Achievement details
    achievementType: {
      type: String,
      enum: [
        'writing',
        'creativity',
        'competition',
        'milestone',
        'consistency',
        'improvement',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },

    // Achievement criteria
    criteria: {
      triggerType: {
        type: String,
        enum: [
          'story_count',
          'word_count',
          'score_threshold',
          'competition_rank',
          'streak',
          'improvement',
        ],
        required: true,
      },
      threshold: { type: Number },
      comparison: {
        type: String,
        enum: ['gte', 'lte', 'eq'],
      },
      timeframe: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'all_time'],
      },
    },

    // Achievement context
    relatedStoryId: {
      type: Schema.Types.ObjectId,
      ref: 'StorySession',
    },
    relatedCompetitionId: {
      type: Schema.Types.ObjectId,
      ref: 'Competition',
    },
    achievementData: {
      scoreAchieved: { type: Number },
      rankAchieved: { type: Number },
      streakLength: { type: Number },
      wordsWritten: { type: Number },
      storiesCompleted: { type: Number },
      improvementPercentage: { type: Number },
    },

    // Status
    isVisible: {
      type: Boolean,
      default: true,
    },
    isSpecial: {
      type: Boolean,
      default: false,
    },
    rarity: {
      type: String,
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
      default: 'common',
    },

    // Timestamps
    earnedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    notifiedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Indexes
AchievementSchema.index({ childId: 1, earnedAt: -1 });
AchievementSchema.index({ childId: 1, achievementType: 1 });
AchievementSchema.index({ childId: 1, isVisible: 1, earnedAt: -1 });

export default mongoose.models?.Achievement ||
  mongoose.model<IAchievement>('Achievement', AchievementSchema);
