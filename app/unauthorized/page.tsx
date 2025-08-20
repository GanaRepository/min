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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-black relative overflow-hidden">
      <div className="container mx-auto px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 py-6 sm:py-10 md:py-16 flex-grow flex items-center justify-center">
        <div
          ref={contentRef}
          className={`max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl w-full text-center transition-all duration-1000 ${
            contentInView
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-12'
          } px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20`}
        >
          <div className="mb-6 sm:mb-8 flex justify-center">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gray-200 flex items-center justify-center">
              <FiShield className="h-8 w-8 sm:h-10 sm:w-10 text-green-800" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl  mb-4 sm:mb-6 text-green-800">
            Access Denied
          </h1>

          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl shadow-lg mb-6 sm:mb-8">
            <p className="text-sm sm:text-base md:text-lg text-neutral-700 mb-4 sm:mb-6">
              You don&apos;t have permission to access this resource. This area
              requires administrative privileges.
            </p>

            <div className="p-2 sm:p-3 md:p-4 bg-secondary-50 border border-secondary-200 rounded-md sm:rounded-lg text-left mb-6 sm:mb-8">
              <h3 className="text-sm sm:text-base md:text-lg  text-secondary-800 mb-1 sm:mb-2">
                Why am I seeing this?
              </h3>
              <ul className="list-disc list-inside text-secondary-700 space-y-1 sm:space-y-2 text-xs sm:text-sm">
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

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <Link href="/">
                <Button className="bg-primary hover:bg-primary/90 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-md sm:rounded-lg w-full sm:w-auto flex items-center justify-center text-sm sm:text-base md:text-lg">
                  <FiArrowLeft className="mr-2" />
                  Return to Home
                </Button>
              </Link>

              <Link href="/logout">
                <Button
                  variant="outline"
                  className="border-neutral-300 text-neutral-700 px-4 sm:px-6 py-3 sm:py-4 rounded-md sm:rounded-lg w-full sm:w-auto text-sm sm:text-base md:text-lg"
                >
                  Logout
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-white">
            If you believe this is an error, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
