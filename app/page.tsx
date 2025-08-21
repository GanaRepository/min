// File: app/page.tsx
import React from 'react';
import { Metadata, Viewport } from 'next';
import Hero from '@/components/home/Hero';

export const viewport: Viewport = {
  themeColor: '#0a192f',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.mintoons.com'),
  title: 'Mintoons | Premier IT Staff Augmentation & Technology Services',
  description:
    'Mintoons offers professional IT staffing solutions, software development services, and technology consulting to help mentors innovate and achieve their digital transformation goals.',
  keywords: [
    'Mintoons',
    'IT staffing solutions',
    'technology staffing',
    'staff augmentation',
    'software development services',
    'IT consulting',
    'tech talent solutions',
    'professional IT services',
    'technology consulting',
    'remote IT staffing',
    'digital transformation',
    'IT recruitment services',
    'software engineers',
    'technology professionals',
    'IT project solutions',
    'technology partner',
  ],
  authors: [{ name: 'Mintoons', url: 'https://www.mintoons.com' }],
  creator: 'Mintoons',
  publisher: 'Mintoons',
  openGraph: {
    title: 'Mintoons | Premier IT Staff Augmentation & Technology Services',
    description:
      'Mintoons offers professional IT staffing solutions, software development services, and technology consulting to help mentors innovate and achieve their digital transformation goals.',
    url: 'https://www.mintoons.com',
    siteName: 'Mintoons',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/imag5.jpg',
        width: 1200,
        height: 630,
        alt: 'Mintoons - Home',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.mintoons.com',
    languages: {
      'en-US': 'https://www.mintoons.com',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
    nocache: true,
  },
  category: 'Technology',
  appleWebApp: {
    capable: true,
    title: 'Mintoons',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: true,
    date: false,
    address: true,
    email: true,
  },
  other: {
    'google-site-verification': 'your-verification-code',
  },
  appLinks: {
    web: {
      url: 'https://www.mintoons.com',
      should_fallback: true,
    },
  },
  verification: {
    google: 'your-verification-code',
  },
};

export default function Home() {
  return (
    <div 
      className="min-h-screen"
      style={{
        // Critical performance optimizations
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        contain: 'layout style paint',
      }}
    >
      <div 
        className="fixed top-10 sm:top-16 md:top-20 left-2 sm:left-6 md:left-10 w-40 sm:w-56 md:w-64 h-40 sm:h-56 md:h-64 bg-contact-purple/10 rounded-full filter blur-3xl animate-float -z-10"
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      ></div>
      <div
        className="fixed bottom-10 sm:bottom-16 md:bottom-20 right-2 sm:right-6 md:right-10 w-40 sm:w-56 md:w-64 h-40 sm:h-56 md:h-64 bg-contact-teal/10 rounded-full filter blur-3xl animate-float -z-10"
        style={{ 
          animationDelay: '2s',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      ></div>
      <main
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      >
        <Hero />
      </main>
    </div>
  );
}
