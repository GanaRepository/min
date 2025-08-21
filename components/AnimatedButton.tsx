import React from 'react';

const AnimatedButton = ({ text = "Generate Site" }) => {
  return (
    <div className="relative inline-block group">
      
      {/* Outer glow - visible on hover */}
      <div 
        className="absolute -inset-12 rounded-full opacity-0 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.6) 0%, rgba(124, 58, 237, 0.4) 40%, rgba(124, 58, 237, 0.2) 70%, transparent 100%)',
          filter: 'blur(25px)'
        }}
      />
      
      {/* Secondary glow layer */}
      <div 
        className="absolute -inset-8 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.5) 0%, rgba(168, 85, 247, 0.3) 50%, transparent 100%)',
          filter: 'blur(20px)'
        }}
      />
      
      {/* Button */}
      <button 
        className="relative px-8 py-4 rounded-full text-white font-semibold text-lg tracking-wide transition-all duration-500 hover:scale-105 active:scale-95 cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #374151 0%, #4b5563 50%, #374151 100%)'
        }}
      >
        {/* Purple background on hover */}
        <div 
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #8b5cf6 100%)'
          }}
        />
        
        {/* Content */}
        <span className="relative z-10 flex items-center gap-3">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0l3.09 6.26L22 9.27l-6.91 3.01L12 24l-3.09-11.72L2 9.27l6.91-3.01L12 0z" />
          </svg>
          {text}
        </span>
      </button>
    </div>
  );
};

export default AnimatedButton;