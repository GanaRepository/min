// components/Navbar.tsx - UPDATED VERSION (Remove admin route check since it's handled in layout)
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FiChevronDown, FiMenu, FiX, FiLogIn } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogOut, User, Building } from 'lucide-react';
import Image from 'next/image';
import MintoonsLogo from './MintoonsLogo';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Get user display name
  const getUserDisplayName = (): string => {
    if (!session?.user) return '';
    if (
      (session.user.role === 'child' ||
        session.user.role === 'mentor' ||
        session.user.role === 'admin') &&
      session.user.firstName &&
      session.user.lastName
    ) {
      return `${session.user.firstName} ${session.user.lastName}`;
    }
    return session.user.email ? session.user.email.split('@')[0] : '';
  };

  // Get avatar color and letter based on role
  const getAvatarInfo = () => {
    if (!session?.user)
      return { icon: <User className="h-5 w-5" />, color: 'bg-gray-500' };

    const displayName = getUserDisplayName();
    const initial = displayName ? displayName.charAt(0).toUpperCase() : '?';

    if (session.user.role === 'child') {
      return {
        initial,
        color: 'bg-contact-teal',
      };
    }
    // mentor, admin, and default
    return {
      initial,
      color: 'bg-contact-purple',
    };
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatarInfo = getAvatarInfo();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-gray-900/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="mt-3 flex items-center space-x-3 group transition-all duration-300 hover:scale-105"
            >
              <span className="sr-only">Mintoons</span>
              <Image
                src="/min_logo3.png"
                alt="Mintoons Logo"
                width={150}
                height={150}
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-lg  transition-all duration-300 hover:text-contact-teal ${
                pathname === '/'
                  ? 'text-contact-teal border-b-2 border-contact-teal pb-1'
                  : isScrolled
                    ? 'text-gray-300 hover:text-contact-teal'
                    : 'text-white hover:text-contact-teal'
              }`}
            >
              Home
            </Link>

            <Link
              href="/create-stories"
              className={`text-lg  transition-all duration-300 hover:text-contact-teal ${
                pathname === '/create-stories'
                  ? 'text-contact-teal border-b-2 border-contact-teal pb-1'
                  : isScrolled
                    ? 'text-gray-300 hover:text-contact-teal'
                    : 'text-white hover:text-contact-teal'
              }`}
            >
              Create Stories
            </Link>

            <Link
              href="/contact-us"
              className={`text-lg  transition-all duration-300 hover:text-contact-teal ${
                pathname === '/contact-us'
                  ? 'text-contact-teal border-b-2 border-contact-teal pb-1'
                  : isScrolled
                    ? 'text-gray-300 hover:text-contact-teal'
                    : 'text-white hover:text-contact-teal'
              }`}
            >
              Contact Us
            </Link>

            <Link
              href="/pricing"
              className={`text-lg  transition-all duration-300 hover:text-contact-teal ${
                pathname === '/pricing'
                  ? 'text-contact-teal border-b-2 border-contact-teal pb-1'
                  : isScrolled
                    ? 'text-gray-300 hover:text-contact-teal'
                    : 'text-white hover:text-contact-teal'
              }`}
            >
              Pricing
            </Link>

            <Link
              href="/competitions"
              className={`text-lg  transition-all duration-300 hover:text-contact-teal ${
                pathname === '/competitions'
                  ? 'text-contact-teal border-b-2 border-contact-teal pb-1'
                  : isScrolled
                    ? 'text-gray-300 hover:text-contact-teal'
                    : 'text-white hover:text-contact-teal'
              }`}
            >
              Competitions
            </Link>

            {/* User Menu or Login */}
            {status === 'loading' ? (
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
            ) : session ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={toggleUserMenu}
                  className={`flex items-center space-x-2 p-2 rounded-full transition-colors duration-200 ${
                    isScrolled ? 'hover:bg-gray-800' : 'hover:bg-white/10'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white  ${avatarInfo.color}`}
                  >
                    {avatarInfo.initial || avatarInfo.icon}
                  </div>
                  <FiChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    } ${isScrolled ? 'text-gray-300' : 'text-white'}`}
                  />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm  text-gray-900">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {session.user.role}
                      </p>
                    </div>

                    {session.user.role === 'child' && (
                      <Link
                        href="/children-dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        Dashboard
                      </Link>
                    )}

                    {session.user.role === 'mentor' && (
                      <Link
                        href="/mentor-dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        Mentor Dashboard
                      </Link>
                    )}

                    {session.user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Building className="w-4 h-4 mr-3" />
                        Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        router.push('/logout');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className={`text-lg  transition-all duration-300 ${
                      isScrolled
                        ? 'text-gray-300 hover:text-contact-teal hover:bg-contact-teal/10'
                        : 'text-white hover:text-contact-teal hover:bg-white/10'
                    }`}
                  >
                    <FiLogIn className="w-5 h-5 mr-2" />
                    Login
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className={`p-2 rounded-md transition-colors duration-200 ${
                isScrolled
                  ? 'text-gray-300 hover:text-contact-teal hover:bg-gray-800'
                  : 'text-white hover:text-contact-teal hover:bg-white/10'
              }`}
            >
              {isMobileMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-700 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                className={`block px-3 py-2 text-base  rounded-md transition-colors duration-200 ${
                  pathname === '/'
                    ? 'text-contact-teal bg-contact-teal/20'
                    : 'text-gray-300 hover:text-contact-teal hover:bg-gray-800'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>

              <Link
                href="/create-stories"
                className={`block px-3 py-2 text-base  rounded-md transition-colors duration-200 ${
                  pathname === '/create-stories'
                    ? 'text-contact-teal bg-contact-teal/20'
                    : 'text-gray-300 hover:text-contact-teal hover:bg-gray-800'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Create Stories
              </Link>

              <Link
                href="/contact-us"
                className={`block px-3 py-2 text-base  rounded-md transition-colors duration-200 ${
                  pathname === '/contact-us'
                    ? 'text-contact-teal bg-contact-teal/20'
                    : 'text-gray-300 hover:text-contact-teal hover:bg-gray-800'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact Us
              </Link>

              <Link
                href="/pricing"
                className={`block px-3 py-2 text-base  rounded-md transition-colors duration-200 ${
                  pathname === '/pricing'
                    ? 'text-contact-teal bg-contact-teal/20'
                    : 'text-gray-300 hover:text-contact-teal hover:bg-gray-800'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>

              <Link
                href="/competitions"
                className={`block px-3 py-2 text-base  rounded-md transition-colors duration-200 ${
                  pathname === '/competitions'
                    ? 'text-contact-teal bg-contact-teal/20'
                    : 'text-gray-300 hover:text-contact-teal hover:bg-gray-800'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Competitions
              </Link>

              {!session && (
                <Link
                  href="/login"
                  className="block px-3 py-2 text-base  text-gray-300 hover:text-contact-teal hover:bg-gray-800 rounded-md transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiLogIn className="w-5 h-5 mr-2 inline" />
                  Login
                </Link>
              )}
            </div>

            {session && (
              <div className="pt-4 pb-3 border-t border-gray-700">
                <div className="flex items-center px-5">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white  ${avatarInfo.color}`}
                  >
                    {avatarInfo.initial || avatarInfo.icon}
                  </div>
                  <div className="ml-3">
                    <div className="text-base  text-gray-200">
                      {getUserDisplayName()}
                    </div>
                    <div className="text-sm text-gray-400 capitalize">
                      {session.user.role}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  {session.user.role === 'child' && (
                    <Link
                      href="/children-dashboard"
                      className="block px-3 py-2 text-base  text-gray-300 hover:text-contact-teal hover:bg-gray-800 rounded-md transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}

                  {session.user.role === 'mentor' && (
                    <Link
                      href="/mentor-dashboard"
                      className="block px-3 py-2 text-base  text-gray-300 hover:text-contact-teal hover:bg-gray-800 rounded-md transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Mentor Dashboard
                    </Link>
                  )}

                  {session.user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="block px-3 py-2 text-base  text-gray-300 hover:text-contact-teal hover:bg-gray-800 rounded-md transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      // Handle sign out
                    }}
                    className="block w-full text-left px-3 py-2 text-base  text-red-400 hover:bg-red-900/20 rounded-md transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
