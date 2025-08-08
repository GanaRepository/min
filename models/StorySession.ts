// // // models/StorySession.ts (COMPLETE REPLACEMENT - DELETE ALL OLD CODE)
// // import mongoose, { Schema, Document } from 'mongoose';

// // export interface StoryElements {
// //   genre?: string;  // ✅ Optional
// //   character?: string;  // ✅ Optional
// //   setting?: string;  // ✅ Optional
// //   theme?: string;  // ✅ Optional
// //   mood?: string;  // ✅ Optional
// //   tone?: string;  // ✅ Optional
// // }

// // export interface IStorySession extends Document {
// //   _id: mongoose.Types.ObjectId;
// //   childId: mongoose.Types.ObjectId;
// //   storyNumber: number;
// //   title: string;
// //   elements?: StoryElements;  // ✅ Optional
// //   storyMode: 'guided' | 'freeform';  // ✅ Add story mode
// //   aiOpening?: string;
// //   currentTurn: number;
// //   totalWords: number;
// //   childWords: number;
// //   apiCallsUsed: number;
// //   maxApiCalls: number;
// //   status: 'active' | 'completed' | 'paused';

// //   // Assessment fields
// //   assessment?: {
// //     grammarScore: number;
// //     creativityScore: number;
// //     overallScore: number;
// //     feedback: string;
// //   };
// //   overallScore?: number;
// //   grammarScore?: number;
// //   creativityScore?: number;
// //   feedback?: string;
// //   completedAt?: Date;
// //   pausedAt?: Date;

// //   // Draft storage
// //   draft?: Record<string, any>;

// //   createdAt: Date;
// //   updatedAt: Date;
// // }

// // const StorySessionSchema = new Schema<IStorySession>(
// //   {
// //     childId: {
// //       type: Schema.Types.ObjectId,
// //       ref: 'User',
// //       required: true,
// //     },
// //     storyNumber: {
// //       type: Number,
// //       required: true,
// //       min: 1,
// //     },
// //     title: {
// //       type: String,
// //       required: true,
// //       trim: true,
// //       maxlength: 100,
// //     },
// //     // ✅ FIXED: Elements are now optional and support both guided/freeform
// //     elements: {
// //       type: {
// //         genre: { type: String, trim: true },      // ✅ No longer required
// //         character: { type: String, trim: true },  // ✅ No longer required
// //         setting: { type: String, trim: true },    // ✅ No longer required
// //         theme: { type: String, trim: true },      // ✅ No longer required
// //         mood: { type: String, trim: true },       // ✅ No longer required
// //         tone: { type: String, trim: true },       // ✅ No longer required
// //       },
// //       required: false,  // ✅ Elements object is optional
// //       default: undefined,  // ✅ Default to undefined for freeform
// //     },
// //     // ✅ ADD: Story mode field
// //     storyMode: {
// //       type: String,
// //       enum: ['guided', 'freeform'],
// //       required: true,
// //       default: 'guided',
// //     },
// //     aiOpening: {
// //       type: String,
// //       trim: true,
// //     },
// //     currentTurn: {
// //       type: Number,
// //       required: true,
// //       min: 1,
// //       max: 6,
// //       default: 1,
// //     },
// //     totalWords: {
// //       type: Number,
// //       required: true,
// //       min: 0,
// //       default: 0,
// //     },
// //     childWords: {
// //       type: Number,
// //       required: true,
// //       min: 0,
// //       default: 0,
// //     },
// //     apiCallsUsed: {
// //       type: Number,
// //       required: true,
// //       min: 0,
// //       default: 0,
// //     },
// //     maxApiCalls: {
// //       type: Number,
// //       required: true,
// //       min: 1,
// //       default: 7,
// //     },
// //     status: {
// //       type: String,
// //       enum: ['active', 'completed', 'paused'],
// //       default: 'active',
// //       required: true,
// //     },

// //     // Assessment fields
// //     assessment: {
// //       grammarScore: { type: Number, min: 0, max: 100 },
// //       creativityScore: { type: Number, min: 0, max: 100 },
// //       overallScore: { type: Number, min: 0, max: 100 },
// //       feedback: { type: String, trim: true },
// //     },
// //     overallScore: { type: Number, min: 0, max: 100 },
// //     grammarScore: { type: Number, min: 0, max: 100 },
// //     creativityScore: { type: Number, min: 0, max: 100 },
// //     feedback: { type: String, trim: true },
// //     completedAt: { type: Date },
// //     pausedAt: { type: Date },

