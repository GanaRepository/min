// app/login/child/ChildLoginContent.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { ArrowLeft, BookOpen, Eye, EyeOff, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
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

const ChildLoginContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/create-stories';
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
  console.log('Child login page callbackUrl:', callbackUrl);

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting sign in with callbackUrl:', callbackUrl);

      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl, // Pass the callbackUrl to NextAuth
        redirect: true, // Let NextAuth handle the redirect
      });

      console.log('Sign in result:', result);

      // NextAuth will handle the redirect automatically if redirect: true
      // If for some reason it doesn't redirect, we can handle it manually
      if (result?.ok && !result?.error) {
        setToastMessage(
          'Welcome back, young storyteller! Loading your creative space...'
        );
        console.log('Login successful, redirecting to:', callbackUrl);

        // Give a short delay to show the success message, then redirect
        setTimeout(() => {
          window.location.href = callbackUrl;
        }, 1500);
      } else if (result?.error) {
        setError(result.error);
        setToastMessage(`Login Failed: ${result.error}`);
        // On error, stay on page but keep callbackUrl in search params for retry
        router.replace(
          `/login/child?callbackUrl=${encodeURIComponent(callbackUrl)}`
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
      setToastMessage('Login Failed: An unexpected error occurred');
      router.replace(
        `/login/child?callbackUrl=${encodeURIComponent(callbackUrl)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/90 via-pink-800/90 to-orange-900/90 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div
        ref={containerRef}
        className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden flex items-center justify-center relative"
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
          className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center gap-8 px-4 mt-28 mb-16"
        >
          {/* Left side - Story showcase card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 max-w-md"
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

                  {/* Story-focused text overlay */}
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
                          'WELCOME',
                          'TO',
                          'MINTOONS',
                          'UNLEASH',
                          'YOUR',
                          'CREATIVE',
                          'MAGIC',
                          'WRITE',
                          'AMAZING',
                          'STORIES',
                          'WITH',
                          'AI',
                          'ASSISTANCE',
                          'CREATE',
                          'ADVENTURES',
                          'FANTASY',
                          'MYSTERIES',
                          'JOIN',
                          'THE',
                          'MAGIC',
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
                  &quot;Mintoons helps me write the most amazing stories! The AI is
                  like having a magical writing friend who gives me cool ideas.&quot;
                </p>
                <p className="text-xs text-white/60">
                  - Emma, Age 10 | Young Storyteller
                </p>
              </motion.div>
            </div>
            {/* Back button */}
            <div className="flex justify-center">
              <Link href="/login">
                <Button
                  variant="outline"
                  className="mb-6 bg-white/10 border-white/20 text-white hover:bg-white/20 m-10 flex justify-center"
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
            className="flex-1 max-w-md w-full ml-12"
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
                  <BookOpen className="w-8 h-8 text-white" />
                  <Sparkles className="w-4 h-4 text-orange-300 absolute -top-1 -right-1" />
                </div>
              </motion.div>

              {/* Welcome text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Welcome back to
                </h1>
                <h2 className="text-4xl md:text-5xl font-bold text-white/80 mb-4 italic">
                  Mintoons
                </h2>
                <p className="text-white/60 text-sm">
                  Unleash your creative magic and write amazing stories with AI
                  assistance
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

            {/* Input fields */}
            <motion.form
              onSubmit={handleLoginSubmit}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="child-email" className="text-white/80 text-sm">
                  Email
                </Label>
                <input
                  id="child-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label
                    htmlFor="child-password"
                    className="text-white/80 text-sm"
                  >
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-orange-300 hover:text-orange-200 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="child-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-orange-300 transition-colors"
                    onClick={togglePasswordVisibility}
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
                className="w-full bg-white hover:bg-orange-100 text-purple-900 py-4 px-6 rounded-xl font-medium transition-all duration-300 backdrop-blur-sm border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-purple-900/20 border-t-purple-900 rounded-full animate-spin mr-2" />
                    Starting your magical journey...
                  </div>
                ) : (
                  'Start Writing Stories!'
                )}
              </motion.button>
            </motion.form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-white/60">OR</span>
              </div>
            </div>

            {/* Create account link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="text-center"
            >
              <span className="text-white/60 text-sm">First time here? </span>
              <Link
                href="/register/child"
                className="text-orange-300 text-sm underline hover:text-orange-200 transition-colors"
              >
                Join the Magic
              </Link>
              <p className="text-xs text-white/40 mt-4">
                By signing in, you agree to our{' '}
                <Link
                  href="/terms-of-service"
                  className="text-orange-300 hover:text-orange-200 transition-colors"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy-policy"
                  className="text-orange-300 hover:text-orange-200 transition-colors"
                >
                  Privacy Policy
                </Link>
              </p>
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
              {toastMessage.startsWith('Login Failed')
                ? 'Login Failed'
                : 'Welcome Back!'}
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

export default ChildLoginContent;
