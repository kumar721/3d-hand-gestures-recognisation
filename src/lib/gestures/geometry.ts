import { Landmark, Point3D, FingerState, HandAnalysis, Handedness } from './types';

export const LANDMARK_INDEX = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_DIP: 7,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_DIP: 11,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_DIP: 15,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
} as const;

export function dist3D(a: Point3D, b: Point3D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z ?? 0) - (b.z ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function dist2D(a: Point3D, b: Point3D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function sub(a: Point3D, b: Point3D): Point3D {
  return { x: a.x - b.x, y: a.y - b.y, z: (a.z ?? 0) - (b.z ?? 0) };
}

export function add(a: Point3D, b: Point3D): Point3D {
  return { x: a.x + b.x, y: a.y + b.y, z: (a.z ?? 0) + (b.z ?? 0) };
}

export function scale(v: Point3D, s: number): Point3D {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

export function dot(a: Point3D, b: Point3D): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function length(v: Point3D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

export function normalize(v: Point3D): Point3D {
  const len = length(v);
  if (len === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

export function cross(a: Point3D, b: Point3D): Point3D {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function angleBetween(a: Point3D, b: Point3D): number {
  const na = normalize(a);
  const nb = normalize(b);
  const cosTheta = Math.max(-1, Math.min(1, dot(na, nb)));
  return Math.acos(cosTheta) * (180 / Math.PI);
}

/**
 * Scale factor based on distance between wrist and middle MCP.
 * This makes threshold comparisons invariant to user distance from webcam.
 */
export function getHandScale(lm: Landmark[]): number {
  const wrist = lm[LANDMARK_INDEX.WRIST];
  const middleMcp = lm[LANDMARK_INDEX.MIDDLE_MCP];
  return Math.max(0.01, dist3D(wrist, middleMcp));
}

/**
 * Palm center calculated from wrist, index MCP, and pinky MCP.
 */
export function getPalmCenter(lm: Landmark[]): Point3D {
  const w = lm[LANDMARK_INDEX.WRIST];
  const im = lm[LANDMARK_INDEX.INDEX_MCP];
  const pm = lm[LANDMARK_INDEX.PINKY_MCP];
  return {
    x: (w.x + im.x + pm.x) / 3,
    y: (w.y + im.y + pm.y) / 3,
    z: ((w.z ?? 0) + (im.z ?? 0) + (pm.z ?? 0)) / 3,
  };
}

/**
 * Computes palm normal vector pointing away from palm face.
 */
export function getPalmNormal(lm: Landmark[], handedness: Handedness): Point3D {
  const wrist = lm[LANDMARK_INDEX.WRIST];
  const indexMcp = lm[LANDMARK_INDEX.INDEX_MCP];
  const pinkyMcp = lm[LANDMARK_INDEX.PINKY_MCP];

  const v1 = sub(indexMcp, wrist);
  const v2 = sub(pinkyMcp, wrist);
  let normal = normalize(cross(v1, v2));

  // Invert normal for left hand to ensure uniform "outward palm" direction
  if (handedness === 'Left') {
    normal = scale(normal, -1);
  }
  return normal;
}

/**
 * Analyzes state of an individual finger.
 */
function analyzeFinger(
  lm: Landmark[],
  tipIdx: number,
  dipIdx: number,
  pipIdx: number,
  mcpIdx: number,
  handScale: number
): FingerState {
  const tip = lm[tipIdx];
  const dip = lm[dipIdx];
  const pip = lm[pipIdx];
  const mcp = lm[mcpIdx];
  const wrist = lm[LANDMARK_INDEX.WRIST];

  const tipToWrist = dist3D(tip, wrist);
  const pipToWrist = dist3D(pip, wrist);
  const mcpToWrist = dist3D(mcp, wrist);

  const bone1 = sub(pip, mcp);
  const bone2 = sub(dip, pip);
  const bone3 = sub(tip, dip);

  const angle1 = angleBetween(bone1, bone2);
  const angle2 = angleBetween(bone2, bone3);
  const totalBend = angle1 + angle2;

  const direction = normalize(sub(tip, mcp));

  // A finger is extended when tip is farther from wrist than PIP and bend angle is small
  const isExtended = tipToWrist > pipToWrist * 1.05 && totalBend < 55;
  // Curled when tip is closer to wrist than PIP or bend angle is large
  const isCurled = tipToWrist < pipToWrist * 0.95 || totalBend > 85;
  const isHalfCurled = !isExtended && !isCurled;

  return {
    extended: isExtended,
    halfCurled: isHalfCurled,
    curled: isCurled,
    direction,
    tipToWristDist: tipToWrist / handScale,
  };
}

/**
 * Analyzes thumb state (thumb has different anatomy: CMC, MCP, IP, TIP).
 */
function analyzeThumb(lm: Landmark[], handScale: number): FingerState {
  const tip = lm[LANDMARK_INDEX.THUMB_TIP];
  const ip = lm[LANDMARK_INDEX.THUMB_IP];
  const mcp = lm[LANDMARK_INDEX.THUMB_MCP];
  const cmc = lm[LANDMARK_INDEX.THUMB_CMC];
  const wrist = lm[LANDMARK_INDEX.WRIST];
  const pinkyMcp = lm[LANDMARK_INDEX.PINKY_MCP];

  const tipToPinkyMcp = dist3D(tip, pinkyMcp);
  const ipToPinkyMcp = dist3D(ip, pinkyMcp);
  const tipToWrist = dist3D(tip, wrist);
  const mcpToWrist = dist3D(mcp, wrist);

  const b1 = sub(mcp, cmc);
  const b2 = sub(ip, mcp);
  const b3 = sub(tip, ip);
  const totalBend = angleBetween(b1, b2) + angleBetween(b2, b3);

  // Extended when pointing away from pinky MCP and bend is low
  const isExtended = tipToPinkyMcp > ipToPinkyMcp * 1.08 && tipToWrist > mcpToWrist * 1.15;
  const isCurled = tipToPinkyMcp < ipToPinkyMcp * 0.95 || totalBend > 65;

  return {
    extended: isExtended,
    halfCurled: !isExtended && !isCurled,
    curled: isCurled,
    direction: normalize(sub(tip, cmc)),
    tipToWristDist: tipToWrist / handScale,
  };
}

/**
 * Full structural analysis of one hand.
 */
export function analyzeHand(lm: Landmark[], handedness: Handedness = 'Right'): HandAnalysis {
  const scaleVal = getHandScale(lm);
  const wrist = lm[LANDMARK_INDEX.WRIST];
  const palmNormal = getPalmNormal(lm, handedness);
  const palmCenter = getPalmCenter(lm);

  const thumb = analyzeThumb(lm, scaleVal);
  const index = analyzeFinger(lm, LANDMARK_INDEX.INDEX_TIP, LANDMARK_INDEX.INDEX_DIP, LANDMARK_INDEX.INDEX_PIP, LANDMARK_INDEX.INDEX_MCP, scaleVal);
  const middle = analyzeFinger(lm, LANDMARK_INDEX.MIDDLE_TIP, LANDMARK_INDEX.MIDDLE_DIP, LANDMARK_INDEX.MIDDLE_PIP, LANDMARK_INDEX.MIDDLE_MCP, scaleVal);
  const ring = analyzeFinger(lm, LANDMARK_INDEX.RING_TIP, LANDMARK_INDEX.RING_DIP, LANDMARK_INDEX.RING_PIP, LANDMARK_INDEX.RING_MCP, scaleVal);
  const pinky = analyzeFinger(lm, LANDMARK_INDEX.PINKY_TIP, LANDMARK_INDEX.PINKY_DIP, LANDMARK_INDEX.PINKY_PIP, LANDMARK_INDEX.PINKY_MCP, scaleVal);

  // Hand Roll (angle around Z axis)
  const indexMcp = lm[LANDMARK_INDEX.INDEX_MCP];
  const pinkyMcp = lm[LANDMARK_INDEX.PINKY_MCP];
  const dx = pinkyMcp.x - indexMcp.x;
  const dy = pinkyMcp.y - indexMcp.y;
  const roll = Math.atan2(dy, dx) * (180 / Math.PI);

  // Hand Pitch (wrist to middle MCP in YZ)
  const middleMcp = lm[LANDMARK_INDEX.MIDDLE_MCP];
  const dyPitch = middleMcp.y - wrist.y;
  const dzPitch = (middleMcp.z ?? 0) - (wrist.z ?? 0);
  const pitch = Math.atan2(dzPitch, -dyPitch) * (180 / Math.PI);

  return {
    handedness,
    scale: scaleVal,
    wrist,
    palmNormal,
    palmCenter,
    fingers: {
      thumb,
      index,
      middle,
      ring,
      pinky,
    },
    roll,
    pitch,
  };
}
