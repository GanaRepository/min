// Update /models/MentorAssignment.ts to add unassign tracking fields

import mongoose, { Schema, Document } from 'mongoose';

export interface IMentorAssignment extends Document {
  _id: mongoose.Types.ObjectId;
  mentorId: mongoose.Types.ObjectId;
  childId: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
  isActive: boolean;
  assignmentDate: Date;
  unassignedDate?: Date; // ✅ NEW FIELD
  unassignedBy?: mongoose.Types.ObjectId; // ✅ NEW FIELD
  createdAt: Date;
  updatedAt: Date;
}

const MentorAssignmentSchema = new Schema<IMentorAssignment>({
  mentorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  childId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  assignmentDate: {
    type: Date,
    default: Date.now,
  },
  unassignedDate: { // ✅ NEW FIELD
    type: Date,
  },
  unassignedBy: { // ✅ NEW FIELD
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
MentorAssignmentSchema.index({ mentorId: 1, isActive: 1 });
MentorAssignmentSchema.index({ childId: 1, isActive: 1 });

export default mongoose.models?.MentorAssignment || mongoose.model<IMentorAssignment>('MentorAssignment', MentorAssignmentSchema);