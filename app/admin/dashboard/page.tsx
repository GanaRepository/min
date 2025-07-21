// 'use client';

// import React, { useState, useEffect, useCallback } from 'react';
// import { Card } from '@/components/ui/card';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogClose,
// } from '@/components/ui/dialog';
// import {
//   ToastProvider,
//   ToastViewport,
//   Toast,
//   ToastTitle,
//   ToastDescription,
//   ToastClose,
// } from '@/components/ui/toast';
// import {
//   Trash2,
//   ChevronLeft,
//   ChevronRight,
//   Users,
//   Calendar,
//   Mail,
//   Phone,
//   MessageSquare,
//   ArrowRight,
//   Pencil,
//   Save,
//   X,
// } from 'lucide-react';
// import ConfirmPopup from '@/components/ui/ConfirmPopup';

// // EXACT COLORS FROM SCREENSHOTS
// // Primary Purple: #7E69AB
// // Purple Light: #9b87f5
// // Purple Dark: #6E59A5
// // Primary Teal: #33C3F0
// // Teal Light: #84e6d9
// // Teal Dark: #20a7d3
// // Background: #F6F9FC

// // Contact interface
// interface Contact {
//   _id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   message: string;
//   createdAt: string;
// }

// interface ToastState {
//   message: string;
//   isVisible: boolean;
//   type: 'success' | 'error' | 'warning';
// }

// interface ContactResponse {
//   success: boolean;
//   data: Contact[];
//   pagination: {
//     totalPages: number;
//     currentPage: number;
//   };
//   message?: string;
// }

// export default function DashboardPage() {
//   // State Management
//   const [contacts, setContacts] = useState<Contact[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [deleteContactId, setDeleteContactId] = useState<string | null>(null);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [toast, setToast] = useState<ToastState>({
//     message: '',
//     isVisible: false,
//     type: 'success',
//   });

//   // Edit states
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
//   const [editingContact, setEditingContact] = useState<Contact | null>(null);
//   const [editFormData, setEditFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     message: '',
//   });

//   // Toast Handler
//   const showToast = useCallback((message: string, type: ToastState['type']) => {
//     setToast({ message, isVisible: true, type });

//     const timer = setTimeout(() => {
//       setToast((prev) => ({ ...prev, isVisible: false }));
//     }, 3000);

//     return () => clearTimeout(timer);
//   }, []);

//   // Fetch Contacts
//   const fetchContacts = useCallback(async () => {
//     try {
//       setLoading(true);
//       const queryParams = new URLSearchParams({
//         page: currentPage.toString(),
//         limit: '10',
//       });

//       const response = await fetch(`/api/admin/contacts?${queryParams}`, {
//         method: 'GET',
//         credentials: 'include',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (!response.ok) {
//         throw new Error('Failed to fetch contacts');
//       }

//       const data: ContactResponse = await response.json();

//       if (data.success) {
//         setContacts(data.data || []);
//         setTotalPages(data.pagination?.totalPages || 1);
//       } else {
//         throw new Error(data.message || 'Unknown error occurred');
//       }
//     } catch (error) {
//       console.error('Error fetching contacts:', error);
//       showToast(
//         error instanceof Error ? error.message : 'Failed to fetch contacts',
//         'error'
//       );
//       setContacts([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [currentPage, showToast]);

//   // Delete Contact Handlers
//   const handleDeleteClick = (contactId: string) => {
//     setDeleteContactId(contactId);
//     setShowDeleteConfirm(true);
//   };

//   const handleDeleteContact = useCallback(async () => {
//     if (!deleteContactId) return;

//     try {
//       const response = await fetch('/api/admin/contacts', {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ id: deleteContactId }),
//       });

//       const data = await response.json();

//       if (data.success) {
//         showToast('Contact deleted successfully', 'success');
//         await fetchContacts();
//       } else {
//         throw new Error(data.message || 'Failed to delete contact');
//       }
//     } catch (error) {
//       console.error('Delete error:', error);
//       showToast(
//         error instanceof Error ? error.message : 'Failed to delete contact',
//         'error'
//       );
//     } finally {
//       setShowDeleteConfirm(false);
//       setDeleteContactId(null);
//     }
//   }, [deleteContactId, fetchContacts, showToast]);

