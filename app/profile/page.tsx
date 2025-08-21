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
        className="mt-16 sm:mt-20 min-h-screen bg-gradient-to-br from-blue-900/90 via-gray-800/90 to-blue-900/90 overflow-hidden relative pt-16 sm:pt-20 pb-10 sm:pb-16"
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

        <div className="relative z-10 container mx-auto px-2 sm:px-4">
          <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto">
            {/* Profile Header */}
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl mb-6 sm:mb-8"
            >
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-xl sm:text-2xl  border-4 border-white/20"
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
                  <h1 className="text-2xl sm:text-3xl md:text-4xl  text-white mb-1 sm:mb-2">
                    {`${session.user.firstName || ''} ${session.user.lastName || ''}`}
                  </h1>
                  <p className="text-white/80 text-base sm:text-lg mb-2 sm:mb-3 capitalize">
                    {session.user.role} • Mintoons Member
                  </p>
                  <div className="flex items-center justify-center md:justify-start">
                    <Mail className="h-4 w-4 text-white/60 mr-2" />
                    <span className="text-white/80 text-xs sm:text-base">
                      {session.user.email}
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Profile Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Account Info */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl"
              >
                <div className="flex items-center mb-4 sm:mb-6">
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-white mr-2 sm:mr-3" />
                  <h2 className="text-lg sm:text-xl  text-white">
                    Account Information
                  </h2>
                </div>

                <dl className="space-y-3 sm:space-y-4">
                  <div>
                    <dt className="text-sm  text-white/60">Email</dt>
                    <dd className="mt-1 text-white">{session.user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm  text-white/60">Account Type</dt>
                    <dd className="mt-1 text-white capitalize">
                      {session.user.role}
                    </dd>
                  </div>
                  {isChild && (
                    <>
                      <div>
                        <dt className="text-xs sm:text-sm  text-white/60">
                          First Name
                        </dt>
                        <dd className="mt-1 text-white text-xs sm:text-base">
                          {session.user.firstName || 'Not set'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs sm:text-sm  text-white/60">
                          Last Name
                        </dt>
                        <dd className="mt-1 text-white text-xs sm:text-base">
                          {session.user.lastName || 'Not set'}
                        </dd>
                      </div>
                      {session.user.age && (
                        <div>
                          <dt className="text-xs sm:text-sm  text-white/60">
                            Age
                          </dt>
                          <dd className="mt-1 text-white text-xs sm:text-base">
                            {session.user.age}
                          </dd>
                        </div>
                      )}
                      {session.user.school && (
                        <div>
                          <dt className="text-xs sm:text-sm  text-white/60">
                            School
                          </dt>
                          <dd className="mt-1 text-white text-xs sm:text-base">
                            {session.user.school}
                          </dd>
                        </div>
                      )}
                    </>
                  )}
                  {isMentor && (
                    <>
                      <div>
                        <dt className="text-sm  text-white/60">First Name</dt>
                        <dd className="mt-1 text-white">
                          {session.user.firstName || 'Not set'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm  text-white/60">Last Name</dt>
                        <dd className="mt-1 text-white">
                          {session.user.lastName || 'Not set'}
                        </dd>
                      </div>
                      {session.user.createdBy && (
                        <div>
                          <dt className="text-xs sm:text-sm  text-white/60">
                            Created By (Admin)
                          </dt>
                          <dd className="mt-1 text-white text-xs sm:text-base">
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
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl"
              >
                <div className="flex items-center mb-4 sm:mb-6">
                  <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-white mr-2 sm:mr-3" />
                  <h2 className="text-lg sm:text-xl  text-white">
                    Quick Access
                  </h2>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {isChild && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href="/create-stories"
                        className="flex items-center p-3 sm:p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10"
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 mr-3 sm:mr-4">
                          <User className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div>
                          <h3 className=" text-white text-sm sm:text-base">
                            Write Stories
                          </h3>
                          <p className="text-xs sm:text-sm text-white/60">
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
                        className="flex items-center p-3 sm:p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10"
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-300 mr-3 sm:mr-4">
                          <User className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div>
                          <h3 className=" text-white text-sm sm:text-base">
                            Mentor Dashboard
                          </h3>
                          <p className="text-xs sm:text-sm text-white/60">
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
                      className="flex items-center p-3 sm:p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-300 mr-3 sm:mr-4">
                        <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div>
                        <h3 className=" text-white text-sm sm:text-base">
                          Get Support
                        </h3>
                        <p className="text-xs sm:text-sm text-white/60">
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
