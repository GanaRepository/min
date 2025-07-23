// models/Turn.ts (UPDATED with word count fields)
import mongoose, { Schema, Document } from 'mongoose';

export interface ITurn extends Document {
  _id: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  turnNumber: number;
  childInput: string;
  aiResponse: string;
  childWordCount: number; // ✅ ADD THIS
  aiWordCount: number;    // ✅ ADD THIS
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
    min: 1,
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
  childWordCount: { // ✅ ADD THIS FIELD
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  aiWordCount: { // ✅ ADD THIS FIELD
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