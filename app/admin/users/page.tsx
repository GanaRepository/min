// 'use client';

// import { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';

// interface User {
//   _id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   role: string;
//   totalStories: number;
//   completedStories: number;
//   activeStories: number;
//   createdAt: string;
//   isVerified: boolean;
//   tier?: string;
// }

// export default function UsersManagement() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [filterRole, setFilterRole] = useState('all');

//   useEffect(() => {
//     if (status === 'loading') return;

//     if (!session || session.user.role !== 'admin') {
//       router.push('/admin/login');
//       return;
//     }

//     fetchUsers();
//   }, [session, status, router]);

//   const fetchUsers = async () => {
//     try {
//       const response = await fetch('/api/admin/users');
//       const data = await response.json();

//       if (data.success) {
//         setUsers(data.users);
//       }
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredUsers = users.filter(
//     (user) => filterRole === 'all' || user.role === filterRole
//   );

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Header */}
//       <div className="bg-white shadow">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-6">
//             <div>
//               <button
//                 onClick={() => router.push('/admin-dashboard')}
//                 className="text-indigo-600 hover:text-indigo-900 mb-2"
//               >
//                 ← Back to Dashboard
//               </button>
//               <h1 className="text-3xl font-bold text-gray-900">
//                 User Management
//               </h1>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         <div className="bg-white shadow rounded-lg p-6 mb-6">
//           <div className="flex space-x-4">
//             <select
//               value={filterRole}
//               onChange={(e) => setFilterRole(e.target.value)}
//               className="border border-gray-300 rounded-md px-3 py-2"
//             >
//               <option value="all">All Roles</option>
//               <option value="child">Children</option>
//               <option value="mentor">Mentors</option>
//               <option value="admin">Admins</option>
//             </select>
//           </div>
//         </div>

//         {/* Users Table */}
//         <div className="bg-white shadow rounded-lg overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   User
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Role
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Stories
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Joined
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredUsers.map((user) => (
//                 <tr key={user._id}>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <div className="h-10 w-10 flex-shrink-0">
//                         <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
//                           <span className="text-sm font-medium text-gray-700">
//                             {user.firstName[0]}
//                             {user.lastName[0]}
//                           </span>
//                         </div>
//                       </div>
//                       <div className="ml-4">
//                         <div className="text-sm font-medium text-gray-900">
//                           {user.firstName} {user.lastName}
//                         </div>
//                         <div className="text-sm text-gray-500">
//                           {user.email}
//                         </div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span
//                       className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}
//                     >
//                       {user.role}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     <div>Total: {user.totalStories}</div>
//                     <div className="text-gray-500">
//                       Completed: {user.completedStories}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span
//                       className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
//                     >
//                       {user.isVerified ? 'Verified' : 'Unverified'}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {new Date(user.createdAt).toLocaleDateString()}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <button
//                       onClick={() =>
//                         router.push(`/admin-dashboard/users/${user._id}`)
//                       }
//                       className="text-indigo-600 hover:text-indigo-900 mr-4"
//                     >
//                       View Details
//                     </button>
//                     {user.role === 'child' && (
//                       <button
//                         onClick={() =>
//                           router.push(
//                             `/admin-dashboard/assign-mentor/${user._id}`
//                           )
//                         }
//                         className="text-green-600 hover:text-green-900"
//                       >
//                         Assign Mentor
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// function getRoleBadgeColor(role: string) {
//   switch (role) {
//     case 'admin':
//       return 'bg-red-100 text-red-800';
//     case 'mentor':
//       return 'bg-blue-100 text-blue-800';
//     case 'child':
//       return 'bg-green-100 text-green-800';
//     default:
//       return 'bg-gray-100 text-gray-800';
//   }
// }

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
  Users,
  Search,
  Filter,
  Eye,
  UserPlus,
  Calendar,
  BookOpen,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  totalStories: number;
  completedStories: number;
  activeStories: number;
  createdAt: string;
  isVerified: boolean;
  tier?: string;
}

export default function UsersManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'User deleted', description: 'User deleted successfully.' });
        fetchUsers(page);
      } else {
        toast({ title: 'Error', description: data.message || 'Failed to delete user' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to delete user' });
    }
  };


  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    fetchUsers(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router, page]);

  const fetchUsers = async (pageNum: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users?page=${pageNum}&limit=10`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.pagination.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'mentor':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'child':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusColor = (isVerified: boolean) => {
    return isVerified
      ? 'bg-green-500/20 text-green-300 border-green-500/30'
      : 'bg-red-500/20 text-red-300 border-red-500/30';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 xl:px-24 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">
            User Management
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">Manage all users in the platform</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Total Users</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{users.length}</p>
            </div>
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Children</p>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {users.filter((u) => u.role === 'child').length}
              </p>
            </div>
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Mentors</p>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {users.filter((u) => u.role === 'mentor').length}
              </p>
            </div>
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base min-w-[120px]"
          >
            <option value="all">All Roles</option>
            <option value="child">Children</option>
            <option value="mentor">Mentors</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-xl overflow-x-auto">
        <div className="min-w-[600px] xl:min-w-0">
          <table className="w-full text-sm md:text-base">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left p-2 sm:p-4 text-gray-300 font-medium min-w-[120px]">User</th>
                <th className="text-left p-2 sm:p-4 text-gray-300 font-medium min-w-[80px]">Role</th>
                <th className="text-left p-2 sm:p-4 text-gray-300 font-medium min-w-[120px]">Stories</th>
                <th className="text-left p-2 sm:p-4 text-gray-300 font-medium min-w-[100px]">Joined</th>
                <th className="text-left p-2 sm:p-4 text-gray-300 font-medium min-w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-700/30 transition-colors"
                >
                  <td className="p-2 sm:p-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-xs sm:text-sm">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-xs sm:text-base">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-gray-400 text-xs sm:text-sm">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-2 sm:p-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs border ${getRoleBadgeColor(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="p-2 sm:p-4">
                    <div>
                      <p className="text-white text-xs sm:text-sm">
                        Total: {user.totalStories}
                      </p>
                      <p className="text-gray-400 text-[10px] sm:text-xs">
                        Completed: {user.completedStories}
                      </p>
                    </div>
                  </td>

                  <td className="p-2 sm:p-4">
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>

                  <td className="p-2 sm:p-4">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Link href={`/admin/users/${user._id}`}>
                        <button className="text-blue-400 hover:text-blue-300 p-1 sm:p-2 rounded-lg hover:bg-gray-700 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        className="text-red-400 hover:text-red-300 p-1 sm:p-2 rounded-lg hover:bg-gray-700 transition-colors"
                        onClick={() => handleDeleteUser(user._id)}
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 sm:mt-8 flex justify-center">
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

      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-8 sm:py-12">
          <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-medium text-gray-400 mb-1 sm:mb-2">
            No users found
          </h3>
          <p className="text-gray-500 text-xs sm:text-base">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
}
