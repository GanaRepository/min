// app/layout.tsx
'use client';

import { Inter } from 'next/font/google';
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
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <title>Mintoons</title>
        <link rel="icon" href="/favicon2.ico" type="image/png" />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <SessionSyncProvider>
            <Navbar />
            <ScrollProgressBar />
            <main>{children}</main>
            <Footer />
          </SessionSyncProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
