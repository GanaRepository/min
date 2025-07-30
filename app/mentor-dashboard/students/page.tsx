'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  Calendar,
  Search,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  Star,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  totalStories: number;
  completedStories: number;
  activeStories: number;
  assignedAt: string;
  lastActiveAt: string;
}

export default function MentorStudents() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch('/api/mentor/students');
      const data = await response.json();

      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'mentor') {
      router.push('/login/mentor');
      return;
    }

    fetchStudents();
  }, [session, status, router, fetchStudents]);

  const filteredStudents = students.filter(
    (student) =>
      `${student.firstName} ${student.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">My Students</h1>
          <p className="text-gray-400 text-sm sm:text-base">Manage your assigned young writers</p>
        </div>
        <div className="mt-2 sm:mt-0">
          <div className="text-gray-400 text-xs sm:text-sm">
            Total Students: {students.length}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-gray-800 rounded-xl p-3 sm:p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-xs sm:text-base"
          />
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredStudents.map((student, index) => (
          <motion.div
            key={student._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-xl p-3 sm:p-6 hover:bg-gray-750 transition-all duration-200"
          >
            {/* Student Header */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-base sm:text-lg">
                  {student.firstName[0]}
                  {student.lastName[0]}
                </span>
              </div>
              <div>
                <h3 className="text-white font-medium text-sm sm:text-base">
                  {student.firstName} {student.lastName}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">{student.email}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
              <div className="text-center">
                <div className="text-base sm:text-xl font-bold text-white">
                  {student.totalStories}
                </div>
                <div className="text-gray-400 text-[10px] sm:text-xs">Total Stories</div>
              </div>
              <div className="text-center">
                <div className="text-base sm:text-xl font-bold text-green-400">
                  {student.completedStories}
                </div>
                <div className="text-gray-400 text-[10px] sm:text-xs">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-base sm:text-xl font-bold text-blue-400">
                  {student.activeStories}
                </div>
                <div className="text-gray-400 text-[10px] sm:text-xs">Active</div>
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-4">
              <div className="flex items-center gap-1 sm:gap-2 text-gray-400 text-[10px] sm:text-sm">
                <Calendar className="w-4 h-4" />
                <span>
                  Assigned: {new Date(student.assignedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 text-gray-400 text-[10px] sm:text-sm">
                <Clock className="w-4 h-4" />
                <span>
                  Last Active:{' '}
                  {new Date(student.lastActiveAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                href={`/mentor-dashboard/students/${student._id}`}
                className="flex-1"
              >
                <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-base">
                  <Eye className="w-4 h-4" />
                  <span>View Profile</span>
                </button>
              </Link>
              <Link href={`/mentor-dashboard/stories?student=${student._id}`}>
                <button className="bg-gray-700 text-white py-2 px-3 rounded-lg hover:bg-gray-600 transition-colors text-xs sm:text-base">
                  <BookOpen className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredStudents.length === 0 && !loading && (
        <div className="text-center py-8 sm:py-12">
          <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-2 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-medium text-gray-400 mb-1 sm:mb-2">
            No students found
          </h3>
          <p className="text-gray-500 text-xs sm:text-base">
            {searchTerm
              ? 'Try adjusting your search criteria.'
              : 'No students have been assigned to you yet.'}
          </p>
        </div>
      )}
    </div>
  );
}
