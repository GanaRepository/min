//app/admin/competitions/create/page.tsx

// app/admin/competitions/create/page.tsx (Fixed)
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Calendar,
  Award,
  Settings,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface JudgingCriteria {
  grammar: number;
  creativity: number;
  structure: number;
  characterDev: number;
  plotOriginality: number;
  vocabulary: number;
}

export default function CreateCompetitionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const [formData, setFormData] = useState({
    month: new Date().toISOString().slice(0, 7), // YYYY-MM format
    year: new Date().getFullYear(),
    theme: '',
    description: '',
    judgingCriteria: {
      grammar: 20,
      creativity: 25,
      structure: 15,
      characterDev: 15,
      plotOriginality: 15,
      vocabulary: 10,
    } as JudgingCriteria,
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validate judging criteria sums to 100
    const totalCriteria = Object.values(formData.judgingCriteria).reduce((sum, val) => sum + val, 0);
    if (totalCriteria !== 100) {
      setErrors({ judgingCriteria: 'Judging criteria must sum to 100%' });
      setLoading(false);
      return;
    }

    try {
      const [year, month] = formData.month.split('-');
      
      const response = await fetch('/api/admin/competitions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          month: new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long' }),
          year: parseInt(year),
          theme: formData.theme,
          description: formData.description,
          judgingCriteria: Object.fromEntries(
            Object.entries(formData.judgingCriteria).map(([key, value]) => [key, value / 100])
          ),
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Competition created successfully!');
        router.push('/admin/competitions');
      } else {
        setErrors({ general: data.error || 'Failed to create competition' });
      }
    } catch (error) {
      console.error('Error creating competition:', error);
      setErrors({ general: 'Failed to create competition' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const totalCriteria = Object.values(formData.judgingCriteria).reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/competitions">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Create Competition
          </h1>
          <p className="text-gray-400">Set up a new monthly writing competition</p>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-xl p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Month & Year
              </label>
              <div className="relative">
                <Calendar size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="month"
                  required
                  value={formData.month}
                  onChange={(e) => handleInputChange('month', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Theme
              </label>
              <div className="relative">
                <Award size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.theme}
                  onChange={(e) => handleInputChange('theme', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Adventure Stories, Fantasy Tales"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the competition theme and what participants should write about..."
            />
          </div>

          {/* Judging Criteria */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Settings size={20} className="mr-2" />
                Judging Criteria
              </h3>
              <div className={`text-sm font-medium ${
                totalCriteria === 100 ? 'text-green-400' : 'text-red-400'
              }`}>
                Total: {totalCriteria}%
              </div>
            </div>
            
            {errors.judgingCriteria && (
              <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm mb-4">
                {errors.judgingCriteria}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(formData.judgingCriteria).map(([key, value]) => (
                <div key={key} className="bg-gray-700/50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={value}
                      onChange={(e) => handleInputChange(`judgingCriteria.${key}`, parseInt(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-400">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
            <Link href="/admin/competitions">
              <button
                type="button"
                className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading || totalCriteria !== 100}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
            >
              <Save size={16} className="mr-2" />
              {loading ? 'Creating...' : 'Create Competition'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}