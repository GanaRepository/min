// app/children-dashboard/upload-story/page.tsx

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import TerminalLoader from '@/components/TerminalLoader';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Book,
  DollarSign,
  Info,
  Trophy,
  Star,
} from 'lucide-react';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';

export default function UploadStoryPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (
        !selectedFile.type.includes('pdf') &&
        !selectedFile.name.endsWith('.docx')
      ) {
        setToastMessage('Please upload only PDF or DOCX files');
        return;
      }

      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setToastMessage('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);

      // Auto-generate title from filename if empty
      if (!title) {
        const fileName = selectedFile.name.replace(/\.[^/.]+$/, ''); // Remove extension
        setTitle(fileName.replace(/[-_]/g, ' ')); // Replace dashes/underscores with spaces
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      setToastMessage('Please provide both a title and select a file');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim());
      formData.append('uploadType', 'story'); // Not assessment

      const response = await fetch('/api/stories/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadSuccess(true);
        setTimeout(() => {
          router.push('/children-dashboard');
        }, 3000);
      } else {
        setToastMessage(`Upload failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setToastMessage('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (uploadSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="bg-green-600 w-24 h-24  flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl  text-white mb-4">
            Story Uploaded Successfully! 🎉
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            Your story &quot;{title}&quot; has been uploaded and is ready for
            publishing.
          </p>
          <div className="bg-blue-600/20 border border-blue-500/30  p-6 mb-6">
            <h3 className="text-white  mb-2">Next Steps:</h3>
            <ul className="text-gray-300 text-left space-y-2">
              <li>• Pay $10 publication fee to publish your story</li>
              <li>• Published stories are eligible for monthly competitions</li>
              <li>• Your story will appear in your portfolio</li>
            </ul>
          </div>
          <p className="text-gray-400">
            Redirecting to dashboard in 3 seconds...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/children-dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl  text-white mb-2 flex items-center justify-center gap-3">
            <Book size={36} className="text-blue-400" />
            Upload Your Story
          </h1>
          <p className="text-gray-300">
            Share your creative writing with the world! Upload your completed
            story for publishing and competition entry.
          </p>
        </motion.div>

        {/* Upload Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/60 border border-gray-600/40  p-8"
        >
          {/* Story Title */}
          <div className="mb-6">
            <label className="block text-gray-300  mb-3">
              Story Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your story title..."
              className="w-full bg-gray-700 border border-gray-600  px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              maxLength={100}
            />
            <div className="text-gray-400 text-sm mt-1">
              {title.length}/100 characters
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-gray-300  mb-3">
              Upload Story File <span className="text-red-400">*</span>
            </label>

            <div className="border-2 border-dashed border-gray-600  p-8 text-center hover:border-gray-500 transition-colors">
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.docx"
                className="hidden"
                id="story-file-upload"
              />
              <label htmlFor="story-file-upload" className="cursor-pointer">
                {file ? (
                  <div className="text-green-400">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3" />
                    <p className=" text-lg">{file.name}</p>
                    <p className="text-gray-400 text-sm">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-blue-400 text-sm mt-2">
                      Click to change file
                    </p>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <Upload className="w-12 h-12 mx-auto mb-3" />
                    <p className=" text-lg">Click to upload your story</p>
                    <p className="text-sm">PDF or DOCX files only</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum file size: 10MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Requirements */}
          <div className="mb-6 bg-blue-600/20 border border-blue-500/30  p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 ">Story Requirements</span>
            </div>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Story must be 100-2000 words</li>
              <li>• Original content only (no plagiarism)</li>
              <li>• Appropriate for young audiences</li>
              <li>• File formats: PDF or DOCX only</li>
            </ul>
          </div>

          {/* Publishing Info */}
          <div className="mb-6 bg-yellow-600/20 border border-yellow-500/30  p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 ">Publishing & Competition</span>
            </div>
            <div className="text-gray-300 text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span>Publication Fee:</span>
                <span className="text-yellow-400 ">$10 per story</span>
              </div>
              <div>
                • Published stories are eligible for monthly competitions
              </div>
              <div>• Stories appear in your public portfolio</div>
              <div>• Chance to be featured in book collections</div>
            </div>
          </div>

          {/* Competition Eligibility */}
          <div className="mb-8 bg-purple-600/20 border border-purple-500/30  p-4">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 ">Competition Benefits</span>
            </div>
            <div className="text-gray-300 text-sm space-y-1">
              <div>• Submit up to 3 stories per month (FREE participation)</div>
              <div>• AI judging system evaluates all submissions fairly</div>
              <div>• Top 3 winners get recognition and certificates</div>
              <div>• Winners featured in annual anthology</div>
            </div>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || !title.trim() || uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 px-6  flex items-center justify-center gap-3 transition-colors  text-lg"
          >
            {uploading ? (
              <TerminalLoader
                title="Uploading"
                loadingText="Uploading Story..."
                size="sm"
              />
            ) : (
              <>
                <Upload size={20} />
                Upload Story
              </>
            )}
          </button>

          {/* Note */}
          <p className="text-gray-400 text-sm text-center mt-4">
            After uploading, you&apos;ll need to pay the $10 publication fee to
            make your story live and competition-eligible.
          </p>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* What Happens Next */}
          <div className="bg-gray-800/40 border border-gray-600/30  p-6">
            <h3 className="text-white  mb-4 flex items-center gap-2">
              <Star className="text-green-400" />
              What Happens Next?
            </h3>
            <ol className="text-gray-300 text-sm space-y-2">
              <li>1. Your story is uploaded and saved</li>
              <li>2. Pay $10 publication fee to go live</li>
              <li>3. Story becomes competition-eligible</li>
              <li>4. Automatic entry in monthly competition</li>
              <li>5. AI judging and results at month-end</li>
            </ol>
          </div>

          {/* Tips for Success */}
          <div className="bg-gray-800/40 border border-gray-600/30  p-6">
            <h3 className="text-white  mb-4 flex items-center gap-2">
              <FileText className="text-blue-400" />
              Tips for Success
            </h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>• Use descriptive, engaging titles</li>
              <li>• Check grammar and spelling carefully</li>
              <li>• Include interesting characters and plot</li>
              <li>• Stay within the 100-2000 word limit</li>
              <li>• Be creative and original!</li>
            </ul>
          </div>
        </motion.div>
      </div>
      {toastMessage && (
        <Toast>
          <ToastTitle>
            {toastMessage.includes('failed') ? 'Error' : 'Warning'}
          </ToastTitle>
          <ToastDescription>{toastMessage}</ToastDescription>
          <ToastClose onClick={() => setToastMessage(null)} />
        </Toast>
      )}
      <ToastViewport />
    </ToastProvider>
  );
}
