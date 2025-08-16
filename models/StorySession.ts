// // models/StorySession.ts - COMPLETELY FIXED VERSION
// import mongoose, { Schema, Document } from 'mongoose';

// export interface IStorySession extends Document {
//   _id: mongoose.Types.ObjectId;
//   childId: mongoose.Types.ObjectId;
//   storyNumber: number;
//   title: string;
//   aiOpening?: string;
//   currentTurn: number;
//   totalWords: number;
//   childWords: number;
//   apiCallsUsed: number;
//   maxApiCalls: number;
//   status: 'active' | 'completed' | 'paused' | 'flagged' | 'review';
  
//   // Assessment fields
//   assessment?: {
//     grammarScore?: number;
//     creativityScore?: number;
//     vocabularyScore?: number;
//     structureScore?: number;
//     characterDevelopmentScore?: number;
//     plotDevelopmentScore?: number;
//     themeScore?: number;
//     dialogueScore?: number;
//     descriptiveScore?: number;
//     pacingScore?: number;
//     overallScore?: number;
//     readingLevel?: string;
//     feedback?: string;
//     strengths?: string[];
//     improvements?: string[];
//     encouragement?: string;
//     integrityAnalysis?: {
//       plagiarismResult?: {
//         overallScore?: number;
//         riskLevel?: string;
//         violationCount?: number;
//         detailedAnalysis?: any;
//       };
//       aiDetectionResult?: {
//         likelihood?: string;
//         confidence?: number;
//         indicatorCount?: number;
//         detailedAnalysis?: any;
//       };
//       integrityRisk?: 'low' | 'medium' | 'high' | 'critical';
//     };
//     // FIXED: Make these fields required but with defaults
//     integrityStatus: {
//       status: 'PASS' | 'WARNING' | 'FAIL';
//       message: string;
//     };
//     assessmentDate?: Date;
//     isReassessment?: boolean;
//     error?: boolean;
//     errorMessage?: string;
//   };
  
//   assessmentAttempts: number;
//   isUploadedForAssessment: boolean;
//   lastAssessedAt?: Date;
  
//   // Publication fields
//   isPublished: boolean;
//   publicationDate?: Date;
//   publicationFee?: number;
//   competitionEligible: boolean;
  
//   // Competition fields
//   competitionEntries?: Array<{
//     competitionId: mongoose.Types.ObjectId;
//     submittedAt: Date;
//     phase: 'submission' | 'judging' | 'results';
//     rank?: number;
//     score?: number;
//   }>;
  
//   // Story type identification
//   storyType: 'freestyle' | 'uploaded' | 'competition';
  
//   // Story Elements
//   elements?: {
//     genre?: string;
//     character?: string;
//     setting?: string;
//     theme?: string;
//     mood?: string;
//     tone?: string;
//   };
  
//   // Timestamps
//   createdAt: Date;
//   updatedAt: Date;
//   completedAt?: Date;
//   pausedAt?: Date;
//   resumedAt?: Date;
// }

// const StorySessionSchema = new Schema<IStorySession>({
//   childId: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     index: true,
//   },
//   storyNumber: {
//     type: Number,
//     required: true,
//   },
//   title: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   aiOpening: {
//     type: String,
//     default: 'Start writing your story here...',
//   },
//   currentTurn: {
//     type: Number,
//     default: 1,
//   },
//   totalWords: {
//     type: Number,
//     default: 0,
//   },
//   childWords: {
//     type: Number,
//     default: 0,
//   },
//   apiCallsUsed: {
//     type: Number,
//     default: 0,
//   },
//   maxApiCalls: {
//     type: Number,
//     default: 7,
//   },
//   status: {
//     type: String,
//     enum: ['active', 'completed', 'paused', 'flagged', 'review'],
//     default: 'active',
//     index: true,
//   },

