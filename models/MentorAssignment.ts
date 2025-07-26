import mongoose, { Schema, Document } from 'mongoose';

export interface IMentorAssignment extends Document {
  mentorId: mongoose.Types.ObjectId;
  childId: mongoose.Types.ObjectId;
  assignedAt: Date;
  assignedBy: mongoose.Types.ObjectId; // Admin who made the assignment
  isActive: boolean;
  unassignedAt?: Date;
  unassignedBy?: mongoose.Types.ObjectId;
}

const MentorAssignmentSchema = new Schema<IMentorAssignment>(
  {
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    childId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    unassignedAt: {
      type: Date,
    },
    unassignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
MentorAssignmentSchema.index({ mentorId: 1, isActive: 1 });

// Ensure a child can only be assigned to one active mentor
MentorAssignmentSchema.index(
  { childId: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

export default mongoose.models.MentorAssignment ||
  mongoose.model<IMentorAssignment>('MentorAssignment', MentorAssignmentSchema);
