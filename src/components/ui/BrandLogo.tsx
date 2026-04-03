import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`relative flex items-center justify-center ${sizes[size]} ${className}`}>
      {/* Elegant minimalist M design */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_8px_rgba(54,34,34,0.3)]"
      >
        {/* Abstract Architectural M */}
        <path
          d="M20 80V20L50 50L80 20V80"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white opacity-90"
        />
        {/* Subtle Accent Layer */}
        <path
          d="M20 80V40L50 70L80 40V80"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      
      {/* Inner Glow */}
      <div className="absolute inset-2 bg-primary/20 blur-xl rounded-full opacity-50" />
    </div>
  );
};
