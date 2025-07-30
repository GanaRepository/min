// app/register/layout.tsx
import React from 'react';

export const metadata = {
  title: 'Register - PioneerIT',
  description:
    'Create your PioneerIT account to access our services and opportunities.',
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pattern-bg">
      {/* Decorative elements */}
      <div className="fixed top-0 right-0 w-1/2 sm:w-1/3 h-1/2 sm:h-screen bg-gradient-to-b from-contact-purple/5 to-contact-teal/5 -z-10"></div>
      <div className="fixed top-8 sm:top-20 left-4 sm:left-10 w-40 h-40 sm:w-64 sm:h-64 bg-contact-purple/10 rounded-full filter blur-2xl sm:blur-3xl animate-float -z-10"></div>
      <div
        className="fixed bottom-8 sm:bottom-20 right-4 sm:right-10 w-40 h-40 sm:w-64 sm:h-64 bg-contact-teal/10 rounded-full filter blur-2xl sm:blur-3xl animate-float -z-10"
        style={{ animationDelay: '2s' }}
      ></div>
      {children}
    </div>
  );
}
