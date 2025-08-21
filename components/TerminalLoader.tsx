'use client';

import React from 'react';

interface TerminalLoaderProps {
  title?: string;
  loadingText?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const TerminalLoader: React.FC<TerminalLoaderProps> = ({
  title = 'Status',
  loadingText = 'Loading...',
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-48 text-sm',
    md: 'w-72 text-base',
    lg: 'w-96 text-lg',
  };

  const headerSizeClasses = {
    sm: 'h-8 px-3',
    md: 'h-10 px-4',
    lg: 'h-12 px-5',
  };

  const bodySizeClasses = {
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  const controlSizeClasses = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div
      className={`
      ${sizeClasses[size]}
      bg-zinc-900 
      border-2 border-zinc-700 
      rounded-lg 
      shadow-2xl 
      overflow-hidden 
      font-mono 
      transition-all 
      duration-300 
      hover:-translate-y-1 
      hover:shadow-3xl
      ${className}
    `}
    >
      {/* Terminal Header */}
      <div
        className={`
        ${headerSizeClasses[size]}
        bg-zinc-800 
        flex 
        items-center 
        justify-between
      `}
      >
        <span className="text-zinc-300 font-semibold">{title}</span>
        <div className="flex gap-2">
          <div
            className={`${controlSizeClasses[size]} bg-red-500 rounded-full`}
          ></div>
          <div
            className={`${controlSizeClasses[size]} bg-yellow-500 rounded-full`}
          ></div>
          <div
            className={`${controlSizeClasses[size]} bg-green-500 rounded-full`}
          ></div>
        </div>
      </div>

      {/* Terminal Body */}
      <div className={`${bodySizeClasses[size]} bg-zinc-900 text-green-400`}>
        <div className="inline-block overflow-hidden whitespace-nowrap border-r-2 border-green-400 animate-typeAndBlink">
          {loadingText}
        </div>
      </div>
    </div>
  );
};

export default TerminalLoader;
