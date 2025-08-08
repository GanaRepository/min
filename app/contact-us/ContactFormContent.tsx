'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  User,
  MessageSquare,
  Send,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Quote,
  Heart,
  Zap,
  Star,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MintoonsContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    school: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      text: 'Mintoons transformed my classroom! Students who never wrote before are now creating amazing stories.',
      author: 'Sarah Chen',
      role: '5th Grade Teacher',
      rating: 5,
    },
    {
      text: 'My daughter went from hating writing to publishing her first book at age 10. This platform is magical!',
      author: 'Michael Rodriguez',
      role: 'Parent',
      rating: 5,
    },
    {
      text: "The AI assistance helped me overcome writer's block and finish my first novel. I'm only 14!",
      author: 'Emma Thompson',
      role: 'Young Writer',
      rating: 5,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('email', formData.email);
      formDataObj.append('phone', formData.phone);
      formDataObj.append('age', formData.age);
      formDataObj.append('school', formData.school);
      formDataObj.append('message', formData.message);

      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formDataObj,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setFormData({
            name: '',
            email: '',
            phone: '',
            age: '',
            school: '',
            message: '',
          });
        }, 4000);
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to send message. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-20 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="text-center max-w-2xl mx-auto px-6 relative z-10">
          <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-bounce">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-5xl text-gray-800 mb-6 ">
            🎉 Welcome to the Mintoons Family! 🎉
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Your creative journey begins now! We&apos;ll reach out within 24
            hours with more information about our services.
          </p>
          <div className="flex items-center justify-center space-x-3 text-gray-500 text-lg">
            <Heart className="w-6 h-6 animate-pulse text-indigo-600" />
            <span className="">Get ready to create magic!</span>
            <Sparkles className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white relative overflow-hidden">
      {/* Background Pattern */}
      {/* <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div> */}

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row mt-8 sm:mt-12 lg:mt-16">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-16">
          <div className="max-w-md sm:max-w-xl">
            {/* Floating badge */}
            <motion.div
              className="mt-8 sm:mt-12 mb-8 sm:mb-12 inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 backdrop-blur-xl"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <Sparkles className="w-4 h-4 text-blue-400 mr-2" />
              <span className="text-blue-200  text-xs sm:text-sm">
                Creative Writing Education Platform
              </span>
            </motion.div>

            <h1 className="text-4xl font-black text-white mb-4 sm:mb-6 leading-tight sm:leading-none">
              How can we help you
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 animate-[gradient-x_3s_ease_infinite]">
                create magic?
              </span>
            </h1>

            <p className="text-base sm:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed">
              Our platform empowers children to collaborate with AI in crafting
              their own stories, fostering creativity and learning.
            </p>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="text-center p-4 sm:p-6 bg-white/90 backdrop-blur-xl  border border-gray-200 hover:bg-white transition-all duration-300 hover:scale-105 shadow-lg">
                <div className="text-2xl sm:text-3xl text-blue-600 mb-1 ">
                  10K+
                </div>
                <div className="text-xs sm:text-sm text-gray-600 ">
                  Stories Created
                </div>
              </div>
              <div className="text-center p-4 sm:p-6 bg-white/90 backdrop-blur-xl  border border-gray-200 hover:bg-white transition-all duration-300 hover:scale-105 shadow-lg">
                <div className="text-2xl sm:text-3xl text-indigo-600 mb-1 ">
                  95%
                </div>
                <div className="text-xs sm:text-sm text-gray-600 ">
                  Happy Writers
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-100 mb-6 sm:mb-8 shadow-xl relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>

              {/* Star rating at top */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-blue-200 rotate-180" />
              </div>

              {/* Testimonial text */}
              <blockquote className="text-gray-700 text-lg sm:text-xl  leading-relaxed mb-6 relative z-10">
                "{testimonials[currentTestimonial].text}"
              </blockquote>

              {/* Author info with avatar placeholder */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white  text-lg">
                  {testimonials[currentTestimonial].author
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <div className=" text-gray-800 text-base">
                    {testimonials[currentTestimonial].author}
                  </div>
                  <div className="text-blue-600 text-sm ">
                    {testimonials[currentTestimonial].role}
                  </div>
                </div>
              </div>

              {/* Progress indicator dots */}
              <div className="flex justify-center space-x-2 mt-6">
                {testimonials.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentTestimonial
                        ? 'bg-blue-600 w-8'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-gray-400">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-xs sm:text-sm">hello@Mintoons.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <span className="text-xs sm:text-sm">+1 1111-111-111</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-16">
          <div className="w-full max-w-xs sm:max-w-lg">
            <div className="bg-white backdrop-blur-2xl  sm: p-4 sm:p-8 lg:p-10 border border-gray-200 shadow-2xl">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-3xl text-gray-800 mb-2 sm:mb-3 ">
                  Start Your Journey
                </h2>
                <p className="text-gray-600 text-xs sm:text-base">
                  Tell us about your child&apos;s creative vision and how we can
                  assist in their storytelling journey.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="group">
                  <label className="block text-sm  text-gray-700 mb-2">
                    Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-300  text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white"
                      placeholder="John Doe"
                      required
                    />
                    <div className="absolute inset-0  bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm  text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-300  text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white"
                      placeholder="you@example.com"
                      required
                    />
                    <div className="absolute inset-0  bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm  text-gray-700 mb-2">
                    Phone *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-300  text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white"
                      placeholder="+1 (555) 555-5555"
                      required
                    />
                    <div className="absolute inset-0  bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm  text-gray-700 mb-2">
                    Child&apos;s Age
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-300  text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white"
                      placeholder="10"
                    />
                    <div className="absolute inset-0  bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm  text-gray-700 mb-2">
                    School
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="school"
                      value={formData.school}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-300  text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white"
                      placeholder="Greenwood High School"
                    />
                    <div className="absolute inset-0  bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm  text-gray-700 mb-2">
                    Tell us more about your child&apos;s interests and how we
                    can help... *
                  </label>
                  <div className="relative">
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-300  text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white resize-none"
                      placeholder="Share your child's creative vision, goals, and how we can assist in their storytelling journey..."
                      required
                    />
                    <div className="absolute inset-0  bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-4 px-8  transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden "
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-3 relative z-10">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3 relative z-10">
                      <span>Contact Us</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
