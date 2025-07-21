// models/Contact.ts
import mongoose, { Schema } from 'mongoose';

export interface IContact {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  age?: string;
  school?: string;
  message: string;
  createdAt: Date;
}

const ContactSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: String,
      trim: true,
      default: '',
    },
    school: {
      type: String,
      trim: true,
      default: '',
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Contact ||
  mongoose.model('Contact', ContactSchema);
