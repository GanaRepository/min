// app/logout/logout-component.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import TerminalLoader from '../../components/TerminalLoader';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';
import useSessionStore from '@/stores/useSessionStore';

export default function LogoutPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const logout = useSessionStore((state) => state.logout);
  const containerRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only run the logout logic once on component mount
  useEffect(() => {
    const performLogout = async () => {
      try {
        // First clear the Zustand store state
        await logout();

        // Show success message
        setToastMessage('Successfully logged out');

        // Navigate to home page after a short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } catch (error) {
        console.error('Logout error:', error);
        setError('An error occurred during logout');
        setToastMessage('An error occurred while logging out');

        // Even if there's an error, redirect to home
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } finally {
        setIsLoading(false);
      }
    };

    performLogout();
  }, [logout]);

  // Prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900/90 via-gray-800/90 to-blue-900/90 flex items-center justify-center px-2 sm:px-4">
        <TerminalLoader
          title="Logging out"
          loadingText="Loading..."
          size="md"
        />
      </div>
    );
  }

  return (
    <ToastProvider>
      <div
        ref={containerRef}
        className="min-h-screen bg-gradient-to-br from-blue-900/90 via-gray-800/90 to-blue-900/90 overflow-hidden flex items-center justify-center relative pt-12 sm:pt-16 md:pt-20 px-2 sm:px-4"
      >
        {/* Animated background stars */}
        <div ref={starsRef} className="absolute inset-0 z-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white  opacity-60 animate-pulse"
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

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto px-2 sm:px-4"
        >
          <div className="bg-white/10 backdrop-blur-xl border border-white/20  p-4 sm:p-8 shadow-2xl text-center">
            {/* Logo/Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-lg border border-white/20  mb-4 sm:mb-6"
            >
              <LogOut className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl  text-white mb-2 sm:mb-4">
                Signing Out
              </h1>
              <p className="text-white/80 text-base sm:text-lg mb-4 sm:mb-8">
                {isLoading
                  ? "We're safely logging you out of Digiverse Story..."
                  : error
                    ? "There was an issue, but we're redirecting you safely"
                    : 'You have been successfully logged out from Digiverse Story'}
              </p>
            </motion.div>

            {/* Loading/Success indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex justify-center"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-white/20 border-t-white "
                />
              ) : (
                !error && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500  flex items-center justify-center"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                )
              )}
            </motion.div>

            {/* Additional message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-white/60 text-xs sm:text-sm mt-4 sm:mt-6"
            >
              Thank you for using Digiverse Story. Redirecting to homepage...
            </motion.p>
          </div>
        </motion.div>

        {/* Ambient lighting effects */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-purple-500/20 via-blue-500/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-orange-500/20 via-red-500/10 to-transparent blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-purple-500/5 to-transparent blur-3xl" />

        {toastMessage && (
          <Toast>
            <ToastTitle>{error ? 'Error' : 'Success'}</ToastTitle>
            <ToastDescription>{toastMessage}</ToastDescription>
            <ToastClose onClick={() => setToastMessage(null)} />
          </Toast>
        )}
        <ToastViewport />
      </div>
    </ToastProvider>
  );
}
