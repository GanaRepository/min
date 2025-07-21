// import mongoose, { Schema } from 'mongoose';
// import { IUser } from '@/types/auth';

// const UserSchema = new Schema<IUser>(
//   {
//     email: {
//       type: String,
//       required: true,
//       lowercase: true,
//       trim: true,
//     },
//     password: {
//       type: String,
//       required: true,
//     },
//     firstName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     lastName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     age: {
//       type: Number,
//       required: function (this: IUser) {
//         return this.role === 'child';
//       },
//       min: 2,
//       max: 18,
//     },
//     school: {
//       type: String,
//       required: function (this: IUser) {
//         return this.role === 'child';
//       },
//       trim: true,
//     },
//     role: {
//       type: String,
//       enum: ['admin', 'mentor', 'child'],
//       required: true,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//     createdBy: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//       required: function (this: IUser) {
//         return this.role === 'mentor';
//       },
//     },
//     assignedMentor: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//       default: null,
//     },
//     resetPasswordToken: {
//       type: String,
//       default: null,
//     },
//     resetPasswordExpires: {
//       type: Date,
//       default: null,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Index for better query performance
// UserSchema.index({ email: 1 }, { unique: true });

// export default mongoose.models.User ||
//   mongoose.model<IUser>('User', UserSchema);


// models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'child' | 'mentor' | 'admin';
  age?: number;
  school?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Lean type for queries
export interface IUserLean {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'child' | 'mentor' | 'admin';
  age?: number;
  school?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

const UserSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['child', 'mentor', 'admin'],
    required: true
  },
  age: {
    type: Number,
    min: 2,
    max: 18
  },
  school: {
    type: String,
    trim: true,
    maxlength: 100
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, isActive: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);