//   // Edit Contact Handlers
//   const handleEditClick = (contact: Contact) => {
//     setEditingContact(contact);
//     setEditFormData({
//       firstName: contact.firstName,
//       lastName: contact.lastName,
//       email: contact.email,
//       phone: contact.phone,
//       message: contact.message,
//     });
//     setIsEditDialogOpen(true);
//   };

//   const handleEditInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setEditFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleEditSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!editingContact) return;

//     try {
//       // Validate required fields
//       const requiredFields = [
//         'firstName',
//         'lastName',
//         'email',
//         'phone',
//         'message',
//       ];
//       for (const field of requiredFields) {
//         if (!(editFormData as any)[field]) {
//           showToast(
//             `Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`,
//             'error'
//           );
//           return;
//         }
//       }

//       // Validate email format
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!emailRegex.test(editFormData.email)) {
//         showToast('Please enter a valid email address', 'error');
//         return;
//       }

//       // Validate phone number
//       const phoneRegex = /^\+?[\d\s-()]{10,}$/;
//       if (!phoneRegex.test(editFormData.phone)) {
//         showToast('Please enter a valid phone number', 'error');
//         return;
//       }

//       const response = await fetch(
//         `/api/admin/contacts/${editingContact._id}`,
//         {
//           method: 'PATCH',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(editFormData),
//         }
//       );

//       const data = await response.json();

//       if (data.success) {
//         showToast('Contact updated successfully', 'success');
//         setIsEditDialogOpen(false);
//         await fetchContacts();
//       } else {
//         throw new Error(data.message || 'Failed to update contact');
//       }
//     } catch (error) {
//       console.error('Edit error:', error);
//       showToast(
//         error instanceof Error ? error.message : 'Failed to update contact',
//         'error'
//       );
//     }
//   };

//   // Initial fetch effect
//   useEffect(() => {
//     fetchContacts();
//   }, [fetchContacts]);

//   if (loading && contacts.length === 0) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-[#F6F9FC]">
//         <div className="text-center">
//           <div className="animate-spin h-8 w-8 border-4 border-[#7E69AB] border-t-transparent rounded-full mx-auto mb-4"></div>
//           <p className="mt-4 text-gray-700">Loading contacts...</p>
//         </div>
//       </div>
//     );
//   }

//   // Get toast variant based on type
//   const getToastVariant = (type: ToastState['type']) => {
//     return type === 'error' ? 'destructive' : 'default';
//   };

//   // Calculate stats for display
//   const last24Hours = contacts.filter((c) => {
//     const date = new Date(c.createdAt);
//     const now = new Date();
//     return now.getTime() - date.getTime() < 86400000;
//   }).length;

//   return (
//     <div className="min-h-screen bg-[#F6F9FC] py-8 sm:py-12 px-4">
//       <ToastProvider>
//         <div className="container mx-auto px-0 sm:px-4 max-w-7xl">
//           {/* Header Section */}
//           <div className="mb-6 sm:mb-8">
//             <div className="inline-flex items-center gap-2 bg-[#7E69AB]/10 rounded-full px-4 py-1.5 mb-3 sm:mb-4 border border-[#7E69AB]/20">
//               <MessageSquare className="w-4 h-4 text-[#7E69AB]" />
//               <span className="text-[#7E69AB] text-sm uppercase tracking-wider font-medium">
//                 Contact Form Data
//               </span>
//             </div>
//             <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
//               Enquiry / Feedback Submissions
//             </h1>
//             <p className="text-gray-700 text-sm sm:text-base">
//               View, edit, and manage contact form submissions from your website
//             </p>
//           </div>

//           {/* Toast Notification */}
//           {toast.isVisible && (
//             <Toast
//               variant={getToastVariant(toast.type)}
//               className={toast.type === 'success' ? 'border-[#7E69AB]' : ''}
//             >
//               <div className="flex">
//                 <div className="flex-1">
//                   <ToastTitle>
//                     {toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}
//                   </ToastTitle>
//                   <ToastDescription>{toast.message}</ToastDescription>
//                 </div>
//                 <ToastClose
//                   onClick={() =>
//                     setToast((prev) => ({ ...prev, isVisible: false }))
//                   }
//                 />
//               </div>
//             </Toast>
//           )}

//           {/* Stats Overview */}
//           <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
//             <Card className="p-4 sm:p-6 bg-white backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 hover:border-[#7E69AB]/30 transition-all duration-300">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <p className="text-xs sm:text-sm font-medium text-gray-600">
//                     Total Contacts
//                   </p>
//                   <p className="text-xl sm:text-2xl font-semibold text-gray-900">
//                     {contacts.length}
//                   </p>
//                 </div>
//                 <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-[#7E69AB]/10 flex items-center justify-center text-[#7E69AB]">
//                   <Users className="h-4 w-4 sm:h-6 sm:w-6" />
//                 </div>
//               </div>
//             </Card>
//             <Card className="p-4 sm:p-6 bg-white backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 hover:border-[#7E69AB]/30 transition-all duration-300">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <p className="text-xs sm:text-sm font-medium text-gray-600">
//                     Last 24 Hours
//                   </p>
//                   <p className="text-xl sm:text-2xl font-semibold text-gray-900">
//                     {last24Hours}
//                   </p>
//                 </div>
//                 <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-[#7E69AB]/10 flex items-center justify-center text-[#7E69AB]">
//                   <Calendar className="h-4 w-4 sm:h-6 sm:w-6" />
//                 </div>
//               </div>
//             </Card>
//           </div>

//           {/* Responsive Table Card */}
//           <Card className="bg-white backdrop-blur-sm rounded-xl overflow-hidden border border-gray-100 hover:border-[#7E69AB]/20 transition-all duration-300 shadow-lg">
//             {/* Small Mobile View: Cards */}
//             <div className="block sm:hidden">
//               {contacts.length === 0 ? (
//                 <div className="p-6 text-center">
//                   <div className="flex flex-col items-center text-gray-400">
//                     <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
//                     <p>No contacts found</p>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="divide-y divide-gray-200">
//                   {contacts.map((contact) => (
//                     <div key={contact._id} className="p-4">
//                       <div className="flex justify-between items-center mb-3">
//                         <h3 className="text-gray-900 font-medium">
//                           {contact.firstName} {contact.lastName}
//                         </h3>
//                         <div className="text-xs text-gray-500 flex items-center">
//                           <Calendar className="h-3 w-3 mr-1" />
//                           {new Date(contact.createdAt).toLocaleDateString()}
//                         </div>
//                       </div>

//                       <div className="space-y-2 mb-3">
//                         <div className="flex items-center text-gray-700">
//                           <Mail className="h-4 w-4 mr-2 text-[#7E69AB]" />
//                           <span className="text-sm truncate">
//                             {contact.email}
//                           </span>
//                         </div>

//                         <div className="flex items-center text-gray-700">
//                           <Phone className="h-4 w-4 mr-2 text-[#7E69AB]" />
//                           <span className="text-sm">{contact.phone}</span>
//                         </div>
//                       </div>

//                       <div className="pt-2 border-t border-gray-200">
//                         <div className="flex items-start mb-3">
//                           <MessageSquare className="h-4 w-4 mr-2 mt-0.5 text-[#7E69AB]" />
//                           <p className="text-sm text-gray-700 line-clamp-2">
//                             {contact.message}
//                           </p>
//                         </div>

//                         <div className="flex justify-end space-x-2">
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             className="text-[#7E69AB] border-[#7E69AB]/50 hover:bg-[#7E69AB]/10 hover:border-[#7E69AB] transition-colors"
//                             onClick={() => handleEditClick(contact)}
//                           >
//                             <Pencil className="h-4 w-4 mr-1" />
//                             Edit
//                           </Button>
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             className="text-red-500 border-red-500/50 hover:bg-red-500/10 hover:border-red-500 transition-colors"
//                             onClick={() => handleDeleteClick(contact._id)}
//                           >
//                             <Trash2 className="h-4 w-4 mr-1" />
//                             Delete
//                           </Button>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Tablet View: Simplified Table */}
//             <div className="hidden sm:block lg:hidden">
//               <div className="overflow-x-auto">
//                 <Table>
//                   <TableHeader>
//                     <TableRow className="border-b border-gray-200">
//                       <TableHead className="text-gray-600 whitespace-nowrap">
//                         Name
//                       </TableHead>
//                       <TableHead className="text-gray-600 whitespace-nowrap">
//                         Contact Info
//                       </TableHead>
//                       <TableHead className="text-gray-600 whitespace-nowrap">
//                         Message Preview
//                       </TableHead>
//                       <TableHead className="text-gray-600 whitespace-nowrap">
//                         Actions
//                       </TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {contacts.length === 0 ? (
//                       <TableRow>
//                         <TableCell colSpan={4} className="text-center py-8">
//                           <div className="flex flex-col items-center text-gray-400">
//                             <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
//                             <p>No contacts found</p>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       contacts.map((contact) => (
//                         <TableRow
//                           key={contact._id}
//                           className="border-b border-gray-200 hover:bg-[#7E69AB]/5 transition-colors"
//                         >
//                           <TableCell className="py-4">
//                             <div className="font-medium text-gray-900">
//                               {contact.firstName} {contact.lastName}
//                             </div>
//                             <div className="text-xs text-gray-500 mt-1">
//                               {new Date(contact.createdAt).toLocaleDateString()}
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex flex-col gap-1">
//                               <div className="flex items-center">
//                                 <Mail className="h-4 w-4 mr-2 text-[#7E69AB]" />
//                                 <span className="text-sm text-gray-700 truncate max-w-[180px]">
//                                   {contact.email}
//                                 </span>
//                               </div>
//                               <div className="flex items-center">
//                                 <Phone className="h-4 w-4 mr-2 text-[#7E69AB]" />
//                                 <span className="text-sm text-gray-700">
//                                   {contact.phone}
//                                 </span>
//                               </div>
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <p className="text-sm text-gray-700 truncate max-w-[200px]">
//                               {contact.message}
//                             </p>
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex space-x-2">
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 className="text-[#7E69AB] border-[#7E69AB]/50 hover:bg-[#7E69AB]/10 hover:border-[#7E69AB] transition-colors"
//                                 onClick={() => handleEditClick(contact)}
//                               >
//                                 <Pencil className="h-4 w-4" />
//                               </Button>
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => handleDeleteClick(contact._id)}
//                                 className="text-red-500 border-red-500/50 hover:bg-red-500/10 hover:border-red-500 transition-colors"
//                               >
//                                 <Trash2 className="h-4 w-4" />
//                               </Button>
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     )}
//                   </TableBody>
//                 </Table>
//               </div>
//             </div>

