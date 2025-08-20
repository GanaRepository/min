// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import Link from 'next/link';
// import { Button } from '@/components/ui/button';
// import { FiChevronDown, FiMenu, FiX, FiLogIn } from 'react-icons/fi';
// import { usePathname } from 'next/navigation';
// import { useSession } from 'next-auth/react';
// import { LogOut, User, Building } from 'lucide-react';
// import Image from 'next/image';
// import MintoonsLogo from './MintoonsLogo';

// const Navbar = () => {
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
//   const pathname = usePathname();
//   const userMenuRef = useRef<HTMLDivElement>(null);
//   const { data: session, status } = useSession();

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 20);
//     };

//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const toggleMobileMenu = () => {
//     setIsMobileMenuOpen(!isMobileMenuOpen);
//   };

//   const toggleUserMenu = () => {
//     setIsUserMenuOpen(!isUserMenuOpen);
//   };

//   // Get user display name
//   const getUserDisplayName = (): string => {
//     if (!session?.user) return '';
//     if (
//       (session.user.role === 'child' ||
//         session.user.role === 'mentor' ||
//         session.user.role === 'admin') &&
//       session.user.firstName &&
//       session.user.lastName
//     ) {
//       return `${session.user.firstName} ${session.user.lastName}`;
//     }
//     return session.user.email ? session.user.email.split('@')[0] : '';
//   };

//   // Get avatar color and letter based on role
//   const getAvatarInfo = () => {
//     if (!session?.user)
//       return { icon: <User className="h-5 w-5" />, color: 'bg-gray-500' };

//     const displayName = getUserDisplayName();
//     const initial = displayName ? displayName.charAt(0).toUpperCase() : '?';

//     if (session.user.role === 'child') {
//       return {
//         initial,
//         color: 'bg-contact-teal',
//       };
//     }
//     // mentor, admin, and default
//     return {
//       initial,
//       color: 'bg-contact-purple',
//     };
//   };

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         userMenuRef.current &&
//         !userMenuRef.current.contains(event.target as Node)
//       ) {
//         setIsUserMenuOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // Check if the current route is an admin route
//   const isAdminRoute = pathname.startsWith('/admin');

//   if (isAdminRoute) {
//     return null; // Hide the Navbar in admin routes
//   }

//   const avatarInfo = getAvatarInfo();

//   return (
//     <nav
//       className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
//         isScrolled
//           ? 'bg-white/95 backdrop-blur-md shadow-md'
//           : 'bg-[#EAF6F6] backdrop-blur-sm'
//       }`}
//     >
//       <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-around items-center h-20">
//           <Link href="/">
//             <MintoonsLogo variant="color" />
//           </Link>

//           <div className="hidden md:flex items-center space-x-8">
//             <Link
//               href="/"
//               className="text-black hover:text-contact-purple transition-colors"
//             >
//               Home
//             </Link>
//             <Link
//               href="/create-stories"
//               className="text-black hover:text-contact-purple transition-colors"
//             >
//               Create Stories
//             </Link>

//             <Link
//               href="/contact-us"
//               className="text-black hover:text-contact-purple transition-colors"
//             >
//               Contact Us
//             </Link>
//             <Link
//               href="/pricing"
//               className="text-black hover:text-contact-purple transition-colors"
//             >
//               Pricing
//             </Link>
//             <Link
//               href="/competitions"
//               className="text-black hover:text-contact-purple transition-colors"
//             >
//               Competitions
//             </Link>
//           </div>

//           <div className="hidden md:flex items-center space-x-4">
//             {/* Show either Login Portal button or User Profile based on authentication status */}
//             {status === 'authenticated' ? (
//               <div className="relative" ref={userMenuRef}>
//                 <button
//                   onClick={toggleUserMenu}
//                   className="flex items-center space-x-2 text-sm text-gray-700 hover:text-contact-purple transition-colors"
//                 >
//                   <div
//                     className={`w-8 h-8 ${avatarInfo.color} rounded-full flex items-center justify-center text-white`}
//                   >
//                     {avatarInfo.icon || <span>{avatarInfo.initial}</span>}
//                   </div>
//                   <span className="max-w-[150px] truncate">
//                     {getUserDisplayName()}
//                   </span>
//                   <FiChevronDown
//                     className={`h-4 w-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
//                   />
//                 </button>

//                 {isUserMenuOpen && (
//                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
//                     <div className="px-4 py-2 border-b border-gray-100">
//                       <p className="text-sm  text-gray-900">
//                         {getUserDisplayName()}
//                       </p>
//                       <p className="text-xs text-gray-500">
//                         {session?.user?.email}
//                       </p>
//                       <p className="text-xs text-gray-500 capitalize mt-1">
//                         {session?.user?.role} Account
//                       </p>
//                     </div>

//                     <Link
//                       href="/profile"
//                       onClick={() => setIsUserMenuOpen(false)}
//                       className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
//                     >
//                       <User className="h-4 w-4 mr-2" />
//                       My Profile
//                     </Link>

