// utils/gridfs.ts
import mongoose from 'mongoose';
import { GridFSBucket, Db } from 'mongodb';
import { connectToDatabase } from './db';
import { FileInfo } from '@/types';

let bucket: GridFSBucket | null = null;

async function getBucket(): Promise<GridFSBucket> {
  if (!bucket) {
    const conn = await connectToDatabase();
    const db = conn.connection.db as Db;
    bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'uploads',
    });
  }
  return bucket;
}

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const bucket = await getBucket();

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: { contentType },
    });

    uploadStream.on('error', reject);
    uploadStream.on('finish', function (this: { id: mongoose.Types.ObjectId }) {
      resolve(this.id.toString());
    });

    uploadStream.write(buffer);
    uploadStream.end();
  });
}

export async function downloadFile(
  fileId: string
): Promise<NodeJS.ReadableStream> {
  const bucket = await getBucket();
  return bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
}

export async function deleteFile(fileId: string): Promise<void> {
  const bucket = await getBucket();
  await bucket.delete(new mongoose.Types.ObjectId(fileId));
}

export async function getFileInfo(fileId: string): Promise<FileInfo | null> {
  const bucket = await getBucket();
  const files = bucket.find({ _id: new mongoose.Types.ObjectId(fileId) });
  const file = await files.next();

  if (!file) return null;

  return {
    id: file._id.toString(),
    filename: file.filename,
    contentType: file.metadata?.contentType || 'application/octet-stream',
    size: file.length,
    uploadDate: file.uploadDate,
  };
}
