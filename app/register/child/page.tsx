// app/register/child/page.tsx
import { Metadata, Viewport } from 'next';
import RegisterChildContent from './RegisterChildContent';

export const viewport: Viewport = {
  themeColor: '#0a192f',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.mintoons.com'),
  title: 'Candidate Registration | Mintoons - Join Our Talent Pool',
  description:
    'Create your candidate profile with Mintoons to access job opportunities in technology, connect with top employers, and advance your career in the tech industry.',
  keywords: [
    'Mintoons',
    'candidate registration',
    'tech job opportunities',
    'talent pool',
    'IT career',
    'technology jobs',
    'software development careers',
    'tech talent',
    'tech recruiting',
    'job application',
    'IT staffing',
    'candidate profile',
    'tech professional',
    'career advancement',
    'job search',
    'technology employment',
  ],
  authors: [{ name: 'Mintoons', url: 'https://www.mintoons.com' }],
  creator: 'Mintoons',
  publisher: 'Mintoons',
  openGraph: {
    title: 'Candidate Registration | Mintoons - Join Our Talent Pool',
    description:
      'Create your candidate profile with Mintoons to access job opportunities in technology, connect with top employers, and advance your career in the tech industry.',
    url: 'https://www.mintoons.com/register/candidate',
    siteName: 'Mintoons',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/candidate-register-og.jpg', // Update with your actual image path
        width: 1200,
        height: 630,
        alt: 'Mintoons - Candidate Registration',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.mintoons.com/register/candidate',
    languages: {
      'en-US': 'https://www.mintoons.com/register/candidate',
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

export default function RegisterChildPage() {
  return <RegisterChildContent />;
}
