'use client';

import React from 'react';
import { useGestureStore } from '@/lib/store/useGestureStore';

interface GestureHUDProps {
  containerWidth: number;
  containerHeight: number;
  mirrored?: boolean;
}

export function GestureHUD({
  containerWidth,
  containerHeight,
  mirrored = true,
}: GestureHUDProps) {
  const { handGestures, landmarks, primaryGesture, fps } = useGestureStore();

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {/* Top Status Bar HUD */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-gray-300">ENGINE:</span>
          <span className="text-cyan-400 font-bold">ACTIVE</span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-300">FPS:</span>
          <span
            className={`font-bold ${
              fps > 45 ? 'text-emerald-400' : fps > 25 ? 'text-amber-400' : 'text-red-400'
            }`}
          >
            {fps}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <span className="text-gray-400">TRACKING:</span>
          <span className="text-magenta font-semibold text-pink-400">
            {landmarks.length} {landmarks.length === 1 ? 'HAND' : 'HANDS'}
          </span>
        </div>
      </div>

      {/* Floating Labels Over Each Detected Hand */}
      {landmarks.map((handLms, idx) => {
        if (!handLms || handLms.length < 21) return null;
        const gesture = handGestures[idx] || (idx === 0 ? primaryGesture : null);
        if (!gesture) return null;

        // Position HUD above index/middle MCP
        const mcp = handLms[9];
        const rawX = mirrored ? 1 - mcp.x : mcp.x;
        const posX = Math.max(0.1, Math.min(0.9, rawX)) * containerWidth;
        const posY = Math.max(0.08, mcp.y - 0.16) * containerHeight;

        const isHand1 = idx === 0;

        return (
          <div
            key={`hand-hud-${idx}`}
            style={{
              left: `${posX}px`,
              top: `${posY}px`,
              transform: 'translate(-50%, -100%)',
            }}
            className="absolute transition-all duration-75 pointer-events-none"
          >
            <div
              className={`flex flex-col items-center p-2 rounded-xl backdrop-blur-md border shadow-2xl ${
                isHand1
                  ? 'bg-black/85 border-cyan-500/50 shadow-cyan-500/20'
                  : 'bg-black/85 border-pink-500/50 shadow-pink-500/20'
              }`}
            >
              {/* Hand Badge */}
              <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase font-mono tracking-wider">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isHand1 ? 'bg-cyan-400' : 'bg-pink-400'
                  }`}
                />
                <span className="text-gray-400">HAND #{idx + 1}</span>
                {gesture.handedness && (
                  <span className="text-gray-300 font-semibold">({gesture.handedness})</span>
                )}
              </div>

              {/* Gesture Name & Emoji */}
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-xl">{gesture.emoji}</span>
                <span className="text-white font-bold text-xs tracking-wide">
                  {gesture.name}
                </span>
              </div>

              {/* Confidence Meter Bar */}
              <div className="w-full mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-150 ${
                      isHand1
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-400'
                        : 'bg-gradient-to-r from-pink-500 to-purple-500'
                    }`}
                    style={{ width: `${gesture.confidence}%` }}
                  />
                </div>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    isHand1 ? 'text-cyan-400' : 'text-pink-400'
                  }`}
                >
                  {gesture.confidence}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
