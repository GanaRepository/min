'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import {
  ArrowLeft,
  Lock,
  EyeOff,
  Eye,
  BookOpen,
  Sparkles,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';

// Loading fallback component
function ResetPasswordFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900/90 via-teal-800/90 to-blue-900/90 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
          <div className="animate-spin h-8 w-8 border-4 border-white/30 border-t-white rounded-full"></div>
        </div>
        <h2 className="text-2xl font-medium text-center mb-2">Loading</h2>
        <p className="text-white/60">Retrieving your reset information...</p>
      </div>
    </div>
  );
}

// Component that uses useSearchParams
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const containerRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
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

  // Redirect if no token is present
  useEffect(() => {
    if (!token) {
      setToastMessage('Invalid or missing reset token');
      setTimeout(() => {
        router.push('/forgot-password');
      }, 2000);
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Missing reset token');
      setToastMessage('Missing reset token');
      return;
    }

    setIsLoading(true);
    setError('');

    // Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
      );
      setToastMessage(
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
      );
      setIsLoading(false);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setToastMessage('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Send request to reset password API
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setToastMessage(
          'Your creative powers have been restored! Password reset successfully. Welcome back to your storytelling adventure!'
        );

        // Clear the form
        setPassword('');
        setConfirmPassword('');

        // Redirect to login page after a delay
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password');
        setToastMessage(data.message || 'Failed to reset password');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      setToastMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return <ResetPasswordFallback />;
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-emerald-900/90 via-teal-800/90 to-blue-900/90 overflow-hidden flex items-center justify-center relative px-2 sm:px-4"
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
        className="relative z-10 w-full max-w-2xl md:max-w-4xl lg:max-w-6xl flex flex-col lg:flex-row items-center gap-4 sm:gap-8 px-0 sm:px-4"
      >
        {/* Left side - Security showcase card */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 w-full max-w-xs sm:max-w-md"
        >
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl">
            {/* Security showcase with digital effects */}
            <div className="relative mb-6 rounded-2xl overflow-hidden">
              <div className="relative w-full h-56 sm:h-80 bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-600 rounded-xl sm:rounded-2xl overflow-hidden">
                {/* Security illustration */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Shield className="w-16 h-16 sm:w-24 sm:h-24 text-white/80 mx-auto mb-2 sm:mb-4" />
                    <div className="text-white/60 text-xs sm:text-sm">
                      Secure Password Reset
                    </div>
                  </div>
                </div>

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

                {/* Security-focused text overlay */}
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
                        'SECURE',
                        'RESET',
                        'PROTECT',
                        'YOUR',
                        'CREATIVE',
                        'ACCOUNT',
                        'NEW',
                        'PASSWORD',
                        'STRONG',
                        'SECURITY',
                        'SAFE',
                        'STORIES',
                        'PROTECTED',
                        'CREATIVE',
                        'JOURNEY',
                        'SECURED',
                        'ADVENTURE',
                        'CONTINUES',
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

            {/* Security Quote */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-white/90 mb-2 sm:mb-4"
            >
              <p className="text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3">
                &quot;Creating a strong password is like building a magical
                shield around your stories. Let&apos;s make sure your creative
                work stays safe!&quot;
              </p>
              <p className="text-[10px] sm:text-xs text-white/60">
                - Mintoons Security Team
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Right side - Reset Password form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex-1 w-full max-w-xs sm:max-w-md"
        >
          {/* Back button */}
          <Link href="/login">
            <Button
              variant="outline"
              className="mb-6 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </Link>

          <div className="text-center mb-8">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl sm:rounded-2xl mb-6 sm:mb-8"
            >
              <div className="relative">
                <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-teal-300 absolute -top-1 -right-1" />
              </div>
            </motion.div>

            {/* Welcome text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h1 className="text-2xl sm:text-4xl md:text-5xl  text-white mb-1 sm:mb-2">
                Create Your New
              </h1>
              <h2 className="text-2xl sm:text-4xl md:text-5xl  text-white/80 mb-2 sm:mb-4 italic">
                Magic Key
              </h2>
              <p className="text-white/60 text-xs sm:text-sm">
                Choose a strong password to protect your creative stories and
                adventures
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

          {!token ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="text-center py-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl"
            >
              <p className="text-white/70 mb-4">
                Invalid or missing reset token.
              </p>
              <Link href="/forgot-password">
                <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                  Request New Magic Link
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="password" className="text-white/80 text-sm">
                  New Magic Key (Password)
                </Label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create your new magic key"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                  />
                  <motion.button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-teal-300 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </motion.button>
                </div>
                <p className="text-[10px] sm:text-xs text-white/50">
                  Must be at least 8 characters with uppercase, lowercase,
                  number, and special character
                </p>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-white/80 text-sm"
                >
                  Confirm Your Magic Key
                </Label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your new magic key"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                  />
                  <motion.button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-teal-300 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white hover:bg-teal-100 text-emerald-900 py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-medium transition-all duration-300 backdrop-blur-sm border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-teal-500/25"
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 10px 40px rgba(20, 184, 166, 0.3)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <motion.div
                      className="w-5 h-5 border-2 border-emerald-900/20 border-t-emerald-900 rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                    Restoring your creative powers...
                  </div>
                ) : (
                  <span className="flex items-center justify-center">
                    Restore My Creative Powers
                    <Shield className="ml-2 w-4 h-4" />
                  </span>
                )}
              </motion.button>
            </motion.form>
          )}

          {/* Additional security info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-center mt-4 sm:mt-6"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-md sm:rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-center mb-1 sm:mb-2">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-teal-300 mr-1 sm:mr-2" />
                <span className="text-white/70 text-xs sm:text-sm">
                  Security Tip
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-white/50 leading-relaxed">
                Choose a unique password that you haven&apos;t used elsewhere.
                This keeps your creative stories extra safe!
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Ambient lighting effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-emerald-500/20 via-teal-500/10 to-transparent blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-blue-500/20 via-teal-500/10 to-transparent blur-3xl" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-emerald-500/5 to-transparent blur-3xl" />

      {/* Toast notifications */}
      {toastMessage && (
        <Toast>
          <ToastTitle>
            {toastMessage.includes('restored') ||
            toastMessage.includes('successfully')
              ? 'Success!'
              : 'Error'}
          </ToastTitle>
          <ToastDescription>{toastMessage}</ToastDescription>
          <ToastClose onClick={() => setToastMessage(null)} />
        </Toast>
      )}
      <ToastViewport />
    </div>
  );
}

// Main component with Suspense boundary
export default function ResetPasswordPage() {
  return (
    <ToastProvider>
      <Suspense fallback={<ResetPasswordFallback />}>
        <ResetPasswordContent />
      </Suspense>
    </ToastProvider>
  );
}
