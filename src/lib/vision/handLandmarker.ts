import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { Landmark, Handedness } from '../gestures/types';

let landmarkerInstance: HandLandmarker | null = null;
let isInitializing = false;

export async function getHandLandmarker(): Promise<HandLandmarker> {
  if (landmarkerInstance) return landmarkerInstance;
  if (isInitializing) {
    while (isInitializing) {
      await new Promise((r) => setTimeout(r, 100));
    }
    if (landmarkerInstance) return landmarkerInstance;
  }

  isInitializing = true;
  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm'
    );

    landmarkerInstance = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    return landmarkerInstance;
  } catch (err) {
    console.warn('Failed to load GPU HandLandmarker, falling back to CPU delegate', err);
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm'
    );
    landmarkerInstance = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        delegate: 'CPU',
      },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    return landmarkerInstance;
  } finally {
    isInitializing = false;
  }
}

/**
 * Procedural demo hand generator for simulated test mode
 */
export function generateDemoLandmarks(timeMs: number): {
  landmarks: Landmark[];
  handedness: Handedness;
  score: number;
}[] {
  // Cycle through gestures every 3.5 seconds
  const phase = (timeMs / 3500) % 5;
  const cycle = Math.floor(phase);
  const t = (phase % 1);

  // Base hand coords (centered)
  const cx = 0.5 + Math.sin(timeMs / 1000) * 0.05;
  const cy = 0.55 + Math.cos(timeMs / 1200) * 0.03;
  const s = 0.18; // scale

  // 0: Wrist
  const lm: Landmark[] = new Array(21).fill(null).map(() => ({ x: cx, y: cy, z: 0 }));
  lm[0] = { x: cx, y: cy + s, z: 0 };

  // Knuckles MCP
  lm[1] = { x: cx - s * 0.4, y: cy + s * 0.7, z: -s * 0.1 };
  lm[2] = { x: cx - s * 0.5, y: cy + s * 0.4, z: -s * 0.15 };
  lm[5] = { x: cx - s * 0.3, y: cy + s * 0.1, z: 0 };
  lm[9] = { x: cx - s * 0.1, y: cy + s * 0.08, z: 0.02 };
  lm[13] = { x: cx + s * 0.1, y: cy + s * 0.1, z: 0.01 };
  lm[17] = { x: cx + s * 0.3, y: cy + s * 0.15, z: 0 };

  // Generate finger poses based on cycle:
  // 0: Peace / Victory
  // 1: Thumbs Up
  // 2: Rock On
  // 3: OK Sign
  // 4: Open Palm
  const fingerCurled = (mcp: Landmark, tipIdx: number) => {
    lm[tipIdx - 2] = { x: mcp.x, y: mcp.y - s * 0.2, z: 0.05 };
    lm[tipIdx - 1] = { x: mcp.x, y: mcp.y - s * 0.1, z: 0.1 };
    lm[tipIdx] = { x: mcp.x, y: mcp.y + s * 0.05, z: 0.08 }; // curled into palm
  };

  const fingerExtended = (mcp: Landmark, tipIdx: number, spreadX = 0) => {
    lm[tipIdx - 2] = { x: mcp.x + spreadX * 0.3, y: mcp.y - s * 0.3, z: 0 };
    lm[tipIdx - 1] = { x: mcp.x + spreadX * 0.7, y: mcp.y - s * 0.6, z: 0 };
    lm[tipIdx] = { x: mcp.x + spreadX, y: mcp.y - s * 0.95, z: 0 };
  };

  if (cycle === 0) {
    // Peace
    lm[3] = { x: cx - s * 0.3, y: cy + s * 0.3, z: 0.08 };
    lm[4] = { x: cx - s * 0.2, y: cy + s * 0.25, z: 0.1 };
    fingerExtended(lm[5], 8, -s * 0.25);
    fingerExtended(lm[9], 12, s * 0.25);
    fingerCurled(lm[13], 16);
    fingerCurled(lm[17], 20);
  } else if (cycle === 1) {
    // Thumbs Up
    lm[3] = { x: cx - s * 0.6, y: cy - s * 0.2, z: 0 };
    lm[4] = { x: cx - s * 0.65, y: cy - s * 0.65, z: 0 };
    fingerCurled(lm[5], 8);
    fingerCurled(lm[9], 12);
    fingerCurled(lm[13], 16);
    fingerCurled(lm[17], 20);
  } else if (cycle === 2) {
    // Rock On
    lm[3] = { x: cx - s * 0.2, y: cy + s * 0.3, z: 0.1 };
    lm[4] = { x: cx - s * 0.1, y: cy + s * 0.25, z: 0.12 };
    fingerExtended(lm[5], 8, -s * 0.2);
    fingerCurled(lm[9], 12);
    fingerCurled(lm[13], 16);
    fingerExtended(lm[17], 20, s * 0.25);
  } else if (cycle === 3) {
    // OK Sign
    lm[3] = { x: cx - s * 0.35, y: cy - s * 0.25, z: 0.05 };
    lm[4] = { x: cx - s * 0.2, y: cy - s * 0.35, z: 0.05 };
    lm[6] = { x: cx - s * 0.3, y: cy - s * 0.15, z: 0 };
    lm[7] = { x: cx - s * 0.28, y: cy - s * 0.3, z: 0.02 };
    lm[8] = { x: cx - s * 0.2, y: cy - s * 0.35, z: 0.05 }; // touch thumb
    fingerExtended(lm[9], 12, 0);
    fingerExtended(lm[13], 16, s * 0.15);
    fingerExtended(lm[17], 20, s * 0.3);
  } else {
    // Open Palm
    lm[3] = { x: cx - s * 0.6, y: cy + s * 0.1, z: 0 };
    lm[4] = { x: cx - s * 0.75, y: cy - s * 0.1, z: 0 };
    fingerExtended(lm[5], 8, -s * 0.2);
    fingerExtended(lm[9], 12, 0);
    fingerExtended(lm[13], 16, s * 0.2);
    fingerExtended(lm[17], 20, s * 0.35);
  }

  return [
    {
      landmarks: lm,
      handedness: 'Right',
      score: 0.98,
    },
  ];
}
