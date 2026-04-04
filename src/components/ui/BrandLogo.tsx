import React from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'fluid';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 'md' }) => {
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
    xxl: 'w-48 h-48',
    fluid: 'w-full h-full'
  };

  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-[22.5%] ${sizes[size]} ${className}`}>
      {/* Premium Metallic Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent blur-2xl opacity-30 pointer-events-none" />
      
      <Image
        src="/mardis.png"
        alt="Mardis Logo"
        width={500}
        height={500}
        priority
        className="w-full h-full object-cover scale-[1.12] relative z-10 mix-blend-screen"
      />
      
      {/* Subtle Bottom Reflection */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent blur-[1px]" />
    </div>
  );
};
