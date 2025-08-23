// app/register/child/page.tsx
import { Metadata, Viewport } from 'next';
import RegisterChildContentWithSuspense from './RegisterChildContent';

export const viewport: Viewport = {
  themeColor: '#0a192f',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.mintoons.com'),
  title: 'Child Registration | Mintoons - Join the Creative Community',
  description:
    'Create your young writer profile with Mintoons to start writing amazing stories, connect with mentors, and unleash your creative potential.',
  keywords: [
    'Mintoons',
    'child registration',
    'young writer signup',
    'creative writing for kids',
    'storytelling platform',
    'kids writing community',
    'young storyteller',
    'children creative writing',
    'writing for kids',
    'story creation for children',
    'youth writing platform',
    'creative kids',
    'writing mentorship',
    'children stories',
    'kids creativity',
    'young author',
  ],
  authors: [{ name: 'Mintoons', url: 'https://www.mintoons.com' }],
  creator: 'Mintoons',
  publisher: 'Mintoons',
  openGraph: {
    title: 'Child Registration | Mintoons - Join the Creative Community',
    description:
      'Create your young writer profile with Mintoons to start writing amazing stories, connect with mentors, and unleash your creative potential.',
    url: 'https://www.mintoons.com/register/child',
    siteName: 'Mintoons',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/child-register-og.jpg', // Update with your actual image path
        width: 1200,
        height: 630,
        alt: 'Mintoons - Child Registration',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.mintoons.com/register/child',
    languages: {
      'en-US': 'https://www.mintoons.com/register/child',
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
  return <RegisterChildContentWithSuspense />;
}
