// app/register/child/page.tsx
import { Metadata, Viewport } from 'next';
import RegisterChildContentWithSuspense from './RegisterChildContent';

export const viewport: Viewport = {
  themeColor: '#0a192f',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.digiversestory.com'),
  title: 'Child Registration | Digiverse Story - Join the Creative Community',
  description:
    'Create your young writer profile with Digiverse Story to start writing amazing stories, connect with mentors, and unleash your creative potential.',
  keywords: [
    'Digiverse Story',
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
  authors: [{ name: 'Digiverse Story', url: 'https://www.digiversestory.com' }],
  creator: 'Digiverse Story',
  publisher: 'Digiverse Story',
  openGraph: {
    title: 'Child Registration | Digiverse Story - Join the Creative Community',
    description:
      'Create your young writer profile with Digiverse Story to start writing amazing stories, connect with mentors, and unleash your creative potential.',
    url: 'https://www.digiversestory.com/register/child',
    siteName: 'Digiverse Story',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/child-register-og.jpg', // Update with your actual image path
        width: 1200,
        height: 630,
        alt: 'Digiverse Story - Child Registration',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.digiversestory.com/register/child',
    languages: {
      'en-US': 'https://www.digiversestory.com/register/child',
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

export default function RegisterChildPage() {
  return <RegisterChildContentWithSuspense />;
}
