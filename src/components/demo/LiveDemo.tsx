'use client';

import React from 'react';
import { CameraFeed } from './CameraFeed';
import { GestureHistory } from './GestureHistory';
import { useGestureStore } from '@/lib/store/useGestureStore';
import { ShieldCheck, Activity, Zap, Layers, Sparkles } from 'lucide-react';

export function LiveDemo() {
  const { primaryGesture, fps } = useGestureStore();

  return (
    <section id="demo" className="relative py-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 font-mono text-xs mb-3 shadow-neon-cyan">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            REAL-TIME LAB
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Live Hand <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500">Recognition</span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base mt-2 max-w-xl">
            Computer vision running entirely in client browser at 60 FPS. Supports 30+ static, dual-hand, and motion gestures with 3D skeleton tracking.
          </p>
        </div>

        {/* Live Metrics Pill */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <div className="text-left font-mono">
              <span className="text-[10px] text-gray-500 uppercase block">Engine Speed</span>
              <span className="text-xs font-bold text-white">{fps || 30} FPS</span>
            </div>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div className="text-left font-mono">
              <span className="text-[10px] text-gray-500 uppercase block">Privacy</span>
              <span className="text-xs font-bold text-emerald-400">100% Client-Side</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Camera Canvas on Left + Stats & History on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 8 Cols: Camera Feed */}
        <div className="lg:col-span-8 flex flex-col justify-center">
          <CameraFeed />
        </div>

        {/* Right 4 Cols: Active Gesture Card + History */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Active Gesture Featured Card */}
          <div className="bg-[#0a0c16]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-glass relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                Active Gesture
              </span>
              {primaryGesture && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                  {primaryGesture.category.toUpperCase()}
                </span>
              )}
            </div>

            {primaryGesture ? (
              <div className="flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-pink-500/20 border border-cyan-400/40 flex items-center justify-center text-4xl shadow-neon-cyan animate-float">
                    {primaryGesture.emoji}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-wide">
                      {primaryGesture.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                      {primaryGesture.description}
                    </p>
                  </div>
                </div>

                {/* Confidence Bar Meter */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-gray-400">Confidence Score</span>
                    <span className="text-cyan-400 font-bold">{primaryGesture.confidence}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-900 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-200"
                      style={{ width: `${primaryGesture.confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-500 mb-2">
                  <Layers className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-sm font-semibold text-gray-300">Awaiting Hand In Frame</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  Raise your hand towards the webcam or enable Demo Mode to start detecting.
                </p>
              </div>
            )}
          </div>

          {/* Gesture History */}
          <div className="flex-1 min-h-[280px]">
            <GestureHistory />
          </div>
        </div>
      </div>
    </section>
  );
}
