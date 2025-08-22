'use client';

import { useState, useEffect, useRef } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TerminalLoader from '@/components/TerminalLoader';
import {
  Eye,
  EyeOff,
  Crown,
  Mail,
  Lock,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

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

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session?.user?.role === 'admin') {
        router.push('/admin');
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials. Admin access only.');
      } else {
        const session = await getSession();
        if (session?.user?.role === 'admin') {
          router.push('/admin');
        } else {
          setError('Admin access required');
        }
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-green-900 flex items-center justify-center">
        <TerminalLoader
          title="Admin Login"
          loadingText="Loading Admin..."
          size="lg"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-gray-900/95 via-blue-900/95 to-green-900/95 overflow-hidden flex items-center justify-center relative px-2 sm:px-4"
    >
      {/* Main container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16"
      >
        {/* Left side - Admin illustration (responsive) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 w-full flex flex-col items-center justify-center relative min-h-[350px] sm:min-h-[400px] md:min-h-[450px] lg:min-h-[500px]"
        >
          <div className="relative w-full h-full bg-white/5 backdrop-blur-sm border border-white/10  p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center overflow-hidden">
            {/* Background image */}
            <div className="absolute inset-0 w-full h-full z-0">
              <Image
                src="/kid1.jpg"
                alt="Admin Portal Background"
                fill
                style={{ objectFit: 'cover', objectPosition: 'center' }}
                className=" opacity-60"
                priority
              />
            </div>
            {/* Admin crown and tech elements */}
            <motion.div
              animate={{
                rotate: [0, 10, 0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative flex flex-col items-center justify-center z-10"
            >
              <Crown className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 text-yellow-400/80 mb-4 sm:mb-6" />
              <div className="absolute -top-4 -right-4">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                </motion.div>
              </div>
              <div className="absolute -bottom-4 -left-4">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 1,
                  }}
                >
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
                </motion.div>
              </div>
            </motion.div>

            {/* Tech glitch lines */}
            {mounted &&
              [...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute left-0 h-0.5 bg-blue-400/60"
                  style={{
                    top: `${15 + i * 7}%`,
                    width: `${30 + Math.random() * 60}%`,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scaleX: [0, 1, 0],
                    x: [0, 20, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                    repeatDelay: 3,
                  }}
                />
              ))}

            {/* Quote */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="mt-6 sm:mt-10 text-center"
            >
              <p className="text-white text-xs sm:text-sm md:text-base italic mb-2">
                &quot;The best way to predict the future is to invent it.&quot;
              </p>
              <p className="text-xs text-white">- Alan Kay</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Right side - Login form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex-1 w-full max-w-md"
        >
          {/* Back to main site */}
          <Link href="/">
            <Button
              variant="outline"
              className="mb-6 bg-white/10 border-white/20 text-white hover:bg-gray-300"
            >
              ← Back to Mintoons
            </Button>
          </Link>

          <div className="text-center mb-8">
            {/* Welcome text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl  text-white mb-2">
                Admin Portal
              </h1>
              <h2 className="text-2xl sm:text-3xl md:text-4xl  text-white/80 mb-4 italic">
                Command Center
              </h2>
              <p className="text-white/60 text-sm">
                Access Mintoons administration panel
              </p>
            </motion.div>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-200 p-3  mb-6 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Login form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Email field */}
            <div className="space-y-2">
              <label
                className="text-white/80 text-sm cursor-pointer"
                onClick={() => document.getElementById('admin-email')?.focus()}
              >
                Admin Email
              </label>
              <div
                className="relative"
                onClick={() => document.getElementById('admin-email')?.focus()}
              >
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-text"
                  placeholder="admin@mintoons.com"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label
                className="text-white/80 text-sm cursor-pointer"
                onClick={() =>
                  document.getElementById('admin-password')?.focus()
                }
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 rounded-lg border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-text"
                  placeholder="Enter your admin password"
                  required
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowPassword(!showPassword);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors z-10 p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Login button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white  py-3 px-6  transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white  animate-spin" />
                  <span>Accessing Admin Panel...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Crown className="w-5 h-5" />
                  <span>Sign In to Admin Panel</span>
                </div>
              )}
            </motion.button>
          </motion.form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-center mt-8"
          >
            <p className="text-white/40 text-sm">
              Mintoons Administration Panel
            </p>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-xs">Secure Connection</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Floating admin badges */}
      <div className="absolute top-10 left-10 hidden lg:block">
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
          className="bg-white/10 backdrop-blur-sm border border-white/20  p-3"
        >
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="text-white/80 text-sm ">Secure</span>
          </div>
        </motion.div>
      </div>

      <div className="absolute top-10 right-10 hidden lg:block">
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: 1.5,
          }}
          className="bg-white/10 backdrop-blur-sm border border-white/20  p-3"
        >
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-white/80 text-sm ">Powered</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
