// app/admin/users/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Lock,
  Shield,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreateUserPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'child',
    parentEmail: '',
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          parentEmail: formData.role === 'child' ? formData.parentEmail : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`${formData.role} created successfully!`);
        router.push('/admin/users');
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: data.error || 'Failed to create user' });
        }
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setErrors({ general: 'Failed to create user' });
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/users">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Create New User
          </h1>
          <p className="text-gray-400">Add a new user to the platform</p>
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

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              User Role
            </label>
            <div className="relative">
              <Shield size={20} className="absolute left-3 top-3 text-gray-400" />
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="child">Child (Student)</option>
                <option value="mentor">Mentor</option>
              </select>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                First Name
              </label>
              <div className="relative">
                <User size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Last Name
              </label>
              <div className="relative">
                <User size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Enter email address"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Parent Email (Child only) */}
          {formData.role === 'child' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Parent Email Address
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.parentEmail}
                  onChange={(e) => handleInputChange('parentEmail', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.parentEmail ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter parent email address"
                />
              </div>
              {errors.parentEmail && (
                <p className="text-red-400 text-sm mt-1">{errors.parentEmail}</p>
              )}
            </div>
          )}

          {/* Passwords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Confirm password"
                  minLength={6}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
            <Link href="/admin/users">
              <button
                type="button"
                className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
            >
              <Save size={16} className="mr-2" />
              {loading ? 'Creating...' : `Create ${formData.role}`}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}