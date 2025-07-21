// 'use client';

// import { useEffect, useState } from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { User, Building, Mail, Phone } from 'lucide-react';

// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import {
//   ToastProvider,
//   ToastViewport,
//   Toast,
//   ToastTitle,
//   ToastDescription,
//   ToastClose,
// } from '@/components/ui/toast';

// export default function ProfilePage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [toastMessage, setToastMessage] = useState<string | null>(null);

//   // Redirect to login if not authenticated
//   useEffect(() => {
//     if (status === 'unauthenticated') {
//       router.push('/login');
//     }
//   }, [status, router]);

//   if (status === 'loading') {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <div className="animate-pulse text-center">
//           <div className="h-12 w-12 rounded-full bg-gray-300 mx-auto mb-4"></div>
//           <div className="h-4 w-32 bg-gray-300 mx-auto mb-2 rounded"></div>
//           <div className="h-3 w-24 bg-gray-300 mx-auto rounded"></div>
//         </div>
//       </div>
//     );
//   }

//   if (!session?.user) {
//     return null; // This should not happen due to the redirect
//   }

//   const isCandidate = session.user.role === 'candidate';
//   const isBusiness = session.user.role === 'business';

//   return (
//     <ToastProvider>
//       <div className="min-h-screen bg-gray-50 pt-28 pb-16">
//         <div className="container mx-auto px-4">
//           <div className="max-w-4xl mx-auto">
//             {/* Profile Header */}
//             <div className="bg-gradient-to-r from-contact-purple to-contact-teal p-0.5 rounded-lg shadow-lg mb-6">
//               <div className="bg-white rounded-lg p-6 md:p-8">
//                 <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
//                   <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-contact-purple to-contact-teal flex items-center justify-center text-white text-2xl font-semibold">
//                     {isBusiness ? (
//                       <Building size={40} />
//                     ) : (
//                       <span>
//                         {session.user.firstName
//                           ? session.user.firstName.charAt(0)
//                           : ''}
//                         {session.user.lastName
//                           ? session.user.lastName.charAt(0)
//                           : ''}
//                       </span>
//                     )}
//                   </div>
//                   <div className="flex-1 text-center md:text-left">
//                     <h1 className="text-2xl md:text-3xl font-semibold">
//                       {isBusiness
//                         ? session.user.companyName
//                         : `${session.user.firstName || ''} ${session.user.lastName || ''}`}
//                     </h1>
//                     <p className="text-gray-500 mt-1 capitalize">
//                       {session.user.role}
//                     </p>
//                     <div className="mt-3 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
//                       <div className="flex items-center justify-center md:justify-start">
//                         <Mail className="h-4 w-4 text-gray-400 mr-2" />
//                         <span className="text-sm text-gray-600">
//                           {session.user.email}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Profile Content */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Account Info */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-xl">Account Information</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <dl className="space-y-4">
//                     <div>
//                       <dt className="text-sm font-medium text-gray-500">
//                         Email
//                       </dt>
//                       <dd className="mt-1 text-gray-900">
//                         {session.user.email}
//                       </dd>
//                     </div>
//                     <div>
//                       <dt className="text-sm font-medium text-gray-500">
//                         Account Type
//                       </dt>
//                       <dd className="mt-1 text-gray-900 capitalize">
//                         {session.user.role}
//                       </dd>
//                     </div>
//                     {isCandidate && (
//                       <>
//                         <div>
//                           <dt className="text-sm font-medium text-gray-500">
//                             First Name
//                           </dt>
//                           <dd className="mt-1 text-gray-900">
//                             {session.user.firstName || 'Not set'}
//                           </dd>
//                         </div>
//                         <div>
//                           <dt className="text-sm font-medium text-gray-500">
//                             Last Name
//                           </dt>
//                           <dd className="mt-1 text-gray-900">
//                             {session.user.lastName || 'Not set'}
//                           </dd>
//                         </div>
//                       </>
//                     )}
//                     {isBusiness && (
//                       <div>
//                         <dt className="text-sm font-medium text-gray-500">
//                           Company Name
//                         </dt>
//                         <dd className="mt-1 text-gray-900">
//                           {session.user.companyName || 'Not set'}
//                         </dd>
//                       </div>
//                     )}
//                   </dl>
//                 </CardContent>
//               </Card>

