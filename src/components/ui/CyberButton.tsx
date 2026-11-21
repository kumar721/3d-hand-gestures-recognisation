'use client';

import React from 'react';

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function CyberButton({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: CyberButtonProps) {
  const sizeStyles = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  }[size];

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-black font-extrabold shadow-neon-cyan hover:shadow-cyan-400/50 hover:brightness-110',
    secondary:
      'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-extrabold shadow-neon-magenta hover:brightness-110',
    outline:
      'bg-white/[0.03] hover:bg-white/[0.08] text-white border border-white/15 hover:border-cyan-400/60 font-semibold',
  }[variant];

  return (
    <button
      className={`relative inline-flex items-center justify-center gap-2 rounded-2xl tracking-wider uppercase font-mono transition-all duration-300 transform active:scale-95 ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
