'use client';

import React from 'react';
import { useInView } from 'react-intersection-observer';
import { FiShield, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  const [contentRef, contentInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div className="min-h-screen flex flex-col pattern-bg">
      <div className="container mx-auto px-4 py-16 flex-grow flex items-center justify-center">
        <div
          ref={contentRef}
          className={`max-w-3xl w-full text-center transition-all duration-1000 ${
            contentInView
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <FiShield className="h-10 w-10 text-red-500" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
            Access Denied
          </h1>

          <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
            <p className="text-xl text-gray-700 mb-6">
              You don&apos;t have permission to access this resource. This area
              requires administrative privileges.
            </p>

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-left mb-8">
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Why am I seeing this?
              </h3>
              <ul className="list-disc list-inside text-red-700 space-y-2">
                <li>
                  You&apos;re currently logged in with a non-admin account
                </li>
                <li>
                  You&apos;re attempting to access a restricted administration
                  area
                </li>
                <li>
                  Your current role doesn&apos;t have sufficient permissions
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/">
                <Button className="bg-contact-purple hover:bg-contact-purple/90 text-white px-6 py-5 rounded-lg w-full sm:w-auto flex items-center justify-center">
                  <FiArrowLeft className="mr-2" />
                  Return to Home
                </Button>
              </Link>

              <Link href="/logout">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 px-6 py-5 rounded-lg w-full sm:w-auto"
                >
                  Logout
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
