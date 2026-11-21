import { Landmark, RecognizedGesture, HandAnalysis, FrameHistoryItem } from './types';
import { dist3D, LANDMARK_INDEX } from './geometry';

export class MotionTracker {
  private history: FrameHistoryItem[] = [];
  private readonly MAX_HISTORY_LEN = 30; // ~1 second at 30fps
  private lastDetectedMotion: { gesture: RecognizedGesture; expireTime: number } | null = null;

  public update(
    handsData: {
      landmarks: Landmark[];
      analysis: HandAnalysis;
    }[]
  ): void {
    const now = performance.now();
    const frameItem: FrameHistoryItem = {
      timestamp: now,
      hands: handsData.map(({ landmarks, analysis }) => {
        const wrist = landmarks[LANDMARK_INDEX.WRIST];
        const thumbTip = landmarks[LANDMARK_INDEX.THUMB_TIP];
        const indexTip = landmarks[LANDMARK_INDEX.INDEX_TIP];
        const isOpen =
          analysis.fingers.index.extended &&
          analysis.fingers.middle.extended &&
          analysis.fingers.ring.extended &&
          analysis.fingers.pinky.extended;
        const isFist =
          analysis.fingers.index.curled &&
          analysis.fingers.middle.curled &&
          analysis.fingers.ring.curled &&
          analysis.fingers.pinky.curled;

        return {
          wrist: { x: wrist.x, y: wrist.y, z: wrist.z ?? 0 },
          landmarks,
          handedness: analysis.handedness,
          isOpen,
          isFist,
          roll: analysis.roll,
          thumbTip: { x: thumbTip.x, y: thumbTip.y, z: thumbTip.z ?? 0 },
          indexTip: { x: indexTip.x, y: indexTip.y, z: indexTip.z ?? 0 },
        };
      }),
    };

    this.history.push(frameItem);
    if (this.history.length > this.MAX_HISTORY_LEN) {
      this.history.shift();
    }
  }

  public detectMotionGestures(): RecognizedGesture | null {
    const now = performance.now();
    // Keep motion active for 650ms after detection so it's clearly visible in UI
    if (this.lastDetectedMotion && now < this.lastDetectedMotion.expireTime) {
      return this.lastDetectedMotion.gesture;
    }

    if (this.history.length < 8) return null;

    const detected =
      this.checkFistToOpenFlash() ||
      this.checkHandWave() ||
      this.checkSwipe() ||
      this.checkRotatingHand() ||
      this.checkPinchToZoom();

    if (detected) {
      this.lastDetectedMotion = {
        gesture: detected,
        expireTime: now + 700,
      };
      return detected;
    }

    return null;
  }

  /**
   * 37. Fist-to-Open Flash: Starts with closed fist and bursts into open palm.
   */
  private checkFistToOpenFlash(): RecognizedGesture | null {
    if (this.history.length < 10) return null;

    const recent = this.history.slice(-5);
    const older = this.history.slice(-15, -6);

    const wasFist = older.some((frame) => frame.hands.some((h) => h.isFist));
    const nowOpen = recent.every((frame) => frame.hands.some((h) => h.isOpen));

    if (wasFist && nowOpen) {
      return {
        id: 'fist_to_open_flash',
        name: 'Fist-to-Open Flash',
        emoji: '💥',
        category: 'motion',
        confidence: 94,
        description: 'Sequence: quick burst from closed fist into open palm',
        timestamp: Date.now(),
      };
    }
    return null;
  }

