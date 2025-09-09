'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { ArrowLeft, Mail, BookOpen, Sparkles } from 'lucide-react';
import TerminalLoader from '../../components/TerminalLoader';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Email validation
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        setToastMessage('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      // Send request to reset password API
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        // If backend provides an error message, show it, otherwise show generic success
        if (data && data.message && data.error) {
          setError(data.message);
          setToastMessage(data.message);
        } else {
          setToastMessage(
            'If the email you entered is registered, you will receive a password reset link shortly.'
          );
          setError('');
          setEmail('');
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        }
      } else {
        // Show backend error if provided, otherwise show generic error
        setError(data.message || 'Failed to send password reset email');
        setToastMessage(data.message || 'Failed to send password reset email');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      setToastMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-radial from-blue-900/90 via-indigo-800/90 to-purple-900/90 flex items-center justify-center">
        <TerminalLoader
          title="Forgot Password"
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
        className="min-h-screen bg-gradient-radial from-blue-900/90 via-indigo-800/90 to-purple-900/90 overflow-hidden flex items-center justify-center relative px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20"
      >
        {/* Animated background stars */}
        <div ref={starsRef} className="absolute inset-0 z-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-60"
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

        {/* Main container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center gap-8 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 pt-20 sm:pt-24 md:pt-28"
        >
          {/* Left side - Story showcase card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 w-full max-w-md min-w-0 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
              {/* Story showcase with digital effects */}
              <div className="relative mb-6 rounded-2xl overflow-hidden">
                <div className="relative w-full h-80 bg-gradient-to-br from-purple-500 via-pink-600 to-orange-600 rounded-2xl overflow-hidden">
                  {/* Child portrait - you can replace with actual image */}
                  <Image
                    src="/kid16.jpg" // Replace with actual child image
                    alt="Young storyteller"
                    fill
                    className="absolute inset-0 rounded-2xl object-cover"
                  />

                  {/* Digital overlay effects */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-400/40 via-transparent to-pink-500/40 animate-pulse"
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
                        className="absolute left-0 h-0.5 bg-orange-300/80"
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

                  {/* Child with lost key/password illustration */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Mail className="w-24 h-24 text-white/80 mx-auto mb-4" />
                      <div className="text-white/60 text-sm">
                        Password Recovery
                      </div>
                    </div>
                  </div>

                  {/* Recovery-focused text overlay */}
                  {mounted && (
                    <div className="absolute inset-0 text-orange-200/60 text-xs font-mono leading-none overflow-hidden">
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
                          'DONT',
                          'WORRY',
                          'YOUNG',
                          'WRITER',
                          'RECOVER',
                          'YOUR',
                          'ACCOUNT',
                          'CONTINUE',
                          'YOUR',
                          'CREATIVE',
                          'JOURNEY',
                          'STORIES',
                          'AWAIT',
                          'MAGIC',
                          'CONTINUES',
                          'ADVENTURE',
                          'AWAITS',
                          'CREATIVITY',
                          'RESTORED',
                          'WELCOME',
                          'BACK',
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

              {/* Encouraging Quote */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-white/90 mb-4"
              >
                <p className="text-sm leading-relaxed mb-3">
                  &quot;Every great storyteller sometimes forgets their magic
                  words. Let&apos;s help you get back to creating amazing
                  stories!&quot;
                </p>
                <p className="text-xs text-white/60">
                  - The Digiverse Story Team
                </p>
              </motion.div>
            </div>
            {/* Back button */}
            <Link href="/login">
              <Button
                variant="outline"
                className="mb-6 bg-white/10 border-white/20 text-white hover:bg-white/20 m-10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </motion.div>

          {/* Right side - Forgot Password form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex-1 w-full max-w-md min-w-0 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 lg:pl-12"
          >
            <div className="text-center mb-8">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl mb-8"
              >
                <div className="relative">
                  <Mail className="w-8 h-8 text-white" />
                  <Sparkles className="w-4 h-4 text-orange-300 absolute -top-1 -right-1" />
                </div>
              </motion.div>

              {/* Welcome text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl  text-white mb-2">
                  Forgot Your
                </h1>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl  text-white/80 mb-4 italic">
                  Magic Key?
                </h2>
                <p className="text-white/60 text-sm">
                  No worries! Enter your email and we&apos;ll send you a magic
                  link to restore your creative powers
                </p>
              </motion.div>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-200 p-3 rounded-xl mb-4 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80 text-sm">
                  Email Address
                </Label>
                <input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                />
                <p className="text-xs text-white/50">
                  Enter the email address you used to create your Digiverse
                  Story account
                </p>
              </div>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white hover:bg-orange-100 text-purple-900 py-4 px-6 rounded-xl  transition-all duration-300 backdrop-blur-sm border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-purple-900/20 border-t-purple-900 rounded-full animate-spin mr-2" />
                    Sending magic link...
                  </div>
                ) : (
                  <span className="flex items-center justify-center">
                    Send Magic Link
                    <Sparkles className="ml-2 w-4 h-4" />
                  </span>
                )}
              </motion.button>
            </motion.form>

            {/* Additional links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="text-center mt-6"
            >
              <span className="text-white/60 text-sm">
                Remember your password?{' '}
              </span>
              <Link
                href="/login"
                className="text-orange-300 text-sm underline hover:text-orange-200 transition-colors"
              >
                Back to Login
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Ambient lighting effects */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-purple-500/20 via-pink-500/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-orange-500/20 via-pink-500/10 to-transparent blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-purple-500/5 to-transparent blur-3xl" />

        {/* Toast notifications */}
        {toastMessage && (
          <Toast>
            <ToastTitle>
              {toastMessage.includes('Magic link sent') ? 'Success!' : 'Error'}
            </ToastTitle>
            <ToastDescription>{toastMessage}</ToastDescription>
            <ToastClose onClick={() => setToastMessage(null)} />
          </Toast>
        )}
        <ToastViewport />
      </div>
    </ToastProvider>
  );
};

export default ForgotPasswordPage;