//   // Assessment fields - FIXED: Make integrityStatus required with defaults
//   assessment: {
//     grammarScore: { type: Number, min: 0, max: 100 },
//     creativityScore: { type: Number, min: 0, max: 100 },
//     vocabularyScore: { type: Number, min: 0, max: 100 },
//     structureScore: { type: Number, min: 0, max: 100 },
//     characterDevelopmentScore: { type: Number, min: 0, max: 100 },
//     plotDevelopmentScore: { type: Number, min: 0, max: 100 },
//     themeScore: { type: Number, min: 0, max: 100 },
//     dialogueScore: { type: Number, min: 0, max: 100 },
//     descriptiveScore: { type: Number, min: 0, max: 100 },
//     pacingScore: { type: Number, min: 0, max: 100 },
//     overallScore: { type: Number, min: 0, max: 100 },
//     readingLevel: { type: String },
//     feedback: { type: String },
//     strengths: [{ type: String }],
//     improvements: [{ type: String }],
//     encouragement: { type: String },
//     integrityAnalysis: {
//       plagiarismResult: {
//         overallScore: { type: Number },
//         riskLevel: { type: String },
//         violationCount: { type: Number },
//         detailedAnalysis: { type: Schema.Types.Mixed },
//       },
//       aiDetectionResult: {
//         likelihood: { type: String },
//         confidence: { type: Number },
//         indicatorCount: { type: Number },
//         detailedAnalysis: { type: Schema.Types.Mixed },
//       },
//       integrityRisk: {
//         type: String,
//         enum: ['low', 'medium', 'high', 'critical'],
//       },
//     },
//     // FIXED: Required fields with default values to prevent validation errors
//     integrityStatus: {
//       status: {
//         type: String,
//         enum: ['PASS', 'WARNING', 'FAIL'],
//         required: true,
//         default: 'PASS', // Add default value
//       },
//       message: {
//         type: String,
//         required: true,
//         default: 'Assessment pending...', // Add default value
//       },
//     },
//     assessmentDate: { type: Date },
//     isReassessment: { type: Boolean, default: false },
//     error: { type: Boolean, default: false },
//     errorMessage: { type: String },
//   },

//   assessmentAttempts: {
//     type: Number,
//     default: 0,
//   },
//   isUploadedForAssessment: {
//     type: Boolean,
//     default: false,
//     index: true,
//   },
//   lastAssessedAt: {
//     type: Date,
//   },

//   // Publication fields
//   isPublished: {
//     type: Boolean,
//     default: false,
//     index: true,
//   },
//   publicationDate: {
//     type: Date,
//   },
//   publicationFee: {
//     type: Number,
//   },
//   competitionEligible: {
//     type: Boolean,
//     default: true,
//     index: true,
//   },

//   // Competition fields
//   competitionEntries: [{
//     competitionId: {
//       type: Schema.Types.ObjectId,
//       ref: 'Competition',
//     },
//     submittedAt: {
//       type: Date,
//       default: Date.now,
//     },
//     phase: {
//       type: String,
//       enum: ['submission', 'judging', 'results'],
//       default: 'submission',
//     },
//     rank: { type: Number },
//     score: { type: Number },
//   }],

//   // Story type identification
//   storyType: {
//     type: String,
//     enum: ['freestyle', 'uploaded', 'competition'],
//     default: 'freestyle',
//     index: true,
//   },

//   // Story Elements
//   elements: {
//     genre: { type: String },
//     character: { type: String },
//     setting: { type: String },
//     theme: { type: String },
//     mood: { type: String },
//     tone: { type: String },
//   },

//   // Timestamps
//   completedAt: { type: Date },
//   pausedAt: { type: Date },
//   resumedAt: { type: Date },
// }, {
//   timestamps: true,
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true },
// });

// // FIXED: Pre-save middleware to ensure integrityStatus is always set
// StorySessionSchema.pre('save', function(next) {
//   if (this.assessment && !this.assessment.integrityStatus) {
//     this.assessment.integrityStatus = {
//       status: 'PASS',
//       message: 'Assessment pending...'
//     };
//   }
//   next();
// });

