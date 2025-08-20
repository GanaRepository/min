// 'use client';

// import React from 'react';
// import Link from 'next/link';
// import Image from 'next/image';
// import {
//   FiMail,
//   FiPhone,
//   FiMapPin,
//   FiChevronRight,
//   FiArrowUp,
// } from 'react-icons/fi';
// import { FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
// import MintoonsLogo from './MintoonsLogo';

// interface FooterNavItemProps {
//   href: string;
//   children: React.ReactNode;
// }

// const FooterNavItem = ({ href, children }: FooterNavItemProps) => {
//   return (
//     <li className="group">
//       <Link
//         href={href}
//         className="text-gray-800 hover:text-gray-900 transition-colors flex items-center group"
//       >
//         <FiChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-all -ml-5 group-hover:ml-0 text-gray-900" />
//         {children}
//       </Link>
//     </li>
//   );
// };

// const Footer: React.FC = () => {
//   return (
//     <footer
//       className="relative py-8 sm:py-10 md:py-12 bg-gray-100 text-black overflow-hidden"
//       id="contact"
//     >
//       <div className="container mx-auto px-3 sm:px-6">
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-10">
//           {/* Company Info */}
//           <div className="md:col-span-1 mb-8 sm:mb-12">
//             <div className="flex justify-center sm:justify-around items-center h-16 sm:h-20">
//               <Link href="/">
//                 <MintoonsLogo variant="color" />
//               </Link>
//             </div>
//             <p className="text-xs sm:text-sm text-gray-800 mb-2 sm:mb-4">
//               Unleashing Creative Magic Through AI-Powered Storytelling
//             </p>
//             <p className="text-xs sm:text-sm text-gray-800 mb-8 sm:mb-16">
//               Mintoons is the leading creative writing platform for children,
//               empowering young writers to create amazing stories with AI
//               assistance, expert mentorship, and unlimited imagination.
//             </p>

//             <div>
//               <h3 className="text-sm sm:text-base font-bold mb-3 sm:mb-4 relative pl-3 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-green-500">
//                 Connect With Us
//               </h3>
//               <div className="flex gap-3 sm:gap-4">
//                 <Link
//                   href="https://twitter.com/mintoons"
//                   className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200 transition-colors shadow-sm"
//                   aria-label="Twitter"
//                 >
//                   <FaTwitter className="h-5 w-5 text-green-600" />
//                 </Link>
//                 <Link
//                   href="https://www.instagram.com/mintoons_official/"
//                   className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors shadow-sm"
//                   aria-label="Instagram"
//                 >
//                   <FaInstagram className="h-5 w-5 text-pink-600" />
//                 </Link>
//                 <Link
//                   href="https://linkedin.com/company/mintoons"
//                   className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors shadow-sm"
//                   aria-label="LinkedIn"
//                 >
//                   <FaLinkedin className="h-5 w-5 text-blue-600" />
//                 </Link>
//               </div>
//             </div>
//           </div>

//           {/* Quick Links Section */}
//           <div className="md:col-span-1 md:pl-6 lg:pl-12">
//             <h3 className="text-sm sm:text-base font-bold mb-4 sm:mb-6 relative pl-3 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-green-500">
//               Quick Links
//             </h3>
//             <ul className="space-y-2 sm:space-y-4 text-xs sm:text-sm">
//               <li>
//                 <Link
//                   href="/"
//                   className="text-gray-800 hover:text-green-600 transition-colors"
//                 >
//                   Home
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/about"
//                   className="text-gray-800 hover:text-green-600 transition-colors"
//                 >
//                   About Us
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/stories"
//                   className="text-gray-800 hover:text-green-600 transition-colors"
//                 >
//                   Story Gallery
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/how-it-works"
//                   className="text-gray-800 hover:text-green-600 transition-colors"
//                 >
//                   How It Works
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/pricing"
//                   className="text-gray-800 hover:text-green-600 transition-colors"
//                 >
//                   Pricing
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/contact-us"
//                   className="text-gray-800 hover:text-green-600 transition-colors"
//                 >
//                   Contact Us
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/login/child"
//                   className="text-gray-800 hover:text-green-600 transition-colors"
//                 >
//                   Student Login
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/login/mentor"
//                   className="text-gray-800 hover:text-green-600 transition-colors"
//                 >
//                   Mentor Login
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/parent-dashboard"
//                   className="text-gray-800 hover:text-green-600 transition-colors"
//                 >
//                   Parent Dashboard
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           {/* Contact Us Section */}
//           <div className="md:col-span-2">
//             <h3 className="text-sm sm:text-base font-bold mb-4 sm:mb-6 relative pl-3 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-green-500">
//               Contact Us
//             </h3>