//               {/* Quick Links */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-xl">Quick Links</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {isCandidate && (
//                       <Link
//                         href="/careers"
//                         className="flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors border border-gray-100"
//                       >
//                         <div className="w-10 h-10 rounded-full bg-contact-purple/10 flex items-center justify-center text-contact-purple mr-4">
//                           <User className="h-5 w-5" />
//                         </div>
//                         <div>
//                           <h3 className="font-medium">Browse Job Openings</h3>
//                           <p className="text-sm text-gray-500">
//                             Find and apply for new opportunities
//                           </p>
//                         </div>
//                       </Link>
//                     )}
//                     {isBusiness && (
//                       <Link
//                         href="/services"
//                         className="flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors border border-gray-100"
//                       >
//                         <div className="w-10 h-10 rounded-full bg-contact-purple/10 flex items-center justify-center text-contact-purple mr-4">
//                           <Building className="h-5 w-5" />
//                         </div>
//                         <div>
//                           <h3 className="font-medium">Our Services</h3>
//                           <p className="text-sm text-gray-500">
//                             Explore recruitment services
//                           </p>
//                         </div>
//                       </Link>
//                     )}
//                     <Link
//                       href="/contact-us"
//                       className="flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors border border-gray-100"
//                     >
//                       <div className="w-10 h-10 rounded-full bg-contact-teal/10 flex items-center justify-center text-contact-teal mr-4">
//                         <Phone className="h-5 w-5" />
//                       </div>
//                       <div>
//                         <h3 className="font-medium">Contact Us</h3>
//                         <p className="text-sm text-gray-500">
//                           Inquiry or feedback
//                         </p>
//                       </div>
//                     </Link>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </div>

//         {toastMessage && (
//           <Toast>
//             <ToastTitle>Notification</ToastTitle>
//             <ToastDescription>{toastMessage}</ToastDescription>
//             <ToastClose onClick={() => setToastMessage(null)} />
//           </Toast>
//         )}
//         <ToastViewport />
//       </div>
//     </ToastProvider>
//   );
// }

