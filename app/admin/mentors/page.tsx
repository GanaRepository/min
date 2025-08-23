//app/admin/mentors/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Search,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  MessageSquare,
  BookOpen,
  Calendar,
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

interface Mentor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  isActive: boolean;
  isVerified: boolean;
  assignedStudents: number;
  totalComments: number;
  totalStories: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function MentorsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchMentors = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '6',
      });

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await fetch(`/api/admin/mentors?${params}`);
      const data = await response.json();

      if (data.success) {
        setMentors(data.mentors);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchMentors();
  }, [session, status, router, fetchMentors]);

  const deleteMentor = async (mentorId: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete mentor "${name}"? This will unassign all their students.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/mentors/${mentorId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setMentors(mentors.filter((mentor) => mentor._id !== mentorId));
        setToastMessage('Mentor deleted successfully');
      } else {
        setToastMessage('Failed to delete mentor: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting mentor:', error);
      setToastMessage('Failed to delete mentor');
    }
  };

  if (loading && mentors.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-green-900 flex items-center justify-center">
        <TerminalLoader
          title="Mentor Edits"
          loadingText="Loading  mentors..."
          size="lg"
        />
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl  text-white mb-2">
              Mentors Management
            </h1>
            <p className="text-gray-400">
              Manage all mentors and their student assignments
            </p>
          </div>
          <Link href="/admin/mentors/create">
            <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2.5  hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center">
              <UserPlus size={20} className="mr-2" />
              Add New Mentor
            </button>
          </Link>
        </div>

        {/* Search */}
        <div className="bg-gray-800  p-6">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search mentors by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {mentors.map((mentor, index) => (
            <motion.div
              key={mentor._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 border border-gray-700  p-6 hover:bg-gray-750 hover:border-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl min-h-[280px] flex flex-col"
            >
              {/* Mentor Header */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700  flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-white font-bold text-xl">
                    {mentor.firstName[0]}
                    {mentor.lastName[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-lg leading-tight mb-1">
                    {mentor.firstName} {mentor.lastName}
                  </h3>
                  <p className="text-gray-400 text-sm truncate mb-2">{mentor.email}</p>
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2  mr-2 ${
                        mentor.isActive ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    ></div>
                    <span className={`text-xs font-medium ${
                      mentor.isActive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {mentor.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6 flex-1">
                <div className="text-center p-4 bg-gray-700/40  border border-gray-600/50">
                  <div className="w-8 h-8 bg-blue-500/20  flex items-center justify-center mx-auto mb-2">
                    <Users size={16} className="text-blue-400" />
                  </div>
                  <p className="text-xl font-bold text-white mb-1">
                    {mentor.assignedStudents}
                  </p>
                  <p className="text-xs text-gray-400 font-medium">Students</p>
                </div>
                <div className="text-center p-4 bg-gray-700/40  border border-gray-600/50">
                  <div className="w-8 h-8 bg-green-500/20  flex items-center justify-center mx-auto mb-2">
                    <BookOpen size={16} className="text-green-400" />
                  </div>
                  <p className="text-xl font-bold text-white mb-1">{mentor.totalStories}</p>
                  <p className="text-xs text-gray-400 font-medium">Stories</p>
                </div>
                <div className="text-center p-4 bg-gray-700/40  border border-gray-600/50">
                  <div className="w-8 h-8 bg-orange-500/20  flex items-center justify-center mx-auto mb-2">
                    <MessageSquare size={16} className="text-orange-400" />
                  </div>
                  <p className="text-xl font-bold text-white mb-1">{mentor.totalComments}</p>
                  <p className="text-xs text-gray-400 font-medium">Comments</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700 mt-auto">
                <div className="flex items-center text-gray-400 text-sm">
                  <Calendar size={14} className="mr-2" />
                  <span>{new Date(mentor.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Link href={`/admin/mentors/${mentor._id}`}>
                    <button 
                      className="p-2.5 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10  transition-all duration-200"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </Link>
                  <Link href={`/admin/mentors/${mentor._id}/edit`}>
                    <button 
                      className="p-2.5 text-gray-400 hover:text-green-400 hover:bg-green-400/10  transition-all duration-200"
                      title="Edit Mentor"
                    >
                      <Edit size={16} />
                    </button>
                  </Link>
                  <button
                    onClick={() =>
                      deleteMentor(
                        mentor._id,
                        `${mentor.firstName} ${mentor.lastName}`
                      )
                    }
                    className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10  transition-all duration-200"
                    title="Delete Mentor"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {mentors.length === 0 && !loading && (
          <div className="bg-gray-800 border border-gray-700  p-12 text-center">
            <div className="w-20 h-20 bg-gray-700  flex items-center justify-center mx-auto mb-6">
              <Users size={32} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-3">No mentors found</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {searchTerm
                ? 'Try adjusting your search criteria or clear the search to see all mentors.'
                : 'Get started by adding your first mentor to the platform.'}
            </p>
            {!searchTerm && (
              <Link href="/admin/mentors/create">
                <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3  hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center mx-auto">
                  <UserPlus size={20} className="mr-2" />
                  Add First Mentor
                </button>
              </Link>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="bg-gray-800 border border-gray-700  p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Page Info */}
              <div className="text-gray-400 text-sm">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} mentors
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 text-white  hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                >
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const pageNum =
                      Math.max(1, Math.min(pagination.pages - 4, page - 2)) + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-2  font-medium transition-all duration-200 ${
                          page === pageNum
                            ? 'bg-purple-600 border border-purple-500 text-white shadow-lg'
                            : 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 text-white  hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                >
                  <span>Next</span>
                </button>
              </div>
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