//             {/* Office Location Cards */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
//               {/* USA Office Card */}
//               <div className="bg-gradient-to-br from-green-50 to-blue-50 backdrop-blur-sm overflow-hidden shadow-md relative  border border-green-200 min-h-[260px] sm:min-h-[240px]">
//                 <div className="absolute top-0 right-0 bg-blue-600 text-white rounded-bl-lg px-2 py-1 text-xs font-bold z-10">
//                   US
//                 </div>
//                 <div className="h-24 sm:h-40 relative bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
//                   <div className="text-white text-2xl sm:text-4xl font-bold opacity-20">
//                     🇺🇸
//                   </div>
//                 </div>
//                 <div className="p-3 sm:p-4">
//                   <p className="font-bold text-xs sm:text-sm mb-2 sm:mb-4 text-center text-green-700">
//                     USA Office
//                   </p>
//                   <div className="flex items-start mb-2 sm:mb-3">
//                     <FiMapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
//                     <div>
//                       <p className="text-xs sm:text-sm">19401 40th</p>
//                       <p className="text-xs sm:text-sm">Avenue West,</p>
//                       <p className="text-xs sm:text-sm">Suite 115, Lynnwood</p>
//                       <p className="text-xs sm:text-sm">WA 98036</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center text-xs sm:text-sm mb-2 sm:mb-3">
//                     <FiPhone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-green-600 flex-shrink-0" />
//                     <Link
//                       href="tel:+14259005221"
//                       className="hover:text-green-600 transition-colors"
//                     >
//                       +1 (425) 900-5221
//                     </Link>
//                   </div>
//                   <div className="flex items-center text-xs sm:text-sm">
//                     <FiMail className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-green-600 flex-shrink-0" />
//                     <Link
//                       href="mailto:support@mintoons.com"
//                       className="hover:text-green-600 transition-colors"
//                     >
//                       support@mintoons.com
//                     </Link>
//                   </div>
//                 </div>
//               </div>

//               {/* India Office Card */}
//               <div className="bg-gradient-to-br from-orange-50 to-green-50 backdrop-blur-sm overflow-hidden shadow-md relative  border border-orange-200 min-h-[260px] sm:min-h-[240px]">
//                 <div className="absolute top-0 right-0 bg-orange-600 text-white rounded-bl-lg px-2 py-1 text-xs font-bold z-10">
//                   IN
//                 </div>
//                 <div className="h-24 sm:h-40 relative bg-gradient-to-br from-orange-400 to-green-500 flex items-center justify-center">
//                   <div className="text-white text-2xl sm:text-4xl font-bold opacity-20">
//                     🇮🇳
//                   </div>
//                 </div>
//                 <div className="p-3 sm:p-4">
//                   <p className="font-bold text-xs sm:text-sm mb-2 sm:mb-4 text-center text-orange-700">
//                     India Office
//                   </p>
//                   <div className="flex items-start mb-2 sm:mb-3">
//                     <FiMapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 mt-0.5 text-orange-600 flex-shrink-0" />
//                     <div>
//                       <p className="text-xs sm:text-sm">
//                         H No. 3-12-28/87, Plot no 87,
//                       </p>
//                       <p className="text-xs sm:text-sm">
//                         Sy no 92, Mansoorabad,
//                       </p>
//                       <p className="text-xs sm:text-sm">
//                         Saroornagar, Ranga Reddy
//                       </p>
//                       <p className="text-xs sm:text-sm">500 068, Telangana</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center text-xs sm:text-sm mb-2 sm:mb-3">
//                     <FiPhone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-orange-600 flex-shrink-0" />
//                     <Link
//                       href="tel:+14259005221"
//                       className="hover:text-orange-600 transition-colors"
//                     >
//                       +1 (425) 900-5221
//                     </Link>
//                   </div>
//                   <div className="flex items-center text-xs sm:text-sm">
//                     <FiMail className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-orange-600 flex-shrink-0" />
//                     <Link
//                       href="mailto:support@mintoons.com"
//                       className="hover:text-orange-600 transition-colors"
//                     >
//                       support@mintoons.com
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Bar */}
//         <div className="h-px w-full bg-green-200 mb-4 sm:mb-6"></div>

