// models/Purchase.ts - Stripe payment tracking
import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchase extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'story_pack' | 'story_publication';
  amount: number; // In dollars (15.00, 10.00)
  currency: string; // 'USD'

  // Stripe Integration
  stripePaymentIntentId: string;
  stripeSessionId?: string;
  stripeCustomerId?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';

  // Purchase Metadata
  metadata: {
    // For story packs
    storiesAdded?: number; // +5 stories
    assessmentsAdded?: number; // +5 assessments
    totalAttemptsAdded?: number; // +15 attempts

    // For story publications
    storyId?: mongoose.Types.ObjectId;
    storyTitle?: string;
    publicationDate?: Date;

    // Admin notes
    adminNotes?: string;
    refundReason?: string;
  };

  // Payment Details
  paymentMethod?: string; // 'card', 'paypal', etc.
  last4?: string; // Last 4 digits of card
  receiptUrl?: string; // Stripe receipt URL

  // Timestamps
  purchaseDate: Date;
  completedAt?: Date;
  refundedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['story_pack', 'story_publication'],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
      uppercase: true,
    },

    // Stripe Fields
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    stripeSessionId: {
      type: String,
      index: true,
    },
    stripeCustomerId: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
      required: true,
      default: 'pending',
      index: true,
    },

    // Metadata
    metadata: {
      // Story pack metadata
      storiesAdded: {
        type: Number,
        min: 0,
      },
      assessmentsAdded: {
        type: Number,
        min: 0,
      },
      totalAttemptsAdded: {
        type: Number,
        min: 0,
      },

      // Publication metadata
      storyId: {
        type: Schema.Types.ObjectId,
        ref: 'StorySession',
      },
      storyTitle: {
        type: String,
        trim: true,
      },
      publicationDate: {
        type: Date,
      },

      // Admin fields
      adminNotes: {
        type: String,
        trim: true,
      },
      refundReason: {
        type: String,
        trim: true,
      },
    },

    // Payment Details
    paymentMethod: {
      type: String,
      trim: true,
    },
    last4: {
      type: String,
      length: 4,
    },
    receiptUrl: {
      type: String,
      trim: true,
    },

    // Timestamps
    purchaseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance and reporting
PurchaseSchema.index({ userId: 1, purchaseDate: -1 });
PurchaseSchema.index({ type: 1, status: 1 });
PurchaseSchema.index({ stripePaymentIntentId: 1 }, { unique: true });
PurchaseSchema.index({ purchaseDate: -1 }); // For revenue reports
PurchaseSchema.index({ status: 1, completedAt: -1 });

export default mongoose.models.Purchase ||
  mongoose.model<IPurchase>('Purchase', PurchaseSchema);
