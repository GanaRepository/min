// app/admin/mentors/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, User, Mail, FileText, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

interface EditMentorData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  bio: string;
  experience: string;
  specializations: string[];
}

export default function EditMentor() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const mentorId = params.id as string;

  const [mentor, setMentor] = useState<EditMentorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    isActive: true,
    bio: '',
    experience: '',
    specializations: [] as string[],
  });

  const [newSpecialization, setNewSpecialization] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchMentor();
  }, [session, status, router, mentorId]);

  const fetchMentor = async () => {
    try {
      const response = await fetch(`/api/admin/mentors/${mentorId}`);
      const data = await response.json();

      if (data.success) {
        setMentor(data.mentor);
        setFormData({
          firstName: data.mentor.firstName,
          lastName: data.mentor.lastName,
          email: data.mentor.email,
          isActive: data.mentor.isActive,
          // removed isVerified
          bio: data.mentor.bio || '',
          experience: data.mentor.experience || '',
          specializations: data.mentor.specializations || [],
        });
      } else {
        router.push('/admin/mentors');
      }
    } catch (error) {
      console.error('Error fetching mentor:', error);
      router.push('/admin/mentors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const response = await fetch(`/api/admin/mentors/${mentorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Mentor updated successfully!');
        router.push(`/admin/mentors/${mentorId}`);
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          alert('Failed to update mentor: ' + data.error);
        }
      }
    } catch (error) {
      console.error('Error updating mentor:', error);
      alert('Failed to update mentor');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading mentor data...</div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Mentor not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/admin/mentors/${mentorId}`}>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700  transition-colors">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl  text-white">
            Edit Mentor
          </h1>
          <p className="text-gray-400">
            Modify mentor information and settings
          </p>
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

          {/* Email */}
          <div>
            <label className="block text-sm  text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-3 text-gray-400" />
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

          {/* Bio */}
          <div>
            <label className="block text-sm  text-gray-300 mb-2">
              Bio
            </label>
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
              Experience
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
                  placeholder="Add specialization..."
                />
              </div>
              <button
                type="button"
                onClick={addSpecialization}
                className="px-4 py-3 bg-blue-600 text-white  hover:bg-blue-700 transition-colors"
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
                <span className="text-white ">Account Active</span>
              </label>
              <p className="text-gray-400 text-sm mt-1">
                Mentor can log in and access students
              </p>
            </div>

            {/* Email Verified removed */}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
            <Link href={`/admin/mentors/${mentorId}`}>
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
