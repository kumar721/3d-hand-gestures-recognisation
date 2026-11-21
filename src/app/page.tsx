'use client';

import React from 'react';
import { HeroSection } from '@/components/sections/HeroSection';
import { LiveDemo } from '@/components/demo/LiveDemo';
import { GesturesGallery } from '@/components/gallery/GesturesGallery';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { PracticeMode } from '@/components/practice/PracticeMode';
import { TechStack } from '@/components/sections/TechStack';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#030307] text-white overflow-hidden bg-grain">
      {/* Subtle Ambient Mesh Lights */}
      <div className="fixed inset-0 bg-cyber-grid bg-[size:48px_48px] opacity-15 pointer-events-none" />

      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Live Demo Lab */}
      <LiveDemo />

      {/* 3. Gestures Encyclopedia (All 37 Gestures) */}
      <GesturesGallery />

      {/* 4. How It Works Pipeline */}
      <HowItWorks />

      {/* 5. Practice & Challenge Arena */}
      <PracticeMode />

      {/* 6. Technology Foundation */}
      <TechStack />
    </div>
  );
}
