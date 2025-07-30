// import Link from 'next/link';
// import Image from 'next/image';

// const NotFound = () => {
//   return (
//     <div className="flex flex-col sm:flex-row items-center justify-center text-[#000000] px-4 py-8 pt-24">
//       <div className="w-full sm:w-1/2 text-center mb-8 sm:mb-0 lg:pl-8">
//         <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-contact-purple to-contact-teal mb-4 font-playfair">
//           Oops!
//         </h1>
//         <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 text-gray-800 font-montserrat font-bold">
//           We can&apos;t seem to find the page you&apos;re looking for.
//         </p>
//         <Link href="/">
//           <button className="inline-flex items-center px-6 sm:px-8 py-2 sm:py-3 bg-contact-purple text-white text-base sm:text-lg font-semibold rounded-full shadow-lg hover:bg-contact-teal transition-transform transform hover:scale-105 duration-300 font-serif">
//             Go Back Home
//           </button>
//         </Link>
//       </div>
//       <div className="w-full sm:w-1/2 text-center">
//         <Image
//           src="/set8.jpg"
//           alt="Page Not Found"
//           width={300}
//           height={300}
//           className="mx-auto sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96"
//         />
//       </div>
//     </div>
//   );
// };

// export default NotFound;

'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900/90 via-gray-800/90 to-blue-900/90 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-blue-900/90 via-gray-800/90 to-blue-900/90 overflow-hidden flex items-center justify-center relative pt-16 sm:pt-20 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20"
    >
      {/* Animated background stars */}
      <div ref={starsRef} className="absolute inset-0 z-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Main container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center gap-8 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20"
      >
        {/* Left side - Error content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 w-full max-w-md min-w-0 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 text-center lg:text-left"
        >
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl">
            {/* 404 Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl mb-6"
            >
              <Search className="h-10 w-10 text-white" />
            </motion.div>

            {/* Error message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
                404
              </h1>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white/90 mb-4">
                Lost in Space?
              </h2>
              <p className="text-white/80 text-base sm:text-lg md:text-xl mb-8 leading-relaxed">
                Oops! It seems like you&apos;ve drifted into uncharted
                territory. The page you&apos;re looking for doesn&apos;t exist
                in the Mintoons universe.
              </p>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="space-y-4"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href="/">
                  <button className="w-full bg-white hover:bg-gray-100 text-black py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-medium transition-all duration-300 backdrop-blur-sm border border-white/20 flex items-center justify-center text-base sm:text-lg">
                    <Home className="h-5 w-5 mr-2" />
                    Return to Mintoons Home
                  </button>
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => window.history.back()}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-medium transition-all duration-300 backdrop-blur-sm border border-white/20 flex items-center justify-center text-base sm:text-lg"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Go Back
                </button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right side - Cosmic illustration */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex-1 w-full max-w-md min-w-0 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10"
        >
          <div className="relative">
            {/* Main illustration */}
            <div className="relative w-full h-[30rem] bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-3xl overflow-hidden border border-white/20">
              <Image
                src="/kid8.jpg"
                alt="Lost in Space"
                fill
                className="absolute inset-0 rounded-3xl object-cover opacity-80"
              />

              {/* Overlay effects */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500/40 via-transparent to-blue-500/40"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              {/* Floating elements */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full opacity-80"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${20 + i * 10}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2 + i * 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </div>
          {/* Quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-center mt-6"
          >
            <p className="text-white/80 text-sm italic">
              &quot;Not all who wander are lost, but this page certainly
              is!&quot;
            </p>
            <p className="text-white/60 text-xs mt-2">- Mintoons Navigator</p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Ambient lighting effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-purple-500/20 via-blue-500/10 to-transparent blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-orange-500/20 via-red-500/10 to-transparent blur-3xl" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-purple-500/5 to-transparent blur-3xl" />
    </div>
  );
};

export default NotFound;
