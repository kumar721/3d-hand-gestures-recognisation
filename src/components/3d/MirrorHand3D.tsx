'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGestureStore } from '@/lib/store/useGestureStore';

// Connections between the 21 MediaPipe hand landmarks
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
  // Palm bridges
  [5, 9], [9, 13], [13, 17],
];

interface MirrorHand3DProps {
  handIndex?: number;
  scaleFactor?: number;
}

export function MirrorHand3D({ handIndex = 0, scaleFactor = 3.5 }: MirrorHand3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const jointsRef = useRef<THREE.Mesh[]>([]);
  const bonesRef = useRef<THREE.Mesh[]>([]);

  const rawLandmarks = useGestureStore((state) => state.landmarks);
  const primaryGesture = useGestureStore((state) => state.primaryGesture);

  // Reusable vectors for bone transforms
  const pA = useMemo(() => new THREE.Vector3(), []);
  const pB = useMemo(() => new THREE.Vector3(), []);
  const boneMid = useMemo(() => new THREE.Vector3(), []);
  const boneDir = useMemo(() => new THREE.Vector3(), []);
  const upVec = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const quat = useMemo(() => new THREE.Quaternion(), []);

  // Cyber glowing materials
  const jointMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#00f0ff'),
        emissive: new THREE.Color('#0099ff'),
        emissiveIntensity: 0.9,
        roughness: 0.2,
        metalness: 0.9,
      }),
    []
  );

  const tipMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ff007f'),
        emissive: new THREE.Color('#ff007f'),
        emissiveIntensity: 1.2,
        roughness: 0.1,
        metalness: 0.95,
      }),
    []
  );

  const boneMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#9d4edd'),
        emissive: new THREE.Color('#7b2cbf'),
        emissiveIntensity: 0.5,
        roughness: 0.3,
        metalness: 0.8,
        transparent: true,
        opacity: 0.85,
      }),
    []
  );

  const sphereGeo = useMemo(() => new THREE.SphereGeometry(0.045, 16, 16), []);
  const tipSphereGeo = useMemo(() => new THREE.SphereGeometry(0.06, 16, 16), []);
  const cylinderGeo = useMemo(() => new THREE.CylinderGeometry(0.02, 0.02, 1, 12), []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();
    const handLms = rawLandmarks[handIndex];

    if (handLms && handLms.length === 21) {
      // Real-time tracking from live hand
      // MediaPipe coords: x: 0..1 (left to right), y: 0..1 (top to bottom), z: depth
      // Invert X so it works as a natural mirror, center around origin
      for (let i = 0; i < 21; i++) {
        const lm = handLms[i];
        const jointMesh = jointsRef.current[i];
        if (jointMesh) {
          const targetX = -(lm.x - 0.5) * scaleFactor;
          const targetY = -(lm.y - 0.5) * scaleFactor;
          const targetZ = -(lm.z ?? 0) * scaleFactor;

          // Smooth interpolation towards target
          jointMesh.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.35);
        }
      }

      // Re-orient bones between connected joints
      CONNECTIONS.forEach(([idxA, idxB], boneIdx) => {
        const boneMesh = bonesRef.current[boneIdx];
        const jA = jointsRef.current[idxA];
        const jB = jointsRef.current[idxB];
        if (boneMesh && jA && jB) {
          pA.copy(jA.position);
          pB.copy(jB.position);

          boneMid.addVectors(pA, pB).multiplyScalar(0.5);
          boneMesh.position.copy(boneMid);

          const dist = pA.distanceTo(pB);
          boneMesh.scale.set(1, dist, 1);

          boneDir.subVectors(pB, pA).normalize();
          quat.setFromUnitVectors(upVec, boneDir);
          boneMesh.quaternion.copy(quat);
        }
      });

      // Subtle float when tracking
      groupRef.current.position.y = Math.sin(time * 1.5) * 0.05;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.1);
    } else {
      // Idle Animation: Wave & cyber breathing when no hand is detected
      const wave = Math.sin(time * 1.8);
      const idleBaseY = Math.sin(time * 1.2) * 0.1;
      groupRef.current.position.y = idleBaseY;
      groupRef.current.rotation.y = Math.sin(time * 0.8) * 0.25;

      // Position procedural idle hand
      for (let i = 0; i < 21; i++) {
        const jointMesh = jointsRef.current[i];
        if (jointMesh) {
          // Synthetic rest pose with idle finger ripples
          const col = i % 4;
          const row = Math.floor(i / 4);
          const idleX = (col - 1.5) * 0.28;
          const idleY = (row - 2) * 0.35 + Math.sin(time * 2.5 + i * 0.3) * 0.06;
          const idleZ = Math.cos(time * 2 + i * 0.2) * 0.08;

          jointMesh.position.lerp(new THREE.Vector3(idleX, idleY, idleZ), 0.1);
        }
      }

      CONNECTIONS.forEach(([idxA, idxB], boneIdx) => {
        const boneMesh = bonesRef.current[boneIdx];
        const jA = jointsRef.current[idxA];
        const jB = jointsRef.current[idxB];
        if (boneMesh && jA && jB) {
          pA.copy(jA.position);
          pB.copy(jB.position);
          boneMid.addVectors(pA, pB).multiplyScalar(0.5);
          boneMesh.position.copy(boneMid);
          const dist = pA.distanceTo(pB);
          boneMesh.scale.set(1, Math.max(0.01, dist), 1);
          boneDir.subVectors(pB, pA).normalize();
          quat.setFromUnitVectors(upVec, boneDir);
          boneMesh.quaternion.copy(quat);
        }
      });
    }

    // React to primary gesture with dynamic pulse colors
    if (primaryGesture) {
      jointMaterial.emissiveIntensity = 1.3 + Math.sin(time * 8) * 0.4;
      tipMaterial.emissiveIntensity = 1.6 + Math.cos(time * 8) * 0.5;
    } else {
      jointMaterial.emissiveIntensity = 0.8;
      tipMaterial.emissiveIntensity = 1.0;
    }
  });

  const tipIndices = [4, 8, 12, 16, 20];

  return (
    <group ref={groupRef}>
      {/* 21 Joints */}
      {Array.from({ length: 21 }).map((_, i) => (
        <mesh
          key={`joint-${i}`}
          ref={(el) => {
            if (el) jointsRef.current[i] = el;
          }}
          geometry={tipIndices.includes(i) ? tipSphereGeo : sphereGeo}
          material={tipIndices.includes(i) ? tipMaterial : jointMaterial}
        />
      ))}

      {/* 23 Skeleton Bones */}
      {CONNECTIONS.map(([a, b], idx) => (
        <mesh
          key={`bone-${idx}`}
          ref={(el) => {
            if (el) bonesRef.current[idx] = el;
          }}
          geometry={cylinderGeo}
          material={boneMaterial}
        />
      ))}
    </group>
  );
}
