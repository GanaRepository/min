// app/children-dashboard/assessment/[sessionId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Zap, Award, Target, BookOpen } from 'lucide-react';

interface AssessmentPageProps {
  params: { sessionId: string };
}

export default function AssessmentPage({ params }: AssessmentPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login/child');
      return;
    }
    fetchStory();
  }, [session, status, params.sessionId]);

  const fetchStory = async () => {
    try {
      const response = await fetch(`/api/stories/session/${params.sessionId}`);
      const data = await response.json();
      
      if (data.success) {
        setStory(data.session);
      } else {
        setError('Story not found');
      }
    } catch (error) {
      setError('Failed to load story');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = async () => {
    setAssessmentLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/stories/assessment/${params.sessionId}`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.success) {
        // Redirect to results page or update story with assessment
        router.push(`/children-dashboard/my-stories/${params.sessionId}`);
      } else {
        setError(data.error || 'Assessment failed');
      }
    } catch (error) {
      setError('Failed to start assessment');
    } finally {
      setAssessmentLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading story...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 pt-20">
      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">AI Story Assessment</h1>
            <p className="text-gray-400">Get detailed feedback on your story</p>
          </div>
        </div>

        {/* Story Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">{story?.title}</h2>
          <div className="text-gray-300 mb-4">
            <p><strong>Word Count:</strong> {story?.totalWords || 0} words</p>
            <p><strong>Story Number:</strong> #{story?.storyNumber}</p>
          </div>
          
          {/* Story Preview */}
          <div className="bg-gray-700/50 rounded-lg p-4 max-h-60 overflow-y-auto">
            <p className="text-gray-300 leading-relaxed">
              {story?.aiOpening?.substring(0, 300)}...
            </p>
          </div>
        </motion.div>

        {/* Assessment Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Brain className="w-6 h-6 mr-3 text-blue-400" />
            Assessment Features
          </h3>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {[
              { icon: Target, title: 'Grammar Analysis', desc: 'Check spelling, punctuation, and sentence structure' },
              { icon: Zap, title: 'Creativity Score', desc: 'Evaluate originality and creative elements' },
              { icon: Award, title: 'Overall Rating', desc: 'Comprehensive assessment of your story' },
              { icon: BookOpen, title: 'Improvement Tips', desc: 'Personalized suggestions for better writing' },
            ].map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-gray-700/30 rounded-lg">
                <feature.icon className="w-6 h-6 text-green-400 mt-1" />
                <div>
                  <h4 className="text-white font-medium">{feature.title}</h4>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Assessment Button */}
          <div className="text-center">
            <button
              onClick={handleStartAssessment}
              disabled={assessmentLoading}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium transition-all text-lg"
            >
              {assessmentLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Analyzing Your Story...
                </div>
              ) : (
                'Start AI Assessment'
              )}
            </button>
            
            <p className="text-gray-400 text-sm mt-3">
              Assessment attempts remaining: {3 - (story?.assessmentAttempts || 0)}
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}