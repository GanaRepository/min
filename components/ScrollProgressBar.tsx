'use client';

import React, { useState, useEffect } from 'react';

const ScrollProgressBar: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Clean up event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Mintoons website palette colors
  const mintoonsPrimary = '#7C3AED'; // contact-purple (Tailwind: purple-600)
  const mintoonsSecondary = '#2DD4BF'; // contact-teal (Tailwind: teal-400)
  const mintoonsAccent = '#16A34A'; // green-600

  return (
    <div
      className="fixed top-0 left-0 w-full h-[3px] z-[100] bg-transparent"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      }}
    >
      <div
        className="h-full transition-all duration-200"
        style={{
          width: `${scrollProgress}%`,
          background: `linear-gradient(to right, ${mintoonsPrimary}, ${mintoonsSecondary}, ${mintoonsAccent})`,
          boxShadow: `0 0 10px ${mintoonsPrimary}99`, // 99 = ~60% opacity
        }}
      />
    </div>
  );
};

export default ScrollProgressBar;