//             {/* Desktop View: Full Table */}
//             <div className="hidden lg:block">
//               <div className="overflow-x-auto">
//                 <Table>
//                   <TableHeader>
//                     <TableRow className="border-b border-gray-200">
//                       <TableHead className="text-gray-600">Name</TableHead>
//                       <TableHead className="text-gray-600">
//                         Contact Info
//                       </TableHead>
//                       <TableHead className="text-gray-600">Message</TableHead>
//                       <TableHead className="text-gray-600">Date</TableHead>
//                       <TableHead className="text-gray-600">Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {contacts.length === 0 ? (
//                       <TableRow>
//                         <TableCell colSpan={5} className="text-center py-8">
//                           <div className="flex flex-col items-center text-gray-400">
//                             <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
//                             <p>No contacts found</p>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       contacts.map((contact) => (
//                         <TableRow
//                           key={contact._id}
//                           className="border-b border-gray-200 hover:bg-[#7E69AB]/5 transition-colors"
//                         >
//                           <TableCell className="py-4">
//                             <div className="font-medium text-gray-900">
//                               {contact.firstName} {contact.lastName}
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex flex-col gap-1">
//                               <div className="flex items-center">
//                                 <Mail className="h-4 w-4 mr-2 text-[#7E69AB]" />
//                                 <span className="text-sm text-gray-700">
//                                   {contact.email}
//                                 </span>
//                               </div>
//                               <div className="flex items-center">
//                                 <Phone className="h-4 w-4 mr-2 text-[#7E69AB]" />
//                                 <span className="text-sm text-gray-700">
//                                   {contact.phone}
//                                 </span>
//                               </div>
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <p className="text-sm text-gray-700 max-w-xs truncate">
//                               {contact.message}
//                             </p>
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex items-center">
//                               <Calendar className="h-4 w-4 mr-2 text-[#7E69AB]" />
//                               <span className="text-sm text-gray-700">
//                                 {new Date(
//                                   contact.createdAt
//                                 ).toLocaleDateString()}
//                               </span>
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex space-x-2">
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 className="text-[#7E69AB] border-[#7E69AB]/50 hover:bg-[#7E69AB]/10 hover:border-[#7E69AB] transition-colors"
//                                 onClick={() => handleEditClick(contact)}
//                               >
//                                 <Pencil className="h-4 w-4" />
//                               </Button>
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => handleDeleteClick(contact._id)}
//                                 className="text-red-500 border-red-500/50 hover:bg-red-500/10 hover:border-red-500 transition-colors"
//                               >
//                                 <Trash2 className="h-4 w-4" />
//                               </Button>
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     )}
//                   </TableBody>
//                 </Table>
//               </div>
//             </div>

