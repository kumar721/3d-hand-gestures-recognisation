'use client';

import React, { useState, useMemo } from 'react';
import { GESTURE_REGISTRY } from '@/lib/gestures/registry';
import { GestureCard } from './GestureCard';
import { Search, Filter, Sparkles, Layers } from 'lucide-react';

export function GesturesGallery() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const counts = useMemo(() => {
    return {
      all: GESTURE_REGISTRY.length,
      single: GESTURE_REGISTRY.filter((g) => g.category === 'single').length,
      'two-hand': GESTURE_REGISTRY.filter((g) => g.category === 'two-hand').length,
      motion: GESTURE_REGISTRY.filter((g) => g.category === 'motion').length,
    };
  }, []);

  const filteredGestures = useMemo(() => {
    return GESTURE_REGISTRY.filter((gesture) => {
      const matchesCategory =
        activeCategory === 'all' || gesture.category === activeCategory;
      const matchesSearch =
        gesture.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gesture.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gesture.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <section id="gallery" className="relative py-24 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950/60 border border-pink-500/40 text-pink-400 font-mono text-xs mb-3 shadow-neon-magenta">
          <Sparkles className="w-3.5 h-3.5" />
          FULL REPERTOIRE
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
          Gestures <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">Encyclopedia</span>
        </h2>
        <p className="text-gray-400 text-sm md:text-base mt-3">
          Explore our complete library of 37 high-precision gestures with real-time vector analysis, dual-hand symmetry checking, and temporal motion tracking.
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Gestures', count: counts.all },
            { id: 'single', label: 'Single Hand', count: counts.single },
            { id: 'two-hand', label: 'Two-Hand / Dual', count: counts['two-hand'] },
            { id: 'motion', label: 'Motion & Dynamic', count: counts.motion },
          ].map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold shadow-neon-cyan'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                    isActive ? 'bg-black/30 text-black' : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search gestures..."
            className="w-full bg-[#0a0c16] border border-white/10 focus:border-cyan-400 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-white font-mono"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Grid of Gesture Cards */}
      {filteredGestures.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGestures.map((gesture) => (
            <GestureCard key={gesture.id} gesture={gesture} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <Layers className="w-12 h-12 text-gray-600 mb-3" />
          <h4 className="text-lg font-semibold text-gray-300">No gestures matched</h4>
          <p className="text-sm text-gray-500 mt-1">
            Try adjusting your search query or switching categories
          </p>
        </div>
      )}
    </section>
  );
}
