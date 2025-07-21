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
//       className="relative py-12 bg-gray-100  text-black overflow-hidden"
//       id="contact"
//     >
//       <div className="container mx-auto px-6">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-10">
//           {/* Company Info */}

//           <div className="md:col-span-1 mb-12">
//             <div className="flex justify-around items-center h-20">
//               <Link href="/">
//                 <MintoonsLogo
//                   size="lg"
//                   theme="professional"
//                   animated={true}
//                   showText={true}
//                 />
//               </Link>
//             </div>
//             <p className="text-sm text-gray-800 mb-4">
//               Powering Your Growth with Exceptional Technology Talent
//             </p>
//             <p className="text-sm text-gray-800 mb-16">
//               Pioneer IT Systems is a leading provider of IT services and
//               solutions, helping businesses transform through technology to meet
//               the growing demands of the digital era.
//             </p>

//             <div>
//               <h3 className="text-base font-bold mb-4 relative pl-3 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-gray-800">
//                 Connect With Us
//               </h3>
//               <div className="flex space-x-4">
//                 <Link
//                   href="https://x.com/pioneer_it_sys"
//                   className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center hover:bg-white/60 transition-colors shadow-sm"
//                   aria-label="Twitter"
//                 >
//                   <FaTwitter className="h-5 w-5 text-gray-800" />
//                 </Link>
//                 <Link
//                   href="https://www.instagram.com/pioneerit_systems/"
//                   className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center hover:bg-white/60 transition-colors shadow-sm"
//                   aria-label="Instagram"
//                 >
//                   <FaInstagram className="h-5 w-5 text-gray-800" />
//                 </Link>
//                 {/* <Link
//                   href="#"
//                   className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center hover:bg-white/60 transition-colors shadow-sm"
//                   aria-label="LinkedIn"
//                 >
//                   <FaLinkedin className="h-5 w-5 text-gray-800" />
//                 </Link> */}
//               </div>
//             </div>
//           </div>

//           {/* Quick Links Section */}
//           <div className="md:col-span-1 md:pl-12">
//             <h3 className="text-base font-bold mb-6 relative pl-3 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-gray-800">
//               Quick Links
//             </h3>
//             <ul className="space-y-4 text-sm">
//               <li>
//                 <Link
//                   href="/"
//                   className="text-gray-800 hover:text-gray-900 transition-colors"
//                 >
//                   Home
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/about"
//                   className="text-gray-800 hover:text-gray-900 transition-colors"
//                 >
//                   About Us
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/services"
//                   className="text-gray-800 hover:text-gray-900 transition-colors"
//                 >
//                   Our Services
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/careers"
//                   className="text-gray-800 hover:text-gray-900 transition-colors"
//                 >
//                   Careers
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/contact-us"
//                   className="text-gray-800 hover:text-gray-900 transition-colors"
//                 >
//                   Contact Us
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/media"
//                   className="text-gray-800 hover:text-gray-900 transition-colors"
//                 >
//                   Media
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/login/candidate"
//                   className="text-gray-800 hover:text-gray-900 transition-colors"
//                 >
//                   Candidate Login
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/login/business"
//                   className="text-gray-800 hover:text-gray-900 transition-colors"
//                 >
//                   Business Login
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/login/employee"
//                   className="text-gray-800 hover:text-gray-900 transition-colors"
//                 >
//                   Employee Login
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           {/* Contact Us Section */}
//           <div className="md:col-span-2">
//             <h3 className="text-base font-bold mb-6 relative pl-3 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-gray-800">
//               Contact Us
//             </h3>

//             {/* Office Location Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* USA Office Card */}
//               <div className="bg-white/30 backdrop-blur-sm  overflow-hidden shadow-md relative">
//                 <div className="absolute top-0 right-0 bg-white rounded-bl-lg px-2 py-1 text-xs font-bold text-gray-900 z-10">
//                   US
//                 </div>
//                 <div className="h-40 relative">
//                   <Image
//                     src="/new8.jpg"
//                     alt="USA Office"
//                     fill
//                     className="opacity-90 object-cover object-top"
//                   />
//                 </div>
//                 <div className="p-4">
//                   <p className="font-bold text-sm mb-4 text-center">
//                     USA Office
//                   </p>
//                   <div className="flex items-start mb-3">
//                     <FiMapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-900 flex-shrink-0" />
//                     <div>
//                       <p className="text-sm">19401 40th </p>
//                       <p className="text-sm">Avenue West,</p>
//                       <p className="text-sm">Suite 115, Lynnwood </p>
//                       <p className="text-sm">WA 98036</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center text-sm mb-3">
//                     <FiPhone className="h-4 w-4 mr-2 text-gray-900 flex-shrink-0" />
//                     <Link
//                       href="tel:+14259987100"
//                       className="hover:text-gray-900 transition-colors"
//                     >
//                       +1 (425) 900-5221
//                     </Link>
//                   </div>
//                   <div className="flex items-center text-sm">
//                     <FiMail className="h-4 w-4 mr-2 text-gray-900 flex-shrink-0" />
//                     <Link
//                       href="mailto:info@pioneeritsystems.com"
//                       className="hover:text-gray-900 transition-colors"
//                     >
//                       hr@pioneeritsystems.com
//                     </Link>
//                   </div>
//                 </div>
//               </div>

