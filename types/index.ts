// types/index.ts
import { Document } from 'mongoose';
import { ReactNode } from 'react';

export interface IAdmin extends Document {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContact extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface FileInfo {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  uploadDate: Date;
}
