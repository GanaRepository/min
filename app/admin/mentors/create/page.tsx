// app/admin/mentors/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, User, Mail, Lock, FileText, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';

export default function CreateMentorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    experience: '',
    specializations: [] as string[],
  });

  const [newSpecialization, setNewSpecialization] = useState('');

  // Helper function to format names properly (Title Case)
  const formatName = (name: string) => {
    return name
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/mentors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          bio: formData.bio,
          experience: formData.experience,
          specializations: formData.specializations,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setToastMessage('Mentor created successfully!');
        router.push('/admin/mentors');
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: data.error || 'Failed to create mentor' });
        }
      }
    } catch (error) {
      console.error('Error creating mentor:', error);
      setErrors({ general: 'Failed to create mentor' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const addSpecialization = () => {
    if (
      newSpecialization.trim() &&
      !formData.specializations.includes(newSpecialization.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()],
      }));
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index),
    }));
  };

  return (
    <ToastProvider>
      <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/admin/mentors">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700  transition-colors">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl  text-white">
              Create New Mentor
            </h1>
            <p className="text-gray-400">Add a new mentor to the platform</p>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800  p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-3  text-sm">
                {errors.general}
              </div>
            )}

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
                      handleInputChange('firstName', formatName(e.target.value))
                    }
                    className={`w-full pl-10 pr-4 py-3 bg-gray-700 border  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.firstName ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter first name"
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.firstName}
                  </p>
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
                      handleInputChange('lastName', formatName(e.target.value))
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

            {/* Email */}
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
                  onChange={(e) =>
                    handleInputChange('email', e.target.value.toLowerCase())
                  }
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

            {/* Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm  text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={20}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange('password', e.target.value)
                    }
                    className={`w-full pl-10 pr-4 py-3 bg-gray-700 border  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter password"
                    minLength={6}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm  text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    size={20}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange('confirmPassword', e.target.value)
                    }
                    className={`w-full pl-10 pr-4 py-3 bg-gray-700 border  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.confirmPassword
                        ? 'border-red-500'
                        : 'border-gray-600'
                    }`}
                    placeholder="Confirm password"
                    minLength={6}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm  text-gray-300 mb-2">Bio</label>
              <div className="relative">
                <FileText
                  size={20}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter mentor bio..."
                />
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm  text-gray-300 mb-2">
                Experience & Qualifications
              </label>
              <div className="relative">
                <FileText
                  size={20}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <textarea
                  value={formData.experience}
                  onChange={(e) =>
                    handleInputChange('experience', e.target.value)
                  }
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter mentor experience and qualifications..."
                />
              </div>
            </div>

            {/* Specializations */}
            <div>
              <label className="block text-sm  text-gray-300 mb-2">
                Specializations
              </label>
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Tag
                    size={20}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="text"
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === 'Enter' &&
                      (e.preventDefault(), addSpecialization())
                    }
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add specialization (e.g., Creative Writing, Grammar)"
                  />
                </div>
                <button
                  type="button"
                  onClick={addSpecialization}
                  className="px-4 py-3 bg-purple-600 text-white  hover:bg-purple-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-800 text-sm  flex items-center"
                  >
                    {spec}
                    <button
                      type="button"
                      onClick={() => removeSpecialization(index)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
              <Link href="/admin/mentors">
                <button
                  type="button"
                  className="px-6 py-2.5 bg-gray-600 text-white  hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-purple-600 text-white  hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50"
              >
                <Save size={16} className="mr-2" />
                {loading ? 'Creating...' : 'Create Mentor'}
              </button>
            </div>
          </form>
        </motion.div>

        {toastMessage && (
          <Toast>
            <ToastTitle>Success!</ToastTitle>
            <ToastDescription>{toastMessage}</ToastDescription>
            <ToastClose onClick={() => setToastMessage(null)} />
          </Toast>
        )}
        <ToastViewport />
      </div>
    </ToastProvider>
  );
}
