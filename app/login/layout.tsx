// app/login/layout.tsx
import React from 'react';

export const metadata = {
  title: 'Login - PioneerIT',
  description:
    'Access your PioneerIT account to manage your profile and services.',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pattern-bg">
      {/* Decorative elements - responsive */}
      <div className="fixed top-0 right-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 h-1/2 sm:h-2/3 md:h-3/4 lg:h-screen bg-gradient-to-b from-contact-purple/5 to-contact-teal/5 -z-10"></div>
      <div className="fixed top-8 sm:top-16 md:top-20 left-2 sm:left-6 md:left-10 w-32 sm:w-48 md:w-56 lg:w-64 h-32 sm:h-48 md:h-56 lg:h-64 bg-contact-purple/10 rounded-full filter blur-2xl sm:blur-3xl animate-float -z-10"></div>
      <div
        className="fixed bottom-8 sm:bottom-16 md:bottom-20 right-2 sm:right-6 md:right-10 w-32 sm:w-48 md:w-56 lg:w-64 h-32 sm:h-48 md:h-56 lg:h-64 bg-contact-teal/10 rounded-full filter blur-2xl sm:blur-3xl animate-float -z-10 "
        style={{ animationDelay: '2s' }}
      ></div>

      {children}
    </div>
  );
}