//                     <Link
//                       href="/logout"
//                       onClick={() => setIsUserMenuOpen(false)}
//                       className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left flex items-center"
//                     >
//                       <LogOut className="h-4 w-4 mr-2" />
//                       Log Out
//                     </Link>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <Button className="bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white hover:opacity-90 flex items-center gap-1">
//                 <Link href="/login" className="flex items-center">
//                   <FiLogIn className="w-4 h-4 mr-3" />
//                   Login Portal
//                 </Link>
//               </Button>
//             )}
//           </div>

//           {/* Mobile View - Profile/Avatar or Menu Button (removed separate login icon) */}
//           <div className="md:hidden flex items-center space-x-3">
//             {status === 'authenticated' && (
//               <div className="relative">
//                 <button onClick={toggleUserMenu} className="flex items-center">
//                   <div
//                     className={`w-8 h-8 ${avatarInfo.color} rounded-full flex items-center justify-center text-white`}
//                   >
//                     {avatarInfo.icon || <span>{avatarInfo.initial}</span>}
//                   </div>
//                 </button>

//                 {isUserMenuOpen && (
//                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
//                     <div className="px-4 py-2 border-b border-gray-100">
//                       <p className="text-sm  text-gray-900">
//                         {getUserDisplayName()}
//                       </p>
//                       <p className="text-xs text-gray-500">
//                         {session?.user?.email}
//                       </p>
//                     </div>

//                     <Link
//                       href="/profile"
//                       onClick={() => setIsUserMenuOpen(false)}
//                       className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     >
//                       My Profile
//                     </Link>

//                     <Link
//                       href="/logout"
//                       onClick={() => setIsUserMenuOpen(false)}
//                       className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
//                     >
//                       Log Out
//                     </Link>
//                   </div>
//                 )}
//               </div>
//             )}

//             <button className="p-2 text-black" onClick={toggleMobileMenu}>
//               {isMobileMenuOpen ? (
//                 <FiX className="w-6 h-6" />
//               ) : (
//                 <FiMenu className="w-6 h-6" />
//               )}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Menu */}
//       {isMobileMenuOpen && (
//         <div className="md:hidden bg-white shadow-lg py-4 px-4">
//           <div className="flex flex-col space-y-3">
//             {/* User Profile section (if logged in) */}
//             {status === 'authenticated' && (
//               <div className="mb-2 pb-3 border-b border-gray-200">
//                 <div className="flex items-center space-x-3 mb-2">
//                   <div
//                     className={`w-10 h-10 ${avatarInfo.color} rounded-full flex items-center justify-center text-white`}
//                   >
//                     {avatarInfo.icon || (
//                       <span className="text-lg ">
//                         {avatarInfo.initial}
//                       </span>
//                     )}
//                   </div>
//                   <div>
//                     <p className=" text-gray-900">
//                       {getUserDisplayName()}
//                     </p>
//                     <p className="text-xs text-gray-500 capitalize">
//                       {session.user.role} Account
//                     </p>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 gap-2 mt-2">
//                   <Link
//                     href="/profile"
//                     className="text-sm text-contact-purple hover:text-contact-purple/80 transition-colors"
//                     onClick={() => setIsMobileMenuOpen(false)}
//                   >
//                     My Profile
//                   </Link>
//                   <Link
//                     href="/logout"
//                     onClick={() => setIsMobileMenuOpen(false)}
//                     className="text-sm text-red-600 hover:text-red-700 text-left"
//                   >
//                     Log Out
//                   </Link>
//                 </div>
//               </div>
//             )}

//             {/* Navigation Links */}
//             <Link
//               href="/"
//               className="text-black hover:text-contact-purple transition-colors py-2"
//               onClick={() => setIsMobileMenuOpen(false)}
//             >
//               Home
//             </Link>
//             <Link
//               href="/create-stories"
//               className="text-black hover:text-contact-purple transition-colors"
//             >
//               Create Stories
//             </Link>

//             <Link
//               href="/contact-us"
//               className="text-black hover:text-contact-purple transition-colors py-2"
//               onClick={() => setIsMobileMenuOpen(false)}
//             >
//               Contact Us
//             </Link>
//             <Link
//               href="/pricing"
//               className="text-black hover:text-contact-purple transition-colors"
//             >
//               Pricing
//             </Link>
//             <Link
//               href="/competitions"
//               className="text-black hover:text-contact-purple transition-colors py-2"
//               onClick={() => setIsMobileMenuOpen(false)}
//             >
//               Competitions
//             </Link>

//             {/* Login button (if not logged in) */}
//             {status !== 'authenticated' && (
//               <div className="pt-3 mt-2 border-t border-gray-200">
//                 <Button className="bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white hover:opacity-90 w-full flex items-center justify-center gap-1 mt-2">
//                   <Link
//                     href="/login"
//                     className="flex items-center justify-center w-full"
//                     onClick={() => setIsMobileMenuOpen(false)}
//                   >
//                     <FiLogIn className="w-4 h-4 mr-1" />
//                     Login Portal
//                   </Link>
//                 </Button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;

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
        isScrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
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
