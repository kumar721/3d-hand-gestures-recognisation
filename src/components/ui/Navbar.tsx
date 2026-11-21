'use client';

import React, { useState, useEffect } from 'react';
import { useGestureStore } from '@/lib/store/useGestureStore';
import { Camera, Sparkles } from 'lucide-react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { isCameraActive, isDemoMode } = useGestureStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'py-3 bg-[#030307]/80 backdrop-blur-xl border-b border-white/10 shadow-glass'
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Brand */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-base shadow-neon-cyan transition-transform group-hover:scale-105">
            🖐️
          </div>
          <span className="font-mono font-black text-sm md:text-base tracking-widest text-white uppercase">
            GESTURE<span className="text-cyan-400">CRAFT</span>
          </span>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-gray-400">
          <a href="#demo" className="hover:text-cyan-300 transition-colors">
            LIVE DEMO
          </a>
          <a href="#gallery" className="hover:text-cyan-300 transition-colors">
            GESTURES (37)
          </a>
          <a href="#practice" className="hover:text-cyan-300 transition-colors">
            PRACTICE ARENA
          </a>
          <a href="#how-it-works" className="hover:text-cyan-300 transition-colors">
            HOW IT WORKS
          </a>
          <a href="#tech-stack" className="hover:text-cyan-300 transition-colors">
            TECH
          </a>
        </nav>

        {/* Live Status Pill & CTA */}
        <div className="flex items-center gap-3">
          {isCameraActive || isDemoMode ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-400/50 text-[11px] font-mono text-cyan-300 shadow-neon-cyan">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>{isCameraActive ? 'WEBCAM ON' : 'SIMULATION ON'}</span>
            </div>
          ) : (
            <a
              href="#demo"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs font-mono tracking-wider shadow-neon-cyan transition-all flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>START DEMO</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
