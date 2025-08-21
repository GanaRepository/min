// app/admin/users/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Shield,
  Calendar,
  Activity,
} from 'lucide-react';
import { motion } from 'framer-motion';
import TerminalLoader from '@/components/TerminalLoader';

interface EditUserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  storiesCreatedThisMonth: number;
  assessmentUploadsThisMonth: number;
  competitionEntriesThisMonth: number;
}

export default function EditUser() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<EditUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    isActive: true,
    // removed isVerified
    storiesCreatedThisMonth: 0,
    assessmentUploadsThisMonth: 0,
    competitionEntriesThisMonth: 0,
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchUser();
  }, [session, status, router, userId]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setFormData({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          role: data.user.role,
          isActive: data.user.isActive,
          // removed isVerified
          storiesCreatedThisMonth: data.user.storiesCreatedThisMonth || 0,
          assessmentUploadsThisMonth: data.user.assessmentUploadsThisMonth || 0,
          competitionEntriesThisMonth:
            data.user.competitionEntriesThisMonth || 0,
        });
      } else {
        router.push('/admin/users');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      router.push('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('User updated successfully!');
        router.push(`/admin/users/${userId}`);
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          alert('Failed to update user: ' + data.error);
        }
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-green-900 flex items-center justify-center">
        <TerminalLoader
          title="User Details"
          loadingText="Loading user details..."
          size="lg"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-green-900 flex items-center justify-center">
        <TerminalLoader
          title="User Details"
          loadingText="User details Not Found..."
          size="lg"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/admin/users/${userId}`}>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700  transition-colors">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl  text-white">Edit User</h1>
          <p className="text-gray-400">Modify user information and settings</p>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800  p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm  text-gray-300 mb-2">
                First Name
              </label>
              <div className="relative">
                <User
                  size={20}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange('firstName', e.target.value)
                  }
                  className={`w-full pl-10 pr-4 py-3 bg-gray-700 border  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter first name"
                />
              </div>
              {errors.firstName && (
                <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm  text-gray-300 mb-2">
                Last Name
              </label>
              <div className="relative">
                <User
                  size={20}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange('lastName', e.target.value)
                  }
                  className={`w-full pl-10 pr-4 py-3 bg-gray-700 border  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter last name"
                />
              </div>
              {errors.lastName && (
                <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email and Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm  text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-700 border  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter email address"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm  text-gray-300 mb-2">Role</label>
              <div className="relative">
                <Shield
                  size={20}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-700 border  text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.role ? 'border-red-500' : 'border-gray-600'
                  }`}
                >
                  <option value="child">Child</option>
                  <option value="mentor">Mentor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {errors.role && (
                <p className="text-red-400 text-sm mt-1">{errors.role}</p>
              )}
            </div>
          </div>

          {/* Status Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    handleInputChange('isActive', e.target.checked)
                  }
                  className="w-5 h-5 bg-gray-700 border-gray-600  focus:ring-blue-500 focus:ring-2"
                />
                <div className="flex items-center">
                  <Activity size={20} className="text-green-400 mr-2" />
                  <span className="text-white ">Account Active</span>
                </div>
              </label>
              <p className="text-gray-400 text-sm mt-1">
                User can log in and use the platform
              </p>
            </div>

            {/* Email Verified removed */}
          </div>

          {/* Monthly Usage Overrides (Child Only) */}
          {formData.role === 'child' && (
            <div>
              <h3 className="text-lg  text-white mb-4">
                Monthly Usage Overrides
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm  text-gray-300 mb-2">
                    Stories Created This Month
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.storiesCreatedThisMonth}
                    onChange={(e) =>
                      handleInputChange(
                        'storiesCreatedThisMonth',
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-gray-400 text-xs mt-1">Default limit: 3</p>
                </div>

                <div>
                  <label className="block text-sm  text-gray-300 mb-2">
                    Assessments This Month
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.assessmentUploadsThisMonth}
                    onChange={(e) =>
                      handleInputChange(
                        'assessmentUploadsThisMonth',
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-gray-400 text-xs mt-1">Default limit: 3</p>
                </div>

                <div>
                  <label className="block text-sm  text-gray-300 mb-2">
                    Competition Entries This Month
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.competitionEntriesThisMonth}
                    onChange={(e) =>
                      handleInputChange(
                        'competitionEntriesThisMonth',
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-gray-400 text-xs mt-1">Default limit: 3</p>
                </div>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-500/30  p-3 mt-4">
                <p className="text-yellow-300 text-sm">
                  ⚠️ These overrides allow you to manually adjust a user's
                  monthly usage counters. Use this feature carefully as it
                  affects their limits and billing.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
            <Link href={`/admin/users/${userId}`}>
              <button
                type="button"
                className="px-6 py-2.5 bg-gray-600 text-white  hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white  hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
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