// //     // Draft storage
// //     draft: {
// //       type: Schema.Types.Mixed,
// //       default: {},
// //     },
// //   },
// //   {
// //     timestamps: true,
// //   }
// // );

// // StorySessionSchema.index({ childId: 1, status: 1 });
// // StorySessionSchema.index({ createdAt: -1 });

// // // ✅ CRITICAL: Force Mongoose to reload the model in development
// // if (mongoose.models.StorySession) {
// //   delete mongoose.models.StorySession;
// //   console.log('🔄 Cleared cached StorySession model');
// // }

// // export default mongoose.model<IStorySession>('StorySession', StorySessionSchema);

// import mongoose, { Schema, Document } from 'mongoose';
// import type { StoryElements } from '@/config/story-elements';

// export { StoryElements };

// export interface IStorySession extends Document {
//   _id: mongoose.Types.ObjectId;
//   childId: mongoose.Types.ObjectId;
//   storyNumber: number;
//   title: string;
//   elements?: StoryElements;
//   storyMode: 'guided' | 'freeform';
//   aiOpening?: string;
//   currentTurn: number;
//   totalWords: number;
//   childWords: number;
//   apiCallsUsed: number;
//   maxApiCalls: number;
//   status: 'active' | 'completed' | 'paused';
//   assessment?: {
//     grammarScore: number;
//     creativityScore: number;
//     overallScore: number;
//     feedback: string;
//     readingLevel: string;
//     vocabularyScore: number;
//     structureScore: number;
//     characterDevelopmentScore: number;
//     plotDevelopmentScore: number;
//     strengths: string[];
//     improvements: string[];
//     vocabularyUsed: string[];
//     suggestedWords: string[];
//     educationalInsights: string;
//   };
//   overallScore?: number;
//   grammarScore?: number;
//   creativityScore?: number;
//   feedback?: string;
//   completedAt?: Date;
//   pausedAt?: Date;
//   resumedAt?: Date;
//   draft?: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const StorySessionSchema = new Schema<IStorySession>({
//   childId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   storyNumber: { type: Number, required: true },
//   title: { type: String, required: true },
//   elements: {
//     genre: String,
//     character: String,
//     setting: String,
//     theme: String,
//     mood: String,
//     tone: String,
//   },
//   storyMode: {
//     type: String,
//     enum: ['guided', 'freeform'],
//     default: 'guided'
//   },
//   aiOpening: String,
//   currentTurn: { type: Number, default: 1 },
//   totalWords: { type: Number, default: 0 },
//   childWords: { type: Number, default: 0 },
//   apiCallsUsed: { type: Number, default: 0 },
//   maxApiCalls: { type: Number, default: 7 },
//   status: {
//     type: String,
//     enum: ['active', 'completed', 'paused'],
//     default: 'active',
//   },
//   assessment: {
//     grammarScore: Number,
//     creativityScore: Number,
//     overallScore: Number,
//     feedback: String,
//     readingLevel: String,
//     vocabularyScore: Number,
//     structureScore: Number,
//     characterDevelopmentScore: Number,
//     plotDevelopmentScore: Number,
//     strengths: [String],
//     improvements: [String],
//     vocabularyUsed: [String],
//     suggestedWords: [String],
//     educationalInsights: String,
//   },
//   overallScore: Number,
//   grammarScore: Number,
//   creativityScore: Number,
//   feedback: String,
//   completedAt: Date,
//   pausedAt: Date,
//   resumedAt: Date,
//   draft: String,
// }, {
//   timestamps: true,
// });

// export default mongoose.models.StorySession || mongoose.model<IStorySession>('StorySession', StorySessionSchema);

// models/StorySession.ts - UPDATED with assessment and publication fields
import mongoose, { Schema, Document } from 'mongoose';
import type { StoryElements } from '@/config/story-elements';

export { StoryElements };

export interface IStorySession extends Document {
  _id: mongoose.Types.ObjectId;
  childId: mongoose.Types.ObjectId;
  storyNumber: number;
  title: string;
  elements?: StoryElements;
  storyMode: 'guided' | 'freeform';
  aiOpening?: string;
  currentTurn: number;
  totalWords: number;
  childWords: number;
  apiCallsUsed: number;
  maxApiCalls: number;
  status: 'active' | 'completed' | 'paused';