// // FIXED: Pre-validate middleware to set defaults before validation
// StorySessionSchema.pre('validate', function(next) {
//   if (this.assessment && !this.assessment.integrityStatus) {
//     this.assessment.integrityStatus = {
//       status: 'PASS',
//       message: 'Assessment pending...'
//     };
//   }
//   next();
// });

// // Indexes
// StorySessionSchema.index({ childId: 1, createdAt: -1 });
// StorySessionSchema.index({ childId: 1, status: 1 });
// StorySessionSchema.index({ childId: 1, isPublished: 1 });
// StorySessionSchema.index({ childId: 1, storyType: 1 });

// export default mongoose.models?.StorySession || mongoose.model<IStorySession>('StorySession', StorySessionSchema);

// models/StorySession.ts - COMPLETE VERSION WITH PHYSICAL ANTHOLOGY
import mongoose, { Schema, Document } from 'mongoose';

export interface IStorySession extends Document {
  _id: mongoose.Types.ObjectId;
  childId: mongoose.Types.ObjectId;
  storyNumber: number;
  title: string;
  aiOpening?: string;
  currentTurn: number;
  totalWords: number;
  childWords: number;
  apiCallsUsed: number;
  maxApiCalls: number;
  status: 'active' | 'completed' | 'paused' | 'flagged' | 'review';
  
  // Assessment fields
  assessment?: {
    grammarScore?: number;
    creativityScore?: number;
    vocabularyScore?: number;
    structureScore?: number;
    characterDevelopmentScore?: number;
    plotDevelopmentScore?: number;
    themeScore?: number;
    dialogueScore?: number;
    descriptiveScore?: number;
    pacingScore?: number;
    overallScore?: number;
    readingLevel?: string;
    feedback?: string;
    strengths?: string[];
    improvements?: string[];
    encouragement?: string;
    integrityAnalysis?: {
      plagiarismResult?: {
        overallScore?: number;
        riskLevel?: string;
        violationCount?: number;
        detailedAnalysis?: any;
      };
      aiDetectionResult?: {
        likelihood?: string;
        confidence?: number;
        indicatorCount?: number;
        detailedAnalysis?: any;
      };
      integrityRisk?: 'low' | 'medium' | 'high' | 'critical';
    };
    integrityStatus: {
      status: 'PASS' | 'WARNING' | 'FAIL';
      message: string;
    };
    assessmentDate?: Date;
    isReassessment?: boolean;
    error?: boolean;
    errorMessage?: string;
  };
  
  assessmentAttempts: number;
  isUploadedForAssessment: boolean;
  lastAssessedAt?: Date;
  
  // Publication fields
  isPublished: boolean;
  publishedAt?: Date;
  publicationDate?: Date;
  publicationFee?: number;
  competitionEligible: boolean;
  
  // Physical Anthology fields - REQUIRED FIELD
  physicalAnthology?: {
    purchased: boolean;
    purchaseDate?: Date;
    stripeSessionId?: string;
    amount?: number;
  };
  
  // Competition fields
  competitionEntries?: Array<{
    competitionId: mongoose.Types.ObjectId;
    submittedAt: Date;
    phase: 'submission' | 'judging' | 'results';
    rank?: number;
    score?: number;
  }>;
  
  // Story type identification
  storyType: 'freestyle' | 'uploaded' | 'competition';
  