  /**
   * 31. Hand Wave 👋: Lateral back-and-forth oscillation of wrist X with open palm.
   */
  private checkHandWave(): RecognizedGesture | null {
    if (this.history.length < 12) return null;

    // Check primary hand
    const samples = this.history.map((f) => f.hands[0]).filter(Boolean);
    if (samples.length < 10) return null;

    const allOpen = samples.filter((s) => s.isOpen).length > samples.length * 0.7;
    if (!allOpen) return null;

    // Count direction reversals in X
    let reversals = 0;
    let lastDx = 0;
    for (let i = 1; i < samples.length; i++) {
      const dx = samples[i].wrist.x - samples[i - 1].wrist.x;
      if (Math.abs(dx) > 0.015) {
        if (lastDx !== 0 && Math.sign(dx) !== Math.sign(lastDx)) {
          reversals++;
        }
        lastDx = dx;
      }
    }

    if (reversals >= 2) {
      return {
        id: 'hand_wave',
        name: 'Hand Wave',
        emoji: '👋',
        category: 'motion',
        confidence: 93,
        description: 'Open hand waving back and forth horizontally',
        timestamp: Date.now(),
      };
    }
    return null;
  }

  /**
   * 34. Swipe Left / Swipe Right: Rapid horizontal movement of open hand.
   */
  private checkSwipe(): RecognizedGesture | null {
    if (this.history.length < 8) return null;

    const start = this.history[this.history.length - 7].hands[0];
    const end = this.history[this.history.length - 1].hands[0];
    if (!start || !end || !end.isOpen) return null;

    const dt =
      (this.history[this.history.length - 1].timestamp -
        this.history[this.history.length - 7].timestamp) /
      1000;
    if (dt <= 0) return null;

    const dx = end.wrist.x - start.wrist.x;
    const dy = end.wrist.y - start.wrist.y;
    const vx = dx / dt;

    // Strong horizontal motion with low vertical deviation
    if (Math.abs(vx) > 0.7 && Math.abs(dx) > 0.18 && Math.abs(dy) < 0.12) {
      const isRight = vx > 0;
      return {
        id: isRight ? 'swipe_right' : 'swipe_left',
        name: isRight ? 'Swipe Right' : 'Swipe Left',
        emoji: isRight ? '➡️' : '⬅️',
        category: 'motion',
        confidence: Math.min(98, Math.round(82 + Math.abs(vx) * 10)),
        description: isRight
          ? 'Fast horizontal swipe to the right'
          : 'Fast horizontal swipe to the left',
        timestamp: Date.now(),
      };
    }
    return null;
  }

  /**
   * 36. Rotating Hand: Continuous roll angle change around wrist axis.
   */
  private checkRotatingHand(): RecognizedGesture | null {
    if (this.history.length < 10) return null;

    const samples = this.history.map((f) => f.hands[0]).filter(Boolean);
    if (samples.length < 8) return null;

    const initialRoll = samples[0].roll;
    const finalRoll = samples[samples.length - 1].roll;
    let diff = finalRoll - initialRoll;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    if (Math.abs(diff) > 48) {
      return {
        id: 'rotating_hand',
        name: 'Rotating Hand',
        emoji: '🔄',
        category: 'motion',
        confidence: 90,
        description: 'Hand rotating axially around wrist',
        timestamp: Date.now(),
      };
    }
    return null;
  }

  /**
   * 35. Pinch-to-Zoom: Two hands pinching and changing mutual distance.
   */
  private checkPinchToZoom(): RecognizedGesture | null {
    if (this.history.length < 10) return null;

    const framesWith2Hands = this.history.filter((f) => f.hands.length >= 2);
    if (framesWith2Hands.length < 8) return null;

    const first = framesWith2Hands[0];
    const last = framesWith2Hands[framesWith2Hands.length - 1];

    const distFirst = dist3D(first.hands[0].wrist, first.hands[1].wrist);
    const distLast = dist3D(last.hands[0].wrist, last.hands[1].wrist);
    const delta = distLast - distFirst;

    if (Math.abs(delta) > 0.15) {
      const isZoomIn = delta > 0;
      return {
        id: 'pinch_to_zoom',
        name: isZoomIn ? 'Pinch-to-Zoom (Spread)' : 'Pinch-to-Zoom (Pinch)',
        emoji: '🔍',
        category: 'motion',
        confidence: 92,
        description: isZoomIn
          ? 'Two hands moving apart to zoom in'
          : 'Two hands moving together to zoom out',
        timestamp: Date.now(),
      };
    }
    return null;
  }

  public clear(): void {
    this.history = [];
    this.lastDetectedMotion = null;
  }
}