  // LEGACY Assessment fields (keep for backward compatibility)
  assessment?: {
    grammarScore: number;
    creativityScore: number;
    overallScore: number;
    feedback: string;
    readingLevel?: string;
    vocabularyScore?: number;
    structureScore?: number;
    characterDevelopmentScore?: number;
    plotDevelopmentScore?: number;
    strengths?: string[];
    improvements?: string[];
    vocabularyUsed?: string[];
    suggestedWords?: string[];
    educationalInsights?: string;
  };
  overallScore?: number;
  grammarScore?: number;
  creativityScore?: number;
  feedback?: string;

  // NEW: Assessment Features for Pay-per-use System
  isUploadedForAssessment: boolean;
  assessmentScore?: number; // 0-100 overall score
  assessmentFeedback?: {
    // Academic Integrity
    plagiarismCheck: {
      score: number;
      issues: string[];
      suggestions: string[];
    };
    aiContentDetection: {
      score: number;
      likelihood: 'low' | 'medium' | 'high';
      recommendations: string[];
    };

    // Writing Quality
    grammar: {
      score: number;
      mistakes: Array<{
        line: number;
        issue: string;
        correction: string;
        explanation: string;
      }>;
    };
    spelling: {
      score: number;
      errors: Array<{
        word: string;
        suggestions: string[];
        context: string;
      }>;
    };
    vocabulary: {
      score: number;
      level: string;
      suggestions: Array<{
        original: string;
        alternatives: string[];
        context: string;
      }>;
    };
    structure: {
      score: number;
      analysis: string;
      improvements: string[];
    };

    // Creative Development
    characterDevelopment: {
      score: number;
      feedback: string;
      strengths: string[];
      improvements: string[];
    };
    plotOriginality: {
      score: number;
      analysis: string;
      suggestions: string[];
    };
    descriptiveWriting: {
      score: number;
      examples: string[];
      improvements: string[];
    };
    sensoryDetails: {
      score: number;
      present: string[];
      missing: string[];
      suggestions: string[];
    };

    // Critical Thinking
    plotLogic: {
      score: number;
      issues: string[];
      suggestions: string[];
    };
    causeEffect: {
      score: number;
      analysis: string;
      improvements: string[];
    };
    problemSolving: {
      score: number;
      creativity: string;
      alternatives: string[];
    };
    themeRecognition: {
      score: number;
      identifiedThemes: string[];
      clarity: string;
    };

    // Overall Feedback
    overallScore: number;
    teacherTone: string; // Encouraging teacher-like feedback
    ageAppropriate: string; // Age-specific guidance
    nextSteps: string[];
    achievements: string[];
    progressTracking?: {
      improvementSince: Date;
      scoreChange: number;
      strengthsGained: string[];
    };
  };
  assessmentAttempts: number; // 0-3 max attempts per story

  // NEW: Publication Features
  isPublished: boolean;
  publicationDate?: Date;
  publicationFee: number; // Default $10
  competitionEligible: boolean;

  // NEW: Competition Features
  competitionEntries: Array<{
    competitionId: mongoose.Types.ObjectId;
    submittedAt: Date;
    rank?: number;
    score?: number;
    phase: 'submission' | 'judging' | 'results';
  }>;

  // Legacy fields
  completedAt?: Date;
  pausedAt?: Date;
  resumedAt?: Date;
  draft?: string;

  createdAt: Date;
  updatedAt: Date;
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
      min: 1,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    elements: {
      type: {
        genre: { type: String, trim: true },
        character: { type: String, trim: true },
        setting: { type: String, trim: true },
        theme: { type: String, trim: true },
        mood: { type: String, trim: true },
        tone: { type: String, trim: true },
      },
      required: false,
      default: undefined,
    },
    storyMode: {
      type: String,
      enum: ['guided', 'freeform'],
      required: true,
      default: 'freeform', // NEW: Default to freeform for new system
    },
    aiOpening: {
      type: String,
      trim: true,
    },
    currentTurn: {
      type: Number,
      required: true,
      min: 1,
      max: 7, // Updated max for freeform mode
      default: 1,
    },
    totalWords: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    childWords: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    apiCallsUsed: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    maxApiCalls: {
      type: Number,
      required: true,
      min: 1,
      default: 7,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused'],
      default: 'active',
      required: true,
      index: true,
    },

