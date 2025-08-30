// // models/StorySession.ts - COMPLETE FIXED VERSION WITH COMMUNITY FIELDS
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

//   // NEW: Human-first integrity flags for mentor/admin review
//   integrityFlags?: {
//     needsReview: boolean;
//     aiDetectionLevel: string;
//     plagiarismRisk: string;
//     integrityRisk: string;
//     flaggedAt: Date;
//     reviewStatus:
//       | 'pending_mentor_review'
//       | 'reviewed_by_mentor'
//       | 'reviewed_by_admin'
//       | 'cleared';
//     mentorComments?: string[];
//     adminNotes?: string;
//   };

//   // Publication fields
//   isPublished?: boolean;
//   publishedAt?: Date;
//   publicationDate?: Date;
//   publicationFee?: number;
//   competitionEligible?: boolean;

//   // Physical anthology fields
//   physicalAnthology?: {
//     purchased: boolean;
//     purchaseDate?: Date;
//     stripeSessionId?: string;
//     amount?: number;
//   };

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

//   // 🆕 COMMUNITY FIELDS - THE MISSING PIECES!
//   likes?: mongoose.Types.ObjectId[];
//   bookmarks?: mongoose.Types.ObjectId[];
//   views?: number;
//   isFeatured?: boolean;
//   tags?: string[];
//   genre?: string;

//   // Legacy fields for backward compatibility
//   plagiarismScore?: number;
//   aiDetectionScore?: number;
//   integrityStatus?: string;

//   // Timestamps
//   createdAt: Date;
//   updatedAt: Date;
//   completedAt?: Date;
//   pausedAt?: Date;
//   resumedAt?: Date;
// }

