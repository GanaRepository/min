// app/admin/mentors/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Mail,
  Calendar,
  MessageSquare,
  BookOpen,
  Star,
  Award,
} from 'lucide-react';
import { motion } from 'framer-motion';
import TerminalLoader from '@/components/TerminalLoader';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';

interface MentorDetails {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  isActive: boolean;
  assignedStudents: number;
  totalComments: number;
  totalStories: number;
  specializations: string[];
  bio: string;
  experience: string;
  assignedChildren: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    storiesCount: number;
    lastActive: string;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    date: string;
  }>;
}

export default function ViewMentor() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const mentorId = params.id as string;

  const [mentor, setMentor] = useState<MentorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const deleteMentor = async () => {
    if (
      !confirm(
        `Are you sure you want to delete mentor ${mentor?.firstName} ${mentor?.lastName}? This will unassign all their students.`
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/mentors/${mentorId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setToastMessage('Mentor deleted successfully');
        router.push('/admin/mentors');
      } else {
        setToastMessage('Failed to delete mentor: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting mentor:', error);
      setToastMessage('Failed to delete mentor');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-green-900 flex items-center justify-center">
        <TerminalLoader
          title="Mentor Edits"
          loadingText="Loading mentor data..."
          size="lg"
        />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-green-900 flex items-center justify-center">
        <TerminalLoader
          title="Mentor Details"
          loadingText="Mentor not found...."
          size="lg"
        />
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/mentors">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700  transition-colors">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl  text-white">
              {mentor.firstName} {mentor.lastName}
            </h1>
            <p className="text-gray-400">Mentor Details & Performance</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link href={`/admin/mentors/${mentorId}/edit`}>
            <button className="bg-blue-600 text-white px-4 py-2  hover:bg-blue-700 transition-colors flex items-center">
              <Edit size={16} className="mr-2" />
              Edit
            </button>
          </Link>
          <button
            onClick={deleteMentor}
            disabled={deleting}
            className="bg-red-600 text-white px-4 py-2  hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Trash2 size={16} className="mr-2" />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Mentor Info Card */}
      <div className="bg-gray-800  p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-600 p-3 ">
              <Mail size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-white ">{mentor.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-green-600 p-3 ">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Assigned Students</p>
              <p className="text-white ">{mentor.assignedStudents}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-3 ">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Student Stories</p>
              <p className="text-white ">{mentor.totalStories}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-orange-600 p-3 ">
              <MessageSquare size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Comments Given</p>
              <p className="text-white ">{mentor.totalComments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mentor Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800  p-6">
          <h3 className="text-lg  text-white mb-4">Profile Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Bio</label>
              <p className="text-white mt-1">
                {mentor.bio || 'No bio provided'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Experience</label>
              <p className="text-white mt-1">
                {mentor.experience || 'No experience details'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Specializations</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {mentor.specializations?.map((spec, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-purple-100 text-purple-800 text-xs "
                  >
                    {spec}
                  </span>
                )) || (
                  <span className="text-gray-400 text-sm">None specified</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800  p-6">
          <h3 className="text-lg  text-white mb-4">Account Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Account Status</span>
              <span
                className={`px-3 py-1  text-sm ${
                  mentor.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {mentor.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {/* Email Verified removed */}
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Joined Date</span>
              <span className="text-white">
                {new Date(mentor.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Students */}
      {mentor.assignedChildren && mentor.assignedChildren.length > 0 && (
        <div className="bg-gray-800  p-6">
          <h3 className="text-lg  text-white mb-4">Assigned Students</h3>
          <div className="space-y-3">
            {mentor.assignedChildren.map((student) => (
              <div
                key={student._id}
                className="flex items-center justify-between p-3 bg-gray-700/50 "
              >
                <div className="flex-1">
                  <Link href={`/admin/users/${student._id}`}>
                    <h4 className="text-white  hover:text-blue-400 cursor-pointer">
                      {student.firstName} {student.lastName}
                    </h4>
                  </Link>
                  <p className="text-xs text-gray-400 mt-1">{student.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white">
                    {student.storiesCount} stories
                  </p>
                  <p className="text-xs text-gray-400">
                    Last active:{' '}
                    {new Date(student.lastActive).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {mentor.recentActivity && mentor.recentActivity.length > 0 && (
        <div className="bg-gray-800  p-6">
          <h3 className="text-lg  text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {mentor.recentActivity.slice(0, 10).map((activity, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 bg-gray-700/50 "
              >
                <div className="flex-shrink-0 w-2 h-2 bg-blue-400  mt-2"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.date).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast>
          <ToastTitle>
            {toastMessage.includes('successfully') ? 'Success!' : 'Error'}
          </ToastTitle>
          <ToastDescription>{toastMessage}</ToastDescription>
          <ToastClose onClick={() => setToastMessage(null)} />
        </Toast>
      )}
      <ToastViewport />
      </div>
    </ToastProvider>
  );
}
