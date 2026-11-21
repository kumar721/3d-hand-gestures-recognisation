'use client';

import React, { useEffect, useState } from 'react';

export function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only enable custom cursor for pointer devices (mouse)
    const media = window.matchMedia('(pointer: fine)');
    if (!media.matches) return;

    const onMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.closest('button') ||
          target.closest('a') ||
          target.getAttribute('role') === 'button')
      ) {
        setIsPointer(true);
      } else {
        setIsPointer(false);
      }
    };

    const onMouseLeave = () => setVisible(false);

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  // Smooth trail animation
  useEffect(() => {
    let animId: number;
    const updateTrail = () => {
      setTrail((prev) => ({
        x: prev.x + (pos.x - prev.x) * 0.22,
        y: prev.y + (pos.y - prev.y) * 0.22,
      }));
      animId = requestAnimationFrame(updateTrail);
    };
    animId = requestAnimationFrame(updateTrail);
    return () => cancelAnimationFrame(animId);
  }, [pos]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Outer Cyber Ring */}
      <div
        style={{
          transform: `translate3d(${trail.x}px, ${trail.y}px, 0) translate(-50%, -50%)`,
        }}
        className={`absolute rounded-full border border-cyan-400/60 transition-[width,height,background-color] duration-150 ${
          isPointer
            ? 'w-10 h-10 bg-cyan-400/10 border-cyan-300 shadow-neon-cyan'
            : 'w-7 h-7 bg-transparent'
        }`}
      />

      {/* Inner Neon Dot */}
      <div
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`,
        }}
        className="absolute w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-neon-cyan"
      />
    </div>
  );
}
