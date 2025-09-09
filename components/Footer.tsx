'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiChevronRight,
  FiArrowUp,
} from 'react-icons/fi';
import { FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer
      className="relative py-8 md:py-12 bg-gradient-to-br from-emerald-950/95 via-slate-900/95 to-teal-950/95 backdrop-blur-md text-emerald-50 overflow-hidden"
      id="contact"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        {/* Mobile Layout (below md) */}
        <div className="block md:hidden space-y-8">
          {/* Company Logo & Info */}
          <div className="text-center space-y-4">
            <Link
              href="/"
              className="inline-block transition-all duration-300 hover:scale-105"
            >
              <Image
                src="/min_logo4.png"
                alt="Digiverse Story Logo"
                width={180}
                height={72}
                priority
                className="h-14 w-auto mx-auto"
              />
            </Link>

            <div className="space-y-3 px-4">
              <h2 className="text-emerald-100 font-medium text-base leading-tight">
                Unleashing Creative Magic Through AI-Powered Storytelling
              </h2>
              <p className="text-emerald-200 text-sm leading-relaxed">
                Digiverse Story is the leading creative writing platform for
                children, empowering young writers to create amazing stories
                with AI assistance, expert mentorship, and unlimited
                imagination.
              </p>
            </div>
          </div>

          {/* Social Media */}
          <div className="text-center">
            <h3 className="text-emerald-100 font-medium text-base mb-4 flex items-center justify-center">
              <span className="w-1 h-4 bg-emerald-500 mr-2"></span>
              Connect With Us
            </h3>
            <div className="flex gap-4 justify-center">
              <Link
                href="https://twitter.com/DigiverseStory"
                className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/30 transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter className="h-4 w-4 text-emerald-300" />
              </Link>
              <Link
                href="https://www.instagram.com/DigiverseStory_official/"
                className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/30 transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="h-4 w-4 text-emerald-300" />
              </Link>
              <Link
                href="https://linkedin.com/company/DigiverseStory"
                className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/30 transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="h-4 w-4 text-emerald-300" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h3 className="text-emerald-100 font-medium text-base mb-4 flex items-center justify-center">
              <span className="w-1 h-4 bg-emerald-500 mr-2"></span>
              Quick Links
            </h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 max-w-xs mx-auto">
              {[
                { href: '/', label: 'Home' },
                { href: '/create-stories', label: 'Create Stories' },
                { href: '/competitions', label: 'Competitions' },
                { href: '/pricing', label: 'Pricing' },
                { href: '/contact-us', label: 'Contact Us' },
                { href: '/login/child', label: 'Student Login' },
                { href: '/login/mentor', label: 'Mentor Login' },
                { href: '/admin', label: 'Admin' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-emerald-200 hover:text-emerald-100 transition-colors text-sm py-1"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="text-center">
            <h3 className="text-emerald-100 font-medium text-base mb-4 flex items-center justify-center">
              <span className="w-1 h-4 bg-emerald-500 mr-2"></span>
              Contact Us
            </h3>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden border border-emerald-200/20 mx-4 max-w-sm mx-auto">
              {/* Country Badge */}
              <div className="relative h-24 bg-gradient-to-br from-teal-400/80 to-cyan-500/80 flex items-center justify-center">
                <div className="absolute top-2 right-2 bg-blue-600 text-white rounded px-2 py-1 text-xs font-medium">
                  US
                </div>
                <div className="text-white text-2xl opacity-30">🇺🇸</div>
              </div>

              {/* Contact Info */}
              <div className="p-4 space-y-3 text-center">
                <p className="font-medium text-emerald-300 text-sm">
                  USA Office
                </p>

                <div className="space-y-2 text-xs text-emerald-200">
                  <div className="flex items-start justify-center space-x-2">
                    <FiMapPin className="h-3 w-3 mt-0.5 text-emerald-300 flex-shrink-0" />
                    <div>
                      <p>19401 40th Avenue West,</p>
                      <p>Suite 115, Lynnwood WA 98036</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-2">
                    <FiPhone className="h-3 w-3 text-emerald-300 flex-shrink-0" />
                    <Link
                      href="tel:+14083949579"
                      className="hover:text-emerald-100 transition-colors"
                    >
                      +1 (408) 394-9579
                    </Link>
                  </div>

                  <div className="flex items-center justify-center space-x-2">
                    <FiMail className="h-3 w-3 text-emerald-300 flex-shrink-0" />
                    <Link
                      href="mailto:support@DigiverseStory.com"
                      className="hover:text-emerald-100 transition-colors break-all"
                    >
                      support@DigiverseStory.com
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout (md and above) */}
        <div className="hidden md:block">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
            {/* Company Info Section */}
            <div className="lg:col-span-4 space-y-6">
              <Link
                href="/"
                className="inline-block transition-all duration-300 hover:scale-105"
              >
                <Image
                  src="/min_logo4.png"
                  alt="Digiverse Story Logo"
                  width={220}
                  height={88}
                  priority
                  className="h-20 w-auto"
                />
              </Link>

              <div className="space-y-4">
                <h2 className="text-emerald-100 font-medium text-lg leading-tight">
                  Unleashing Creative Magic Through AI-Powered Storytelling
                </h2>
                <p className="text-emerald-200 text-sm leading-relaxed">
                  Digiverse Story is the leading creative writing platform for
                  children, empowering young writers to create amazing stories
                  with AI assistance, expert mentorship, and unlimited
                  imagination.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold mb-4 relative pl-3 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-emerald-500">
                  Connect With Us
                </h3>
                <div className="flex gap-4">
                  <Link
                    href="https://twitter.com/DigiverseStory"
                    className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/30 transition-colors"
                    aria-label="Twitter"
                  >
                    <FaTwitter className="h-5 w-5 text-emerald-300" />
                  </Link>
                  <Link
                    href="https://www.instagram.com/DigiverseStory_official/"
                    className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/30 transition-colors"
                    aria-label="Instagram"
                  >
                    <FaInstagram className="h-5 w-5 text-emerald-300" />
                  </Link>
                  <Link
                    href="https://linkedin.com/company/DigiverseStory"
                    className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/30 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <FaLinkedin className="h-5 w-5 text-emerald-300" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="lg:col-span-3">
              <h3 className="text-base font-semibold mb-6 relative pl-3 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-emerald-500">
                Quick Links
              </h3>
              <ul className="space-y-3">
                {[
                  { href: '/', label: 'Home' },
                  { href: '/create-stories', label: 'Create Stories' },
                  { href: '/competitions', label: 'Competitions' },
                  { href: '/pricing', label: 'Pricing' },
                  { href: '/contact-us', label: 'Contact Us' },
                  { href: '/login/child', label: 'Student Login' },
                  { href: '/login/mentor', label: 'Mentor Login' },
                  { href: '/admin', label: 'Admin' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-emerald-200 hover:text-emerald-100 transition-colors text-sm inline-flex items-center group"
                    >
                      <FiChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-all -ml-5 group-hover:ml-0 text-emerald-300" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Us Section */}
            <div className="lg:col-span-5">
              <h3 className="text-base font-semibold mb-6 relative pl-3 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-emerald-500">
                Contact Us
              </h3>

              <div className="max-w-md">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg border border-emerald-200/20 relative">
                  <div className="absolute top-3 right-3 bg-blue-600 text-white rounded-md px-2 py-1 text-xs font-medium z-10">
                    US
                  </div>

                  <div className="h-32 relative bg-gradient-to-br from-teal-400/80 to-cyan-500/80 flex items-center justify-center">
                    <div className="text-white text-4xl opacity-30">🇺🇸</div>
                  </div>

                  <div className="p-6 space-y-4">
                    <p className="font-medium text-center text-emerald-300 mb-6">
                      USA Office
                    </p>

                    <div className="flex items-start space-x-3">
                      <FiMapPin className="h-4 w-4 mt-1 text-emerald-300 flex-shrink-0" />
                      <div className="text-sm text-emerald-200 leading-relaxed">
                        <p>19401 40th Avenue West,</p>
                        <p>Suite 115, Lynnwood</p>
                        <p>WA 98036</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <FiPhone className="h-4 w-4 text-emerald-300 flex-shrink-0" />
                      <Link
                        href="tel:+14259005221"
                        className="text-sm text-emerald-200 hover:text-emerald-100 transition-colors"
                      >
                        +1 (425) 900-5221
                      </Link>
                    </div>

                    <div className="flex items-center space-x-3">
                      <FiMail className="h-4 w-4 text-emerald-300 flex-shrink-0" />
                      <Link
                        href="mailto:support@DigiverseStory.com"
                        className="text-sm text-emerald-200 hover:text-emerald-100 transition-colors break-all"
                      >
                        support@DigiverseStory.com
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Same for both layouts */}
        <div className="pt-6 border-t border-emerald-200/20">
          <div className="flex flex-col items-center space-y-4 md:flex-row md:justify-between md:space-y-0">
            <p className="text-emerald-200 text-xs text-center md:text-left leading-relaxed">
              © {new Date().getFullYear()} Digiverse Story. All rights
              reserved. Made with ❤️ for young storytellers.
            </p>
            <div className="flex gap-6">
              <Link
                href="/privacy-policy"
                className="text-emerald-200 hover:text-emerald-100 transition-colors text-xs"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="text-emerald-200 hover:text-emerald-100 transition-colors text-xs"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Back to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all hover:-translate-y-1 z-40"
        aria-label="Back to top"
      >
        <FiArrowUp size={18} />
      </button>
    </footer>
  );
};

export default Footer;
