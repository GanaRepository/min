// models/Purchase.ts - FIXED VERSION  
import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchase extends Document {
  _id: mongoose.Types.ObjectId;
  childId: mongoose.Types.ObjectId;
  type: 'story_pack' | 'individual_story';
  amount: number;
  stripePaymentId?: string;
  stripeSessionId?: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  itemDetails: {
    storyId?: mongoose.Types.ObjectId;
    storyTitle?: string;
    storiesAdded?: number;
    assessmentsAdded?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>({
  childId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['story_pack', 'individual_story'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  stripePaymentId: {
    type: String,
    index: true,
  },
  stripeSessionId: {
    type: String,
    index: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    required: true,
    default: 'pending',
  },
  itemDetails: {
    storyId: {
      type: Schema.Types.ObjectId,
      ref: 'StorySession',
    },
    storyTitle: { type: String },
    storiesAdded: { type: Number },
    assessmentsAdded: { type: Number },
  },
}, {
  timestamps: true,
});

// Indexes
PurchaseSchema.index({ childId: 1, createdAt: -1 });
PurchaseSchema.index({ paymentStatus: 1 });

export default mongoose.models?.Purchase || mongoose.model<IPurchase>('Purchase', PurchaseSchema);