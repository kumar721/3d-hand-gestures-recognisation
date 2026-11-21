'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Cpu } from 'lucide-react';

export function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(55), 300);
    const timer2 = setTimeout(() => setProgress(88), 700);
    const timer3 = setTimeout(() => setProgress(100), 1100);
    const timer4 = setTimeout(() => setLoading(false), 1400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030307] transition-opacity duration-500">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-cyber-grid bg-[size:40px_40px] opacity-20 pointer-events-none" />

      {/* Hologram Hand Logo */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-cyan-950/40 border border-cyan-500/50 flex items-center justify-center text-4xl shadow-neon-cyan animate-pulse">
          🖐️
        </div>
        <div className="absolute -inset-2 rounded-3xl border border-cyan-500/20 animate-spin" />
      </div>

      {/* Typography */}
      <h1 className="text-xl md:text-2xl font-black text-white tracking-widest uppercase font-mono mb-2">
        GESTURE<span className="text-cyan-400">CRAFT</span> 3D
      </h1>
      <p className="text-xs text-gray-500 font-mono tracking-wider mb-8">
        INITIALIZING NEURAL VISION & WEBGL PIPELINE
      </p>

      {/* Progress Bar */}
      <div className="w-64 h-1.5 bg-gray-900 rounded-full overflow-hidden border border-white/10 p-0.5">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-500 font-mono">
        <Cpu className="w-3 h-3 text-cyan-400 animate-spin" />
        <span>LOADING MODELS {progress}%</span>
      </div>
    </div>
  );
}