'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Building, Mail, Phone, Briefcase, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading' || !mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900/90 via-gray-800/90 to-blue-900/90 flex items-center justify-center">
        <div className="text-white">Loading your Mintoons profile...</div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const isChild = session.user.role === 'child';
  const isMentor = session.user.role === 'mentor';
  const isAdmin = session.user.role === 'admin';

  return (
    <ToastProvider>
      <div
        ref={containerRef}
        className="mt-20 min-h-screen bg-gradient-to-br from-blue-900/90 via-gray-800/90 to-blue-900/90 overflow-hidden relative pt-20 pb-16"
      >
        {/* Animated background stars */}
        <div ref={starsRef} className="absolute inset-0 z-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl mb-8"
            >
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-semibold border-4 border-white/20"
                >
                  {isAdmin ? (
                    <Building size={40} />
                  ) : isMentor ? (
                    <User size={40} />
                  ) : (
                    <span>
                      {session.user.firstName?.charAt(0) || ''}
                      {session.user.lastName?.charAt(0) || ''}
                    </span>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex-1 text-center md:text-left"
                >
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {`${session.user.firstName || ''} ${session.user.lastName || ''}`}
                  </h1>
                  <p className="text-white/80 text-lg mb-3 capitalize">
                    {session.user.role} • Mintoons Member
                  </p>
                  <div className="flex items-center justify-center md:justify-start">
                    <Mail className="h-4 w-4 text-white/60 mr-2" />
                    <span className="text-white/80">{session.user.email}</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Profile Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Info */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl"
              >
                <div className="flex items-center mb-6">
                  <Settings className="h-6 w-6 text-white mr-3" />
                  <h2 className="text-xl font-bold text-white">
                    Account Information
                  </h2>
                </div>

                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-white/60">Email</dt>
                    <dd className="mt-1 text-white">{session.user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-white/60">
                      Account Type
                    </dt>
                    <dd className="mt-1 text-white capitalize">
                      {session.user.role}
                    </dd>
                  </div>
                  {isChild && (
                    <>
                      <div>
                        <dt className="text-sm font-medium text-white/60">
                          First Name
                        </dt>
                        <dd className="mt-1 text-white">
                          {session.user.firstName || 'Not set'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-white/60">
                          Last Name
                        </dt>
                        <dd className="mt-1 text-white">
                          {session.user.lastName || 'Not set'}
                        </dd>
                      </div>
                      {session.user.age && (
                        <div>
                          <dt className="text-sm font-medium text-white/60">
                            Age
                          </dt>
                          <dd className="mt-1 text-white">
                            {session.user.age}
                          </dd>
                        </div>
                      )}
                      {session.user.school && (
                        <div>
                          <dt className="text-sm font-medium text-white/60">
                            School
                          </dt>
                          <dd className="mt-1 text-white">
                            {session.user.school}
                          </dd>
                        </div>
                      )}
                    </>
                  )}
                  {isMentor && (
                    <>
                      <div>
                        <dt className="text-sm font-medium text-white/60">
                          First Name
                        </dt>
                        <dd className="mt-1 text-white">
                          {session.user.firstName || 'Not set'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-white/60">
                          Last Name
                        </dt>
                        <dd className="mt-1 text-white">
                          {session.user.lastName || 'Not set'}
                        </dd>
                      </div>
                      {session.user.createdBy && (
                        <div>
                          <dt className="text-sm font-medium text-white/60">
                            Created By (Admin)
                          </dt>
                          <dd className="mt-1 text-white">
                            {session.user.createdBy}
                          </dd>
                        </div>
                      )}
                    </>
                  )}
                  {/* No companyName field in user model, so nothing for admin here */}
                </dl>
              </motion.div>

              {/* Quick Links */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl"
              >
                <div className="flex items-center mb-6">
                  <Briefcase className="h-6 w-6 text-white mr-3" />
                  <h2 className="text-xl font-bold text-white">Quick Access</h2>
                </div>

                <div className="space-y-4">
                  {isChild && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href="/create-stories"
                        className="flex items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10"
                      >
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 mr-4">
                          <User className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">
                            Write Stories
                          </h3>
                          <p className="text-sm text-white/60">
                            Unleash your creativity and write your own stories
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  )}
                  {isMentor && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href="/mentor/dashboard"
                        className="flex items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10"
                      >
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-300 mr-4">
                          <User className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">
                            Mentor Dashboard
                          </h3>
                          <p className="text-sm text-white/60">
                            Manage your mentees and activities
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  )}
                  {/* No business role or companyName, so nothing for admin here */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href="/contact-us"
                      className="flex items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10"
                    >
                      <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-300 mr-4">
                        <Phone className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Get Support</h3>
                        <p className="text-sm text-white/60">
                          Connect with our Mintoons team
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Ambient lighting effects */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-purple-500/20 via-blue-500/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-orange-500/20 via-red-500/10 to-transparent blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-purple-500/5 to-transparent blur-3xl" />

        {toastMessage && (
          <Toast>
            <ToastTitle>Notification</ToastTitle>
            <ToastDescription>{toastMessage}</ToastDescription>
            <ToastClose onClick={() => setToastMessage(null)} />
          </Toast>
        )}
        <ToastViewport />
      </div>
    </ToastProvider>
  );
}
