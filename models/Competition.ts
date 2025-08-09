// models/Competition.ts
import mongoose from 'mongoose';

const competitionSchema = new mongoose.Schema({
  month: { type: String, required: true }, // e.g., "January"
  year: { type: Number, required: true },
  phase: { 
    type: String, 
    enum: ['submission', 'judging', 'results'], 
    default: 'submission' 
  },
  
  // Auto-calculated dates
  submissionStart: { type: Date, required: true },
  submissionEnd: { type: Date, required: true },
  judgingStart: { type: Date, required: true },
  judgingEnd: { type: Date, required: true },
  resultsDate: { type: Date, required: true },
  
  // Competition rules
  maxEntriesPerChild: { type: Number, default: 3 },
  minWordCount: { type: Number, default: 350 },
  maxWordCount: { type: Number, default: 2000 },
  
  // Status tracking
  isActive: { type: Boolean, default: true },
  autoCreated: { type: Boolean, default: true },
  totalSubmissions: { type: Number, default: 0 },
  totalParticipants: { type: Number, default: 0 },
  
  // Winners (populated during results phase)
  winners: [{
    position: Number,
    childId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    childName: String,
    storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'StorySession' },
    title: String,
    score: Number,
    aiJudgingNotes: String
  }],
  
  // AI Judging criteria weights
  judgingCriteria: {
    grammar: { type: Number, default: 20 },
    creativity: { type: Number, default: 25 },
    structure: { type: Number, default: 15 },
    characterDevelopment: { type: Number, default: 15 },
    plotOriginality: { type: Number, default: 15 },
    vocabulary: { type: Number, default: 10 }
  }
}, {
  timestamps: true
});

// Ensure one active competition per month/year
competitionSchema.index({ month: 1, year: 1, isActive: 1 }, { unique: true });

export default mongoose.models.Competition || mongoose.model('Competition', competitionSchema);