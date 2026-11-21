'use client';

import React, { useRef, useState } from 'react';
import { GestureDefinition } from '@/lib/gestures/types';
import { Sparkles, Info } from 'lucide-react';

interface GestureCardProps {
  gesture: GestureDefinition;
}

export function GestureCard({ gesture }: GestureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'single':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-800/50';
      case 'two-hand':
        return 'text-pink-400 bg-pink-950/60 border-pink-800/50';
      case 'motion':
        return 'text-purple-400 bg-purple-950/60 border-purple-800/50';
      default:
        return 'text-gray-400 bg-gray-900 border-gray-800';
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'easy':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';
      case 'medium':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/40';
      case 'hard':
        return 'text-rose-400 bg-rose-950/40 border-rose-800/40';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-6px)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
      }}
      className="group relative flex flex-col justify-between p-6 rounded-3xl bg-[#090b14]/70 backdrop-blur-md border border-white/10 hover:border-cyan-500/40 hover:shadow-neon-cyan transition-all duration-300 overflow-hidden"
    >
      {/* Background radial gradient on hover */}
      <div
        className={`absolute inset-0 bg-radial-gradient from-cyan-500/10 via-transparent to-transparent pointer-events-none transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Top Meta: Category + Difficulty */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <span
          className={`text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-full border ${getCategoryColor(
            gesture.category
          )}`}
        >
          {gesture.category}
        </span>

        <span
          className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-md border ${getDifficultyBadge(
            gesture.difficulty
          )}`}
        >
          {gesture.difficulty}
        </span>
      </div>

      {/* Emoji & Animated Hand Visualization Icon */}
      <div className="relative z-10 flex flex-col items-center justify-center my-3">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 group-hover:border-cyan-400/50 flex items-center justify-center text-5xl shadow-lg transition-transform duration-300 group-hover:scale-110">
          {gesture.emoji}
        </div>
      </div>

      {/* Info: Name & Description */}
      <div className="relative z-10 text-center mt-2">
        <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
          {gesture.name}
        </h4>
        <p className="text-xs text-gray-400 mt-1.5 leading-relaxed line-clamp-2">
          {gesture.description}
        </p>
      </div>

      {/* How to perform tip */}
      <div className="relative z-10 mt-4 pt-3 border-t border-white/5 flex items-start gap-1.5 text-[11px] text-gray-500 group-hover:text-gray-300 transition-colors">
        <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-cyan-400" />
        <span className="line-clamp-2">{gesture.instructions}</span>
      </div>
    </div>
  );
}