    // LEGACY Assessment fields (keep for backward compatibility)
    assessment: {
      grammarScore: { type: Number, min: 0, max: 100 },
      creativityScore: { type: Number, min: 0, max: 100 },
      overallScore: { type: Number, min: 0, max: 100 },
      feedback: { type: String, trim: true },
      readingLevel: { type: String, trim: true },
      vocabularyScore: { type: Number, min: 0, max: 100 },
      structureScore: { type: Number, min: 0, max: 100 },
      characterDevelopmentScore: { type: Number, min: 0, max: 100 },
      plotDevelopmentScore: { type: Number, min: 0, max: 100 },
      strengths: [String],
      improvements: [String],
      vocabularyUsed: [String],
      suggestedWords: [String],
      educationalInsights: { type: String, trim: true },
    },
    overallScore: { type: Number, min: 0, max: 100 },
    grammarScore: { type: Number, min: 0, max: 100 },
    creativityScore: { type: Number, min: 0, max: 100 },
    feedback: { type: String, trim: true },

    // NEW: Assessment Features
    isUploadedForAssessment: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    assessmentScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    assessmentFeedback: {
      // Academic Integrity
      plagiarismCheck: {
        score: { type: Number, min: 0, max: 100 },
        issues: [String],
        suggestions: [String],
      },
      aiContentDetection: {
        score: { type: Number, min: 0, max: 100 },
        likelihood: { type: String, enum: ['low', 'medium', 'high'] },
        recommendations: [String],
      },

      // Writing Quality
      grammar: {
        score: { type: Number, min: 0, max: 100 },
        mistakes: [
          {
            line: Number,
            issue: String,
            correction: String,
            explanation: String,
          },
        ],
      },
      spelling: {
        score: { type: Number, min: 0, max: 100 },
        errors: [
          {
            word: String,
            suggestions: [String],
            context: String,
          },
        ],
      },
      vocabulary: {
        score: { type: Number, min: 0, max: 100 },
        level: String,
        suggestions: [
          {
            original: String,
            alternatives: [String],
            context: String,
          },
        ],
      },
      structure: {
        score: { type: Number, min: 0, max: 100 },
        analysis: String,
        improvements: [String],
      },

      // Creative Development
      characterDevelopment: {
        score: { type: Number, min: 0, max: 100 },
        feedback: String,
        strengths: [String],
        improvements: [String],
      },
      plotOriginality: {
        score: { type: Number, min: 0, max: 100 },
        analysis: String,
        suggestions: [String],
      },
      descriptiveWriting: {
        score: { type: Number, min: 0, max: 100 },
        examples: [String],
        improvements: [String],
      },
      sensoryDetails: {
        score: { type: Number, min: 0, max: 100 },
        present: [String],
        missing: [String],
        suggestions: [String],
      },

      // Critical Thinking
      plotLogic: {
        score: { type: Number, min: 0, max: 100 },
        issues: [String],
        suggestions: [String],
      },
      causeEffect: {
        score: { type: Number, min: 0, max: 100 },
        analysis: String,
        improvements: [String],
      },
      problemSolving: {
        score: { type: Number, min: 0, max: 100 },
        creativity: String,
        alternatives: [String],
      },
      themeRecognition: {
        score: { type: Number, min: 0, max: 100 },
        identifiedThemes: [String],
        clarity: String,
      },

      // Overall Feedback
      overallScore: { type: Number, min: 0, max: 100 },
      teacherTone: String,
      ageAppropriate: String,
      nextSteps: [String],
      achievements: [String],
      progressTracking: {
        improvementSince: Date,
        scoreChange: Number,
        strengthsGained: [String],
      },
    },
    assessmentAttempts: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 3,
    },

    // NEW: Publication Features
    isPublished: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    publicationDate: {
      type: Date,
    },
    publicationFee: {
      type: Number,
      required: true,
      default: 10.0,
    },
    competitionEligible: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },

    // NEW: Competition Features
    competitionEntries: [
      {
        competitionId: {
          type: Schema.Types.ObjectId,
          ref: 'Competition',
          required: true,
        },
        submittedAt: {
          type: Date,
          required: true,
          default: Date.now,
        },
        rank: Number,
        score: Number,
        phase: {
          type: String,
          enum: ['submission', 'judging', 'results'],
          default: 'submission',
        },
      },
    ],

    // Legacy fields
    completedAt: { type: Date },
    pausedAt: { type: Date },
    resumedAt: { type: Date },
    draft: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
StorySessionSchema.index({ childId: 1, status: 1 });
StorySessionSchema.index({ createdAt: -1 });
StorySessionSchema.index({ isUploadedForAssessment: 1, childId: 1 });
StorySessionSchema.index({ isPublished: 1, competitionEligible: 1 });
StorySessionSchema.index({ 'competitionEntries.competitionId': 1 });

export default mongoose.models.StorySession ||
  mongoose.model<IStorySession>('StorySession', StorySessionSchema);
