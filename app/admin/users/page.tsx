// app/admin/users/page.tsx - UPDATED to include admin filter
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Download,
  Crown,
  UserCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastActiveDate?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchUsers();
  }, [session, status, router, page, searchTerm, filterRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '6',
      });

      if (filterRole !== 'all') {
        params.append('role', filterRole);
      }
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const exportUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (filterRole !== 'all') params.append('role', filterRole);

      const response = await fetch(`/api/admin/users/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting users:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'mentor':
        return 'bg-purple-100 text-purple-800';
      case 'child':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown size={16} className="text-red-600" />;
      case 'mentor':
        return <UserCheck size={16} className="text-purple-600" />;
      case 'child':
        return <BookOpen size={16} className="text-blue-600" />;
      default:
        return <Users size={16} className="text-gray-600" />;
    }
  };

  const getStatusColor = (isActive: boolean) => {
    if (!isActive) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (isActive: boolean) => {
    if (!isActive) return 'Inactive';
    return 'Active';
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl  text-white mb-2">
            User Management
          </h1>
          <p className="text-gray-400">Manage all users in the platform</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/admin/users/create">
            <button className="bg-blue-600 text-white px-4 py-2  hover:bg-blue-700 transition-colors flex items-center">
              <UserPlus size={16} className="mr-2" />
              Add User
            </button>
          </Link>
          <button
            onClick={exportUsers}
            className="bg-green-600 text-white px-4 py-2  hover:bg-green-700 transition-colors flex items-center"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800  p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm  text-gray-400">Total Users</h3>
            <Users size={20} className="text-blue-400" />
          </div>
          <p className="text-2xl  text-white">
            {pagination?.total || 0}
          </p>
        </div>

        <div className="bg-gray-800  p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm  text-gray-400">Children</h3>
            <BookOpen size={20} className="text-green-400" />
          </div>
          <p className="text-2xl  text-white">
            {users.filter((u) => u.role === 'child').length}
          </p>
        </div>

        <div className="bg-gray-800  p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm  text-gray-400">Mentors</h3>
            <UserCheck size={20} className="text-purple-400" />
          </div>
          <p className="text-2xl  text-white">
            {users.filter((u) => u.role === 'mentor').length}
          </p>
        </div>

        <div className="bg-gray-800  p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm  text-gray-400">Admins</h3>
            <Crown size={20} className="text-red-400" />
          </div>
          <p className="text-2xl  text-white">
            {users.filter((u) => u.role === 'admin').length}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800  p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-gray-700 border border-gray-600  px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="child">Children</option>
                <option value="mentor">Mentors</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800  overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs  text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs  text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs  text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs  text-gray-300 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs  text-gray-300 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs  text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.length > 0 ? (
                users.map((user) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10  bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-sm  text-white">
                              {user.firstName.charAt(0)}
                              {user.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm  text-white">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(user.role)}
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5  text-xs  ${getRoleBadgeColor(user.role)}`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5  text-xs  ${getStatusColor(user.isActive)}`}
                      >
                        {getStatusText(user.isActive)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {user.lastActiveDate
                        ? new Date(user.lastActiveDate).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm ">
                      <div className="flex items-center space-x-2">
                        <Link href={`/admin/users/${user._id}`}>
                          <button className="text-blue-400 hover:text-blue-300">
                            <Eye size={16} />
                          </button>
                        </Link>
                        <Link href={`/admin/users/${user._id}/edit`}>
                          <button className="text-green-400 hover:text-green-300">
                            <Edit size={16} />
                          </button>
                        </Link>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() =>
                              deleteUser(
                                user._id,
                                `${user.firstName} ${user.lastName}`
                              )
                            }
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="text-gray-400">
                      <Users size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg ">No users found</p>
                      <p className="text-sm">
                        Users will appear here as they register
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="bg-gray-700 px-6 py-3 flex items-center justify-between border-t border-gray-600">
            <div className="text-sm text-gray-400">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
              of {pagination.total} users
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm bg-gray-600 text-white  hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-400">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
                className="px-3 py-1 text-sm bg-gray-600 text-white  hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
