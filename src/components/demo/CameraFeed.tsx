'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { getHandLandmarker, generateDemoLandmarks } from '@/lib/vision/handLandmarker';
import { GestureDetector } from '@/lib/gestures/detector';
import { useGestureStore } from '@/lib/store/useGestureStore';
import { SkeletonCanvas } from './SkeletonCanvas';
import { GestureHUD } from './GestureHUD';
import { Camera, CameraOff, Play, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { HandLandmarker } from '@mediapipe/tasks-vision';
import { Handedness, Landmark } from '@/lib/gestures/types';

export function CameraFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const detectorRef = useRef<GestureDetector>(new GestureDetector());
  const animFrameRef = useRef<number | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);

  const [dimensions, setDimensions] = useState({ width: 640, height: 480 });
  const [initError, setInitError] = useState<string | null>(null);

  const {
    isCameraActive,
    isCameraLoading,
    isDemoMode,
    landmarks,
    setDetection,
    setCameraActive,
    setCameraLoading,
    setDemoMode,
  } = useGestureStore();

  // Resize listener
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({
          width: clientWidth || 640,
          height: clientHeight || 480,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Frame processing loop
  const lastTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const fpsRef = useRef<number>(0);
  const lastFpsCalcRef = useRef<number>(performance.now());

  const processFrame = useCallback(() => {
    const now = performance.now();
    frameCountRef.current++;

    if (now - lastFpsCalcRef.current >= 1000) {
      fpsRef.current = frameCountRef.current;
      frameCountRef.current = 0;
      lastFpsCalcRef.current = now;
    }

    if (isDemoMode) {
      // Demo Mode: Procedural simulated hands
      const demoHands = generateDemoLandmarks(now);
      const output = detectorRef.current.process(demoHands);
      setDetection(
        output.primaryGesture,
        output.handGestures,
        output.smoothedLandmarks,
        fpsRef.current || 30
      );
    } else if (
      videoRef.current &&
      videoRef.current.readyState >= 2 &&
      landmarkerRef.current
    ) {
      // Real WebCam Mode
      try {
        const results = landmarkerRef.current.detectForVideo(videoRef.current, now);

        if (results && results.landmarks && results.landmarks.length > 0) {
          const rawHands = results.landmarks.map((lms, idx) => {
            const handednessStr =
              results.handedness && results.handedness[idx] && results.handedness[idx][0]
                ? results.handedness[idx][0].categoryName
                : idx === 0
                ? 'Right'
                : 'Left';
            const handedness: Handedness = handednessStr === 'Left' ? 'Left' : 'Right';
            const score =
              results.handedness && results.handedness[idx] && results.handedness[idx][0]
                ? results.handedness[idx][0].score
                : 0.9;

            return {
              landmarks: lms as Landmark[],
              handedness,
              score,
            };
          });

          const output = detectorRef.current.process(rawHands);
          setDetection(
            output.primaryGesture,
            output.handGestures,
            output.smoothedLandmarks,
            fpsRef.current
          );
        } else {
          // No hand detected in current frame
          const output = detectorRef.current.process([]);
          setDetection(null, [], [], fpsRef.current);
        }
      } catch (err) {
        console.error('HandLandmarker video frame error', err);
      }
    }

    animFrameRef.current = requestAnimationFrame(processFrame);
  }, [isDemoMode, setDetection]);

  // Start webcam
  const startCamera = async () => {
    setCameraLoading(true);
    setInitError(null);
    try {
      // Initialize MediaPipe Tasks Vision Landmarker
      if (!landmarkerRef.current) {
        landmarkerRef.current = await getHandLandmarker();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        setDemoMode(false);
      }
    } catch (err: any) {
      console.warn('Webcam permission denied or unavailable:', err);
      setInitError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Click "Demo Video Mode" below to try simulation.'
          : 'No camera found. Click "Demo Video Mode" to test with simulated hand data.'
      );
      // Auto fallback to demo mode
      setDemoMode(true);
      setCameraActive(false);
    } finally {
      setCameraLoading(false);
    }
  };

  // Stop webcam
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Trigger frame loop on mount or mode change
  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(processFrame);
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [processFrame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video max-h-[580px] bg-[#07080f] rounded-3xl overflow-hidden border border-white/10 shadow-glass group"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`w-full h-full object-cover transform -scale-x-100 ${
          isCameraActive ? 'opacity-90' : 'hidden'
        }`}
      />

      {/* Demo Mode Background Pattern */}
      {isDemoMode && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-radial-gradient from-cyan-950/40 to-[#07080f]">
          <div className="absolute inset-0 bg-cyber-grid bg-[size:32px_32px] opacity-25" />
          <div className="z-10 flex flex-col items-center gap-2 pointer-events-none">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 font-mono text-xs flex items-center gap-1.5 shadow-neon-cyan">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              DEMO SIMULATION ACTIVE
            </span>
            <p className="text-gray-400 text-xs">
              Cycling through procedural hand gestures in real time
            </p>
          </div>
        </div>
      )}

      {/* Inactive Standby Screen */}
      {!isCameraActive && !isDemoMode && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/60 backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400 shadow-neon-cyan">
            <Camera className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-white mb-2">Webcam Recognition Ready</h4>
          <p className="text-sm text-gray-400 max-w-sm mb-6">
            Enable your webcam for real-time 3D hand tracking, or start the simulated demo mode.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={startCamera}
              disabled={isCameraLoading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm tracking-wide shadow-neon-cyan transition-all flex items-center gap-2"
            >
              {isCameraLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Initializing MediaPipe...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Enable Webcam
                </>
              )}
            </button>

            <button
              onClick={() => setDemoMode(true)}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium text-sm border border-white/10 transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-magenta" />
              Demo Simulation Mode
            </button>
          </div>

          {initError && (
            <div className="mt-4 flex items-center gap-2 text-xs text-amber-400 bg-amber-950/50 px-4 py-2 rounded-lg border border-amber-800/50">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{initError}</span>
            </div>
          )}
        </div>
      )}

      {/* Glowing 3D-Style Skeleton Canvas */}
      {(isCameraActive || isDemoMode) && (
        <SkeletonCanvas
          landmarks={landmarks}
          width={dimensions.width}
          height={dimensions.height}
          mirrored={true}
        />
      )}

      {/* Floating HUD over hands */}
      {(isCameraActive || isDemoMode) && (
        <GestureHUD
          containerWidth={dimensions.width}
          containerHeight={dimensions.height}
          mirrored={true}
        />
      )}

      {/* Floating Action Bar at Bottom of Video */}
      {(isCameraActive || isDemoMode) && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto z-30">
          <div className="flex items-center gap-2">
            {isCameraActive ? (
              <button
                onClick={stopCamera}
                className="px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-md border border-red-500/40 text-red-400 text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <CameraOff className="w-3.5 h-3.5" />
                Stop Camera
              </button>
            ) : (
              <button
                onClick={startCamera}
                className="px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-md border border-cyan-500/40 text-cyan-400 text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                Switch to Webcam
              </button>
            )}

            <button
              onClick={() => setDemoMode(!isDemoMode)}
              className={`px-3 py-1.5 rounded-lg backdrop-blur-md border text-xs font-mono flex items-center gap-1.5 transition-colors ${
                isDemoMode
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-black/70 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isDemoMode ? 'Demo Mode: ON' : 'Demo Mode'}
            </button>
          </div>

          <div className="text-[11px] font-mono text-gray-400 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
            MediaPipe Tasks Vision v0.10
          </div>
        </div>
      )}
    </div>
  );
}