//               {/* India Office Card */}
//               <div className="bg-white/30 backdrop-blur-sm  overflow-hidden shadow-md relative">
//                 <div className="absolute top-0 right-0 bg-white rounded-bl-lg px-2 py-1 text-xs font-bold text-gray-900 z-10">
//                   IN
//                 </div>
//                 <div className="h-40 relative">
//                   <Image
//                     src="/new6.jpg"
//                     alt="India Office"
//                     fill
//                     className="opacity-90 object-cover"
//                   />
//                 </div>
//                 <div className="p-4">
//                   <p className="font-bold text-sm mb-4 text-center">
//                     India Office
//                   </p>
//                   <div className="flex items-start mb-3">
//                     <FiMapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-900 flex-shrink-0" />
//                     <div>
//                       <p className="text-sm">H No. 3-12-28/87, Plot no 87,</p>
//                       <p className="text-sm">Sy no 92, Mansoorabad,</p>
//                       <p className="text-sm">Saroornagar, Ranga Reddy</p>
//                       <p className="text-sm">500 068, Telangana</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center text-sm mb-3">
//                     <FiPhone className="h-4 w-4 mr-2 text-gray-900 flex-shrink-0" />
//                     <Link
//                       href="tel:+14259987100"
//                       className="hover:text-gray-900 transition-colors"
//                     >
//                       +1 (425) 900-5221
//                     </Link>
//                   </div>
//                   <div className="flex items-center text-sm">
//                     <FiMail className="h-4 w-4 mr-2 text-gray-900 flex-shrink-0" />
//                     <Link
//                       href="mailto:hr@pioneeritsystems.com"
//                       className="hover:text-gray-900 transition-colors"
//                     >
//                       hr@pioneeritsystems.com
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Bar */}
//         <div className="h-px w-full bg-gray-800/30 mb-6"></div>

//         <div className="text-gray-800 flex flex-col md:flex-row justify-between items-center">
//           <p className="text-sm">
//             © {new Date().getFullYear()} Pioneer IT Systems. All rights
//             reserved.
//           </p>
//           <div className="mt-4 md:mt-0 flex flex-wrap gap-6">
//             <Link
//               href="/privacy-policy"
//               className="text-gray-800 hover:text-gray-900 transition-colors text-xs"
//             >
//               Privacy Policy
//             </Link>
//             <Link
//               href="/terms-of-service"
//               className="text-gray-800 hover:text-gray-900 transition-colors text-xs"
//             >
//               Terms of Service
//             </Link>
//             <Link
//               href="/cookie-policy"
//               className="text-gray-800 hover:text-gray-900 transition-colors text-xs"
//             >
//               Cookie Policy
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* Back to top button */}
//       <button
//         onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
//         className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-white text-gray-800 flex items-center justify-center shadow-lg hover:bg-gray-100 transition-all hover:-translate-y-1 z-40"
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
        className="text-gray-800 hover:text-gray-900 transition-colors flex items-center group"
      >
        <FiChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-all -ml-5 group-hover:ml-0 text-gray-900" />
        {children}
      </Link>
    </li>
  );
};

