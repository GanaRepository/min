// models/PendingStoryElements.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IPendingStoryElements extends Document {
  sessionToken: string;
  elements: {
    genre: string;
    character: string;
    setting: string;
    theme: string;
    mood: string;
    tone: string;
  };
  expiresAt: Date;
  createdAt: Date;
}

const PendingStoryElementsSchema = new Schema<IPendingStoryElements>(
  {
    sessionToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    elements: {
      genre: { type: String, required: true },
      character: { type: String, required: true },
      setting: { type: String, required: true },
      theme: { type: String, required: true },
      mood: { type: String, required: true },
      tone: { type: String, required: true },
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // MongoDB will auto-delete expired docs
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.PendingStoryElements ||
  mongoose.model<IPendingStoryElements>('PendingStoryElements', PendingStoryElementsSchema);