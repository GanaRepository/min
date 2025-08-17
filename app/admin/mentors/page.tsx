//app/admin/mentors/page.tsx
// app/admin/mentors/page.tsx - List All Mentors
'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchMentors();
  }, [session, status, router, page, searchTerm]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
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
  };

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
        alert('Mentor deleted successfully');
      } else {
        alert('Failed to delete mentor: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting mentor:', error);
      alert('Failed to delete mentor');
    }
  };

  if (loading && mentors.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading mentors...</div>
      </div>
    );
  }

  return (
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map((mentor) => (
          <motion.div
            key={mentor._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800  p-6 hover:bg-gray-700/50 transition-all duration-200"
          >
            {/* Mentor Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-600  flex items-center justify-center">
                  <span className="text-white  text-lg">
                    {mentor.firstName[0]}
                    {mentor.lastName[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-white ">
                    {mentor.firstName} {mentor.lastName}
                  </h3>
                  <p className="text-gray-400 text-sm">{mentor.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <div
                  className={`w-3 h-3  ${
                    mentor.isActive ? 'bg-green-500' : 'bg-red-500'
                  }`}
                ></div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users size={16} className="text-blue-400" />
                </div>
                <p className="text-2xl  text-white">
                  {mentor.assignedStudents}
                </p>
                <p className="text-xs text-gray-400">Students</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <BookOpen size={16} className="text-green-400" />
                </div>
                <p className="text-2xl  text-white">
                  {mentor.totalStories}
                </p>
                <p className="text-xs text-gray-400">Stories</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <MessageSquare size={16} className="text-orange-400" />
                </div>
                <p className="text-2xl  text-white">
                  {mentor.totalComments}
                </p>
                <p className="text-xs text-gray-400">Comments</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div className="flex items-center text-gray-400 text-sm">
                <Calendar size={14} className="mr-1" />
                {new Date(mentor.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center space-x-2">
                <Link href={`/admin/mentors/${mentor._id}`}>
                  <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-600  transition-colors">
                    <Eye size={16} />
                  </button>
                </Link>
                <Link href={`/admin/mentors/${mentor._id}/edit`}>
                  <button className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-600  transition-colors">
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
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-600  transition-colors"
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
        <div className="text-center py-12">
          <Users size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl  text-gray-400 mb-2">
            No mentors found
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? 'Try adjusting your search'
              : 'Start by adding your first mentor'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-700 text-white  hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const pageNum =
                Math.max(1, Math.min(pagination.pages - 4, page - 2)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-2  transition-colors ${
                    page === pageNum
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
            className="px-4 py-2 bg-gray-700 text-white  hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
