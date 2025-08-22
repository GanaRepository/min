// app/register/child/RegisterChildContent.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Eye,
  EyeOff,
  Sparkles,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import TerminalLoader from '@/components/TerminalLoader';

const RegisterChildContent: React.FC = () => {
  const router = useRouter();
  const searchParams =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : undefined;
  const callbackUrl = searchParams?.get('callbackUrl') || '/create-stories';
  const containerRef = useRef<HTMLDivElement>(null);
  const planetRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

  const { ref: heroRef, inView: heroInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { ref: formRef, inView: formInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    school: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

    // Planet rotation animation
    if (planetRef.current) {
      // Using CSS animations instead of GSAP
      planetRef.current.style.animation = 'spin 60s linear infinite';
    }

    // Mouse move effect
    const handleMouseMove = (e: MouseEvent) => {
      if (planetRef.current) {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const deltaX = (clientX - centerX) / centerX;
        const deltaY = (clientY - centerY) / centerY;

        planetRef.current.style.transform = `translate(${deltaX * 30}px, ${deltaY * 30}px)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mounted]);

  useEffect(() => {
    if (toastMessage) {
      console.log('Toast message set:', toastMessage);
    }
  }, [toastMessage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'email' ? value.toLowerCase() : value,
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // In the handleSubmit function, replace the post-registration logic:

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Password validation on the client side
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        setToastMessage(
          'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
        );
        setIsLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setToastMessage('Passwords do not match');
        setIsLoading(false);
        return;
      }

      console.log('Sending registration request...');
      const response = await fetch('/api/auth/register/child', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Registration response:', response.status, data);

      if (!response.ok) {
        console.log('Registration failed:', data.error);
        setToastMessage(data.error || 'Registration failed');
        setIsLoading(false);
        return;
      }

      setToastMessage(
        'Welcome to Mintoons! Your creative journey begins now...'
      );

      // Auto-login immediately after successful registration
      const signInResult = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
        callbackUrl,
      });

      if (signInResult?.error) {
        console.error('Auto login failed:', signInResult.error);
        // If auto-login fails, redirect to login page with callbackUrl
        setTimeout(() => {
          router.push(
            `/login/child?callbackUrl=${encodeURIComponent(callbackUrl)}`
          );
        }, 2000);
      } else {
        // If successful, redirect to callbackUrl
        setTimeout(() => {
          router.push(callbackUrl);
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setToastMessage(
        error instanceof Error
          ? error.message
          : 'Registration failed. Please try again.'
      );
      setIsLoading(false);
    }
  };

  // Prevent hydration issues by only rendering dynamic content after mount
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <TerminalLoader
          title="Registering"
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
        className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden relative pt-28 sm:pt-24 pb-8 sm:pb-12"
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

        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Left side - Registration form */}
          <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-sm sm:max-w-md w-full"
            >
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center mb-8 sm:mb-12"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 mr-2 sm:mr-3 relative">
                  <div className="absolute inset-1 rounded-full bg-gray-900" />
                  <div className="absolute inset-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                    <BookOpen className="w-3 h-3 text-white" />
                  </div>
                </div>
                <span className="text-white text-base sm:text-lg ">
                  Mintoons
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-2xl sm:text-4xl md:text-5xl  text-white mb-4 sm:mb-8 leading-tight"
              >
                Unleash Your Creative Magic
              </motion.h1>

              {/* Registration Form */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                onSubmit={handleSubmit}
                className="space-y-3 sm:space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm text-gray-400 mb-2 cursor-pointer"
                      onClick={() =>
                        document.getElementById('firstName')?.focus()
                      }
                    >
                      First Name
                    </label>
                    <div
                      className="relative"
                      onClick={() =>
                        document.getElementById('firstName')?.focus()
                      }
                    >
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Your first name"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 cursor-text"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm text-gray-400 mb-2 cursor-pointer"
                      onClick={() =>
                        document.getElementById('lastName')?.focus()
                      }
                    >
                      Last Name
                    </label>
                    <div
                      className="relative"
                      onClick={() =>
                        document.getElementById('lastName')?.focus()
                      }
                    >
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Your last name"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 cursor-text"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm text-gray-400 mb-2 cursor-pointer"
                    onClick={() => document.getElementById('email')?.focus()}
                  >
                    Email
                  </label>
                  <div
                    className="relative"
                    onClick={() => document.getElementById('email')?.focus()}
                  >
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Your email or parent's email"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 cursor-text"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label
                      htmlFor="age"
                      className="block text-sm text-gray-400 mb-2 cursor-pointer"
                      onClick={() => document.getElementById('age')?.focus()}
                    >
                      Age
                    </label>
                    <div
                      className="relative"
                      onClick={() => document.getElementById('age')?.focus()}
                    >
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        placeholder="Your age"
                        min="2"
                        max="18"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 cursor-text"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="school"
                      className="block text-sm text-gray-400 mb-2 cursor-pointer"
                      onClick={() => document.getElementById('school')?.focus()}
                    >
                      School
                    </label>
                    <div
                      className="relative"
                      onClick={() => document.getElementById('school')?.focus()}
                    >
                      <input
                        type="text"
                        id="school"
                        name="school"
                        value={formData.school}
                        onChange={handleInputChange}
                        placeholder="Your school"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 cursor-text"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm text-gray-400 mb-2 cursor-pointer"
                    onClick={() => document.getElementById('password')?.focus()}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a secure password"
                      className="w-full px-4 py-3 pr-12 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 cursor-text"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors z-10 p-1"
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
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 8 characters and include
                    uppercase, lowercase, number, and special character.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm text-gray-400 mb-2 cursor-pointer"
                    onClick={() =>
                      document.getElementById('confirmPassword')?.focus()
                    }
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className="w-full px-4 py-3 pr-12 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 cursor-text"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors z-10 p-1"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleConfirmPasswordVisibility();
                      }}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('agreeToTerms', checked as boolean)
                    }
                    required
                    disabled={isLoading}
                    className="mt-1"
                  />
                  <Label
                    htmlFor="agreeToTerms"
                    className="text-xs text-gray-400 leading-relaxed"
                  >
                    By signing up, you confirm that you have parental consent if
                    under 13 and agree to our{' '}
                    <Link
                      href="/terms-of-service"
                      className="text-green-400 hover:text-green-300 transition-colors"
                    >
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy-policy"
                      className="text-green-400 hover:text-green-300 transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <motion.button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6   transition-all duration-300 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      Starting your magical journey...
                    </div>
                  ) : (
                    <motion.span
                      animate={{ x: isHovered ? 2 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-center"
                    >
                      Join the Magic
                      <Sparkles className="ml-2 w-4 h-4" />
                    </motion.span>
                  )}
                </motion.button>
              </motion.form>

              {/* Login link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="text-center mt-6 sm:mt-8"
              >
                <span className="text-gray-400 text-sm">
                  Already have an account?{' '}
                </span>
                <Link
                  href="/login/child"
                  className="text-white text-sm border border-gray-600 px-4 py-2  hover:border-gray-500 transition-colors inline-block ml-2"
                >
                  Log in
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Right side - Animated showcase */}
          <div className="flex-1 relative overflow-hidden min-h-[400px] sm:min-h-0">
            <motion.div
              ref={planetRef}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Orbital rings */}
              <div className="absolute inset-0">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute border border-gray-600/20 rounded-full"
                    style={{
                      width: `${300 + i * 60}px`,
                      height: `${300 + i * 60}px`,
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 20 + i * 5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                ))}
              </div>

              {/* Central showcase card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="relative z-20 bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-8 max-w-xs sm:max-w-sm text-center shadow-2xl mx-auto"
              >
                <div className="mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                    <BookOpen className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-lg sm:text-2xl  text-white mb-1 sm:mb-2">
                    Mintoons
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                    &quot;Unleash Your Creative Magic&quot; - Empowering young
                    writers to create amazing stories with AI assistance, expert
                    mentorship, and unlimited imagination.
                  </p>
                  <p className="text-gray-400 text-[10px] sm:text-xs mt-2 sm:mt-3">
                    AI-Powered Creative Writing Platform for Kids
                  </p>
                </div>

                <div className="flex justify-center gap-1 sm:gap-2">
                  <div className="w-6 sm:w-8 h-1 bg-green-400 rounded" />
                  <div className="w-1 sm:w-2 h-1 bg-gray-600 rounded" />
                  <div className="w-1 sm:w-2 h-1 bg-gray-600 rounded" />
                </div>
              </motion.div>

              {/* Floating user profiles */}
              {[
                { name: 'Alex', color: 'from-blue-400 to-cyan-400', delay: 0 },
                {
                  name: 'Sam',
                  color: 'from-purple-400 to-pink-400',
                  delay: 0.2,
                },
                {
                  name: 'Maya',
                  color: 'from-green-400 to-emerald-400',
                  delay: 0.4,
                },
                {
                  name: 'Jordan',
                  color: 'from-orange-400 to-red-400',
                  delay: 0.6,
                },
                {
                  name: 'Riley',
                  color: 'from-indigo-400 to-purple-400',
                  delay: 0.8,
                },
                {
                  name: 'Casey',
                  color: 'from-pink-400 to-rose-400',
                  delay: 1.0,
                },
              ].map((profile, i) => (
                <motion.div
                  key={profile.name}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x:
                      Math.cos((i * 60 * Math.PI) / 180) *
                      (200 + Math.sin(Date.now() / 2000 + i) * 50),
                    y:
                      Math.sin((i * 60 * Math.PI) / 180) *
                      (200 + Math.cos(Date.now() / 2000 + i) * 50),
                  }}
                  transition={{
                    opacity: { duration: 0.8, delay: profile.delay },
                    scale: { duration: 0.8, delay: profile.delay },
                    x: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                    y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                  }}
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${profile.color} rounded-full flex items-center justify-center shadow-lg border-2 border-white/20`}
                  >
                    <span className="text-white  text-sm">
                      {profile.name[0]}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Floating particles */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-green-400/40 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.4, 1, 0.4],
                    scale: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </motion.div>
          </div>
        </div>

        {/* Ambient lighting effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-green-500/10 via-blue-500/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-radial from-purple-500/10 via-pink-500/5 to-transparent blur-3xl" />

        {/* Toast notifications */}
        {toastMessage && (
          <Toast className="z-50">
            <ToastTitle>
              {toastMessage.includes('successful') ||
              toastMessage.includes('Welcome')
                ? 'Success'
                : 'Error'}
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

export default RegisterChildContent;
