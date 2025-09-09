// app/login/mentor/MentorLoginContent.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { ArrowLeft, GraduationCap, Eye, EyeOff, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Suspense } from 'react';
import TerminalLoader from '@/components/TerminalLoader';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';

function MentorLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/mentor-dashboard';
  const containerRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Always use callbackUrl for all redirects
  console.log('Mentor login page callbackUrl:', callbackUrl);

  useEffect(() => {
    setMounted(true);

    // Check for error in URL params from NextAuth
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const decodedError = decodeURIComponent(errorParam);
      setError(decodedError);
      setToastMessage(`Login Failed: ${decodedError}`);
      console.log('Auth error detected:', decodedError);
    }
  }, [searchParams]);
  useEffect(() => {
    // Animations for stars and cosmic elements
    const stars = starsRef.current?.children;
    if (stars && typeof window !== 'undefined') {
      Array.from(stars).forEach((star, i) => {
        const element = star as HTMLElement;
        element.style.animationDelay = `${i * 0.1}s`;
        element.classList.add('animate-pulse');
      });
    }
  }, [mounted]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setToastMessage(null);

    try {
      console.log('Attempting mentor sign in with callbackUrl:', callbackUrl);

      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl,
        redirect: false, // Handle redirect manually to show better error messages
      });

      console.log('Mentor sign in result:', result);

      if (result?.ok && !result?.error) {
        // Check if the user has the correct role for mentor login
        const sessionResponse = await fetch('/api/auth/session');
        const session = await sessionResponse.json();

        if (
          session?.user?.role &&
          session.user.role !== 'mentor' &&
          session.user.role !== 'admin'
        ) {
          // User has wrong role for mentor login
          const roleError = `This login is for mentors only. Please use the ${session.user.role} login page instead.`;
          setError(roleError);
          setToastMessage(`Access Denied: ${roleError}`);

          // Sign out the user since they used wrong login page
          await fetch('/api/auth/signout', { method: 'POST' });
          return;
        }

        setToastMessage('Welcome back, mentor! Loading your dashboard...');
        console.log('Mentor login successful, redirecting to:', callbackUrl);

        // Give a short delay to show the success message, then redirect
        setTimeout(() => {
          window.location.href = callbackUrl;
        }, 1500);
      } else if (result?.error) {
        // Parse the specific error from NextAuth
        let errorMessage = result.error;

        // Map common error codes to user-friendly messages
        switch (result.error) {
          case 'CredentialsSignin':
            errorMessage =
              'Invalid email or password. Please check your credentials and try again.';
            break;
          case 'AccessDenied':
            errorMessage = 'Access denied. Your account may be deactivated.';
            break;
          default:
            // Use the exact error message from the backend
            errorMessage = result.error;
        }

        setError(errorMessage);
        setToastMessage(`Login Failed: ${errorMessage}`);
        console.error('Mentor authentication failed:', errorMessage);
      } else {
        // Fallback for unexpected cases
        const fallbackError = 'Login failed. Please try again.';
        setError(fallbackError);
        setToastMessage(`Login Failed: ${fallbackError}`);
      }
    } catch (error) {
      console.error('Mentor login error:', error);
      const errorMsg = 'An unexpected error occurred. Please try again.';
      setError(errorMsg);
      setToastMessage(`Login Failed: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900/90 via-teal-800/90 to-blue-900/90 flex items-center justify-center">
        <TerminalLoader
          title="Mentor Login"
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
        className="min-h-screen bg-gradient-to-br from-emerald-900/90 via-teal-800/90 to-blue-900/90 overflow-hidden flex items-center justify-center relative px-2 sm:px-4"
      >
        {/* Animated background stars */}
        <div ref={starsRef} className="absolute inset-0 z-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white  opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Grid pattern overlay */}
        {/* <div className="absolute inset-0 opacity-10">
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
        </div> */}

        {/* Main container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center gap-8 px-2 sm:px-4 md:px-8 mt-28 md:mt-24 lg:mt-28 mb-8 md:mb-12 lg:mb-16"
        >
          {/* Left side - Mentor showcase card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 w-full max-w-md min-w-0 mb-8 lg:mb-0"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20  p-4 sm:p-6 shadow-2xl">
              {/* Mentor showcase with digital effects */}
              <div className="relative mb-6  overflow-hidden">
                <div className="relative w-full h-56 sm:h-64 md:h-72 lg:h-80 bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-600  overflow-hidden">
                  {/* Mentor portrait - you can replace with actual image */}
                  <Image
                    src="/kid16.jpg" // Replace with actual mentor image
                    alt="Digiverse Story Mentor"
                    fill
                    className="absolute inset-0  object-cover"
                  />

                  {/* Digital overlay effects */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-emerald-400/40 via-transparent to-teal-500/40 animate-pulse"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />

                  {/* Digital glitch lines */}
                  {mounted &&
                    [...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute left-0 h-0.5 bg-teal-300/80"
                        style={{
                          top: `${20 + i * 10}%`,
                          width: `${50 + Math.random() * 50}%`,
                        }}
                        animate={{
                          opacity: [0, 1, 0],
                          scaleX: [0, 1, 0],
                        }}
                        transition={{
                          duration: 0.3,
                          repeat: Infinity,
                          delay: i * 0.1,
                          repeatDelay: 2,
                        }}
                      />
                    ))}

                  {/* Mentor-focused text overlay */}
                  {mounted && (
                    <div className="absolute inset-0 text-teal-200/60 text-xs font-mono leading-none overflow-hidden">
                      <motion.div
                        animate={{
                          y: ['-100%', '100%'],
                        }}
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        {[
                          'WELCOME',
                          'MENTOR',
                          'GUIDE',
                          'YOUNG',
                          'WRITERS',
                          'NURTURE',
                          'CREATIVITY',
                          'INSPIRE',
                          'STORIES',
                          'SHAPE',
                          'FUTURES',
                          'FEEDBACK',
                          'GROWTH',
                          'MENTORSHIP',
                          'EDUCATION',
                          'SUPPORT',
                          'CHILDREN',
                          'WRITING',
                          'SKILLS',
                          'DEVELOPMENT',
                        ].map((text, i) => (
                          <div key={i} className="whitespace-nowrap pl-12">
                            {text}
                          </div>
                        ))}
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>

              {/* Testimonial Quote */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-white/90 mb-4"
              >
                <p className="text-sm leading-relaxed mb-3">
                  &quot;Being a Digiverse Story mentor allows me to guide young
                  minds and watch their creativity flourish. Every story is a
                  new adventure!&quot;
                </p>
                <p className="text-xs text-white/60">
                  - Michael | Creative Writing Mentor
                </p>
              </motion.div>
            </div>
            {/* Back button */}
            <div className="flex justify-center">
              <Link href="/login">
                <Button
                  variant="outline"
                  className="mb-6 bg-white/10 border-white/20 text-white hover:bg-gray-300 m-6 sm:m-8 md:m-10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to options
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right side - Login form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex-1 w-full max-w-md min-w-0"
          >
            <div className="text-center mb-6 sm:mb-8">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-lg border border-white/20  mb-8"
              >
                <div className="relative">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
              </motion.div>

              {/* Welcome text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl  text-white mb-2">
                  Welcome back
                </h1>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl  text-white/80 mb-4 italic">
                  Mentor
                </h2>
                <p className="text-white/60 text-xs sm:text-sm">
                  Guide young storytellers and nurture their creative potential
                </p>
              </motion.div>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-200 p-2 sm:p-3  mb-4 text-xs sm:text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Input fields */}
            <motion.form
              onSubmit={handleLoginSubmit}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="space-y-3 sm:space-y-4"
            >
              <div className="space-y-1 sm:space-y-2">
                <Label
                  htmlFor="mentor-email"
                  className="text-white/80 text-xs sm:text-sm cursor-pointer"
                  onClick={() =>
                    document.getElementById('mentor-email')?.focus()
                  }
                >
                  Email
                </Label>
                <div className="relative">
                  <input
                    id="mentor-email"
                    type="email"
                    placeholder="mentor@Digiverse Story.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    required
                    disabled={isLoading}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all text-xs sm:text-base cursor-text"
                  />
                </div>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between items-center">
                  <Label
                    htmlFor="mentor-password"
                    className="text-white/80 text-xs sm:text-sm cursor-pointer"
                    onClick={() =>
                      document.getElementById('mentor-password')?.focus()
                    }
                  >
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs sm:text-sm text-teal-300 hover:text-teal-200 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="mentor-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all text-xs sm:text-base cursor-text"
                  />
                  <button
                    type="button"
                    className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-teal-300 transition-colors z-10 p-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      togglePasswordVisibility();
                    }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Login button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white hover:bg-teal-100 text-emerald-900 py-3 sm:py-4 px-4 sm:px-6   transition-all duration-300 backdrop-blur-sm border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed mt-4 sm:mt-6 text-xs sm:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-emerald-900/20 border-t-emerald-900  animate-spin mr-2" />
                    Accessing mentor dashboard...
                  </div>
                ) : (
                  'Access Mentor Dashboard'
                )}
              </motion.button>
            </motion.form>

            {/* Divider */}
            <div className="relative my-4 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 sm:px-4 bg-transparent text-white/60">
                  OR
                </span>
              </div>
            </div>

            {/* Info text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="text-center"
            >
              <span className="text-white/60 text-xs sm:text-sm">
                New mentor?{' '}
              </span>
              <span className="text-teal-300 text-xs sm:text-sm">
                Contact admin for access
              </span>
              <p className="text-[10px] sm:text-xs text-white/40 mt-2 sm:mt-4">
                By signing in, you agree to our{' '}
                <Link
                  href="/terms-of-service"
                  className="text-teal-300 hover:text-teal-200 transition-colors"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy-policy"
                  className="text-teal-300 hover:text-teal-200 transition-colors"
                >
                  Privacy Policy
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Ambient lighting effects */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-emerald-500/20 via-teal-500/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-blue-500/20 via-teal-500/10 to-transparent blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-emerald-500/5 to-transparent blur-3xl" />

        {/* Toast notifications */}
        {toastMessage && (
          <Toast
            variant={
              toastMessage.startsWith('Login Failed')
                ? 'destructive'
                : 'default'
            }
          >
            <ToastTitle>
              {toastMessage.startsWith('Login Failed')
                ? 'Authentication Error'
                : 'Welcome Back!'}
            </ToastTitle>
            <ToastDescription>
              {toastMessage.startsWith('Login Failed')
                ? toastMessage.replace('Login Failed: ', '')
                : toastMessage}
            </ToastDescription>
            <ToastClose onClick={() => setToastMessage(null)} />
          </Toast>
        )}
        <ToastViewport />
      </div>
    </ToastProvider>
  );
}

export default function MentorLoginContentWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-emerald-900/90 via-teal-800/90 to-blue-900/90 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <MentorLoginContent />
    </Suspense>
  );
}
