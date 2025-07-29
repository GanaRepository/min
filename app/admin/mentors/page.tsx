'use client';

import { useState, useEffect } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UserCheck,
  Users,
  Mail,
  Calendar,
  Search,
  Eye,
  Edit,
  UserPlus,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Mentor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  assignedStudents: number;
  totalStories: number;
  totalComments: number;
  activeAssignments: number;
  students?: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    totalStories: number;
  }>;
}

export default function MentorsManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchMentors(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router, page]);

  const fetchMentors = async (pageNum: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/mentors?page=${pageNum}&limit=10`);
      const data = await response.json();
      if (data.success) {
        setMentors(data.mentors);
        setTotalPages(data.pagination.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMentorDetails = async (mentorId: string) => {
    try {
      const response = await fetch(`/api/admin/mentors/${mentorId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedMentor(data.mentor);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching mentor details:', error);
    }
  };


  const filteredMentors = mentors.filter(
    (mentor) =>
      `${mentor.firstName} ${mentor.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      mentor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading mentors...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Mentors Management
          </h1>
          <p className="text-gray-400">
            Manage mentors and their student assignments
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link href="/admin/create-mentor">
            <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span>Create Mentor</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Mentors</p>
              <p className="text-2xl font-bold text-white">{mentors.length}</p>
            </div>
            <UserCheck className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Mentors</p>
              <p className="text-2xl font-bold text-white">
                {mentors.filter((m) => m.assignedStudents > 0).length}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Assignments</p>
              <p className="text-2xl font-bold text-white">
                {mentors.reduce(
                  (sum, mentor) => sum + mentor.assignedStudents,
                  0
                )}
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search mentors by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor, index) => (
          <motion.div
            key={mentor._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-all duration-200"
          >
            {/* Mentor Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {mentor.firstName[0]}
                  {mentor.lastName[0]}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium">
                  {mentor.firstName} {mentor.lastName}
                </h3>
                <p className="text-gray-400 text-sm">{mentor.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      mentor.isVerified
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {mentor.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Mentor Stats */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Assigned Students</span>
                <span className="text-white font-medium">
                  {mentor.assignedStudents}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Stories Guided</span>
                <span className="text-white font-medium">
                  {mentor.totalStories}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Comments Made</span>
                <span className="text-white font-medium">
                  {mentor.totalComments}
                </span>
              </div>
            </div>

            {/* Join Date */}
            <div className="flex items-center text-gray-400 text-sm mb-4">
              <Calendar className="w-4 h-4 mr-2" />
              <span>
                Joined {new Date(mentor.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => fetchMentorDetails(mentor._id)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
  
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mentor Details Modal */}
      {showDetailsModal && selectedMentor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {selectedMentor.firstName} {selectedMentor.lastName}
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Mentor Info */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{selectedMentor.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">
                  Joined{' '}
                  {new Date(selectedMentor.createdAt).toLocaleDateString()}
                </span>
              </div>
              {selectedMentor.lastLoginAt && (
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">
                    Last login:{' '}
                    {new Date(selectedMentor.lastLoginAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Assigned Students */}
            {selectedMentor.students && selectedMentor.students.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  Assigned Students
                </h3>
                <div className="space-y-3">
                  {selectedMentor.students.map((student) => (
                    <div
                      key={student._id}
                      className="bg-gray-700/50 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {student.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm">
                            {student.totalStories} stories
                          </p>
                          <Link href={`/admin/users/${student._id}`}>
                            <button className="text-blue-400 hover:text-blue-300 text-sm">
                              View Profile
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-8">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(page > 1 ? page - 1 : 1)}
                aria-disabled={page === 1}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, idx) => (
              <PaginationItem key={idx + 1}>
                <PaginationLink
                  isActive={page === idx + 1}
                  onClick={() => setPage(idx + 1)}
                >
                  {idx + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
                aria-disabled={page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {filteredMentors.length === 0 && !loading && (
        <div className="text-center py-12">
          <UserCheck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-400 mb-2">
            No mentors found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search criteria or create a new mentor.
          </p>
        </div>
      )}
    </div>
  );
}
