'use client';

import React from 'react';
import { Layers, Sparkles } from 'lucide-react';

const TECH_ITEMS = [
  {
    name: 'MediaPipe Tasks Vision',
    role: '21 3D Landmark Estimation',
    badge: 'Vision ML',
    glow: 'hover:border-cyan-400 hover:shadow-neon-cyan',
  },
  {
    name: 'Three.js & R3F',
    role: 'Procedural 3D Hand Mesh & Scene',
    badge: '3D Graphics',
    glow: 'hover:border-purple-400 hover:shadow-neon-purple',
  },
  {
    name: 'Next.js 14 App Router',
    role: 'Server Components & Optimized Client Hydration',
    badge: 'Framework',
    glow: 'hover:border-white hover:shadow-white/20',
  },
  {
    name: 'Tailwind CSS',
    role: 'Cyberpunk Design System & Glassmorphism',
    badge: 'Styling',
    glow: 'hover:border-cyan-400 hover:shadow-neon-cyan',
  },
  {
    name: 'Zustand 5',
    role: 'Zero-Overhead Reactive State Management',
    badge: 'State Engine',
    glow: 'hover:border-amber-400 hover:shadow-amber-400/30',
  },
  {
    name: 'WebGL & WebAssembly',
    role: 'Hardware Acceleration & Native Execution',
    badge: 'Core Runtime',
    glow: 'hover:border-pink-400 hover:shadow-neon-magenta',
  },
  {
    name: 'Framer Motion',
    role: 'Kinetic Interactions & Micro-animations',
    badge: 'Motion',
    glow: 'hover:border-pink-500 hover:shadow-neon-magenta',
  },
  {
    name: 'TypeScript',
    role: 'Strict Type-Safe Mathematical Pipeline',
    badge: 'Language',
    glow: 'hover:border-blue-400 hover:shadow-blue-400/30',
  },
];

export function TechStack() {
  return (
    <section id="tech-stack" className="relative py-24 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 font-mono text-xs mb-3 shadow-neon-cyan">
          <Layers className="w-3.5 h-3.5" />
          <span>TECHNOLOGY FOUNDATION</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
          Cutting-Edge <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Stack</span>
        </h2>
        <p className="text-gray-400 text-sm md:text-base mt-2">
          Engineered using industry-leading browser vision algorithms, WebGL renderers, and modern reactive patterns.
        </p>
      </div>

      {/* Floating Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TECH_ITEMS.map((item) => (
          <div
            key={item.name}
            className={`p-5 rounded-2xl bg-[#090b16]/70 backdrop-blur-md border border-white/10 transition-all duration-300 ${item.glow} group cursor-default`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 group-hover:text-cyan-300 group-hover:border-cyan-400/40 transition-colors">
                {item.badge}
              </span>
              <Sparkles className="w-3 h-3 text-gray-600 group-hover:text-cyan-400 transition-colors" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
              {item.name}
            </h4>
            <p className="text-xs text-gray-500 mt-1 font-mono">{item.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