//         <div className="text-gray-800 flex flex-col md:flex-row justify-between items-center gap-2 sm:gap-0">
//           <p className="text-xs sm:text-sm text-center md:text-left">
//             © {new Date().getFullYear()} Mintoons. All rights reserved. Made
//             with ❤️ for young storytellers.
//           </p>
//           <div className="mt-2 sm:mt-4 md:mt-0 flex flex-wrap gap-4 sm:gap-6 justify-center md:justify-end">
//             <Link
//               href="/privacy-policy"
//               className="text-gray-800 hover:text-green-600 transition-colors text-xs"
//             >
//               Privacy Policy
//             </Link>
//             <Link
//               href="/terms-of-service"
//               className="text-gray-800 hover:text-green-600 transition-colors text-xs"
//             >
//               Terms of Service
//             </Link>
//             <Link
//               href="/child-safety"
//               className="text-gray-800 hover:text-green-600 transition-colors text-xs"
//             >
//               Child Safety
//             </Link>
//             <Link
//               href="/parent-guide"
//               className="text-gray-800 hover:text-green-600 transition-colors text-xs"
//             >
//               Parent Guide
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* Back to top button */}
//       <button
//         onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
//         className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all hover:-translate-y-1 z-40"
//         aria-label="Back to top"
//       >
//         <FiArrowUp size={18} />
//       </button>
//     </footer>
//   );
// };

// export default Footer;


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
import MintoonsLogo from './MintoonsLogo';

interface FooterNavItemProps {
  href: string;
  children: React.ReactNode;
}

const FooterNavItem = ({ href, children }: FooterNavItemProps) => {
  return (
    <li className="group">
      <Link
        href={href}
        className="text-emerald-200 hover:text-emerald-100 transition-colors flex items-center group"
      >
        <FiChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-all -ml-5 group-hover:ml-0 text-emerald-300" />
        {children}
      </Link>
    </li>
  );
};

