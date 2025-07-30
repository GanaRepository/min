// Mentor Student Profile Page
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Calendar, Mail, Users } from 'lucide-react';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  totalStories: number;
  completedStories: number;
  activeStories: number;
  createdAt: string;
  lastActiveAt?: string;
  stories: Array<{
    _id: string;
    title: string;
    status: string;
    updatedAt: string;
    totalWords: number;
  }>;
}

export default function MentorStudentProfile() {
  const router = useRouter();
  const params = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch(`/api/mentor/students/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setStudent(data.student);
        } else {
          setStudent(null);
        }
      } catch (e) {
        setStudent(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [params.id]);

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading student profile...</div>;
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-400 mb-2">Student not found</h3>
        <Link href="/mentor-dashboard/students">
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Back to Students
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <Link href="/mentor-dashboard/students">
          <button className="text-gray-400 hover:text-white transition-colors text-xs sm:text-base">← Back</button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{student.firstName} {student.lastName}</h1>
          <p className="text-gray-400 text-xs sm:text-base">Student Profile</p>
        </div>
      </div>

      {/* Student Info Card */}
      <div className="bg-gray-800 rounded-xl p-3 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg sm:text-xl">{student.firstName[0]}{student.lastName[0]}</span>
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">{student.firstName} {student.lastName}</h2>
          <p className="text-gray-400 text-xs sm:text-base">{student.email}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-300 border border-green-500/30">Active</span>
            <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">Stories: {student.totalStories}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-gray-400 text-[10px] sm:text-xs">
            <Mail className="w-4 h-4" /> {student.email}
            <Calendar className="w-4 h-4 ml-2 sm:ml-4" /> Joined: {new Date(student.createdAt).toLocaleDateString()}
            {student.lastActiveAt && <span><span className="ml-2 sm:ml-4">Last Active:</span> {new Date(student.lastActiveAt).toLocaleDateString()}</span>}
          </div>
        </div>
      </div>

      {/* Student Stories */}
      <div className="bg-gray-800 rounded-xl p-3 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium text-white mb-2 sm:mb-4">Stories by {student.firstName}</h3>
        <div className="space-y-2 sm:space-y-3">
          {student.stories.length === 0 && <p className="text-gray-400 text-xs sm:text-sm">No stories yet.</p>}
          {student.stories.map((story) => (
            <div key={story._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 p-2 sm:p-3 bg-gray-700/50 rounded-lg">
              <div>
                <p className="text-white text-xs sm:text-sm font-medium">{story.title}</p>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                  <span className="px-2 py-1 rounded-full text-xs border bg-blue-500/20 text-blue-300 border-blue-500/30">{story.status}</span>
                  <span className="text-gray-400 text-[10px] sm:text-xs">{story.totalWords} words</span>
                </div>
                <span className="text-gray-400 text-[10px] sm:text-xs">Updated: {new Date(story.updatedAt).toLocaleDateString()}</span>
              </div>
              <Link href={`/mentor-dashboard/stories/${story._id}`}>
                <button className="text-blue-400 hover:text-blue-300 p-1">
                  <BookOpen className="w-4 h-4" />
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