//             {/* Pagination - works for all screen sizes */}
//             <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50/40 px-4 sm:px-6 py-4">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                 disabled={currentPage === 1}
//                 className="flex items-center gap-1 text-gray-700 border-gray-200 hover:bg-[#7E69AB]/10 hover:border-[#7E69AB]/50 disabled:opacity-50"
//               >
//                 <ChevronLeft className="h-4 w-4" />
//                 <span className="hidden sm:inline">Previous</span>
//               </Button>
//               <span className="text-sm text-gray-600">
//                 Page{' '}
//                 <span className="font-medium text-gray-900">{currentPage}</span>{' '}
//                 of{' '}
//                 <span className="font-medium text-gray-900">{totalPages}</span>
//               </span>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() =>
//                   setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//                 }
//                 disabled={currentPage === totalPages}
//                 className="flex items-center gap-1 text-gray-700 border-gray-200 hover:bg-[#7E69AB]/10 hover:border-[#7E69AB]/50 disabled:opacity-50"
//               >
//                 <span className="hidden sm:inline">Next</span>
//                 <ChevronRight className="h-4 w-4" />
//               </Button>
//             </div>
//           </Card>
//         </div>

//         {/* Edit Contact Dialog */}
//         <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
//           <DialogContent className="sm:max-w-md">
//             <DialogHeader>
//               <DialogTitle>Edit Contact Details</DialogTitle>
//               <DialogDescription>
//                 Update the contact information below
//               </DialogDescription>
//             </DialogHeader>

