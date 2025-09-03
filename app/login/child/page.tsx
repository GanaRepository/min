// File: app/login/candidate/page.tsx
import { Metadata, Viewport } from 'next';
import ChildLoginContent from './ChildLoginContent';

export const viewport: Viewport = {
  themeColor: '#0a192f',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.digiversestory.com'),
  title: 'Candidate Login | Digiverse Story - Access Your Profile',
  description:
    'Access your Digiverse Story candidate profile to apply for tech jobs, track applications, and connect with top employers in the technology industry.',
  keywords: [
    'Digiverse Story',
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
  authors: [{ name: 'Digiverse Story', url: 'https://www.digiversestory.com' }],
  creator: 'Digiverse Story',
  publisher: 'Digiverse Story',
  openGraph: {
    title: 'Candidate Login | Digiverse Story - Access Your Profile',
    description:
      'Access your Digiverse Story candidate profile to apply for tech jobs, track applications, and connect with top employers in the technology industry.',
    url: 'https://www.digiversestory.com/login/candidate',
    siteName: 'Digiverse Story',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/candidate-login-og.jpg', // Update with your actual image path
        width: 1200,
        height: 630,
        alt: 'Digiverse Story - Candidate Login',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.digiversestory.com/login/candidate',
    languages: {
      'en-US': 'https://www.digiversestory.com/login/candidate',
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

export default function ChildLoginPage() {
  return <ChildLoginContent />;
}