  // Story Elements
  elements?: {
    genre?: string;
    character?: string;
    setting?: string;
    theme?: string;
    mood?: string;
    tone?: string;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  pausedAt?: Date;
  resumedAt?: Date;
}

const StorySessionSchema = new Schema<IStorySession>({
  childId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  storyNumber: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  aiOpening: {
    type: String,
    default: 'Start writing your story here...',
  },
  currentTurn: {
    type: Number,
    default: 1,
  },
  totalWords: {
    type: Number,
    default: 0,
  },
  childWords: {
    type: Number,
    default: 0,
  },
  apiCallsUsed: {
    type: Number,
    default: 0,
  },
  maxApiCalls: {
    type: Number,
    default: 7,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'flagged', 'review'],
    default: 'active',
    index: true,
  },

  // Assessment fields
  assessment: {
    grammarScore: { type: Number, min: 0, max: 100 },
    creativityScore: { type: Number, min: 0, max: 100 },
    vocabularyScore: { type: Number, min: 0, max: 100 },
    structureScore: { type: Number, min: 0, max: 100 },
    characterDevelopmentScore: { type: Number, min: 0, max: 100 },
    plotDevelopmentScore: { type: Number, min: 0, max: 100 },
    themeScore: { type: Number, min: 0, max: 100 },
    dialogueScore: { type: Number, min: 0, max: 100 },
    descriptiveScore: { type: Number, min: 0, max: 100 },
    pacingScore: { type: Number, min: 0, max: 100 },
    overallScore: { type: Number, min: 0, max: 100 },
    readingLevel: { type: String },
    feedback: { type: String },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    encouragement: { type: String },
    integrityAnalysis: {
      plagiarismResult: {
        overallScore: { type: Number },
        riskLevel: { type: String },
        violationCount: { type: Number },
        detailedAnalysis: { type: Schema.Types.Mixed },
      },
      aiDetectionResult: {
        likelihood: { type: String },
        confidence: { type: Number },
        indicatorCount: { type: Number },
        detailedAnalysis: { type: Schema.Types.Mixed },
      },
      integrityRisk: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
      },
    },
    integrityStatus: {
      status: {
        type: String,
        enum: ['PASS', 'WARNING', 'FAIL'],
        required: true,
        default: 'PASS',
      },
      message: {
        type: String,
        required: true,
        default: 'Assessment pending...',
      },
    },
    assessmentDate: { type: Date },
    isReassessment: { type: Boolean, default: false },
    error: { type: Boolean, default: false },
    errorMessage: { type: String },
  },

  assessmentAttempts: {
    type: Number,
    default: 0,
  },
  isUploadedForAssessment: {
    type: Boolean,
    default: false,
    index: true,
  },
  lastAssessedAt: {
    type: Date,
  },

  // Publication fields
  isPublished: {
    type: Boolean,
    default: false,
    index: true,
  },
  publishedAt: {
    type: Date,
  },
  publicationDate: {
    type: Date,
  },
  publicationFee: {
    type: Number,
  },
  competitionEligible: {
    type: Boolean,
    default: true,
    index: true,
  },

  // Physical Anthology fields - REQUIRED SCHEMA FIELD
  physicalAnthology: {
    purchased: {
      type: Boolean,
      default: false,
    },
    purchaseDate: { 
      type: Date 
    },
    stripeSessionId: { 
      type: String 
    },
    amount: { 
      type: Number 
    },
  },

  // Competition fields
  competitionEntries: [{
    competitionId: {
      type: Schema.Types.ObjectId,
      ref: 'Competition',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    phase: {
      type: String,
      enum: ['submission', 'judging', 'results'],
      default: 'submission',
    },
    rank: { type: Number },
    score: { type: Number },
  }],

  // Story type identification
  storyType: {
    type: String,
    enum: ['freestyle', 'uploaded', 'competition'],
    default: 'freestyle',
    index: true,
  },

  // Story Elements
  elements: {
    genre: { type: String },
    character: { type: String },
    setting: { type: String },
    theme: { type: String },
    mood: { type: String },
    tone: { type: String },
  },

  // Timestamps
  completedAt: { type: Date },
  pausedAt: { type: Date },
  resumedAt: { type: Date },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
StorySessionSchema.index({ childId: 1, createdAt: -1 });
StorySessionSchema.index({ childId: 1, status: 1 });
StorySessionSchema.index({ childId: 1, isPublished: 1 });
StorySessionSchema.index({ childId: 1, storyType: 1 });
StorySessionSchema.index({ 'physicalAnthology.purchased': 1 });

export default mongoose.models?.StorySession || mongoose.model<IStorySession>('StorySession', StorySessionSchema);