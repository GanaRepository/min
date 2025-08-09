'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Shield,
  Brain,
  Target,
  Award,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UsageStats {
  assessmentsRemaining: number;
  totalAssessmentAttempts: number;
  maxAssessmentAttempts: number;
}

export default function UploadAssessmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login/child');
      return;
    }
    fetchUsageStats();
  }, [session, status]);

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [content]);

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/user/usage');
      if (response.ok) {
        const data = await response.json();
        setUsageStats(data);
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = [
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: '❌ Invalid File Type',
        description: 'Please upload a .txt or .docx file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (1MB limit)
    if (selectedFile.size > 1024 * 1024) {
      toast({
        title: '❌ File Too Large',
        description: 'File must be less than 1MB',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);

    // Read file content
    try {
      const text = await selectedFile.text();
      setContent(text);

      // Auto-generate title from filename if no title set
      if (!title.trim()) {
        const fileName = selectedFile.name.replace(/\.[^/.]+$/, '');
        setTitle(fileName);
      }
    } catch (error) {
      toast({
        title: '❌ Error Reading File',
        description: 'Failed to read file content',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: '❌ Title Required',
        description: 'Please enter a title for your story',
        variant: 'destructive',
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: '❌ Content Required',
        description: 'Please provide story content',
        variant: 'destructive',
      });
      return;
    }

    if (wordCount < 50) {
      toast({
        title: '❌ Too Short',
        description: 'Story must be at least 50 words long',
        variant: 'destructive',
      });
      return;
    }

    if (wordCount > 5000) {
      toast({
        title: '❌ Too Long',
        description: 'Story must be less than 5,000 words',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch('/api/stories/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: '🎉 Assessment Complete!',
          description: `Your story scored ${data.assessment.overallScore}%`,
        });

        // Redirect to assessment results
        router.push(`/children-dashboard/my-stories/${data.story.id}`);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: '❌ Upload Failed',
        description:
          error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setContent('');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const canUpload = usageStats && usageStats.assessmentsRemaining > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 py-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <h1 className="text-4xl font-bold text-white mb-4">
            Upload Story for Assessment
          </h1>
          <p className="text-gray-300 text-lg">
            Get detailed AI feedback on your writing with advanced plagiarism
            detection and integrity analysis
          </p>
        </motion.div>

        {/* Usage Stats */}
        {usageStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-4 text-center">
              <Upload className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">
                {usageStats.assessmentsRemaining}
              </div>
              <div className="text-blue-300 text-sm">Assessments Left</div>
            </div>

            <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-4 text-center">
              <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">
                {usageStats.maxAssessmentAttempts -
                  usageStats.totalAssessmentAttempts}
              </div>
              <div className="text-green-300 text-sm">Attempts Left</div>
            </div>

            <div className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-4 text-center">
              <Award className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">3</div>
              <div className="text-purple-300 text-sm">Max Attempts/Story</div>
            </div>
          </motion.div>
        )}

        {!canUpload ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-8 text-center"
          >
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              No Assessments Remaining
            </h2>
            <p className="text-gray-300 mb-6">
              You've used all your assessments for this month. Upgrade to
              continue getting AI feedback!
            </p>
            <button
              onClick={() => router.push('/pricing')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Upgrade Now - $15
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {/* Title Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6"
              >
                <label className="block text-white font-medium mb-3">
                  Story Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your story title..."
                  maxLength={100}
                  className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-400 mt-2">
                  {title.length}/100 characters
                </p>
              </motion.div>

              {/* File Upload */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6"
              >
                <label className="block text-white font-medium mb-3">
                  Upload Story File
                </label>

                {!file ? (
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      dragActive
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-white font-medium mb-2">
                      Drop your story file here or click to upload
                    </p>
                    <p className="text-gray-400 text-sm mb-4">
                      Supports .txt and .docx files up to 1MB
                    </p>
                    <input
                      type="file"
                      accept=".txt,.docx"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleFileSelect(e.target.files[0])
                      }
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg cursor-pointer inline-block transition-colors"
                    >
                      Choose File
                    </label>
                  </div>
                ) : (
                  <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-green-400" />
                        <div>
                          <p className="text-white font-medium">{file.name}</p>
                          <p className="text-green-300 text-sm">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={clearFile}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Text Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6"
              >
                <label className="block text-white font-medium mb-3">
                  Story Content {!file && '*'}
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    file
                      ? 'File content loaded automatically...'
                      : 'Paste your story text here...'
                  }
                  rows={12}
                  className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />

                <div className="flex justify-between items-center mt-3">
                  <div
                    className={`text-sm ${
                      wordCount < 50
                        ? 'text-red-400'
                        : wordCount > 5000
                          ? 'text-red-400'
                          : 'text-green-400'
                    }`}
                  >
                    {wordCount} words {wordCount < 50 && '(minimum 50)'}{' '}
                    {wordCount > 5000 && '(maximum 5,000)'}
                  </div>

                  {wordCount >= 50 && wordCount <= 5000 && (
                    <div className="flex items-center gap-1 text-green-400 text-sm">
                      <CheckCircle size={16} />
                      Ready for assessment
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Assessment Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl p-6"
              >
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Brain className="text-purple-400" />
                  Advanced AI Assessment Features
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <h4 className="text-white font-medium mb-1">
                      Plagiarism Detection
                    </h4>
                    <p className="text-gray-300 text-sm">
                      Advanced similarity checking
                    </p>
                  </div>

                  <div className="text-center">
                    <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <h4 className="text-white font-medium mb-1">
                      AI Content Analysis
                    </h4>
                    <p className="text-gray-300 text-sm">
                      Originality verification
                    </p>
                  </div>

                  <div className="text-center">
                    <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <h4 className="text-white font-medium mb-1">
                      Detailed Feedback
                    </h4>
                    <p className="text-gray-300 text-sm">
                      16+ writing categories
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <button
                  type="submit"
                  disabled={
                    uploading ||
                    !title.trim() ||
                    !content.trim() ||
                    wordCount < 50 ||
                    wordCount > 5000
                  }
                  className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                    uploading ||
                    !title.trim() ||
                    !content.trim() ||
                    wordCount < 50 ||
                    wordCount > 5000
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 transform hover:scale-105'
                  }`}
                >
                  {uploading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Analyzing Your Story...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Brain className="w-6 h-6" />
                      Get AI Assessment
                    </div>
                  )}
                </button>

                {uploading && (
                  <p className="text-gray-400 text-sm mt-3">
                    Running plagiarism detection and AI analysis...
                  </p>
                )}
              </motion.div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
