'use client';

import React from 'react';
import { useInView } from 'react-intersection-observer';
import { PenTool, Users, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type LoginOption = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
};

const LoginPage: React.FC = () => {
  const { ref: heroRef, inView: heroInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { ref: cardsRef, inView: cardsInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const loginOptions: LoginOption[] = [
    {
      id: 'child',
      title: 'Young Writer',
      description:
        'For children to write amazing stories, get feedback, and publish their creative work.',
      icon: <PenTool className="h-8 w-8" />,
      link: '/login/child',
    },
    {
      id: 'mentor',
      title: 'Teacher/Mentor',
      description:
        'For educators to guide young writers, provide feedback, and track their progress.',
      icon: <Users className="h-8 w-8" />,
      link: '/login/mentor',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white relative overflow-hidden ">
    
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative z-10 min-h-screen flex items-center justify-center px-2 sm:px-4 md:px-8 mt-28 md:mt-24 lg:mt-28 mb-8 md:mb-12 lg:mb-16"
      >
        <div
          className={`text-center max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto transition-all duration-1000 ${
            heroInView
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-12'
          }`}
        >
          {/* Badge */}
          <div className="inline-block mb-6 sm:mb-8 ">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-green-500 to-teal-500 opacity-70 blur"></div>
              <div className="relative px-4 sm:px-6 py-1.5 sm:py-2 bg-gray-800/90 backdrop-blur-xl rounded-full text-xs sm:text-sm  text-green-300 border border-green-400/30">
                <Sparkles className="w-4 h-4 inline mr-2" />
                Account Access
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl   mb-4 sm:mb-6 leading-tight">
            Login to Your{' '}
            <span className="bg-gradient-to-r from-green-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Creative Portal
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 sm:mb-12 md:mb-16 max-w-xl sm:max-w-2xl mx-auto leading-relaxed">
            Select your account type below to access your personalized dashboard
            and start your creative writing journey.
          </p>

          {/* Login Options Cards */}
          <div
            ref={cardsRef}
            className={`transition-all duration-1000 ${
              cardsInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-xl sm:max-w-3xl md:max-w-4xl mx-auto">
              {loginOptions.map((option, index) => (
                <div
                  key={option.id}
                  className={`transition-all duration-700 ${
                    cardsInView
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-12'
                  }`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <Card className="group relative bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 hover:bg-white/15 overflow-hidden">
                    {/* Hover Effect Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <CardContent className="relative z-10 p-6 sm:p-8 flex flex-col items-center text-center">
                      {/* Icon */}
                      <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {option.icon}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg sm:text-2xl  text-white mb-2 sm:mb-4 group-hover:text-green-300 transition-colors">
                        {option.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-300 mb-4 sm:mb-8 leading-relaxed text-sm sm:text-base">
                        {option.description}
                      </p>

                      {/* Button */}
                      <Link href={option.link} className="w-full">
                        <Button className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white  py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group border-0 text-xs sm:text-base">
                          <span className="flex items-center justify-center">
                            Access {option.title} Portal
                            <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-8 sm:mt-12">
              <p className="text-gray-300 text-base sm:text-lg">
                Don&apos;t have an account yet?{' '}
                <Link
                  href="/register"
                  className="text-green-400 hover:text-green-300  hover:underline transition-colors"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
