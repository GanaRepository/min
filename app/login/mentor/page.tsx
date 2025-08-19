// File: app/login/employee/page.tsx
import { Metadata, Viewport } from 'next';
import MentorLoginContent from './MentorLoginContent';

export const viewport: Viewport = {
  themeColor: '#0a192f',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.mintoons.com'),
  title: 'Employee Login | Mintoons - Access Your Dashboard',
  description:
    'Access your Mintoons employee dashboard to manage timesheets, view company resources, and connect with your team members and clients.',
  keywords: [
    'Mintoons',
    'employee login',
    'staff portal',
    'timesheet management',
    'employee dashboard',
    'IT company resources',
    'tech employee portal',
    'internal systems access',
    'staff login',
    'company portal',
    'employee resources',
    'IT timesheet system',
    'tech staff login',
    'employee access',
    'workforce management',
    'internal communications',
  ],
  authors: [{ name: 'Mintoons', url: 'https://www.mintoons.com' }],
  creator: 'Mintoons',
  publisher: 'Mintoons',
  openGraph: {
    title: 'Employee Login | Mintoons - Access Your Dashboard',
    description:
      'Access your Mintoons employee dashboard to manage timesheets, view company resources, and connect with your team members and clients.',
    url: 'https://www.mintoons.com/login/employee',
    siteName: 'Mintoons',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/employee-login-og.jpg', // Update with your actual image path
        width: 1200,
        height: 630,
        alt: 'Mintoons - Employee Login',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.mintoons.com/login/employee',
    languages: {
      'en-US': 'https://www.mintoons.com/login/employee',
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

export default function MentorLoginPage() {
  return <MentorLoginContent />;
}
