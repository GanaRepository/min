// File: app/login/candidate/page.tsx
import { Metadata, Viewport } from 'next';
import ChildLoginContent from './ChildLoginContent';

export const viewport: Viewport = {
  themeColor: '#0a192f',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.pioneeritsystems.com'),
  title: 'Candidate Login | Pioneer IT Systems - Access Your Profile',
  description:
    'Access your Pioneer IT Systems candidate profile to apply for tech jobs, track applications, and connect with top employers in the technology industry.',
  keywords: [
    'Pioneer IT Systems',
    'candidate login',
    'job seeker portal',
    'tech jobs access',
    'IT candidate login',
    'job applications',
    'tech career portal',
    'job search account',
    'candidate profile',
    'tech job opportunities',
    'IT career access',
    'job application tracking',
    'tech talent login',
    'software developer jobs',
    'tech recruitment',
    'IT staffing',
  ],
  authors: [
    { name: 'Pioneer IT Systems', url: 'https://www.pioneeritsystems.com' },
  ],
  creator: 'Pioneer IT Systems',
  publisher: 'Pioneer IT Systems',
  openGraph: {
    title: 'Candidate Login | Pioneer IT Systems - Access Your Profile',
    description:
      'Access your Pioneer IT Systems candidate profile to apply for tech jobs, track applications, and connect with top employers in the technology industry.',
    url: 'https://www.pioneeritsystems.com/login/candidate',
    siteName: 'Pioneer IT Systems',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/candidate-login-og.jpg', // Update with your actual image path
        width: 1200,
        height: 630,
        alt: 'Pioneer IT Systems - Candidate Login',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.pioneeritsystems.com/login/candidate',
    languages: {
      'en-US': 'https://www.pioneeritsystems.com/login/candidate',
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
    title: 'Pioneer IT Systems',
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
      url: 'https://www.pioneeritsystems.com',
      should_fallback: true,
    },
  },
  verification: {
    google: 'your-verification-code',
  },
};

export default function ChildLoginPage() {
  return <ChildLoginContent />;
}