//             <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <label htmlFor="firstName" className="text-sm text-gray-600">
//                     First Name
//                   </label>
//                   <Input
//                     id="firstName"
//                     name="firstName"
//                     value={editFormData.firstName}
//                     onChange={handleEditInputChange}
//                     required
//                     className="border border-gray-200 focus:border-[#7E69AB]"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <label htmlFor="lastName" className="text-sm text-gray-600">
//                     Last Name
//                   </label>
//                   <Input
//                     id="lastName"
//                     name="lastName"
//                     value={editFormData.lastName}
//                     onChange={handleEditInputChange}
//                     required
//                     className="border border-gray-200 focus:border-[#7E69AB]"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="email" className="text-sm text-gray-600">
//                   Email
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
//                   <Input
//                     id="email"
//                     name="email"
//                     type="email"
//                     value={editFormData.email}
//                     onChange={handleEditInputChange}
//                     required
//                     className="pl-10 border border-gray-200 focus:border-[#7E69AB]"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="phone" className="text-sm text-gray-600">
//                   Phone
//                 </label>
//                 <div className="relative">
//                   <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
//                   <Input
//                     id="phone"
//                     name="phone"
//                     type="tel"
//                     value={editFormData.phone}
//                     onChange={handleEditInputChange}
//                     required
//                     className="pl-10 border border-gray-200 focus:border-[#7E69AB]"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="message" className="text-sm text-gray-600">
//                   Message
//                 </label>
//                 <div className="relative">
//                   <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
//                   <Textarea
//                     id="message"
//                     name="message"
//                     value={editFormData.message}
//                     onChange={handleEditInputChange}
//                     required
//                     rows={4}
//                     className="pl-10 border border-gray-200 focus:border-[#7E69AB]"
//                   />
//                 </div>
//               </div>