const Footer: React.FC = () => {
  return (
    <footer
      className="relative py-8 sm:py-10 md:py-12 bg-gradient-to-br from-emerald-950/95 via-slate-900/95 to-teal-950/95 backdrop-blur-md text-emerald-50 overflow-hidden px-10"
      id="contact"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-3 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-10">
          {/* Company Info */}
          <div className="md:col-span-1 mb-8 sm:mb-12">
            <div className="flex justify-center sm:justify-around items-center h-16 sm:h-20">
              <Link href="/">
                <MintoonsLogo variant="color" />
              </Link>
            </div>
            <p className="text-xs sm:text-sm text-emerald-200 mb-2 sm:mb-4">
              Unleashing Creative Magic Through AI-Powered Storytelling
            </p>
            <p className="text-xs sm:text-sm text-emerald-200 mb-8 sm:mb-16">
              Mintoons is the leading creative writing platform for children,
              empowering young writers to create amazing stories with AI
              assistance, expert mentorship, and unlimited imagination.
            </p>

            <div>
              <h3 className="text-sm sm:text-base font-bold mb-3 sm:mb-4 relative pl-3 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-emerald-500">
                Connect With Us
              </h3>
              <div className="flex gap-3 sm:gap-4">
                <Link
                  href="https://twitter.com/mintoons"
                  className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/30 transition-colors shadow-sm"
                  aria-label="Twitter"
                >
                  <FaTwitter className="h-5 w-5 text-emerald-300" />
                </Link>
                <Link
                  href="https://www.instagram.com/mintoons_official/"
                  className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/30 transition-colors shadow-sm"
                  aria-label="Instagram"
                >
                  <FaInstagram className="h-5 w-5 text-emerald-300" />
                </Link>
                <Link
                  href="https://linkedin.com/company/mintoons"
                  className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/30 transition-colors shadow-sm"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin className="h-5 w-5 text-emerald-300" />
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="md:col-span-1 md:pl-6 lg:pl-12">
            <h3 className="text-sm sm:text-base font-bold mb-4 sm:mb-6 relative pl-3 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-emerald-500">
              Quick Links
            </h3>
            <ul className="space-y-2 sm:space-y-4 text-xs sm:text-sm">
              <li>
                <Link
                  href="/"
                  className="text-emerald-200 hover:text-emerald-100 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-emerald-200 hover:text-emerald-100 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/create-stories"
                  className="text-emerald-200 hover:text-emerald-100 transition-colors"
                >
                  Create Stories
                </Link>
              </li>
              <li>
                <Link
                  href="/competitons"
                  className="text-emerald-200 hover:text-emerald-100 transition-colors"
                >
                  Competitions
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-emerald-200 hover:text-emerald-100 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-us"
                  className="text-emerald-200 hover:text-emerald-100 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/login/child"
                  className="text-emerald-200 hover:text-emerald-100 transition-colors"
                >
                  Student Login
                </Link>
              </li>
              <li>
                <Link
                  href="/login/mentor"
                  className="text-emerald-200 hover:text-emerald-100 transition-colors"
                >
                  Mentor Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us Section */}
          <div className="md:col-span-2">
            <h3 className="text-sm sm:text-base font-bold mb-4 sm:mb-6 relative pl-3 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-emerald-500">
              Contact Us
            </h3>

            {/* Office Location Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* USA Office Card */}
              <div className="bg-white/10 backdrop-blur-sm overflow-hidden shadow-md relative border border-emerald-200/20 rounded-lg min-h-[260px] sm:min-h-[240px]">
                <div className="absolute top-0 right-0 bg-blue-600 text-white rounded-bl-lg px-2 py-1 text-xs font-bold z-10">
                  US
                </div>
                <div className="h-24 sm:h-40 relative bg-gradient-to-br from-teal-400/80 to-cyan-500/80 flex items-center justify-center">
                  <div className="text-white text-2xl sm:text-4xl font-bold opacity-20">
                    🇺🇸
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <p className="font-bold text-xs sm:text-sm mb-2 sm:mb-4 text-center text-emerald-300">
                    USA Office
                  </p>
                  <div className="flex items-start mb-2 sm:mb-3">
                    <FiMapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 mt-0.5 text-emerald-300 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm">19401 40th</p>
                      <p className="text-xs sm:text-sm">Avenue West,</p>
                      <p className="text-xs sm:text-sm">Suite 115, Lynnwood</p>
                      <p className="text-xs sm:text-sm">WA 98036</p>
                    </div>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm mb-2 sm:mb-3">
                    <FiPhone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-emerald-300 flex-shrink-0" />
                    <Link
                      href="tel:+14259005221"
                      className="hover:text-emerald-100 transition-colors"
                    >
                      +1 (425) 900-5221
                    </Link>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm">
                    <FiMail className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-emerald-300 flex-shrink-0" />
                    <Link
                      href="mailto:support@mintoons.com"
                      className="hover:text-emerald-100 transition-colors"
                    >
                      support@mintoons.com
                    </Link>
                  </div>
                </div>
              </div>

              {/* India Office Card */}
              <div className="bg-white/10 backdrop-blur-sm overflow-hidden shadow-md relative border border-emerald-200/20 rounded-lg min-h-[260px] sm:min-h-[240px]">
                <div className="absolute top-0 right-0 bg-orange-600 text-white rounded-bl-lg px-2 py-1 text-xs font-bold z-10">
                  IN
                </div>
                <div className="h-24 sm:h-40 relative bg-gradient-to-br from-orange-400/80 to-yellow-500/80 flex items-center justify-center">
                  <div className="text-white text-2xl sm:text-4xl font-bold opacity-20">
                    🇮🇳
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <p className="font-bold text-xs sm:text-sm mb-2 sm:mb-4 text-center text-emerald-300">
                    India Office
                  </p>
                  <div className="flex items-start mb-2 sm:mb-3">
                    <FiMapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 mt-0.5 text-emerald-300 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm">
                        H No. 3-12-28/87, Plot no 87,
                      </p>
                      <p className="text-xs sm:text-sm">
                        Sy no 92, Mansoorabad,
                      </p>
                      <p className="text-xs sm:text-sm">
                        Saroornagar, Ranga Reddy
                      </p>
                      <p className="text-xs sm:text-sm">500 068, Telangana</p>
                    </div>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm mb-2 sm:mb-3">
                    <FiPhone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-emerald-300 flex-shrink-0" />
                    <Link
                      href="tel:+14259005221"
                      className="hover:text-emerald-100 transition-colors"
                    >
                      +1 (425) 900-5221
                    </Link>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm">
                    <FiMail className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-emerald-300 flex-shrink-0" />
                    <Link
                      href="mailto:support@mintoons.com"
                      className="hover:text-emerald-100 transition-colors"
                    >
                      support@mintoons.com
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="h-px w-full bg-emerald-200/30 mb-4 sm:mb-6"></div>

        <div className="text-emerald-200 flex flex-col md:flex-row justify-between items-center gap-2 sm:gap-0">
          <p className="text-xs sm:text-sm text-center md:text-left">
            © {new Date().getFullYear()} Mintoons. All rights reserved. Made
            with ❤️ for young storytellers.
          </p>
          <div className="mt-2 sm:mt-4 md:mt-0 flex flex-wrap gap-4 sm:gap-6 justify-center md:justify-end">
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
            <Link
              href="/child-safety"
              className="text-emerald-200 hover:text-emerald-100 transition-colors text-xs"
            >
              Child Safety
            </Link>
            <Link
              href="/parent-guide"
              className="text-emerald-200 hover:text-emerald-100 transition-colors text-xs"
            >
              Parent Guide
            </Link>
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