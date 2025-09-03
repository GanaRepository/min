//app/contact-us/page.tsx
import { Metadata, Viewport } from 'next';
import ContactFormContent from './ContactFormContent';

export const viewport: Viewport = {
  themeColor: '#0a192f',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.digiversestory.com'),
  title: 'Contact Us | Digiverse Story - Get in Touch with Our Team',
  description:
    'Connect with Digiverse Story for technology solutions, staffing services, or mentor/child inquiries. Our expert team is ready to help with your technology and recruitment needs.',
  keywords: [
    'Digiverse Story',
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
  authors: [{ name: 'Digiverse Story', url: 'https://www.digiversestory.com' }],
  creator: 'Digiverse Story',
  publisher: 'Digiverse Story',
  openGraph: {
    title: 'Contact Us | Digiverse Story - Get in Touch with Our Team',
    description:
      'Connect with Digiverse Story for technology solutions, staffing services, or mentor/child inquiries. Our expert team is ready to help with your technology and recruitment needs.',
    url: 'https://www.digiversestory.com/contact-us',
    siteName: 'Digiverse Story',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/contact-us-og.jpg', // Update with your actual image path
        width: 1200,
        height: 630,
        alt: 'Digiverse Story - Contact Us',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.digiversestory.com/contact-us',
    languages: {
      'en-US': 'https://www.digiversestory.com/contact-us',
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

export default function ContactPage() {
  return <ContactFormContent />;
}
