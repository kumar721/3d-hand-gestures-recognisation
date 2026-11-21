'use client';

import React from 'react';
import { Camera, Cpu, GitFork, Box, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'High-FPS Video Stream',
    icon: Camera,
    color: 'from-cyan-500 to-blue-500',
    borderColor: 'border-cyan-500/30',
    description:
      'Browser accesses local webcam via HTML5 getUserMedia with zero data ever leaving the device.',
    tech: 'WebRTC / getUserMedia',
  },
  {
    step: '02',
    title: 'MediaPipe Vision Tasks',
    icon: Cpu,
    color: 'from-blue-500 to-purple-500',
    borderColor: 'border-blue-500/30',
    description:
      'WASM & WebGL neural pipeline isolates hands and predicts 21 3D spatial keypoints with sub-millimeter precision.',
    tech: 'MediaPipe Tasks Vision 0.10',
  },
  {
    step: '03',
    title: 'Geometric ML Inference',
    icon: GitFork,
    color: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-500/30',
    description:
      'Analyzes 3D bone curl angles, palm normal vectors, dual-hand symmetry, and temporal motion velocity vectors.',
    tech: 'Vector Geometry & Temporal Buffer',
  },
  {
    step: '04',
    title: 'Real-Time 3D Rendering',
    icon: Box,
    color: 'from-pink-500 to-cyan-400',
    borderColor: 'border-pink-500/30',
    description:
      'Procedural 3D hand rig mirrors live kinematics with glowing cyber materials at a rock-solid 60 FPS.',
    tech: 'Three.js & React Three Fiber',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 font-mono text-xs mb-3 shadow-neon-cyan">
          <span>ARCHITECTURE</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
          How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500">Works</span>
        </h2>
        <p className="text-gray-400 text-sm md:text-base mt-3">
          A client-side pipeline transforming raw optical frames into high-precision spatial interaction in under 16ms.
        </p>
      </div>

      {/* 4-Step Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {STEPS.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className={`relative flex flex-col justify-between p-6 rounded-3xl bg-[#090b16]/70 backdrop-blur-md border ${item.borderColor} shadow-glass hover:shadow-neon-cyan transition-all duration-300 group`}
            >
              <div>
                {/* Step Number + Icon */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-2xl font-black font-mono text-gray-600 group-hover:text-cyan-400 transition-colors">
                    {item.step}
                  </span>
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} p-0.5 shadow-lg`}
                  >
                    <div className="w-full h-full bg-[#0a0c16] rounded-2xl flex items-center justify-center text-white">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-6">
                  {item.description}
                </p>
              </div>

              {/* Tech Tag */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-500">
                <span>{item.tech}</span>
                {index < STEPS.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 hidden lg:block text-gray-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
