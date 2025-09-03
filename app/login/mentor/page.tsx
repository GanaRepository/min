// File: app/login/mentor/page.tsx
import { Metadata, Viewport } from 'next';
import MentorLoginContentWithSuspense from './MentorLoginContent';

export const viewport: Viewport = {
  themeColor: '#0a192f',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.digiversestory.com'),
  title: 'Mentor Login | Digiverse Story - Access Your Dashboard',
  description:
    'Access your Digiverse Story mentor dashboard to guide young writers, provide feedback, and track student progress in creative writing.',
  keywords: [
    'Digiverse Story',
    'mentor login',
    'teacher portal',
    'mentor dashboard',
    'student guidance',
    'writing mentor access',
    'creative writing mentor',
    'student feedback system',
    'mentor login',
    'teacher login',
    'educational portal',
    'writing instructor access',
    'mentor resources',
    'student tracking',
    'writing education',
    'mentor access',
  ],
  authors: [{ name: 'Digiverse Story', url: 'https://www.digiversestory.com' }],
  creator: 'Digiverse Story',
  publisher: 'Digiverse Story',
  openGraph: {
    title: 'Mentor Login | Digiverse Story - Access Your Dashboard',
    description:
      'Access your Digiverse Story mentor dashboard to guide young writers, provide feedback, and track student progress in creative writing.',
    url: 'https://www.digiversestory.com/login/mentor',
    siteName: 'Digiverse Story',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/mentor-login-og.jpg', // Update with your actual image path
        width: 1200,
        height: 630,
        alt: 'Digiverse Story - Mentor Login',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.digiversestory.com/login/mentor',
    languages: {
      'en-US': 'https://www.digiversestory.com/login/mentor',
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
    title: 'Digiverse Story',
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
      url: 'https://www.digiversestory.com',
      should_fallback: true,
    },
  },
  verification: {
    google: 'your-verification-code',
  },
};

export default function MentorLoginPage() {
  return <MentorLoginContentWithSuspense />;
}