// const StorySessionSchema = new Schema<IStorySession>(
//   {
//     childId: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//       index: true,
//     },
//     storyNumber: {
//       type: Number,
//       required: true,
//     },
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     aiOpening: {
//       type: String,
//       default: 'Start writing your story here...',
//     },
//     currentTurn: {
//       type: Number,
//       default: 1,
//     },
//     totalWords: {
//       type: Number,
//       default: 0,
//     },
//     childWords: {
//       type: Number,
//       default: 0,
//     },
//     apiCallsUsed: {
//       type: Number,
//       default: 0,
//     },
//     maxApiCalls: {
//       type: Number,
//       default: 7,
//     },
//     status: {
//       type: String,
//       enum: ['active', 'completed', 'paused', 'flagged', 'review'],
//       default: 'active',
//       index: true,
//     },

//     // Assessment fields
//     assessment: {
//       grammarScore: { type: Number, min: 0, max: 100 },
//       creativityScore: { type: Number, min: 0, max: 100 },
//       vocabularyScore: { type: Number, min: 0, max: 100 },
//       structureScore: { type: Number, min: 0, max: 100 },
//       characterDevelopmentScore: { type: Number, min: 0, max: 100 },
//       plotDevelopmentScore: { type: Number, min: 0, max: 100 },
//       themeScore: { type: Number, min: 0, max: 100 },
//       dialogueScore: { type: Number, min: 0, max: 100 },
//       descriptiveScore: { type: Number, min: 0, max: 100 },
//       pacingScore: { type: Number, min: 0, max: 100 },
//       overallScore: { type: Number, min: 0, max: 100 },
//       readingLevel: { type: String },
//       feedback: { type: String },
//       strengths: [{ type: String }],
//       improvements: [{ type: String }],
//       encouragement: { type: String },
//       integrityAnalysis: {
//         plagiarismResult: {
//           overallScore: { type: Number },
//           riskLevel: { type: String },
//           violationCount: { type: Number },
//           detailedAnalysis: { type: Schema.Types.Mixed },
//         },
//         aiDetectionResult: {
//           likelihood: { type: String },
//           confidence: { type: Number },
//           indicatorCount: { type: Number },
//           detailedAnalysis: { type: Schema.Types.Mixed },
//         },
//         integrityRisk: {
//           type: String,
//           enum: ['low', 'medium', 'high', 'critical'],
//         },
//       },
//       integrityStatus: {
//         status: {
//           type: String,
//           enum: ['PASS', 'WARNING', 'FAIL'],
//           required: true,
//           default: 'PASS',
//         },
//         message: {
//           type: String,
//           required: true,
//           default: 'Assessment pending...',
//         },
//       },
//       assessmentDate: { type: Date },
//       isReassessment: { type: Boolean, default: false },
//       error: { type: Boolean, default: false },
//       errorMessage: { type: String },
//     },

//     assessmentAttempts: {
//       type: Number,
//       default: 0,
//     },
//     isUploadedForAssessment: {
//       type: Boolean,
//       default: false,
//       index: true,
//     },
//     lastAssessedAt: {
//       type: Date,
//     },

//     // NEW: Human-first integrity flags for mentor/admin review
//     integrityFlags: {
//       needsReview: {
//         type: Boolean,
//         default: false,
//         index: true,
//       },
//       aiDetectionLevel: {
//         type: String,
//         enum: ['very_low', 'low', 'medium', 'high', 'very_high', 'unknown'],
//         default: 'unknown',
//       },
//       plagiarismRisk: {
//         type: String,
//         enum: ['low', 'medium', 'high', 'critical'],
//         default: 'low',
//       },
//       integrityRisk: {
//         type: String,
//         enum: ['low', 'medium', 'high', 'critical'],
//         default: 'low',
//       },
//       flaggedAt: {
//         type: Date,
//       },
//       reviewStatus: {
//         type: String,
//         enum: [
//           'pending_mentor_review',
//           'reviewed_by_mentor',
//           'reviewed_by_admin',
//           'cleared',
//         ],
//         default: 'pending_mentor_review',
//         index: true,
//       },
//       mentorComments: [
//         {
//           type: String,
//         },
//       ],
//       adminNotes: {
//         type: String,
//       },
//     },

//     // Publication fields
//     isPublished: {
//       type: Boolean,
//       default: false,
//       index: true,
//     },
//     publishedAt: {
//       type: Date,
//     },
//     publicationDate: {
//       type: Date,
//     },
//     publicationFee: {
//       type: Number,
//     },
//     competitionEligible: {
//       type: Boolean,
//       default: true,
//       index: true,
//     },

//     // Physical Anthology fields
//     physicalAnthology: {
//       purchased: {
//         type: Boolean,
//         default: false,
//       },
//       purchaseDate: {
//         type: Date,
//       },
//       stripeSessionId: {
//         type: String,
//       },
//       amount: {
//         type: Number,
//       },
//     },

//     // Competition fields
//     competitionEntries: [
//       {
//         competitionId: {
//           type: Schema.Types.ObjectId,
//           ref: 'Competition',
//         },
//         submittedAt: {
//           type: Date,
//           default: Date.now,
//         },
//         phase: {
//           type: String,
//           enum: ['submission', 'judging', 'results'],
//           default: 'submission',
//         },
//         rank: { type: Number },
//         score: { type: Number },
//       },
//     ],

//     // Story type identification
//     storyType: {
//       type: String,
//       enum: ['freestyle', 'uploaded', 'competition'],
//       default: 'freestyle',
//       index: true,
//     },

//     // Story Elements
//     elements: {
//       genre: { type: String },
//       character: { type: String },
//       setting: { type: String },
//       theme: { type: String },
//       mood: { type: String },
//       tone: { type: String },
//     },

//     // 🆕 COMMUNITY FIELDS - THE CRITICAL MISSING SCHEMA FIELDS!
//     likes: [
//       {
//         type: Schema.Types.ObjectId,
//         ref: 'User',
//         default: [],
//       },
//     ],
//     bookmarks: [
//       {
//         type: Schema.Types.ObjectId,
//         ref: 'User',
//         default: [],
//       },
//     ],
//     views: {
//       type: Number,
//       default: 0,
//       index: true,
//     },
//     isFeatured: {
//       type: Boolean,
//       default: false,
//     },
//     tags: [
//       {
//         type: String,
//         trim: true,
//       },
//     ],
//     genre: {
//       type: String,
//       default: 'Adventure',
//       index: true,
//     },

//     // Legacy fields for backward compatibility
//     plagiarismScore: { type: Number },
//     aiDetectionScore: { type: Number },
//     integrityStatus: { type: String },

//     // Timestamps
//     completedAt: { type: Date },
//     pausedAt: { type: Date },
//     resumedAt: { type: Date },
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// // FIXED: Pre-save middleware to ensure integrityStatus is always set
// StorySessionSchema.pre('save', function (next) {
//   if (this.assessment && !this.assessment.integrityStatus) {
//     this.assessment.integrityStatus = {
//       status: 'PASS',
//       message: 'Assessment pending...',
//     };
//   }
//   next();
// });

// // FIXED: Pre-validate middleware to set defaults before validation
// StorySessionSchema.pre('validate', function (next) {
//   if (this.assessment && !this.assessment.integrityStatus) {
//     this.assessment.integrityStatus = {
//       status: 'PASS',
//       message: 'Assessment pending...',
//     };
//   }
//   next();
// });

// // Existing indexes
// StorySessionSchema.index({ childId: 1, createdAt: -1 });
// StorySessionSchema.index({ childId: 1, status: 1 });
// StorySessionSchema.index({ childId: 1, isPublished: 1 });
// StorySessionSchema.index({ childId: 1, storyType: 1 });
// StorySessionSchema.index({ 'physicalAnthology.purchased': 1 });

// // 🆕 NEW COMMUNITY INDEXES
// StorySessionSchema.index({ isPublished: 1, publishedAt: -1 });
// StorySessionSchema.index({ views: -1 });
// StorySessionSchema.index({ isFeatured: 1 });

// export default mongoose.models?.StorySession ||
//   mongoose.model<IStorySession>('StorySession', StorySessionSchema);

// models/StorySession.ts - FIXED WITH 13-FACTOR ASSESSMENT SCHEMA
import mongoose, { Schema, Document } from 'mongoose';

export interface IStorySession extends Document {
  _id: mongoose.Types.ObjectId;
  childId: mongoose.Types.ObjectId;
  storyNumber: number;
  title: string;
  aiOpening?: string;
  content?: string;
  currentTurn: number;
  totalWords: number;
  childWords: number;
  aiWords?: number;
  apiCallsUsed: number;
  maxApiCalls: number;
  status: 'active' | 'completed' | 'paused' | 'flagged' | 'review';

  // ✅ FIXED: 13-Factor Assessment Structure
  assessment?: {
    // 13-Factor Structure
    coreLanguageSkills?: {
      grammarSentenceClarity?: string;
      vocabularyWordChoice?: string;
      spellingPunctuation?: string;
    };
    storytellingSkills?: {
      plotPacing?: string;
      characterDevelopment?: string;
      settingWorldBuilding?: string;
      dialogueExpression?: string;
      themeMessage?: string;
    };
    creativeExpressiveSkills?: {
      creativityOriginality?: string;
      descriptivePowerEmotionalImpact?: string;
    };
    authenticityGrowth?: {
      ageAppropriatenessAuthorship?: string;
      strengthsAreasToImprove?: string;
      practiceExercises?: string;
    };

    // Metadata
    assessmentVersion?: string;
    assessmentDate?: string;
    assessmentType?: string;
    userAge?: number;
    wordCount?: number;
    userContributionCount?: number;

    // Legacy fields for backwards compatibility
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
      integrityRisk?: string;
      overallStatus?: string;
      message?: string;
    };
    integrityStatus?: {
      status: 'PASS' | 'WARNING' | 'FAIL';
      message: string;
    };
  };

  // Assessment tracking
  assessmentAttempts?: number;
  lastAssessedAt?: Date;
  isUploadedForAssessment?: boolean;

  // Physical anthology
  physicalAnthology?: {
    purchased: boolean;
    purchaseDate?: Date;
    stripeSessionId?: string;
    amount?: number;
    trackingNumber?: string;
    shippingAddress?: {
      name: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };

  // Competition features
  competitionEligible?: boolean;
  competitionEntries?: Array<{
    competitionId: mongoose.Types.ObjectId;
    submittedAt: Date;
    rank?: number;
    score?: number;
    isWinner?: boolean;
  }>;

  // Story type identification
  storyType?: 'freestyle' | 'uploaded' | 'competition';

  // Story Elements
  elements?: {
    genre?: string;
    character?: string;
    setting?: string;
    theme?: string;
    mood?: string;
    tone?: string;
  };

  // Community features
  isPublished?: boolean;
  publishedAt?: Date;
  views?: number;
  likes?: mongoose.Types.ObjectId[];
  bookmarks?: mongoose.Types.ObjectId[];
  isFeatured?: boolean;
  tags?: string[];
  genre?: string;

  // Legacy fields for backward compatibility
  plagiarismScore?: number;
  aiDetectionScore?: number;
  integrityStatus?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  pausedAt?: Date;
  resumedAt?: Date;
}

const StorySessionSchema = new Schema<IStorySession>(
  {
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
    content: {
      type: String, // For uploaded stories
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
    aiWords: {
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

    // ✅ FIXED: 13-Factor Assessment Schema
    assessment: {
      // 13-Factor Structure
      coreLanguageSkills: {
        grammarSentenceClarity: { type: String },
        vocabularyWordChoice: { type: String },
        spellingPunctuation: { type: String },
      },
      storytellingSkills: {
        plotPacing: { type: String },
        characterDevelopment: { type: String },
        settingWorldBuilding: { type: String },
        dialogueExpression: { type: String },
        themeMessage: { type: String },
      },
      creativeExpressiveSkills: {
        creativityOriginality: { type: String },
        descriptivePowerEmotionalImpact: { type: String },
      },
      authenticityGrowth: {
        ageAppropriatenessAuthorship: { type: String },
        strengthsAreasToImprove: { type: String },
        practiceExercises: { type: String },
      },

      // Metadata
      assessmentVersion: { type: String },
      assessmentDate: { type: String },
      assessmentType: { type: String },
      userAge: { type: Number },
      wordCount: { type: Number },
      userContributionCount: { type: Number },

      // Legacy fields for backwards compatibility
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
        integrityRisk: { type: String },
        overallStatus: { type: String },
        message: { type: String },
      },
      integrityStatus: {
        status: { type: String, enum: ['PASS', 'WARNING', 'FAIL'] },
        message: { type: String },
      },
    },

    // Assessment tracking
    assessmentAttempts: { type: Number, default: 0 },
    lastAssessedAt: { type: Date },
    isUploadedForAssessment: { type: Boolean, default: false },

    // Physical anthology
    physicalAnthology: {
      purchased: { type: Boolean, default: false },
      purchaseDate: { type: Date },
      stripeSessionId: { type: String },
      amount: { type: Number },
      trackingNumber: { type: String },
      shippingAddress: {
        name: { type: String },
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String },
      },
    },

    // Competition features
    competitionEligible: { type: Boolean, default: false },
    competitionEntries: [
      {
        competitionId: { type: Schema.Types.ObjectId, ref: 'Competition' },
        submittedAt: { type: Date, default: Date.now },
        rank: { type: Number },
        score: { type: Number },
        isWinner: { type: Boolean, default: false },
      },
    ],

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

    // Community features
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    views: { type: Number, default: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }],
    genre: { type: String, default: 'Adventure' },

    // Legacy fields for backward compatibility
    plagiarismScore: { type: Number },
    aiDetectionScore: { type: Number },
    integrityStatus: { type: String },

    // Timestamps
    completedAt: { type: Date },
    pausedAt: { type: Date },
    resumedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save middleware to ensure integrityStatus is always set
StorySessionSchema.pre('save', function (next) {
  if (this.assessment && !this.assessment.integrityStatus) {
    this.assessment.integrityStatus = {
      status: 'PASS',
      message: 'Assessment pending...',
    };
  }
  next();
});

// Pre-validate middleware to set defaults before validation
StorySessionSchema.pre('validate', function (next) {
  if (this.assessment && !this.assessment.integrityStatus) {
    this.assessment.integrityStatus = {
      status: 'PASS',
      message: 'Assessment pending...',
    };
  }
  next();
});

// Indexes
StorySessionSchema.index({ childId: 1, createdAt: -1 });
StorySessionSchema.index({ childId: 1, status: 1 });
StorySessionSchema.index({ childId: 1, isPublished: 1 });
StorySessionSchema.index({ childId: 1, storyType: 1 });
StorySessionSchema.index({ 'physicalAnthology.purchased': 1 });
StorySessionSchema.index({ isPublished: 1, publishedAt: -1 });
StorySessionSchema.index({ views: -1 });
StorySessionSchema.index({ isFeatured: 1 });

export default mongoose.models?.StorySession ||
  mongoose.model<IStorySession>('StorySession', StorySessionSchema);
