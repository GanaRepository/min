// models/Achievement.ts (CREATE THIS FILE)
import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: 'writing' | 'creativity' | 'consistency' | 'quality';
  earnedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['writing', 'creativity', 'consistency', 'quality'],
    required: true
  },
  earnedAt: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
});

AchievementSchema.index({ userId: 1, earnedAt: -1 });
AchievementSchema.index({ category: 1 });

export default mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', AchievementSchema);