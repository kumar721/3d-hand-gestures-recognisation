export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export type Landmark = Point3D;

export type Handedness = 'Left' | 'Right';

export interface HandData {
  landmarks: Landmark[];
  worldLandmarks?: Landmark[];
  handedness: Handedness;
  score: number;
}

export type GestureCategory = 'single' | 'two-hand' | 'motion';

export interface RecognizedGesture {
  id: string;
  name: string;
  emoji: string;
  category: GestureCategory;
  confidence: number; // 0 to 100
  description: string;
  handedness?: Handedness | 'Both';
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface GestureDefinition {
  id: string;
  name: string;
  emoji: string;
  category: GestureCategory;
  description: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  instructions: string;
}

export interface FingerState {
  extended: boolean;
  halfCurled: boolean;
  curled: boolean;
  direction: Point3D;
  tipToWristDist: number;
}

export interface HandAnalysis {
  handedness: Handedness;
  scale: number;
  wrist: Landmark;
  palmNormal: Point3D;
  palmCenter: Point3D;
  fingers: {
    thumb: FingerState;
    index: FingerState;
    middle: FingerState;
    ring: FingerState;
    pinky: FingerState;
  };
  roll: number;
  pitch: number;
}

export interface FrameHistoryItem {
  timestamp: number;
  hands: {
    wrist: Point3D;
    landmarks: Landmark[];
    handedness: Handedness;
    isOpen: boolean;
    isFist: boolean;
    roll: number;
    thumbTip: Point3D;
    indexTip: Point3D;
  }[];
}
