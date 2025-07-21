'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  Building,
  User,
  UserCog,
  Pencil,
  Save,
  X,
  Shield,
  Trash,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// User interface
interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

// Role configuration with icons and colors
const roleConfig = {
  admin: {
    icon: Shield,
    color: 'bg-purple-100 text-purple-800',
    label: 'Admin',
  },
  employee: {
    icon: UserCog,
    color: 'bg-blue-100 text-blue-800',
    label: 'Employee',
  },
  candidate: {
    icon: User,
    color: 'bg-green-100 text-green-800',
    label: 'Candidate',
  },
  business: {
    icon: Building,
    color: 'bg-amber-100 text-amber-800',
    label: 'Business',
  },
};

export default function ManageUsersPage() {
  // State Management
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Editing state
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});

  // Delete confirmation dialog state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [deletingUserData, setDeletingUserData] = useState<User | null>(null);

  // Toast notification state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'default' as 'default' | 'destructive',
  });

  // Show toast notification
  const showToast = useCallback(
    (message: string, type: 'default' | 'destructive' = 'default') => {
      setToast({ visible: true, message, type });
      setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
    },
    []
  );

  // Fetch users from the API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchQuery,
        role: roleFilter !== 'all' ? roleFilter : '',
      });

      const response = await fetch(`/api/admin/users?${queryParams}`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages || 1);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Failed to fetch users', 'destructive');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, roleFilter, showToast]);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchUsers();
  };

  // Handle role filter change
  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Start editing a user
  const startEditing = (user: User) => {
    setEditingUser(user._id);
    setEditFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      companyName: user.companyName || '',
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingUser(null);
    setEditFormData({});
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string | boolean) => {
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save user changes
  const saveUserChanges = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast('User updated successfully');
        setEditingUser(null);
        fetchUsers(); // Refresh the list
      } else {
        throw new Error(data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to update user',
        'destructive'
      );
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (user: User) => {
    setDeletingUser(user._id);
    setDeletingUserData(user);
    setShowDeleteConfirm(true);
  };

  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setShowDeleteConfirm(false);
    setDeletingUser(null);
    setDeletingUserData(null);
  };

  // Delete user
  const deleteUser = async () => {
    if (!deletingUser) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${deletingUser}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast('User deleted successfully');
        closeDeleteDialog();
        fetchUsers(); // Refresh the list
      } else {
        throw new Error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to delete user',
        'destructive'
      );
    } finally {
      setLoading(false);
    }
  };

  // Get user display name based on role
  const getUserDisplayName = (user: User) => {
    if (user.role === 'business' && user.companyName) {
      return user.companyName;
    } else if (
      (user.role === 'candidate' ||
        user.role === 'employee' ||
        user.role === 'admin') &&
      user.firstName &&
      user.lastName
    ) {
      return `${user.firstName} ${user.lastName}`;
    } else {
      return user.email.split('@')[0]; // Fallback to email username
    }
  };

  // Render loading state
  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F6F9FC]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-[#7E69AB] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="mt-4 text-gray-700">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F6F9FC] py-8 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-[#7E69AB]/10 rounded-full px-4 py-1.5 mb-3 border border-[#7E69AB]/20">
              <Users className="w-4 h-4 text-[#7E69AB]" />
              <span className="text-[#7E69AB] text-sm uppercase tracking-wider font-medium">
                Admin Can Manage all the Registered Users here
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Manage Users
            </h1>
            <p className="text-gray-700 text-sm sm:text-base">
              View and manage all registered users across the platform
            </p>
          </div>

          {/* Action Bar with Search and Filters */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex w-full sm:w-auto">
              <div className="relative flex-grow sm:max-w-md">
                <Input
                  placeholder="Search by name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#7E69AB]"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="employee">Employees</SelectItem>
                  <SelectItem value="candidate">Candidates</SelectItem>
                  <SelectItem value="business">Businesses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* User Table */}
          <Card className="bg-white backdrop-blur-sm border border-gray-100 hover:border-[#7E69AB]/20 transition-all duration-300 rounded-xl shadow-lg">
            {/* Mobile View: Card layout */}
            <div className="block sm:hidden">
              {users.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="flex flex-col items-center text-gray-400">
                    <Users className="h-8 w-8 mb-2 opacity-50" />
                    <p>No users found</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <div key={user._id} className="p-4">
                      {editingUser === user._id ? (
                        // Edit mode
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <h3 className="font-medium text-gray-900">
                              Edit User
                            </h3>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEditing}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          {user.role === 'business' ? (
                            <div className="space-y-2">
                              <label className="text-sm text-gray-600">
                                Company Name
                              </label>
                              <Input
                                name="companyName"
                                value={editFormData.companyName || ''}
                                onChange={handleInputChange}
                              />
                            </div>
                          ) : (
                            <>
                              <div className="space-y-2">
                                <label className="text-sm text-gray-600">
                                  First Name
                                </label>
                                <Input
                                  name="firstName"
                                  value={editFormData.firstName || ''}
                                  onChange={handleInputChange}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm text-gray-600">
                                  Last Name
                                </label>
                                <Input
                                  name="lastName"
                                  value={editFormData.lastName || ''}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </>
                          )}

                          <div className="space-y-2">
                            <label className="text-sm text-gray-600">
                              Email
                            </label>
                            <Input
                              name="email"
                              value={editFormData.email || ''}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm text-gray-600">
                              Role
                            </label>
                            <Select
                              value={editFormData.role}
                              onValueChange={(value) =>
                                handleSelectChange('role', value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="employee">
                                  Employee
                                </SelectItem>
                                <SelectItem value="candidate">
                                  Candidate
                                </SelectItem>
                                <SelectItem value="business">
                                  Business
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm text-gray-600">
                              Status
                            </label>
                            <Select
                              value={
                                editFormData.isActive ? 'active' : 'inactive'
                              }
                              onValueChange={(value) =>
                                handleSelectChange(
                                  'isActive',
                                  value === 'active'
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">
                                  Inactive
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="pt-2 space-x-2 flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={cancelEditing}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-contact-purple to-contact-teal text-white"
                              onClick={() => saveUserChanges(user._id)}
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <>
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-gray-900 font-medium">
                              {getUserDisplayName(user)}
                            </h3>
                            <Badge
                              className={`${
                                roleConfig[user.role as keyof typeof roleConfig]
                                  ?.color
                              }`}
                            >
                              {
                                roleConfig[user.role as keyof typeof roleConfig]
                                  ?.label
                              }
                            </Badge>
                          </div>

                          <div className="space-y-2 mb-3">
                            <div className="flex items-center text-gray-700">
                              <Mail className="h-4 w-4 mr-2 text-[#7E69AB]" />
                              <span className="text-sm truncate">
                                {user.email}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              {React.createElement(
                                roleConfig[user.role as keyof typeof roleConfig]
                                  ?.icon || Users,
                                { className: 'h-4 w-4 mr-2 text-[#7E69AB]' }
                              )}
                              <span className="text-sm capitalize">
                                {user.role}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <span
                                className={`px-2 py-0.5 text-xs rounded-full ${
                                  user.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-end pt-2 space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-[#7E69AB] border-[#7E69AB]/50"
                              onClick={() => startEditing(user)}
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-300"
                              onClick={() => openDeleteDialog(user)}
                            >
                              <Trash className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop View: Table layout */}
            <div className="hidden sm:block">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="text-gray-600">Name</TableHead>
                      <TableHead className="text-gray-600">Email</TableHead>
                      <TableHead className="text-gray-600">Role</TableHead>
                      <TableHead className="text-gray-600">Status</TableHead>
                      <TableHead className="text-gray-600">Created</TableHead>
                      <TableHead className="text-gray-600">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center text-gray-400">
                            <Users className="h-8 w-8 mb-2 opacity-50" />
                            <p>No users found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow
                          key={user._id}
                          className="border-b border-gray-200 hover:bg-[#7E69AB]/5 transition-colors"
                        >
                          {editingUser === user._id ? (
                            // Edit mode - spans entire row
                            <TableCell colSpan={6}>
                              <div className="grid grid-cols-12 gap-4">
                                {user.role === 'business' ? (
                                  <div className="col-span-4">
                                    <label className="text-xs text-gray-500 mb-1 block">
                                      Company Name
                                    </label>
                                    <Input
                                      name="companyName"
                                      value={editFormData.companyName || ''}
                                      onChange={handleInputChange}
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <div className="col-span-2">
                                      <label className="text-xs text-gray-500 mb-1 block">
                                        First Name
                                      </label>
                                      <Input
                                        name="firstName"
                                        value={editFormData.firstName || ''}
                                        onChange={handleInputChange}
                                      />
                                    </div>
                                    <div className="col-span-2">
                                      <label className="text-xs text-gray-500 mb-1 block">
                                        Last Name
                                      </label>
                                      <Input
                                        name="lastName"
                                        value={editFormData.lastName || ''}
                                        onChange={handleInputChange}
                                      />
                                    </div>
                                  </>
                                )}

                                <div className="col-span-4">
                                  <label className="text-xs text-gray-500 mb-1 block">
                                    Email
                                  </label>
                                  <Input
                                    name="email"
                                    value={editFormData.email || ''}
                                    onChange={handleInputChange}
                                  />
                                </div>

                                <div className="col-span-2">
                                  <label className="text-xs text-gray-500 mb-1 block">
                                    Role
                                  </label>
                                  <Select
                                    value={editFormData.role}
                                    onValueChange={(value) =>
                                      handleSelectChange('role', value)
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="admin">
                                        Admin
                                      </SelectItem>
                                      <SelectItem value="employee">
                                        Employee
                                      </SelectItem>
                                      <SelectItem value="candidate">
                                        Candidate
                                      </SelectItem>
                                      <SelectItem value="business">
                                        Business
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="col-span-2">
                                  <label className="text-xs text-gray-500 mb-1 block">
                                    Status
                                  </label>
                                  <Select
                                    value={
                                      editFormData.isActive
                                        ? 'active'
                                        : 'inactive'
                                    }
                                    onValueChange={(value) =>
                                      handleSelectChange(
                                        'isActive',
                                        value === 'active'
                                      )
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="active">
                                        Active
                                      </SelectItem>
                                      <SelectItem value="inactive">
                                        Inactive
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="col-span-2 flex items-end space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={cancelEditing}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-contact-purple to-contact-teal text-white"
                                    onClick={() => saveUserChanges(user._id)}
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                          ) : (
                            // View mode
                            <>
                              <TableCell className="font-medium text-gray-900">
                                {getUserDisplayName(user)}
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  {React.createElement(
                                    roleConfig[
                                      user.role as keyof typeof roleConfig
                                    ]?.icon || Users,
                                    { className: 'h-4 w-4 mr-1 text-[#7E69AB]' }
                                  )}
                                  <Badge
                                    className={`${
                                      roleConfig[
                                        user.role as keyof typeof roleConfig
                                      ]?.color
                                    }`}
                                  >
                                    {
                                      roleConfig[
                                        user.role as keyof typeof roleConfig
                                      ]?.label
                                    }
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    user.isActive
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </TableCell>
                              <TableCell>
                                {new Date(user.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-[#7E69AB] border-[#7E69AB]/50 hover:bg-[#7E69AB]/10 hover:border-[#7E69AB] transition-colors"
                                    onClick={() => startEditing(user)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 transition-colors"
                                    onClick={() => openDeleteDialog(user)}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50/40 px-4 sm:px-6 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
                className="flex items-center gap-1 text-gray-700 border-gray-200 hover:bg-[#7E69AB]/10 hover:border-[#7E69AB]/50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <span className="text-sm text-gray-600">
                Page{' '}
                <span className="font-medium text-gray-900">{currentPage}</span>{' '}
                of{' '}
                <span className="font-medium text-gray-900">{totalPages}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || loading}
                className="flex items-center gap-1 text-gray-700 border-gray-200 hover:bg-[#7E69AB]/10 hover:border-[#7E69AB]/50 disabled:opacity-50"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Delete Confirmation Dialog */}
          <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Delete User
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this user? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              {deletingUserData && (
                <div className="py-4">
                  <div className="mb-2 font-medium">
                    {getUserDisplayName(deletingUserData)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {deletingUserData.email}
                  </div>
                  <div className="mt-1">
                    <Badge
                      className={`${
                        roleConfig[
                          deletingUserData.role as keyof typeof roleConfig
                        ]?.color
                      }`}
                    >
                      {
                        roleConfig[
                          deletingUserData.role as keyof typeof roleConfig
                        ]?.label
                      }
                    </Badge>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={closeDeleteDialog}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={deleteUser}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash className="h-4 w-4 mr-2" />
                      Delete User
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Toast Notification */}
          {toast.visible && (
            <Toast
              variant={toast.type}
              className={toast.type === 'default' ? 'border-[#7E69AB]' : ''}
            >
              <div className="flex">
                <div className="flex-1">
                  <ToastTitle>
                    {toast.type === 'default' ? 'Success' : 'Error'}
                  </ToastTitle>
                  <ToastDescription>{toast.message}</ToastDescription>
                </div>
                <ToastClose
                  onClick={() =>
                    setToast((prev) => ({ ...prev, visible: false }))
                  }
                />
              </div>
            </Toast>
          )}
          <ToastViewport />
        </div>
      </div>
    </ToastProvider>
  );
}
