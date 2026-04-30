import React from 'react';
import { cn } from '../lib/utils';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("relative flex items-center justify-center transition-all duration-300 group h-[36px] w-auto", className)}>
      <svg 
        viewBox="0 0 48 48" 
        className="h-full w-auto text-[#1d1d1f] drop-shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:opacity-80" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2.5" />
        <path d="M24 10C24 10 20 18 14 20C20 22 24 30 24 30C24 30 28 22 34 20C28 18 24 10 24 10Z" fill="currentColor" />
        <circle cx="24" cy="36" r="3" fill="currentColor" />
        <circle cx="24" cy="24" r="1.5" fill="white" />
      </svg>
    </div>
  );
};
