'use client';

import React, { useEffect } from 'react';
import { useGestureStore } from '@/lib/store/useGestureStore';
import confetti from 'canvas-confetti';
import { Trophy, Flame, Timer, Play, RotateCcw, CheckCircle2, Target, Sparkles } from 'lucide-react';

export function PracticeMode() {
  const {
    practice,
    isCameraActive,
    isDemoMode,
    startPractice,
    stopPractice,
    nextPracticeTarget,
    tickPracticeTimer,
    setCameraActive,
    setDemoMode,
  } = useGestureStore();

  // Tick practice timer
  useEffect(() => {
    if (!practice.active) return;
    const interval = setInterval(() => {
      tickPracticeTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [practice.active, tickPracticeTimer]);

  // Trigger celebratory confetti on milestones
  useEffect(() => {
    if (practice.feedback === 'correct') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#00f0ff', '#ff007f', '#00ff88'],
      });
    }
  }, [practice.feedback, practice.streak]);

  const handleStart = () => {
    if (!isCameraActive && !isDemoMode) {
      setDemoMode(true);
    }
    startPractice();
  };

  return (
    <section id="practice" className="relative py-24 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="relative rounded-3xl bg-gradient-to-b from-[#0a0c1a] to-[#04050a] border border-white/10 p-8 md:p-12 overflow-hidden shadow-glass">
        {/* Glowing background highlights */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-magenta/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 font-mono text-xs mb-3 shadow-neon-cyan">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            CHALLENGE ARENA
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Gesture <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-400">Mastery</span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base mt-2">
            Put your reflexes to the test. Form the target gesture shown on screen before the timer expires to build your streak!
          </p>
        </div>

        {!practice.active ? (
          /* Pre-Game Launcher */
          <div className="max-w-md mx-auto text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-magenta/20 border border-cyan-500/40 flex items-center justify-center text-5xl mb-6 shadow-neon-cyan animate-float">
              🎯
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Ready to Test Your Speed?</h3>
            <p className="text-xs text-gray-400 mb-8 leading-relaxed">
              The engine will serve random gestures from our 37-gesture library. Hold each pose accurately in front of your camera.
            </p>

            <button
              onClick={handleStart}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 hover:opacity-95 text-white font-extrabold text-sm tracking-wider shadow-neon-cyan flex items-center gap-2.5 transition-all transform hover:scale-105"
            >
              <Play className="w-4 h-4 fill-current" />
              START CHALLENGE
            </button>
          </div>
        ) : (
          /* Active Game Arena */
          <div className="max-w-3xl mx-auto">
            {/* Top Score Bar */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* Score */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                <span className="text-[10px] font-mono uppercase text-gray-500 block mb-1">Score</span>
                <span className="text-2xl font-black font-mono text-cyan-400">
                  {practice.score}
                </span>
              </div>

              {/* Streak */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                <span className="text-[10px] font-mono uppercase text-gray-500 block mb-1 flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400" />
                  Streak
                </span>
                <span className="text-2xl font-black font-mono text-orange-400">
                  {practice.streak}x
                </span>
              </div>

              {/* Countdown Timer */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                <span className="text-[10px] font-mono uppercase text-gray-500 block mb-1 flex items-center justify-center gap-1">
                  <Timer className="w-3 h-3 text-pink-400" />
                  Time Left
                </span>
                <span
                  className={`text-2xl font-black font-mono ${
                    practice.timeRemaining <= 4 ? 'text-red-400 animate-pulse' : 'text-pink-400'
                  }`}
                >
                  {practice.timeRemaining}s
                </span>
              </div>
            </div>

            {/* Target Gesture Display */}
            {practice.targetGesture && (
              <div className="p-8 rounded-3xl bg-[#0e1122]/90 border border-cyan-500/30 text-center relative overflow-hidden shadow-2xl mb-8">
                {practice.feedback === 'correct' && (
                  <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex flex-col items-center justify-center z-20 animate-fade-in">
                    <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-2 animate-bounce" />
                    <span className="text-xl font-bold text-emerald-300">EXCELLENT! +120 PTS</span>
                  </div>
                )}

                <div className="text-[11px] font-mono text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-cyan-400" />
                  Perform This Gesture
                </div>

                <div className="text-7xl my-4 animate-float">{practice.targetGesture.emoji}</div>

                <h3 className="text-2xl md:text-3xl font-extrabold text-white">
                  {practice.targetGesture.name}
                </h3>

                <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto">
                  {practice.targetGesture.instructions}
                </p>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {practice.targetGesture.category}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-pink-950 text-pink-300 border border-pink-800">
                    {practice.targetGesture.difficulty}
                  </span>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={nextPracticeTarget}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono border border-white/10 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Skip Gesture
              </button>

              <button
                onClick={stopPractice}
                className="px-5 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 text-xs font-mono border border-red-800/40 transition-colors"
              >
                Quit Game
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
