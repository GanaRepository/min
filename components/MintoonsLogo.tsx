'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';

interface MintoonsLogoProps {
  variant?: 'light' | 'dark' | 'color';
  className?: string;
}

const MintoonsLogo: React.FC<MintoonsLogoProps> = ({
  variant = 'color',
  className = '',
}) => {
  // Variant configurations
  const variants = {
    color: {
      containerBg: 'bg-gradient-to-br from-blue-600 to-indigo-700',
      iconColor: 'text-white',
      textColor: 'text-gray-800',
      shadow: 'shadow-lg',
    },
    light: {
      containerBg: 'bg-white border-2 border-gray-200',
      iconColor: 'text-blue-600',
      textColor: 'text-gray-800',
      shadow: 'shadow-md',
    },
    dark: {
      containerBg: 'bg-gray-800',
      iconColor: 'text-blue-400',
      textColor: 'text-white',
      shadow: 'shadow-lg',
    },
  };

  const variantConfig = variants[variant];

  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo Icon */}
      <div
        className={`
          w-12 h-12
          ${variantConfig.containerBg} 
          ${variantConfig.shadow}
          rounded-xl
          flex items-center justify-center
          mr-3
        `}
      >
        <BookOpen className={`w-6 h-6 ${variantConfig.iconColor}`} />
      </div>

      {/* Logo Text */}
      <span className={`text-2xl font-bold ${variantConfig.textColor}`}>
        Mintoons
      </span>
    </div>
  );
};

export default MintoonsLogo;