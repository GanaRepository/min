// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';

// export default function CreateMentor() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (formData.password !== formData.confirmPassword) {
//       alert('Passwords do not match');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await fetch('/api/admin/mentors', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           firstName: formData.firstName,
//           lastName: formData.lastName,
//           email: formData.email,
//           password: formData.password,
//         }),
//       });

//       const data = await response.json();

//       if (data.success) {
//         alert('Mentor created successfully!');
//         router.push('/admin-dashboard/mentors');
//       } else {
//         alert(data.error || 'Failed to create mentor');
//       }
//     } catch (error) {
//       console.error('Error creating mentor:', error);
//       alert('Failed to create mentor');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="bg-white shadow rounded-lg p-6">
//           <div className="mb-6">
//             <button
//               onClick={() => router.push('/admin-dashboard')}
//               className="text-indigo-600 hover:text-indigo-900 mb-4"
//             >
//               ← Back to Dashboard
//             </button>
//             <h1 className="text-2xl font-bold text-gray-900">
//               Create New Mentor
//             </h1>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   First Name
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.firstName}
//                   onChange={(e) =>
//                     setFormData({ ...formData, firstName: e.target.value })
//                   }
//                   className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Last Name
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.lastName}
//                   onChange={(e) =>
//                     setFormData({ ...formData, lastName: e.target.value })
//                   }
//                   className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 required
//                 value={formData.email}
//                 onChange={(e) =>
//                   setFormData({ ...formData, email: e.target.value })
//                 }
//                 className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 required
//                 value={formData.password}
//                 onChange={(e) =>
//                   setFormData({ ...formData, password: e.target.value })
//                 }
//                 className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Confirm Password
//               </label>
//               <input
//                 type="password"
//                 required
//                 value={formData.confirmPassword}
//                 onChange={(e) =>
//                   setFormData({ ...formData, confirmPassword: e.target.value })
//                 }
//                 className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//               />
//             </div>

//             <div className="flex justify-end space-x-4">
//               <button
//                 type="button"
//                 onClick={() => router.push('/admin-dashboard')}
//                 className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
//               >
//                 {loading ? 'Creating...' : 'Create Mentor'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreateMentor() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/mentors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Mentor created successfully!');
        router.push('/admin/mentors');
      } else {
        alert(data.error || 'Failed to create mentor');
      }
    } catch (error) {
      console.error('Error creating mentor:', error);
      alert('Failed to create mentor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.push('/admin/mentors')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Create New Mentor</h1>
          <p className="text-gray-400">
            Add a new mentor to guide student writers
          </p>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl"
      >
        <div className="bg-gray-800 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="mentor@example.com"
              />
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm password"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={() => router.push('/admin/mentors')}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Mentor</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
