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
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-gradient-to-r from-green-400 to-blue-600 rounded-full opacity-40 animate-pulse"
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
          <div className="w-32 h-32 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-bounce">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-5xl text-slate-800 mb-6 font-bold">
            🎉 Welcome to the Mintoons Family! 🎉
          </h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Your creative journey begins now! We'll reach out within 24 hours
            with more information about our services.
          </p>
          <div className="flex items-center justify-center space-x-3 text-slate-500 text-lg">
            <Heart className="w-6 h-6 animate-pulse text-blue-600" />
            <span className="font-medium">Get ready to create magic!</span>
            <Sparkles className="w-6 h-6 animate-spin text-green-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
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
      </div>

      <div className="relative z-10 min-h-screen flex mt-16">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
          <div className="max-w-xl">
            {/* Floating badge */}
            <motion.div
              className="mt-12 mb-12 inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-400/30 backdrop-blur-xl"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <Sparkles className="w-4 h-4 text-green-400 mr-2" />
              <span className="text-green-200 font-medium text-sm">
                Creative Writing Education Platform
              </span>
            </motion.div>

            <h1 className="text-5xl lg:text-7xl font-black text-slate-100 mb-6 leading-none">
              How can we help you
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-600 to-pink-600 animate-[gradient-x_3s_ease_infinite]">
                create magic?
              </span>
            </h1>

            <p className="text-xl text-slate-200 mb-8 leading-relaxed">
              Our platform empowers children to collaborate with AI in crafting
              their own stories, fostering creativity and learning.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center p-6 bg-white/60 backdrop-blur-xl rounded-2xl border border-green-200 hover:bg-white/80 transition-all duration-300 hover:scale-105 shadow-lg">
                <div className="text-3xl text-green-600 mb-1 font-bold">
                  10K+
                </div>
                <div className="text-sm text-slate-600 font-medium">
                  Stories Created
                </div>
              </div>
              <div className="text-center p-6 bg-white/60 backdrop-blur-xl rounded-2xl border border-pink-200 hover:bg-white/80 transition-all duration-300 hover:scale-105 shadow-lg">
                <div className="text-3xl text-blue-600 mb-1 font-bold">95%</div>
                <div className="text-sm text-slate-600 font-medium">
                  Happy Writers
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-green-200 mb-8 shadow-lg">
              <div className="flex items-start space-x-4">
                <Quote className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-slate-700 text-lg mb-3 leading-relaxed">
                    "{testimonials[currentTestimonial].text}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-green-600 font-semibold">
                        {testimonials[currentTestimonial].author}
                      </div>
                      <div className="text-slate-500 text-sm">
                        {testimonials[currentTestimonial].role}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-blue-600 text-blue-600"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-slate-600">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-green-500" />
                <span className="text-sm">hello@Mintoons.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-green-500" />
                <span className="text-sm">+1 1111-111-111</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-lg">
            <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-8 lg:p-10 border border-white/40 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl text-slate-800 mb-3 font-bold">
                  Start Your Journey
                </h2>
                <p className="text-slate-600">
                  Tell us about your child's creative vision and how we can
                  assist in their storytelling journey.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-white/70 border border-green-200 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent backdrop-blur-xl transition-all duration-300 hover:bg-white/90"
                      placeholder="John Doe"
                      required
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400/10 to-blue-600/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-white/70 border border-green-200 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent backdrop-blur-xl transition-all duration-300 hover:bg-white/90"
                      placeholder="you@example.com"
                      required
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400/10 to-blue-600/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-white/70 border border-green-200 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent backdrop-blur-xl transition-all duration-300 hover:bg-white/90"
                      placeholder="+1 (555) 555-5555"
                      required
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400/10 to-blue-600/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Child's Age
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-white/70 border border-green-200 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent backdrop-blur-xl transition-all duration-300 hover:bg-white/90"
                      placeholder="10"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400/10 to-blue-600/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    School
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="school"
                      value={formData.school}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-white/70 border border-green-200 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent backdrop-blur-xl transition-all duration-300 hover:bg-white/90"
                      placeholder="Greenwood High School"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400/10 to-blue-600/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tell us more about your child's interests and how we can
                    help... *
                  </label>
                  <div className="relative">
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-4 bg-white/70 border border-green-200 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent backdrop-blur-xl transition-all duration-300 hover:bg-white/90 resize-none"
                      placeholder="Share your child's creative vision, goals, and how we can assist in their storytelling journey..."
                      required
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400/10 to-blue-600/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-blue-600 hover:from-green-600 hover:via-emerald-600 hover:to-pink-600 text-white py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden font-medium"
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
