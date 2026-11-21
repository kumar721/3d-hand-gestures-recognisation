'use client';

import React from 'react';
import { Sparkles, Github, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#030408] pt-12 pb-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-lg shadow-neon-cyan">
            🖐️
          </div>
          <div>
            <span className="font-mono font-black text-sm tracking-widest text-white uppercase block">
              GESTURE<span className="text-cyan-400">CRAFT</span> 3D
            </span>
            <span className="text-[10px] font-mono text-gray-500">
              Next-Gen Client Vision & 3D Mirrored Kinematics
            </span>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-xs font-mono text-gray-400">
          <a href="#demo" className="hover:text-cyan-400 transition-colors">
            Live Lab
          </a>
          <a href="#gallery" className="hover:text-cyan-400 transition-colors">
            Gestures (37)
          </a>
          <a href="#practice" className="hover:text-cyan-400 transition-colors">
            Practice Arena
          </a>
          <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">
            How It Works
          </a>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-gray-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>ALL SYSTEMS OPERATIONAL</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 font-mono gap-2">
        <span>© 2026 GestureCraft 3D. Built for real-time spatial interaction.</span>
        <span>Runs 100% locally in browser • No video transmitted</span>
      </div>
    </footer>
  );
}
