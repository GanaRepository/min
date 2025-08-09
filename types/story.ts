// // // types/story.ts
// // import { Document, Types } from 'mongoose';

// // export interface IStoryElement {
// //   id: string;
// //   type: 'genre' | 'character' | 'setting' | 'theme' | 'mood' | 'tone';
// //   name: string;
// //   description: string;
// //   emoji: string;
// //   color: string;
// // }

// // export interface IStorySession extends Document {
// //   _id: Types.ObjectId;
// //   childId: Types.ObjectId;
// //   title: string;
// //   elements: {
// //     genre: string;
// //     character: string;
// //     setting: string;
// //     theme: string;
// //     mood: string;
// //     tone: string;
// //   };
// //   currentTurn: number;
// //   totalWords: number;
// //   apiCallsUsed: number;
// //   maxApiCalls: number;
// //   status: 'active' | 'completed' | 'paused';
// //   createdAt: Date;
// //   updatedAt: Date;
// // }

// // export interface ITurn extends Document {
// //   sessionId: Types.ObjectId;
// //   turnNumber: number;
// //   childInput: string;
// //   aiResponse: string;
// //   wordCount: number;
// //   timestamp: Date;
// // }

// // export interface IPublishedStory extends Document {
// //   sessionId: Types.ObjectId;
// //   childId: Types.ObjectId;
// //   title: string;
// //   content: string;
// //   totalWords: number;
// //   grammarScore: number;
// //   creativityScore: number;
// //   overallScore: number;
// //   aiFeeback: string;
// //   publishedAt: Date;
// // }

// // export interface StoryCreationRequest {
// //   elements: {
// //     genre: string;
// //     character: string;
// //     setting: string;
// //     theme: string;
// //     mood: string;
// //     tone: string;
// //   };
// // }

// // export interface AICollaborationRequest {
// //   sessionId: string;
// //   childInput: string;
// //   turnNumber: number;
// // }

// // export interface AIAssessmentRequest {
// //   sessionId: string;
// //   finalStory: string;
// // }

// // // types/story.ts
// // export interface StoryElements {
// //   genre: string;
// //   character: string;
// //   setting: string;
// //   theme: string;
// //   mood: string;
// //   tone: string;
// // }

// // export interface StoryCreationRequest {
// //   elements: StoryElements;
// // }

// // export interface StorySession {
// //   _id: string;
// //   childId: string;
// //   title: string;
// //   elements: StoryElements;
// //   currentTurn: number;
// //   totalWords: number;
// //   status: 'active' | 'completed' | 'draft';
// //   createdAt: Date;
// //   updatedAt: Date;
// // }

// // export interface Turn {
// //   _id: string;
// //   sessionId: string;
// //   turnNumber: number;
// //   childInput: string;
// //   aiResponse: string;
// //   wordCount: number;
// //   createdAt: Date;
// //   updatedAt: Date;
// // }

// // export interface AICollaborationRequest {
// //   sessionId: string;
// //   childInput: string;
// //   turnNumber: number;
// // }

// // export interface AIAssessmentRequest {
// //   sessionId: string;
// //   finalStory: string;
// // }

// // export interface AssessmentResult {
// //   grammarScore: number;
// //   creativityScore: number;
// //   overallScore: number;
// //   feedback: string;
// // }

// import { Document, Types } from 'mongoose';

// export interface IStoryElement {
//   id: string;
//   type: 'genre' | 'character' | 'setting' | 'theme' | 'mood' | 'tone';
//   name: string;
//   description: string;
//   emoji: string;
//   color: string;
// }

// export interface IStorySession extends Document {
//   _id: Types.ObjectId;
//   childId: Types.ObjectId;
//   title: string;
//   elements: {
//     genre: string;
//     character: string;
//     setting: string;
//     theme: string;
//     mood: string;
//     tone: string;
//   };
//   currentTurn: number;
//   totalWords: number;
//   childWords: number;
//   apiCallsUsed: number;
//   maxApiCalls: number;
//   status: 'active' | 'completed' | 'paused';
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface ITurn extends Document {
//   sessionId: Types.ObjectId;
//   turnNumber: number;
//   childInput: string;
//   aiResponse: string;
//   wordCount: number;
//   timestamp: Date;
// }

// export interface IPublishedStory extends Document {
//   sessionId: Types.ObjectId;
//   childId: Types.ObjectId;
//   title: string;
//   content: string;
//   totalWords: number;
//   grammarScore: number;
//   creativityScore: number;
//   overallScore: number;
//   aiFeeback: string;
//   publishedAt: Date;
// }

// export interface StoryCreationRequest {
//   elements: {
//     genre: string;
//     character: string;
//     setting: string;
//     theme: string;
//     mood: string;
//     tone: string;
//   };
// }

// export interface AICollaborationRequest {
//   sessionId: string;
//   childInput: string;
//   turnNumber: number;
// }

// export interface AIAssessmentRequest {
//   sessionId: string;
//   finalStory: string;
// }

// export interface StoryElements {
//   genre: string;
//   character: string;
//   setting: string;
//   theme: string;
//   mood: string;
//   tone: string;
// }

// export interface StorySession {
//   _id: string;
//   childId: string;
//   title: string;
//   elements: StoryElements;
//   currentTurn: number;
//   totalWords: number;
//   childWords: number;
//   status: 'active' | 'completed' | 'draft';
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface Turn {
//   _id: string;
//   sessionId: string;
//   turnNumber: number;
//   childInput: string;
//   aiResponse: string;
//   wordCount: number;
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface AssessmentResult {
//   grammarScore: number;
//   creativityScore: number;
//   overallScore: number;
//   feedback: string;
// }