//               <DialogFooter className="pt-4">
//                 <DialogClose asChild>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     className="text-gray-700 border-gray-300 hover:bg-gray-100"
//                   >
//                     Cancel
//                   </Button>
//                 </DialogClose>
//                 <Button
//                   type="submit"
//                   className="bg-gradient-to-r from-[#7E69AB] to-[#33C3F0] text-white font-medium hover:opacity-90"
//                 >
//                   <Save className="h-4 w-4 mr-2" />
//                   Save Changes
//                 </Button>
//               </DialogFooter>
//             </form>
//           </DialogContent>
//         </Dialog>

//         {/* Toast Viewport */}
//         <ToastViewport />

//         {/* Delete Confirmation Popup */}
//         <ConfirmPopup
//           isOpen={showDeleteConfirm}
//           title="Delete Contact"
//           message="Are you sure you want to delete this contact? This action cannot be undone."
//           confirmText="Delete"
//           cancelText="Cancel"
//           onConfirm={handleDeleteContact}
//           onCancel={() => {
//             setShowDeleteConfirm(false);
//             setDeleteContactId(null);
//           }}
//           variant="danger"
//         />
//       </ToastProvider>
//     </div>
//   );
// }

// Updated DashboardPage component with edit functionality
'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  ArrowRight,
  Pencil,
  Save,
  X,
} from 'lucide-react';
import ConfirmPopup from '@/components/ui/ConfirmPopup';

// EXACT COLORS FROM SCREENSHOTS
// Primary Purple: #7E69AB
// Purple Light: #9b87f5
// Purple Dark: #6E59A5
// Primary Teal: #33C3F0
// Teal Light: #84e6d9
// Teal Dark: #20a7d3
// Background: #F6F9FC

// Contact interface
interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}

interface ToastState {
  message: string;
  isVisible: boolean;
  type: 'success' | 'error' | 'warning';
}

interface ContactResponse {
  success: boolean;
  data: Contact[];
  pagination: {
    totalPages: number;
    currentPage: number;
  };
  message?: string;
}

