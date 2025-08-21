// app/layout.tsx - UPDATED VERSION
'use client';

import { Inter } from 'next/font/google';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';
import ScrollProgressBar from '@/components/ScrollProgressBar';
import { SessionProvider } from 'next-auth/react';
import { SessionSyncProvider } from '@/components/providers/SessionSyncProvider';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Hide navbar and footer on dashboard and admin pages
  const isDashboardPage =
    pathname?.startsWith('/children-dashboard') ||
    pathname?.startsWith('/mentor-dashboard') ||
    pathname?.startsWith('/parent-dashboard') ||
    pathname?.startsWith('/admin');

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <title>Mintoons</title>
        <link rel="icon" href="/favicon2.ico" type="image/png" />
      </head>
      <body
        className={inter.className}
        style={{
          // Critical performance optimizations for scroll
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          contain: 'layout style',
        }}
      >
        <SessionProvider>
          <SessionSyncProvider>
            {/* Only show navbar on non-dashboard pages */}
            {!isDashboardPage && <Navbar />}

            {/* Only show scroll progress bar on non-dashboard pages */}
            {!isDashboardPage && <ScrollProgressBar />}

            <main
              style={{
                // Optimize main content area
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                contain: 'layout style paint',
              }}
            >
              {children}
            </main>

            {/* Only show footer on non-dashboard pages */}
            {!isDashboardPage && <Footer />}
          </SessionSyncProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
