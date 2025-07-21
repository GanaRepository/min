// File: app/contact-us/page.tsx
import { Metadata, Viewport } from 'next';
import ContactFormContent from './ContactFormContent';

export const viewport: Viewport = {
  themeColor: '#0a192f',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.pioneeritsystems.com'),
  title: 'Contact Us | Pioneer IT Systems - Get in Touch with Our Team',
  description:
    'Connect with Pioneer IT Systems for technology solutions, staffing services, or mentor/child inquiries. Our expert team is ready to help with your technology and recruitment needs.',
  keywords: [
    'Pioneer IT Systems',
    'contact us',
    'IT consulting contact',
    'tech staffing inquiries',
    'software development contact',
    'technology solutions contact',
    'DevOps services',
    'IT experts',
    'tech recruitment',
    'mentor/child inquiries',
    'get in touch',
    'request IT services',
    'tech consultation',
    'project inquiry',
    'tech talent solutions',
    'IT support contact',
  ],
  authors: [
    { name: 'Pioneer IT Systems', url: 'https://www.pioneeritsystems.com' },
  ],
  creator: 'Pioneer IT Systems',
  publisher: 'Pioneer IT Systems',
  openGraph: {
    title: 'Contact Us | Pioneer IT Systems - Get in Touch with Our Team',
    description:
      'Connect with Pioneer IT Systems for technology solutions, staffing services, or mentor/child inquiries. Our expert team is ready to help with your technology and recruitment needs.',
    url: 'https://www.pioneeritsystems.com/contact-us',
    siteName: 'Pioneer IT Systems',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/contact-us-og.jpg', // Update with your actual image path
        width: 1200,
        height: 630,
        alt: 'Pioneer IT Systems - Contact Us',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.pioneeritsystems.com/contact-us',
    languages: {
      'en-US': 'https://www.pioneeritsystems.com/contact-us',
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
    nocache: false,
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

export default function ContactPage() {
  return <ContactFormContent />;
}