export default function DashboardPage() {
  // State Management
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    message: '',
    isVisible: false,
    type: 'success',
  });

  // Edit states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });

  // Toast Handler
  const showToast = useCallback((message: string, type: ToastState['type']) => {
    setToast({ message, isVisible: true, type });

    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Fetch Contacts
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      const response = await fetch(`/api/admin/contacts?${queryParams}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const data: ContactResponse = await response.json();

      if (data.success) {
        setContacts(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        throw new Error(data.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to fetch contacts',
        'error'
      );
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, showToast]);

  // Delete Contact Handlers
  const handleDeleteClick = (contactId: string) => {
    setDeleteContactId(contactId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteContact = useCallback(async () => {
    if (!deleteContactId) return;

    try {
      const response = await fetch('/api/admin/contacts', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: deleteContactId }),
      });

      const data = await response.json();

      if (data.success) {
        showToast('Contact deleted successfully', 'success');
        await fetchContacts();
      } else {
        throw new Error(data.message || 'Failed to delete contact');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to delete contact',
        'error'
      );
    } finally {
      setShowDeleteConfirm(false);
      setDeleteContactId(null);
    }
  }, [deleteContactId, fetchContacts, showToast]);

  // Edit Contact Handlers
  const handleEditClick = (contact: Contact) => {
    setEditingContact(contact);
    setEditFormData({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      message: contact.message,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingContact) return;

    try {
      // Validate required fields
      const requiredFields = [
        'firstName',
        'lastName',
        'email',
        'phone',
        'message',
      ];
      for (const field of requiredFields) {
        if (!(editFormData as any)[field]) {
          showToast(
            `Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`,
            'error'
          );
          return;
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editFormData.email)) {
        showToast('Please enter a valid email address', 'error');
        return;
      }

      // Validate phone number
      const phoneRegex = /^\+?[\d\s-()]{10,}$/;
      if (!phoneRegex.test(editFormData.phone)) {
        showToast('Please enter a valid phone number', 'error');
        return;
      }

      const response = await fetch(
        `/api/admin/contacts/${editingContact._id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editFormData),
        }
      );

      const data = await response.json();

      if (data.success) {
        showToast('Contact updated successfully', 'success');
        setIsEditDialogOpen(false);
        await fetchContacts();
      } else {
        throw new Error(data.message || 'Failed to update contact');
      }
    } catch (error) {
      console.error('Edit error:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to update contact',
        'error'
      );
    }
  };

  // Initial fetch effect
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  if (loading && contacts.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F6F9FC]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-[#7E69AB] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="mt-4 text-gray-700">Loading contacts...</p>
        </div>
      </div>
    );
  }

  // Get toast variant based on type
  const getToastVariant = (type: ToastState['type']) => {
    return type === 'error' ? 'destructive' : 'default';
  };

  // Calculate stats for display
  const last24Hours = contacts.filter((c) => {
    const date = new Date(c.createdAt);
    const now = new Date();
    return now.getTime() - date.getTime() < 86400000;
  }).length;

  return (
    <div className="min-h-screen bg-[#F6F9FC] py-8 sm:py-12 px-4">
      <ToastProvider>
        <div className="container mx-auto px-0 sm:px-4 max-w-7xl">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 bg-[#7E69AB]/10 rounded-full px-4 py-1.5 mb-3 sm:mb-4 border border-[#7E69AB]/20">
              <MessageSquare className="w-4 h-4 text-[#7E69AB]" />
              <span className="text-[#7E69AB] text-sm uppercase tracking-wider font-medium">
                Contact Form Data
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Enquiry / Feedback Submissions
            </h1>
            <p className="text-gray-700 text-sm sm:text-base">
              View, edit, and manage contact form submissions from your website
            </p>
          </div>

          {/* Toast Notification */}
          {toast.isVisible && (
            <Toast
              variant={getToastVariant(toast.type)}
              className={toast.type === 'success' ? 'border-[#7E69AB]' : ''}
            >
              <div className="flex">
                <div className="flex-1">
                  <ToastTitle>
                    {toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}
                  </ToastTitle>
                  <ToastDescription>{toast.message}</ToastDescription>
                </div>
                <ToastClose
                  onClick={() =>
                    setToast((prev) => ({ ...prev, isVisible: false }))
                  }
                />
              </div>
            </Toast>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <Card className="p-4 sm:p-6 bg-white backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 hover:border-[#7E69AB]/30 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Total Contacts
                  </p>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                    {contacts.length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-[#7E69AB]/10 flex items-center justify-center text-[#7E69AB]">
                  <Users className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
              </div>
            </Card>
            <Card className="p-4 sm:p-6 bg-white backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 hover:border-[#7E69AB]/30 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Last 24 Hours
                  </p>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                    {last24Hours}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-[#7E69AB]/10 flex items-center justify-center text-[#7E69AB]">
                  <Calendar className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
              </div>
            </Card>
          </div>

          {/* Responsive Table Card */}
          <Card className="bg-white backdrop-blur-sm rounded-xl overflow-hidden border border-gray-100 hover:border-[#7E69AB]/20 transition-all duration-300 shadow-lg">
            {/* Small Mobile View: Cards */}
            <div className="block sm:hidden">
              {contacts.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="flex flex-col items-center text-gray-400">
                    <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                    <p>No contacts found</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {contacts.map((contact) => (
                    <div key={contact._id} className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-gray-900 font-medium">
                          {contact.firstName} {contact.lastName}
                        </h3>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center text-gray-700">
                          <Mail className="h-4 w-4 mr-2 text-[#7E69AB]" />
                          <span className="text-sm truncate">
                            {contact.email}
                          </span>
                        </div>

                        <div className="flex items-center text-gray-700">
                          <Phone className="h-4 w-4 mr-2 text-[#7E69AB]" />
                          <span className="text-sm">{contact.phone}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex items-start mb-3">
                          <MessageSquare className="h-4 w-4 mr-2 mt-0.5 text-[#7E69AB]" />
                          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                            {contact.message}
                          </p>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-[#7E69AB] border-[#7E69AB]/50 hover:bg-[#7E69AB]/10 hover:border-[#7E69AB] transition-colors"
                            onClick={() => handleEditClick(contact)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 border-red-500/50 hover:bg-red-500/10 hover:border-red-500 transition-colors"
                            onClick={() => handleDeleteClick(contact._id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tablet View: Simplified Table */}
            <div className="hidden sm:block lg:hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="text-gray-600 whitespace-nowrap">
                        Name
                      </TableHead>
                      <TableHead className="text-gray-600 whitespace-nowrap">
                        Contact Info
                      </TableHead>
                      <TableHead className="text-gray-600 whitespace-nowrap">
                        Message Preview
                      </TableHead>
                      <TableHead className="text-gray-600 whitespace-nowrap">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <div className="flex flex-col items-center text-gray-400">
                            <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                            <p>No contacts found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      contacts.map((contact) => (
                        <TableRow
                          key={contact._id}
                          className="border-b border-gray-200 hover:bg-[#7E69AB]/5 transition-colors"
                        >
                          <TableCell className="py-4">
                            <div className="font-medium text-gray-900">
                              {contact.firstName} {contact.lastName}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(contact.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-2 text-[#7E69AB]" />
                                <span className="text-sm text-gray-700 truncate max-w-[180px]">
                                  {contact.email}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-2 text-[#7E69AB]" />
                                <span className="text-sm text-gray-700">
                                  {contact.phone}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words max-w-[200px]">
                              {contact.message}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-[#7E69AB] border-[#7E69AB]/50 hover:bg-[#7E69AB]/10 hover:border-[#7E69AB] transition-colors"
                                onClick={() => handleEditClick(contact)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteClick(contact._id)}
                                className="text-red-500 border-red-500/50 hover:bg-red-500/10 hover:border-red-500 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Desktop View: Full Table */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="text-gray-600">Name</TableHead>
                      <TableHead className="text-gray-600">
                        Contact Info
                      </TableHead>
                      <TableHead className="text-gray-600">Message</TableHead>
                      <TableHead className="text-gray-600">Date</TableHead>
                      <TableHead className="text-gray-600">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex flex-col items-center text-gray-400">
                            <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                            <p>No contacts found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      contacts.map((contact) => (
                        <TableRow
                          key={contact._id}
                          className="border-b border-gray-200 hover:bg-[#7E69AB]/5 transition-colors"
                        >
                          <TableCell className="py-4">
                            <div className="font-medium text-gray-900">
                              {contact.firstName} {contact.lastName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-2 text-[#7E69AB]" />
                                <span className="text-sm text-gray-700">
                                  {contact.email}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-2 text-[#7E69AB]" />
                                <span className="text-sm text-gray-700">
                                  {contact.phone}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words max-w-xs">
                              {contact.message}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-[#7E69AB]" />
                              <span className="text-sm text-gray-700">
                                {new Date(
                                  contact.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-[#7E69AB] border-[#7E69AB]/50 hover:bg-[#7E69AB]/10 hover:border-[#7E69AB] transition-colors"
                                onClick={() => handleEditClick(contact)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteClick(contact._id)}
                                className="text-red-500 border-red-500/50 hover:bg-red-500/10 hover:border-red-500 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination - works for all screen sizes */}
            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50/40 px-4 sm:px-6 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
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
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 text-gray-700 border-gray-200 hover:bg-[#7E69AB]/10 hover:border-[#7E69AB]/50 disabled:opacity-50"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Edit Contact Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Contact Details</DialogTitle>
              <DialogDescription>
                Update the contact information below
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm text-gray-600">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={editFormData.firstName}
                    onChange={handleEditInputChange}
                    required
                    className="border border-gray-200 focus:border-[#7E69AB]"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm text-gray-600">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={editFormData.lastName}
                    onChange={handleEditInputChange}
                    required
                    className="border border-gray-200 focus:border-[#7E69AB]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm text-gray-600">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    required
                    className="pl-10 border border-gray-200 focus:border-[#7E69AB]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm text-gray-600">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={editFormData.phone}
                    onChange={handleEditInputChange}
                    required
                    className="pl-10 border border-gray-200 focus:border-[#7E69AB]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm text-gray-600">
                  Message
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Textarea
                    id="message"
                    name="message"
                    value={editFormData.message}
                    onChange={handleEditInputChange}
                    required
                    rows={4}
                    className="pl-10 border border-gray-200 focus:border-[#7E69AB]"
                  />
                </div>
              </div>

              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-gray-700 border-gray-300 hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[#7E69AB] to-[#33C3F0] text-white font-medium hover:opacity-90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Toast Viewport */}
        <ToastViewport />

        {/* Delete Confirmation Popup */}
        <ConfirmPopup
          isOpen={showDeleteConfirm}
          title="Delete Contact"
          message="Are you sure you want to delete this contact? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteContact}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeleteContactId(null);
          }}
          variant="danger"
        />
      </ToastProvider>
    </div>
  );
}
