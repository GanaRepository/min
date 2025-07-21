'use client';

import React from 'react';
import { useInView } from 'react-intersection-observer';
import { FiArrowRight } from 'react-icons/fi';
import { Button } from './ui/button';
import Link from 'next/link';

// Define the HeroSlide interface
export interface HeroSlide {
  title: string;
  subtitle: string;
  backgroundImage: string;
}

// Define props interface with optional slides
interface HeroSectionProps {
  slides?: HeroSlide[];
}

const HeroSection: React.FC<HeroSectionProps> = ({
  slides = [
    {
      title: 'Innovative IT Solutions',
      subtitle: 'Empowering Your Mentor/Child with Cutting-Edge Technology',
      backgroundImage: '/set7.jpg',
    },
  ],
}) => {
  // Animation hook for scroll reveal
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div className="relative overflow-hidden py-24 pattern-bg">
      {/* Decorative elements */}
      <div className="fixed top-0 right-0 w-1/3 h-screen bg-gradient-to-b from-contact-purple/5 to-contact-teal/5 -z-10"></div>
      <div className="fixed top-20 left-10 w-64 h-64 bg-contact-purple/10 rounded-full filter blur-3xl animate-float -z-10"></div>
      <div
        className="fixed bottom-20 right-10 w-64 h-64 bg-contact-teal/10 rounded-full filter blur-3xl animate-float -z-10"
        style={{ animationDelay: '2s' }}
      ></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 relative z-10">
        <div
          ref={heroRef}
          className={`max-w-5xl mx-auto text-center transition-all duration-1000 ${
            heroInView
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="inline-block mb-8">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-contact-purple to-contact-teal opacity-70 blur"></div>
              <div className="relative px-6 py-2 bg-white rounded-full text-sm font-normal text-gray-800">
                Professional IT Services
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-normal mb-6 gradient-text leading-tight">
            {slides[0].title}
          </h1>
          <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto">
            {slides[0].subtitle}
          </p>
          <Link href="/contact-us">
            <Button className="gradient-button">
              Get Started
              <FiArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
