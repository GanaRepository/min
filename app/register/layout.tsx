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
      <div className="fixed top-0 right-0 w-1/3 h-screen bg-gradient-to-b from-contact-purple/5 to-contact-teal/5 -z-10"></div>
      <div className="fixed top-20 left-10 w-64 h-64 bg-contact-purple/10 rounded-full filter blur-3xl animate-float -z-10"></div>
      <div
        className="fixed bottom-20 right-10 w-64 h-64 bg-contact-teal/10 rounded-full filter blur-3xl animate-float -z-10"
        style={{ animationDelay: '2s' }}
      ></div>
      {children}
    </div>
  );
}
