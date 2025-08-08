//app/admin/users/page.tsx

// app/admin/users/page.tsx (Fixed)
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
} from 'lucide-react';
import { motion } from 'framer-motion';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isVerified: boolean;
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
        limit: '20',
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
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setUsers(users.filter(user => user._id !== userId));
        alert('User deleted successfully');
      } else {
        alert('Failed to delete user: ' + data.error);
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
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/admin/users/export?${params}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting users:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'mentor': return 'bg-purple-100 text-purple-800';
      case 'child': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) return 'bg-red-100 text-red-800';
    if (!isVerified) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) return 'Inactive';
    if (!isVerified) return 'Unverified';
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            User Management
          </h1>
          <p className="text-gray-400">
            Manage all users in the platform
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/admin/users/create">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <UserPlus size={16} className="mr-2" />
              Add User
            </button>
          </Link>
          <button
            onClick={exportUsers}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Total Users</h3>
            <Users size={20} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{pagination?.total || 0}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Children</h3>
            <BookOpen size={20} className="text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {users.filter(u => u.role === 'child').length}
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Mentors</h3>
            <Users size={20} className="text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {users.filter(u => u.role === 'mentor').length}
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Active Users</h3>
            <Users size={20} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {users.filter(u => u.isActive).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <div className="flex bg-gray-700 rounded-lg p-1">
              {['all', 'child', 'mentor', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => setFilterRole(role)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    filterRole === role
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                  {role === 'all' ? ' Users' : 's'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Role</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Joined</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Last Active</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                  {/* User */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">
                          {user.firstName} {user.lastName}
                        </h4>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.isActive, user.isVerified)}`}>
                      {getStatusText(user.isActive, user.isVerified)}
                    </span>
                  </td>

                  {/* Joined */}
                  <td className="py-3 px-4">
                    <div className="text-white text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  {/* Last Active */}
                  <td className="py-3 px-4">
                    <div className="text-gray-300 text-sm">
                      {user.lastActiveDate 
                        ? new Date(user.lastActiveDate).toLocaleDateString()
                        : 'Never'
                      }
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Link href={`/admin/users/${user._id}`}>
                        <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors">
                          <Eye size={16} />
                        </button>
                      </Link>
                      <Link href={`/admin/users/${user._id}/edit`}>
                        <button className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-colors">
                          <Edit size={16} />
                        </button>
                      </Link>
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => deleteUser(user._id, `${user.firstName} ${user.lastName}`)}
                         className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                       >
                         <Trash2 size={16} />
                       </button>
                     )}
                   </div>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>

       {/* Empty State */}
       {users.length === 0 && !loading && (
         <div className="text-center py-12">
           <Users size={48} className="text-gray-600 mx-auto mb-4" />
           <h3 className="text-xl font-medium text-gray-400 mb-2">No users found</h3>
           <p className="text-gray-500">
             {searchTerm || filterRole !== 'all' 
               ? 'Try adjusting your search or filter criteria'
               : 'Users will appear here as they register'
             }
           </p>
         </div>
       )}
     </div>

     {/* Pagination */}
     {pagination && pagination.pages > 1 && (
       <div className="flex items-center justify-center space-x-4">
         <button
           onClick={() => setPage(Math.max(1, page - 1))}
           disabled={page === 1}
           className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
         >
           Previous
         </button>
         
         <div className="flex items-center space-x-2">
           {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
             const pageNum = Math.max(1, Math.min(pagination.pages - 4, page - 2)) + i;
             return (
               <button
                 key={pageNum}
                 onClick={() => setPage(pageNum)}
                 className={`px-3 py-2 rounded-lg transition-colors ${
                   page === pageNum
                     ? 'bg-blue-600 text-white'
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
           className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
         >
           Next
         </button>
       </div>
     )}

     {/* Summary */}
     {pagination && (
       <div className="text-center text-gray-400 text-sm">
         Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
       </div>
     )}
   </div>
 );
}