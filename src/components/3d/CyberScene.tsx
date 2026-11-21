'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { MirrorHand3D } from './MirrorHand3D';

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate 1200 glowing floating cyber dust particles
  const [positions, colors] = useMemo(() => {
    const count = 1200;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const colorCyan = new THREE.Color('#00f0ff');
    const colorMagenta = new THREE.Color('#ff007f');
    const colorPurple = new THREE.Color('#9d4edd');

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;

      const mixed =
        Math.random() > 0.6
          ? colorCyan
          : Math.random() > 0.3
          ? colorMagenta
          : colorPurple;
      col[i * 3] = mixed.r;
      col[i * 3 + 1] = mixed.g;
      col[i * 3 + 2] = mixed.b;
    }
    return [pos, col];
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
      pointsRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} colors={colors} stride={3}>
      <PointMaterial
        transparent
        vertexColors
        size={0.045}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function CyberRings() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 0.2;
      ring1Ref.current.rotation.y += delta * 0.15;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.18;
      ring2Ref.current.rotation.z += delta * 0.22;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Holographic Ring */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.2, 0.012, 16, 100]} />
        <meshStandardMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={1.5}
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Inner Magenta Ring */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.8, 0.01, 16, 100]} />
        <meshStandardMaterial
          color="#ff007f"
          emissive="#ff007f"
          emissiveIntensity={1.5}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

interface CyberSceneProps {
  className?: string;
  enableControls?: boolean;
}

export function CyberScene({ className = '', enableControls = true }: CyberSceneProps) {
  return (
    <div className={`relative w-full h-full select-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#030307']} />
        
        {/* Ambient & Cyber Lights */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} color="#00f0ff" />
        <pointLight position={[-4, -3, 2]} intensity={2} color="#ff007f" />
        <pointLight position={[3, 4, -2]} intensity={1.8} color="#9d4edd" />

        <ParticleField />
        <CyberRings />

        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
          <MirrorHand3D scaleFactor={3.2} />
        </Float>

        {enableControls && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 1.6}
            minPolarAngle={Math.PI / 2.4}
            rotateSpeed={0.4}
          />
        )}
      </Canvas>

      {/* Cyber Corner HUD Reticles */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-cyan-400 opacity-60" />
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan-400 opacity-60" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-magenta-500 opacity-60" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-magenta-500 opacity-60" />
      </div>
    </div>
  );
}
