// app/admin/stories/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  BookOpen,
  User,
  BarChart3,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface EditStoryData {
  _id: string;
  title: string;
  status: 'active' | 'completed' | 'paused';
  isPublished: boolean;
  submittedToCompetition: boolean;
  maxApiCalls: number;
  competitionScore?: number;
  competitionRank?: number;
}

export default function EditStory() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const storyId = params.id as string;

  const [story, setStory] = useState<EditStoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const [formData, setFormData] = useState({
    title: '',
    status: 'active' as 'active' | 'completed' | 'paused',
    isPublished: false,
    submittedToCompetition: false,
    maxApiCalls: 50,
    competitionScore: 0,
    competitionRank: 0,
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchStory();
  }, [session, status, router, storyId]);

  const fetchStory = async () => {
    try {
      const response = await fetch(`/api/admin/stories/${storyId}`);
      const data = await response.json();
      
      if (data.success) {
        setStory(data.story);
        setFormData({
          title: data.story.title,
          status: data.story.status,
          isPublished: data.story.isPublished || false,
          submittedToCompetition: data.story.submittedToCompetition || false,
          maxApiCalls: data.story.maxApiCalls || 50,
          competitionScore: data.story.competitionScore || 0,
          competitionRank: data.story.competitionRank || 0,
        });
      } else {
        router.push('/admin/stories');
      }
    } catch (error) {
      console.error('Error fetching story:', error);
      router.push('/admin/stories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const response = await fetch(`/api/admin/stories/${storyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Story updated successfully!');
        router.push(`/admin/stories/${storyId}`);
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          alert('Failed to update story: ' + data.error);
        }
      }
    } catch (error) {
      console.error('Error updating story:', error);
      alert('Failed to update story');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading story data...</div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Story not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/admin/stories/${storyId}`}>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Edit Story
          </h1>
          <p className="text-gray-400">Modify story settings and metadata</p>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-xl p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Story Title
            </label>
            <div className="relative">
              <BookOpen size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Enter story title"
              />
            </div>
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          {/* API Calls Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max AI Calls
            </label>
            <div className="relative">
              <BarChart3 size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="number"
                min="1"
                max="200"
                value={formData.maxApiCalls}
                onChange={(e) => handleInputChange('maxApiCalls', parseInt(e.target.value) || 50)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Maximum AI calls allowed"
              />
            </div>
            <p className="text-gray-400 text-sm mt-1">Number of AI interactions allowed for this story</p>
          </div>

          {/* Competition Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Competition Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Competition Score
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.competitionScore}
                  onChange={(e) => handleInputChange('competitionScore', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Competition score (0-100)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Competition Rank
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.competitionRank}
                  onChange={(e) => handleInputChange('competitionRank', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Competition rank"
                />
              </div>
            </div>
          </div>

          {/* Status Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                  className="w-5 h-5 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-white font-medium">Published</span>
              </label>
              <p className="text-gray-400 text-sm mt-1">Story is publicly visible</p>
            </div>

            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.submittedToCompetition}
                  onChange={(e) => handleInputChange('submittedToCompetition', e.target.checked)}
                  className="w-5 h-5 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-white font-medium">Competition Entry</span>
              </label>
              <p className="text-gray-400 text-sm mt-1">Story is entered in competition</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
            <Link href={`/admin/stories/${storyId}`}>
              <button
                type="button"
                className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
            >
              <Save size={16} className="mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}