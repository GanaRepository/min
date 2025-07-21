'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, Feather, PenTool, Wand2 } from 'lucide-react';

interface AdvancedMintoonsLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  theme?: 'cosmic' | 'magical' | 'creative' | 'professional';
  animated?: boolean;
  className?: string;
}

const AdvancedMintoonsLogo: React.FC<AdvancedMintoonsLogoProps> = ({
  size = 'md',
  showText = true,
  theme = 'magical',
  animated = true,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Size configurations
  const sizes = {
    sm: {
      icon: 'w-4 h-4',
      container: 'w-8 h-8',
      text: 'text-sm',
      sparkle: 'w-2 h-2',
    },
    md: {
      icon: 'w-6 h-6',
      container: 'w-12 h-12',
      text: 'text-lg',
      sparkle: 'w-3 h-3',
    },
    lg: {
      icon: 'w-8 h-8',
      container: 'w-16 h-16',
      text: 'text-2xl',
      sparkle: 'w-4 h-4',
    },
    xl: {
      icon: 'w-12 h-12',
      container: 'w-20 h-20',
      text: 'text-3xl',
      sparkle: 'w-5 h-5',
    },
  };

  // Theme configurations
  const themes = {
    cosmic: {
      gradient: 'from-purple-500 via-blue-500 to-cyan-500',
      textColor: 'text-black',
      sparkleColors: ['text-purple-300', 'text-blue-300', 'text-cyan-300'],
    },
    magical: {
      gradient: 'from-green-400 to-blue-500',
      textColor: 'text-black',
      sparkleColors: ['text-yellow-300', 'text-pink-300', 'text-green-300'],
    },
    creative: {
      gradient: 'from-orange-400 via-pink-500 to-purple-600',
      textColor: 'text-black',
      sparkleColors: ['text-orange-300', 'text-pink-300', 'text-purple-300'],
    },
    professional: {
      gradient: 'from-slate-600 to-slate-800',
      textColor: 'text-black',
      sparkleColors: ['text-slate-300', 'text-slate-400', 'text-slate-200'],
    },
  };

  const sizeConfig = sizes[size];
  const themeConfig = themes[theme];

  // Animation variants
  const containerVariants = {
    rest: {
      scale: 1,
      rotate: 0,
    },
    hover: {
      scale: 1.1,
      rotate: 5,
    },
    pulse: {
      scale: [1, 1.05, 1],
    },
  };

  const iconVariants = {
    rest: {
      rotate: 0,
      scale: 1,
    },
    hover: {
      rotate: 15,
      scale: 1.1,
    },
    spin: {
      rotate: 360,
    },
  };

  // Sparkle positions for different themes
  const sparklePositions = [
    { top: '-4px', right: '-4px', delay: 0 },
    { bottom: '-4px', left: '-4px', delay: 0.5 },
    { top: '2px', left: '-4px', delay: 1 },
    { bottom: '2px', right: '-4px', delay: 1.5 },
  ];

  return (
    <motion.div
      className={`flex items-center cursor-pointer ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover="hover"
      initial="rest"
    >
      {/* Logo Container */}
      <motion.div
        className={`${sizeConfig.container} rounded-full bg-gradient-to-r ${themeConfig.gradient} mr-3 relative overflow-hidden shadow-lg`}
        variants={containerVariants}
        animate={animated ? 'pulse' : 'rest'}
        transition={{
          duration: 2,
          repeat: animated ? Infinity : 0,
          ease: 'easeInOut',
        }}
        style={{
          filter: isHovered
            ? 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))'
            : 'none',
        }}
      >
        {/* Inner circle with animated gradient */}
        <motion.div
          className="absolute inset-1 rounded-full bg-gray-900"
          animate={
            isHovered
              ? {
                  background: [
                    'radial-gradient(circle, rgba(17,24,39,1) 0%, rgba(17,24,39,1) 100%)',
                    'radial-gradient(circle, rgba(17,24,39,0.8) 0%, rgba(17,24,39,1) 100%)',
                    'radial-gradient(circle, rgba(17,24,39,1) 0%, rgba(17,24,39,1) 100%)',
                  ],
                }
              : {}
          }
          transition={{ duration: 1 }}
        />

        {/* Icon container */}
        <motion.div
          className={`absolute inset-2 rounded-full bg-gradient-to-r ${themeConfig.gradient} flex items-center justify-center`}
          variants={iconVariants}
          animate={animated && isHovered ? 'spin' : 'rest'}
          transition={{
            duration: 0.8,
            ease: 'easeInOut',
          }}
        >
          {theme === 'creative' ? (
            <PenTool className={`${sizeConfig.icon} text-black`} />
          ) : theme === 'magical' ? (
            <Wand2 className={`${sizeConfig.icon} text-black`} />
          ) : (
            <BookOpen className={`${sizeConfig.icon} text-black`} />
          )}
        </motion.div>

        {/* Animated sparkles */}
        <AnimatePresence>
          {(animated || isHovered) &&
            sparklePositions.map((pos, index) => (
              <motion.div
                key={index}
                className="absolute"
                style={{
                  top: pos.top,
                  right: pos.right,
                  bottom: pos.bottom,
                  left: pos.left,
                }}
                initial={{ scale: 0, opacity: 0, rotate: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  rotate: [0, 180, 360],
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: pos.delay,
                  ease: 'easeInOut',
                }}
              >
                <Sparkles
                  className={`${sizeConfig.sparkle} ${themeConfig.sparkleColors[index % themeConfig.sparkleColors.length]}`}
                />
              </motion.div>
            ))}
        </AnimatePresence>

        {/* Ripple effect */}
        {isHovered && (
          <motion.div
            className={`absolute inset-0 rounded-full border-2 border-current opacity-30`}
            style={{
              borderImage: `linear-gradient(45deg, ${themeConfig.gradient.replace('from-', '').replace('to-', '').replace('via-', '')}) 1`,
            }}
            animate={{
              scale: [1, 1.8],
              opacity: [0.3, 0],
            }}
            transition={{
              duration: 1,
              ease: 'easeOut',
            }}
          />
        )}

        {/* Floating particles */}
        {theme === 'cosmic' && isHovered && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Animated Text */}
      {showText && (
        <motion.div className="relative">
          <motion.span
            className={`${themeConfig.textColor} ${sizeConfig.text} font-medium relative z-10`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{
              scale: 1.05,
            }}
          >
            Mintoons
          </motion.span>

          {/* Text glow effect */}
          {isHovered && (
            <motion.span
              className={`absolute inset-0 ${themeConfig.textColor} ${sizeConfig.text} font-medium blur-sm opacity-50`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
            >
              Mintoons
            </motion.span>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdvancedMintoonsLogo;
