'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Calendar,
  School,
  ArrowLeft,
  Edit,
  Save,
  X,
  BookOpen,
  Trophy,
  Star,
  Target,
  TrendingUp,
} from 'lucide-react';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  school: string;
  createdAt: string;
}

interface ProfileStats {
  totalStories: number;
  totalWords: number;
  averageScore: number;
  publishedStories: number;
  competitionEntries: number;
  achievements: number;
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    school: '',
  });

  useEffect(() => {
    if (!session) {
      router.push('/login/child');
      return;
    }
    fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const [profileResponse, statsResponse] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/stats')
      ]);

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData.user);
        setEditForm({
          firstName: profileData.user.firstName,
          lastName: profileData.user.lastName,
          school: profileData.user.school,
        });
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        await fetchProfile();
        await update(); // Update session
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditForm({
        firstName: profile.firstName,
        lastName: profile.lastName,
        school: profile.school,
      });
    }
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-2xl mb-4">Profile Not Found</h2>
          <button
            onClick={() => router.push('/children-dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
            onClick={() => router.push('/children-dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <User size={36} />
              My Profile
            </h1>
            <p className="text-gray-300">Manage your account and view your writing journey</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/60 border border-gray-600/40 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Basic Information</h2>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="text-green-400 hover:text-green-300 flex items-center gap-1 transition-colors"
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    First Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                      className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="p-3 bg-gray-700/30 rounded-lg text-white">
                      {profile.firstName}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Last Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                      className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="p-3 bg-gray-700/30 rounded-lg text-white">
                      {profile.lastName}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email
                  </label>
                  <div className="p-3 bg-gray-700/30 rounded-lg text-gray-400 flex items-center gap-2">
                    <Mail size={16} />
                    {profile.email}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Age
                  </label>
                  <div className="p-3 bg-gray-700/30 rounded-lg text-white flex items-center gap-2">
                    <Calendar size={16} />
                    {profile.age} years old
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    School
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.school}
                      onChange={(e) => setEditForm({...editForm, school: e.target.value})}
                      className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="p-3 bg-gray-700/30 rounded-lg text-white flex items-center gap-2">
                      <School size={16} />
                      {profile.school}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-600">
                <div className="text-gray-400 text-sm flex items-center gap-2">
                  <Calendar size={16} />
                  Member since {new Date(profile.createdAt).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            
            {/* Writing Stats */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6"
              >
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Writing Stats
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-300">
                      <BookOpen size={16} />
                      Stories Written
                    </div>
                    <div className="text-white font-bold">{stats.totalStories}</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Target size={16} />
                      Total Words
                    </div>
                    <div className="text-white font-bold">{stats.totalWords.toLocaleString()}</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Star size={16} />
                      Average Score
                    </div>
                    <div className="text-white font-bold">{stats.averageScore}%</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Star size={16} />
                      Published
                    </div>
                    <div className="text-white font-bold">{stats.publishedStories}</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Trophy size={16} />
                      Competitions
                    </div>
                    <div className="text-white font-bold">{stats.competitionEntries}</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/60 border border-gray-600/40 rounded-xl p-6"
            >
              <h3 className="text-white font-bold text-lg mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/create-stories')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <BookOpen size={16} />
                  Create New Story
                </button>

                <button
                  onClick={() => router.push('/children-dashboard/my-stories')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Star size={16} />
                  View My Stories
                </button>

                <button
                  onClick={() => router.push('/children-dashboard/competitions')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Trophy size={16} />
                  Join Competition
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}