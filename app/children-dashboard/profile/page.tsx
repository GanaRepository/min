// app/children-dashboard/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Calendar,
  Edit,
  Save,
  X,
  Settings,
  Shield,
  Bell,
  Palette,
  Globe,
  Camera,
  Award,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    grade: string;
    school: string;
    avatar: string;
    joinedAt: string;
    lastActiveDate: string;
  };
  stats: {
    totalStoriesCreated: number;
    totalWordsWritten: number;
    averageScore: number;
    writingStreak: number;
    favoriteGenre: string;
    totalTimeWriting: number; // in minutes
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    emailNotifications: boolean;
    soundEffects: boolean;
    autoSave: boolean;
  };
  achievements: Array<{
    id: string;
    title: string;
    earnedAt: string;
  }>;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    grade: '',
    school: ''
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'child') {
      router.push('/login/child');
      return;
    }

    fetchProfileData();
  }, [session, status, router]);

  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();

      if (data.success) {
        setProfileData(data.profile);
        setEditForm({
          firstName: data.profile.user.firstName,
          lastName: data.profile.user.lastName,
          grade: data.profile.user.grade || '',
          school: data.profile.user.school || ''
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast({
        title: "❌ Error",
        description: "Failed to load profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setProfileData(prev => prev ? {
        ...prev,
        user: {
          ...prev.user,
          ...editForm
        }
      } : null);

      setIsEditing(false);
      
      toast({
        title: "✅ Profile Updated!",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferenceChange = async (preference: string, value: any) => {
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [preference]: value })
      });

      if (!response.ok) {
        throw new Error('Failed to update preference');
      }

      setProfileData(prev => prev ? {
        ...prev,
        preferences: {
          ...prev.preferences,
          [preference]: value
        }
      } : null);

      toast({
        title: "✅ Settings Updated!",
        description: "Your preference has been saved.",
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      toast({
        title: "❌ Error",
        description: "Failed to update setting.",
        variant: "destructive",
      });
    }
  };

  const getGradeOptions = () => [
    'Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade',
    '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade',
    '9th Grade', '10th Grade', '11th Grade', '12th Grade'
  ];

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'child' || !profileData) {
    return null;
  }

  const { user, stats, preferences, achievements } = profileData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white">
      
      {/* Header with proper spacing */}
      <div className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-600/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mt-16"
          >
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold flex items-center">
                <User className="w-8 h-8 mr-4 text-blue-400" />
                My Profile
              </h1>
              <p className="text-gray-300 mt-2 text-lg">
                Manage your account and see your writing journey
              </p>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-colors"
              >
                <Edit className="w-5 h-5" />
                <span>Edit Profile</span>
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Main Content with proper container and spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/50 border border-gray-600/50 rounded-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Basic Information</h2>
                {isEditing && (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                      className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-start space-x-6 mb-8">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold">
                    {user.firstName.charAt(0).toUpperCase()}{user.lastName.charAt(0).toUpperCase()}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 p-2 rounded-full transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Basic Info */}
                <div className="flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        First Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <div className="text-white font-medium text-lg">{user.firstName}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Last Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <div className="text-white font-medium text-lg">{user.lastName}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Grade
                      </label>
                      {isEditing ? (
                        <select
                          value={editForm.grade}
                          onChange={(e) => setEditForm(prev => ({ ...prev, grade: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="">Select Grade</option>
                          {getGradeOptions().map(grade => (
                            <option key={grade} value={grade}>{grade}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-white font-medium text-lg">{user.grade || 'Not specified'}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        School
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.school}
                          onChange={(e) => setEditForm(prev => ({ ...prev, school: e.target.value }))}
                          placeholder="Enter your school name"
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <div className="text-white font-medium text-lg">{user.school || 'Not specified'}</div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Writing Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 border border-gray-600/50 rounded-2xl p-8"
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 mr-3 text-green-400" />
                Writing Statistics
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <BookOpen className="w-8 h-8 text-blue-400" />
                    <span className="text-2xl font-bold text-white">{stats.totalStoriesCreated}</span>
                  </div>
                  <div className="text-blue-300 font-medium">Stories Written</div>
                </div>

                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Edit className="w-8 h-8 text-green-400" />
                    <span className="text-2xl font-bold text-white">
                      {stats.totalWordsWritten.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-green-300 font-medium">Words Written</div>
                </div>

                <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="w-8 h-8 text-purple-400" />
                    <span className="text-2xl font-bold text-white">{stats.averageScore}%</span>
                  </div>
                  <div className="text-purple-300 font-medium">Average Score</div>
                </div>

                <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="w-8 h-8 text-orange-400" />
                    <span className="text-2xl font-bold text-white">{stats.writingStreak}</span>
                  </div>
                  <div className="text-orange-300 font-medium">Day Streak</div>
                </div>

                <div className="bg-pink-500/20 border border-pink-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Palette className="w-8 h-8 text-pink-400" />
                    <span className="text-lg font-bold text-white">{stats.favoriteGenre}</span>
                  </div>
                  <div className="text-pink-300 font-medium">Favorite Genre</div>
                </div>

                <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Globe className="w-8 h-8 text-cyan-400" />
                    <span className="text-2xl font-bold text-white">
                      {Math.round(stats.totalTimeWriting / 60)}h
                    </span>
                  </div>
                  <div className="text-cyan-300 font-medium">Time Writing</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Achievements */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 border border-gray-600/50 rounded-2xl p-8"
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Award className="w-6 h-6 mr-3 text-yellow-400" />
                Recent Achievements
              </h2>

              <div className="space-y-4">
                {achievements.slice(0, 8).map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center space-x-3 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg"
                  >
                    <Award className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                    <div>
                      <div className="text-yellow-200 font-medium text-sm">
                        {achievement.title}
                      </div>
                      <div className="text-yellow-300 text-xs">
                        {new Date(achievement.earnedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {achievements.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Start writing to earn achievements!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}