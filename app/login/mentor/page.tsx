// File: app/login/employee/page.tsx
import { Metadata, Viewport } from 'next';
import MentorLoginContent from './MentorLoginContent';

export const viewport: Viewport = {
  themeColor: '#0a192f',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.pioneeritsystems.com'),
  title: 'Employee Login | Pioneer IT Systems - Access Your Dashboard',
  description:
    'Access your Pioneer IT Systems employee dashboard to manage timesheets, view company resources, and connect with your team members and clients.',
  keywords: [
    'Pioneer IT Systems',
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
  authors: [
    { name: 'Pioneer IT Systems', url: 'https://www.pioneeritsystems.com' },
  ],
  creator: 'Pioneer IT Systems',
  publisher: 'Pioneer IT Systems',
  openGraph: {
    title: 'Employee Login | Pioneer IT Systems - Access Your Dashboard',
    description:
      'Access your Pioneer IT Systems employee dashboard to manage timesheets, view company resources, and connect with your team members and clients.',
    url: 'https://www.pioneeritsystems.com/login/employee',
    siteName: 'Pioneer IT Systems',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/employee-login-og.jpg', // Update with your actual image path
        width: 1200,
        height: 630,
        alt: 'Pioneer IT Systems - Employee Login',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.pioneeritsystems.com/login/employee',
    languages: {
      'en-US': 'https://www.pioneeritsystems.com/login/employee',
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

export default function MentorLoginPage() {
  return <MentorLoginContent />;
}
