'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { CyberButton } from '../ui/CyberButton';
import { ArrowRight, Sparkles, Play, ShieldCheck, Box } from 'lucide-react';
import { useGestureStore } from '@/lib/store/useGestureStore';

// Dynamic import CyberScene with SSR disabled to guarantee flawless Three.js mounting
const CyberScene = dynamic(
  () => import('../3d/CyberScene').then((mod) => mod.CyberScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    ),
  }
);

export function HeroSection() {
  const { setDemoMode, setCameraActive } = useGestureStore();

  const handleTryNow = () => {
    const el = document.getElementById('demo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLaunchSimulation = () => {
    setDemoMode(true);
    handleTryNow();
  };

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Background Cyber Glow Gradients */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-magenta/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full z-10">
        {/* Left Column: Headlines & Actions (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-500/40 text-cyan-400 font-mono text-xs mb-6 shadow-neon-cyan">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AWWWARDS EXPERIMENTAL VISION TECH</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.08] mb-6">
            Control with a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500">
              Gesture.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-xl mb-8">
            Experience the future of touchless spatial interaction. Detect 37+ real-time hand gestures directly in your browser with zero latency, dual-hand tracking, and an interactive 3D procedural avatar hand.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 mb-12">
            <CyberButton variant="primary" size="lg" onClick={handleTryNow}>
              <span>Try It Now</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </CyberButton>

            <CyberButton variant="outline" size="lg" onClick={handleLaunchSimulation}>
              <Play className="w-4 h-4 mr-1 text-cyan-400 fill-current" />
              <span>Launch Demo Mode</span>
            </CyberButton>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 w-full max-w-lg font-mono">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-white block">37+</span>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Gestures</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-cyan-400 block">60 FPS</span>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Performance</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-pink-400 block">2 Hands</span>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Simultaneous</span>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Mirroring Hand Hero Scene (5 cols) */}
        <div className="lg:col-span-5 h-[460px] md:h-[580px] w-full relative rounded-3xl overflow-hidden border border-white/10 bg-[#060710]/60 backdrop-blur-md shadow-2xl">
          {/* CyberScene 3D Canvas */}
          <CyberScene />

          {/* 3D Scene Interactive Overlay Badge */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <div className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-gray-300 flex items-center gap-2">
              <Box className="w-3.5 h-3.5 text-cyan-400" />
              <span>Real-Time 3D Hand Mirror</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400/80 uppercase">
              DRAG TO ROTATE
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
