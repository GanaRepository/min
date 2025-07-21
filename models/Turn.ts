// models/Turn.ts (KEEP AS IS - min: 1)
import mongoose, { Schema, Document } from 'mongoose';

export interface ITurn extends Document {
  sessionId: mongoose.Types.ObjectId;
  turnNumber: number;
  childInput: string;
  aiResponse: string;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TurnSchema = new Schema<ITurn>({
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'StorySession',
    required: true
  },
  turnNumber: {
    type: Number,
    required: true,
    min: 1, // ✅ Keep as 1 - no Turn 0
    max: 7
  },
  childInput: {
    type: String,
    required: true,
    trim: true
  },
  aiResponse: {
    type: String,
    required: true,
    trim: true
  },
  wordCount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

TurnSchema.index({ sessionId: 1, turnNumber: 1 }, { unique: true });

export default mongoose.models.Turn || mongoose.model<ITurn>('Turn', TurnSchema);