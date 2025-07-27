'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  UserPlus,
  Search,
  CheckCircle,
  User,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Mentor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  assignedStudents: number;
}

export default function AssignMentorPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }

    fetchData();
  }, [session, status, router, params.id]);

  const fetchData = async () => {
    try {
      const [studentResponse, mentorsResponse] = await Promise.all([
        fetch(`/api/admin/users/${params.id}`),
        fetch('/api/admin/mentors')
      ]);

      const studentData = await studentResponse.json();
      const mentorsData = await mentorsResponse.json();

      if (studentData.success) {
        setStudent(studentData.user);
      }

      if (mentorsData.success) {
        setMentors(mentorsData.mentors);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignMentor = async () => {
    if (!selectedMentor) {
      toast({
        title: 'Error',
        description: 'Please select a mentor',
        variant: 'destructive',
      });
      return;
    }

    setAssigning(true);
    try {
      const response = await fetch('/api/admin/assign-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: selectedMentor,
          childId: params.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Mentor assigned successfully',
        });
        router.push(`/admin/users/${params.id}`);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to assign mentor',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign mentor',
        variant: 'destructive',
      });
    } finally {
      setAssigning(false);
    }
  };

  const filteredMentors = mentors.filter(mentor =>
    `${mentor.firstName} ${mentor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-400 mb-2">Student not found</h3>
        <Link href="/admin/users">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Back to Users
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/admin/users/${params.id}`}>
          <button className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Assign Mentor</h1>
          <p className="text-gray-400">Select a mentor for {student.firstName} {student.lastName}</p>
        </div>
      </div>

      {/* Student Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-xl p-6"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {student.firstName[0]}{student.lastName[0]}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">
              {student.firstName} {student.lastName}
            </h3>
            <p className="text-gray-400">{student.email}</p>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="relative">
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

      {/* Mentors List */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-4">Available Mentors</h3>
        <div className="space-y-3">
          {filteredMentors.map((mentor) => (
            <motion.div
              key={mentor._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedMentor === mentor._id
                  ? 'bg-blue-500/20 border-blue-500/50'
                  : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
              }`}
              onClick={() => setSelectedMentor(mentor._id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {mentor.firstName[0]}{mentor.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {mentor.firstName} {mentor.lastName}
                    </p>
                    <p className="text-gray-400 text-sm">{mentor.email}</p>
                    <p className="text-gray-400 text-xs">
                      {mentor.assignedStudents} students assigned
                    </p>
                  </div>
                </div>
                {selectedMentor === mentor._id && (
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredMentors.length === 0 && (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No mentors found</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Link href={`/admin/users/${params.id}`}>
          <button className="px-6 py-2 text-gray-400 hover:text-white transition-colors">
            Cancel
          </button>
        </Link>
        <button
          onClick={handleAssignMentor}
          disabled={!selectedMentor || assigning}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {assigning ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Assigning...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Assign Mentor</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}