'use client';

import React, { useEffect, useRef } from 'react';
import { Landmark } from '@/lib/gestures/types';

interface SkeletonCanvasProps {
  landmarks: Landmark[][];
  width: number;
  height: number;
  mirrored?: boolean;
}

const CONNECTIONS: [number, number][] = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Knuckle connections
  [5, 9], [9, 13], [13, 17],
];

const FINGERTIPS = [4, 8, 12, 16, 20];

export function SkeletonCanvas({
  landmarks,
  width,
  height,
  mirrored = true,
}: SkeletonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    if (!landmarks || landmarks.length === 0) return;

    landmarks.forEach((hand, handIdx) => {
      if (!hand || hand.length < 21) return;

      const isFirstHand = handIdx === 0;
      const primaryColor = isFirstHand ? '#00f0ff' : '#ff007f';
      const secondaryColor = isFirstHand ? '#9d4edd' : '#00ff88';

      // 1. Draw glowing palm polygon
      ctx.save();
      ctx.beginPath();
      const palmIndices = [0, 5, 9, 13, 17];
      palmIndices.forEach((idx, i) => {
        const pt = hand[idx];
        const x = mirrored ? (1 - pt.x) * width : pt.x * width;
        const y = pt.y * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = isFirstHand
        ? 'rgba(0, 240, 255, 0.08)'
        : 'rgba(255, 0, 127, 0.08)';
      ctx.fill();
      ctx.restore();

      // 2. Draw holographic skeleton bones
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      CONNECTIONS.forEach(([startIdx, endIdx]) => {
        const p1 = hand[startIdx];
        const p2 = hand[endIdx];
        const x1 = mirrored ? (1 - p1.x) * width : p1.x * width;
        const y1 = p1.y * height;
        const x2 = mirrored ? (1 - p2.x) * width : p2.x * width;
        const y2 = p2.y * height;

        // Outer glow
        ctx.shadowBlur = 12;
        ctx.shadowColor = primaryColor;
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 3.5;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Inner neon core line
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
      ctx.restore();

      // 3. Draw cyber joints
      hand.forEach((pt, idx) => {
        const x = mirrored ? (1 - pt.x) * width : pt.x * width;
        const y = pt.y * height;
        const isTip = FINGERTIPS.includes(idx);
        const isWrist = idx === 0;

        ctx.save();
        if (isTip) {
          // Fingertips: extra large pulsating rings
          ctx.shadowBlur = 16;
          ctx.shadowColor = secondaryColor;

          // Outer ring
          ctx.beginPath();
          ctx.arc(x, y, 9, 0, Math.PI * 2);
          ctx.strokeStyle = secondaryColor;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Core dot
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        } else if (isWrist) {
          // Wrist: square cyber anchor
          ctx.shadowBlur = 14;
          ctx.shadowColor = primaryColor;
          ctx.strokeStyle = primaryColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(x - 7, y - 7, 14, 14);

          ctx.fillStyle = primaryColor;
          ctx.fillRect(x - 3, y - 3, 6, 6);
        } else {
          // Regular knuckles
          ctx.shadowBlur = 8;
          ctx.shadowColor = primaryColor;

          ctx.beginPath();
          ctx.arc(x, y, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = primaryColor;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
        ctx.restore();
      });
    });
  }, [landmarks, width, height, mirrored]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="pointer-events-none absolute inset-0 z-20 h-full w-full object-contain"
    />
  );
}
