// 'use client';

// import React from 'react';
// import { useInView } from 'react-intersection-observer';
// import { Building, User, ArrowRight, UserCircle } from 'lucide-react';
// import Link from 'next/link';

// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';

// type LoginOption = {
//   id: string;
//   title: string;
//   description: string;
//   icon: React.ReactNode;
//   link: string;
// };

// const LoginPage: React.FC = () => {
//   const { ref: heroRef, inView: heroInView } = useInView({
//     triggerOnce: true,
//     threshold: 0.1,
//   });

//   const { ref: cardsRef, inView: cardsInView } = useInView({
//     triggerOnce: true,
//     threshold: 0.1,
//   });

//   const loginOptions: LoginOption[] = [
//     {
//       id: 'candidate',
//       title: 'Candidate',
//       description:
//         'For job seekers looking to apply for positions or manage their application profile.',
//       icon: <User className="h-8 w-8" />,
//       link: '/login/child',
//     },

//     {
//       id: 'employee',
//       title: 'Employee',
//       description:
//         'For staff members to manage timesheets and access company resources.',
//       icon: <UserCircle className="h-8 w-8" />,
//       link: '/login/mentor',
//     },
//   ];

//   return (
//     <>
//         <div className="h-[40vh] bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white relative overflow-hidden">
//             {/* Background Pattern */}
//             <div className="absolute inset-0 opacity-5">
//               <svg width="100%" height="100%" className="absolute inset-0">
//                 <defs>
//                   <pattern
//                     id="grid"
//                     width="40"
//                     height="40"
//                     patternUnits="userSpaceOnUse"
//                   >
//                     <path
//                       d="M 40 0 L 0 0 0 40"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="1"
//                     />
//                   </pattern>
//                 </defs>
//                 <rect width="100%" height="100%" fill="url(#grid)" />
//               </svg>
//             </div>
//             <div className="inline-block mb-8">
//               <div className="relative inline-flex items-center justify-center">
//                 <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-contact-purple to-contact-teal opacity-70 blur"></div>
//                 <div className="relative px-6 py-2 bg-white rounded-full text-sm font-normal text-gray-800">
//                   Account Access
//                 </div>
//               </div>
//             </div>

//             <h1 className="text-5xl md:text-7xl font-normal mb-6 gradient-text leading-tight">
//               Login to Your Portal
//             </h1>
//             <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto">
//               Select your account type below to access your personalized
//               dashboard.
//             </p>
//           </div>

//       {/* Login Options Section */}
//       <section className="py-16 bg-white/90 backdrop-blur-sm justify-center">
//         <div className="container mx-auto px-4">
//           <div
//             ref={cardsRef}
//             className={`max-w-5xl mx-auto transition-all duration-1000 ${
//               cardsInView
//                 ? 'opacity-100 translate-y-0'
//                 : 'opacity-0 translate-y-12'
//             }`}
//           >
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
//               {loginOptions.map((option, index) => (
//                 <Card
//                   key={option.id}
//                   className="border shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
//                   style={{ transitionDelay: `${index * 100}ms` }}
//                 >
//                   <CardContent className="p-8 flex flex-col items-center text-center">
//                     <div className="w-16 h-16 bg-contact-purple/10 rounded-full flex items-center justify-center mb-4 text-contact-purple">
//                       {option.icon}
//                     </div>
//                     <h3 className="text-xl font-medium mb-2">{option.title}</h3>
//                     <p className="text-gray-600 mb-6">{option.description}</p>
//                     <Link href={option.link} className="w-full">
//                       <Button className="w-full bg-gradient-to-r from-contact-purple to-contact-teal text-white group">
//                         Access {option.title} Portal
//                         <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
//                       </Button>
//                     </Link>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>

//             <p className="text-center mt-8 text-gray-600">
//               Don&apos;t have an account yet?{' '}
//               <Link
//                 href="/register"
//                 className="text-contact-purple hover:underline"
//               >
//                 Sign up here
//               </Link>
//             </p>
//           </div>
//         </div>
//       </section>
//     </>
//   );
// };

// export default LoginPage;

'use client';

import React from 'react';
import { useInView } from 'react-intersection-observer';
import { PenTool, Users, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type LoginOption = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
};

const LoginPage: React.FC = () => {
  const { ref: heroRef, inView: heroInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { ref: cardsRef, inView: cardsInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const loginOptions: LoginOption[] = [
    {
      id: 'child',
      title: 'Young Writer',
      description:
        'For children to write amazing stories, get feedback, and publish their creative work.',
      icon: <PenTool className="h-8 w-8" />,
      link: '/login/child',
    },
    {
      id: 'mentor',
      title: 'Teacher/Mentor',
      description:
        'For educators to guide young writers, provide feedback, and track their progress.',
      icon: <Users className="h-8 w-8" />,
      link: '/login/mentor',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 mt-28 mb-12"
      >
        <div
          className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${
            heroInView
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-12'
          }`}
        >
          {/* Badge */}
          <div className="inline-block mb-8">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-green-500 to-teal-500 opacity-70 blur"></div>
              <div className="relative px-6 py-2 bg-gray-800/90 backdrop-blur-xl rounded-full text-sm font-medium text-green-300 border border-green-400/30">
                <Sparkles className="w-4 h-4 inline mr-2" />
                Account Access
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            Login to Your{' '}
            <span className="bg-gradient-to-r from-green-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Creative Portal
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-300 mb-16 max-w-2xl mx-auto leading-relaxed">
            Select your account type below to access your personalized dashboard
            and start your creative writing journey.
          </p>

          {/* Login Options Cards */}
          <div
            ref={cardsRef}
            className={`transition-all duration-1000 ${
              cardsInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {loginOptions.map((option, index) => (
                <div
                  key={option.id}
                  className={`transition-all duration-700 ${
                    cardsInView
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-12'
                  }`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <Card className="group relative bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 hover:bg-white/15 overflow-hidden">
                    {/* Hover Effect Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <CardContent className="relative z-10 p-8 flex flex-col items-center text-center">
                      {/* Icon */}
                      <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {option.icon}
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-300 transition-colors">
                        {option.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-300 mb-8 leading-relaxed">
                        {option.description}
                      </p>

                      {/* Button */}
                      <Link href={option.link} className="w-full">
                        <Button className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group border-0">
                          <span className="flex items-center justify-center">
                            Access {option.title} Portal
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-12">
              <p className="text-gray-300 text-lg">
                Don&apos;t have an account yet?{' '}
                <Link
                  href="/register"
                  className="text-green-400 hover:text-green-300 font-semibold hover:underline transition-colors"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
