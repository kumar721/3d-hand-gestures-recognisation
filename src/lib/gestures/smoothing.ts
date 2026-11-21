import { Landmark, RecognizedGesture } from './types';

export class LandmarkSmoother {
  private prevLandmarks: Landmark[][] = [];
  private alpha: number;

  constructor(alpha = 0.65) {
    this.alpha = alpha;
  }

  public smooth(landmarks: Landmark[], handIndex = 0): Landmark[] {
    if (!this.prevLandmarks[handIndex] || this.prevLandmarks[handIndex].length !== landmarks.length) {
      this.prevLandmarks[handIndex] = landmarks.map((p) => ({ ...p }));
      return landmarks;
    }

    const prev = this.prevLandmarks[handIndex];
    const smoothed: Landmark[] = landmarks.map((curr, idx) => {
      const p = prev[idx];
      return {
        x: p.x * (1 - this.alpha) + curr.x * this.alpha,
        y: p.y * (1 - this.alpha) + curr.y * this.alpha,
        z: (p.z ?? 0) * (1 - this.alpha) + (curr.z ?? 0) * this.alpha,
      };
    });

    this.prevLandmarks[handIndex] = smoothed;
    return smoothed;
  }

  public reset(handIndex?: number): void {
    if (handIndex !== undefined) {
      this.prevLandmarks[handIndex] = [];
    } else {
      this.prevLandmarks = [];
    }
  }
}

export class MajorityVoteBuffer {
  private buffer: (RecognizedGesture | null)[] = [];
  private readonly bufferSize: number;
  private currentGesture: RecognizedGesture | null = null;
  private smoothedConfidence = 0;

  constructor(bufferSize = 5) {
    this.bufferSize = bufferSize;
  }

  public push(gesture: RecognizedGesture | null): RecognizedGesture | null {
    this.buffer.push(gesture);
    if (this.buffer.length > this.bufferSize) {
      this.buffer.shift();
    }

    // Count occurrences of each gesture id in buffer
    const counts: Record<string, { count: number; gesture: RecognizedGesture }> = {};
    let nullCount = 0;

    for (const item of this.buffer) {
      if (!item) {
        nullCount++;
      } else {
        if (!counts[item.id]) {
          counts[item.id] = { count: 1, gesture: item };
        } else {
          counts[item.id].count++;
        }
      }
    }

    // If mostly null (no gesture), clear current
    if (nullCount >= Math.ceil(this.bufferSize / 2)) {
      this.currentGesture = null;
      return null;
    }

    // Find majority winner
    let maxCount = 0;
    let winner: RecognizedGesture | null = null;

    for (const key of Object.keys(counts)) {
      if (counts[key].count > maxCount) {
        maxCount = counts[key].count;
        winner = counts[key].gesture;
      }
    }

    // Require at least 3 out of 5 frames to switch/sustain gesture
    if (winner && maxCount >= 3) {
      if (this.currentGesture?.id === winner.id) {
        // Smooth confidence
        this.smoothedConfidence =
          this.smoothedConfidence * 0.7 + winner.confidence * 0.3;
      } else {
        this.smoothedConfidence = winner.confidence;
      }

      this.currentGesture = {
        ...winner,
        confidence: Math.round(this.smoothedConfidence),
      };
      return this.currentGesture;
    }

    return this.currentGesture;
  }

  public clear(): void {
    this.buffer = [];
    this.currentGesture = null;
    this.smoothedConfidence = 0;
  }
}