const Footer: React.FC = () => {
  return (
    <footer
      className="relative py-12 bg-gray-100 text-black overflow-hidden"
      id="contact"
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-10">
          {/* Company Info */}
          <div className="md:col-span-1 mb-12">
            <div className="flex justify-around items-center h-20">
              <Link href="/">
                <MintoonsLogo
                  size="lg"
                  theme="magical"
                  animated={true}
                  showText={true}
                />
              </Link>
            </div>
            <p className="text-sm text-gray-800 mb-4">
              Unleashing Creative Magic Through AI-Powered Storytelling
            </p>
            <p className="text-sm text-gray-800 mb-16">
              Mintoons is the leading creative writing platform for children,
              empowering young writers to create amazing stories with AI
              assistance, expert mentorship, and unlimited imagination.
            </p>

            <div>
              <h3 className="text-base font-bold mb-4 relative pl-3 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-green-500">
                Connect With Us
              </h3>
              <div className="flex space-x-4">
                <Link
                  href="https://twitter.com/mintoons"
                  className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200 transition-colors shadow-sm"
                  aria-label="Twitter"
                >
                  <FaTwitter className="h-5 w-5 text-green-600" />
                </Link>
                <Link
                  href="https://www.instagram.com/mintoons_official/"
                  className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors shadow-sm"
                  aria-label="Instagram"
                >
                  <FaInstagram className="h-5 w-5 text-pink-600" />
                </Link>
                <Link
                  href="https://linkedin.com/company/mintoons"
                  className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors shadow-sm"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin className="h-5 w-5 text-blue-600" />
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="md:col-span-1 md:pl-12">
            <h3 className="text-base font-bold mb-6 relative pl-3 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-green-500">
              Quick Links
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-gray-800 hover:text-green-600 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-800 hover:text-green-600 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/stories"
                  className="text-gray-800 hover:text-green-600 transition-colors"
                >
                  Story Gallery
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-gray-800 hover:text-green-600 transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-gray-800 hover:text-green-600 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-us"
                  className="text-gray-800 hover:text-green-600 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/login/child"
                  className="text-gray-800 hover:text-green-600 transition-colors"
                >
                  Student Login
                </Link>
              </li>
              <li>
                <Link
                  href="/login/mentor"
                  className="text-gray-800 hover:text-green-600 transition-colors"
                >
                  Mentor Login
                </Link>
              </li>
              <li>
                <Link
                  href="/parent-dashboard"
                  className="text-gray-800 hover:text-green-600 transition-colors"
                >
                  Parent Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us Section */}
          <div className="md:col-span-2">
            <h3 className="text-base font-bold mb-6 relative pl-3 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-green-500">
              Contact Us
            </h3>

            {/* Office Location Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* USA Office Card */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 backdrop-blur-sm overflow-hidden shadow-md relative rounded-lg border border-green-200">
                <div className="absolute top-0 right-0 bg-blue-600 text-white rounded-bl-lg px-2 py-1 text-xs font-bold z-10">
                  US
                </div>
                <div className="h-40 relative bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <div className="text-white text-4xl font-bold opacity-20">
                    🇺🇸
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-bold text-sm mb-4 text-center text-green-700">
                    USA Office
                  </p>
                  <div className="flex items-start mb-3">
                    <FiMapPin className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm">19401 40th</p>
                      <p className="text-sm">Avenue West,</p>
                      <p className="text-sm">Suite 115, Lynnwood</p>
                      <p className="text-sm">WA 98036</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm mb-3">
                    <FiPhone className="h-4 w-4 mr-2 text-green-600 flex-shrink-0" />
                    <Link
                      href="tel:+14259005221"
                      className="hover:text-green-600 transition-colors"
                    >
                      +1 (425) 900-5221
                    </Link>
                  </div>
                  <div className="flex items-center text-sm">
                    <FiMail className="h-4 w-4 mr-2 text-green-600 flex-shrink-0" />
                    <Link
                      href="mailto:support@mintoons.com"
                      className="hover:text-green-600 transition-colors"
                    >
                      support@mintoons.com
                    </Link>
                  </div>
                </div>
              </div>

              {/* India Office Card */}
              <div className="bg-gradient-to-br from-orange-50 to-green-50 backdrop-blur-sm overflow-hidden shadow-md relative rounded-lg border border-orange-200">
                <div className="absolute top-0 right-0 bg-orange-600 text-white rounded-bl-lg px-2 py-1 text-xs font-bold z-10">
                  IN
                </div>
                <div className="h-40 relative bg-gradient-to-br from-orange-400 to-green-500 flex items-center justify-center">
                  <div className="text-white text-4xl font-bold opacity-20">
                    🇮🇳
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-bold text-sm mb-4 text-center text-orange-700">
                    India Office
                  </p>
                  <div className="flex items-start mb-3">
                    <FiMapPin className="h-4 w-4 mr-2 mt-0.5 text-orange-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm">H No. 3-12-28/87, Plot no 87,</p>
                      <p className="text-sm">Sy no 92, Mansoorabad,</p>
                      <p className="text-sm">Saroornagar, Ranga Reddy</p>
                      <p className="text-sm">500 068, Telangana</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm mb-3">
                    <FiPhone className="h-4 w-4 mr-2 text-orange-600 flex-shrink-0" />
                    <Link
                      href="tel:+14259005221"
                      className="hover:text-orange-600 transition-colors"
                    >
                      +1 (425) 900-5221
                    </Link>
                  </div>
                  <div className="flex items-center text-sm">
                    <FiMail className="h-4 w-4 mr-2 text-orange-600 flex-shrink-0" />
                    <Link
                      href="mailto:support@mintoons.com"
                      className="hover:text-orange-600 transition-colors"
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
        <div className="h-px w-full bg-green-200 mb-6"></div>

        <div className="text-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">
            © {new Date().getFullYear()} Mintoons. All rights reserved. Made
            with ❤️ for young storytellers.
          </p>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-6">
            <Link
              href="/privacy-policy"
              className="text-gray-800 hover:text-green-600 transition-colors text-xs"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-gray-800 hover:text-green-600 transition-colors text-xs"
            >
              Terms of Service
            </Link>
            <Link
              href="/child-safety"
              className="text-gray-800 hover:text-green-600 transition-colors text-xs"
            >
              Child Safety
            </Link>
            <Link
              href="/parent-guide"
              className="text-gray-800 hover:text-green-600 transition-colors text-xs"
            >
              Parent Guide
            </Link>
          </div>
        </div>
      </div>

      {/* Back to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all hover:-translate-y-1 z-40"
        aria-label="Back to top"
      >
        <FiArrowUp size={18} />
      </button>
    </footer>
  );
};

export default Footer;
