// app/admin/mentors/assign/page.tsx - NEW PAGE FOR ASSIGNING STUDENTS TO MENTORS
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  UserCheck,
  Search,
  Plus,
  Trash2,
  Check,
  X,
  User,
  GraduationCap,
  BookOpen,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  storiesCount: number;
  isAssigned: boolean;
  currentMentor?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

interface Mentor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  assignedStudents: number;
  isActive: boolean;
}

interface Assignment {
  _id: string;
  mentorId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  childId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedDate: string;
}

export default function AssignStudentsPage() {

  // State declarations
  const { data: session, status } = useSession();
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [selectedMentor, setSelectedMentor] = useState('');
  const [page, setPage] = useState(1);
  const studentsPerPage = 6;

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, mentorsRes, assignmentsRes] = await Promise.all([
        fetch('/api/admin/users?role=child&limit=100'),
        fetch('/api/admin/mentors?limit=100'),
        fetch('/api/admin/mentors/assaign'), // Note: API has typo "assaign" instead of "assign"
      ]);

      const [studentsData, mentorsData, assignmentsData] = await Promise.all([
        studentsRes.json(),
        mentorsRes.json(),
        assignmentsRes.json(),
      ]);

      if (studentsData.success) {
        // Map students with assignment status
        const studentsWithAssignment = studentsData.users.map((student: any) => {
          const assignment = assignmentsData.success ? 
            assignmentsData.assignments.find((a: Assignment) => 
              a.childId._id === student._id
            ) : null;

          return {
            ...student,
            storiesCount: student.storiesCount || 0,
            isAssigned: !!assignment,
            currentMentor: assignment ? {
              _id: assignment.mentorId._id,
              firstName: assignment.mentorId.firstName,
              lastName: assignment.mentorId.lastName,
            } : undefined,
          };
        });

        setStudents(studentsWithAssignment);
      }

      if (mentorsData.success) {
        setMentors(mentorsData.mentors);
      }

      if (assignmentsData.success) {
        setAssignments(assignmentsData.assignments);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignStudent = async (studentId: string, mentorId: string) => {
    if (!mentorId) {
      alert('Please select a mentor');
      return;
    }

    try {
      setAssigning(studentId);
      const response = await fetch('/api/admin/mentors/assaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: studentId,
          mentorId: mentorId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        fetchData(); // Refresh data
      } else {
        alert('Failed to assign student: ' + data.error);
      }
    } catch (error) {
      console.error('Error assigning student:', error);
      alert('Failed to assign student');
    } finally {
      setAssigning(null);
    }
  };

  const unassignStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to unassign this student?')) {
      return;
    }

    try {
      setAssigning(studentId);
      // You'll need to create an unassign API endpoint
      const response = await fetch('/api/admin/mentors/unassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId: studentId }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Student unassigned successfully');
        fetchData(); // Refresh data
      } else {
        alert('Failed to unassign student: ' + data.error);
      }
    } catch (error) {
      console.error('Error unassigning student:', error);
      alert('Failed to unassign student');
    } finally {
      setAssigning(null);
    }
  };

  // Pagination logic (must come after all state declarations)
  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'assigned' && student.isAssigned) ||
      (filterType === 'unassigned' && !student.isAssigned);

    return matchesSearch && matchesFilter;
  });
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const paginatedStudents = filteredStudents.slice((page - 1) * studentsPerPage, page * studentsPerPage);

  // Reset page if filteredStudents shrinks below current page
  useEffect(() => {
    if (page > 1 && (page - 1) * studentsPerPage >= filteredStudents.length) {
      setPage(Math.max(1, Math.ceil(filteredStudents.length / studentsPerPage)));
    }
  }, [filteredStudents.length, page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading students and mentors...</div>
      </div>
    );
  }

  return (
  <div className="space-y-6 px-1 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-2 sm:py-6 md:py-8 overflow-x-auto w-full min-w-0">
      {/* Header */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 w-full min-w-0">
        <div className="flex items-center space-x-4">
          <Link href="/admin/mentors">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700  transition-colors">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl  text-white">
              Assign Students to Mentors
            </h1>
            <p className="text-gray-400">
              Manage student-mentor assignments and supervision
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="bg-gray-700 text-white px-4 py-2  hover:bg-gray-600 transition-colors flex items-center"
        >
          <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 w-full min-w-0">
        <div className="bg-gray-800  p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-3 ">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Students</p>
              <p className="text-2xl  text-white">{students.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800  p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 p-3 ">
              <UserCheck size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Assigned Students</p>
              <p className="text-2xl  text-white">
                {students.filter(s => s.isAssigned).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800  p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-600 p-3 ">
              <AlertCircle size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Unassigned Students</p>
              <p className="text-2xl  text-white">
                {students.filter(s => !s.isAssigned).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800  p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-600 p-3 ">
              <GraduationCap size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Mentors</p>
              <p className="text-2xl  text-white">
                {mentors.filter(m => m.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
  <div className="bg-gray-800  p-4 sm:p-6 overflow-x-auto w-full min-w-0">
  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 w-full min-w-0">
          {/* Search */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Assignment Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600  text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Students</option>
              <option value="assigned">Assigned Students</option>
              <option value="unassigned">Unassigned Students</option>
            </select>
          </div>

          {/* Quick Assign Mentor */}
          <div>
            <select
              value={selectedMentor}
              onChange={(e) => setSelectedMentor(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600  text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select mentor for bulk assign</option>
              {mentors.filter(m => m.isActive).map((mentor) => (
                <option key={mentor._id} value={mentor._id}>
                  {mentor.firstName} {mentor.lastName} ({mentor.assignedStudents} students)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students List */}
  <div className="bg-gray-800  p-4 sm:p-6 overflow-x-auto w-full min-w-0">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg  text-white">
            Students ({filteredStudents.length})
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">
              Showing {paginatedStudents.length} of {filteredStudents.length} students (Page {page} of {totalPages || 1})
            </span>
          </div>
        </div>

        {filteredStudents.length > 0 ? (
          <>
            <div className="space-y-3 min-w-0 w-full">
              {paginatedStudents.map((student) => (
              <motion.div
                key={student._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-4 bg-gray-700/50  hover:bg-gray-700/70 transition-colors gap-1 sm:gap-2 min-w-0 w-full"
              >
                {/* Student Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-600 -full flex items-center justify-center flex-shrink-0">
                    <span className="text-white  text-base sm:text-lg">
                      {student.firstName[0]}{student.lastName[0]}
                    </span>
                  </div>
                  <div className="min-w-0 w-full break-words">
                    <Link href={`/admin/users/${student._id}`}>
                      <h4 className="text-white  hover:text-blue-400 cursor-pointer text-base sm:text-lg break-words">
                        {student.firstName} {student.lastName}
                      </h4>
                    </Link>
                    <p className="text-gray-400 text-xs sm:text-sm break-words">{student.email}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {student.storiesCount} stories
                      </span>
                      <span className="text-xs text-gray-500">
                        Joined {new Date(student.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assignment Status & Actions */}
                <div className="flex items-center space-x-4">
                  {student.isAssigned && student.currentMentor ? (
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Check size={16} className="text-green-400" />
                        <span className="text-green-400 text-sm ">Assigned</span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        Mentor: {student.currentMentor.firstName} {student.currentMentor.lastName}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <X size={16} className="text-red-400" />
                      <span className="text-red-400 text-sm ">Unassigned</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {student.isAssigned ? (
                      <button
                        onClick={() => unassignStudent(student._id)}
                        disabled={assigning === student._id}
                        className="bg-red-600 text-white px-3 py-1  hover:bg-red-700 transition-colors flex items-center text-sm disabled:opacity-50"
                      >
                        <Trash2 size={14} className="mr-1" />
                        {assigning === student._id ? 'Unassigning...' : 'Unassign'}
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <select
                          className="px-2 py-1 bg-gray-600 border border-gray-500  text-white text-sm"
                          onChange={(e) => {
                            if (e.target.value) {
                              assignStudent(student._id, e.target.value);
                              e.target.value = ''; // Reset
                            }
                          }}
                          disabled={assigning === student._id}
                        >
                          <option value="">Assign to...</option>
                          {mentors.filter(m => m.isActive).map((mentor) => (
                            <option key={mentor._id} value={mentor._id}>
                              {mentor.firstName} {mentor.lastName}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="text-gray-300">Page {page} of {totalPages || 1}</span>
            <button
              className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl text-gray-400 mb-2">No students found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'No students match your search.' : 'No students available to assign.'}
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {students.filter(s => !s.isAssigned).length > 0 && (
        <div className="bg-blue-900/20 border border-blue-500/30  p-6">
          <h3 className="text-lg  text-blue-400 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800  p-4">
              <h4 className="text-white  mb-2">
                Unassigned Students Alert
              </h4>
              <p className="text-gray-400 text-sm mb-3">
                {students.filter(s => !s.isAssigned).length} students need mentor assignment
              </p>
              <Link href="/admin/mentors/create">
                <button className="bg-blue-600 text-white px-4 py-2  hover:bg-blue-700 transition-colors text-sm">
                  Create New Mentor
                </button>
              </Link>
            </div>
            <div className="bg-gray-800  p-4">
              <h4 className="text-white  mb-2">
                Mentor Capacity
              </h4>
              <p className="text-gray-400 text-sm mb-3">
                Average students per mentor: {mentors.length > 0 ? Math.round(students.filter(s => s.isAssigned).length / mentors.filter(m => m.isActive).length) : 0}
              </p>
              <Link href="/admin/mentors">
                <button className="bg-purple-600 text-white px-4 py-2  hover:bg-purple-700 transition-colors text-sm">
                  View All Mentors
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}