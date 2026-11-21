import { Landmark, RecognizedGesture, Handedness, HandAnalysis } from './types';
import { analyzeHand } from './geometry';
import { detectSingleHandGestures } from './singleHand';
import { detectTwoHandGestures } from './twoHand';
import { MotionTracker } from './motion';
import { LandmarkSmoother, MajorityVoteBuffer } from './smoothing';

export interface DetectionOutput {
  primaryGesture: RecognizedGesture | null;
  handGestures: (RecognizedGesture | null)[];
  analyses: HandAnalysis[];
  smoothedLandmarks: Landmark[][];
}

export class GestureDetector {
  private smoother: LandmarkSmoother;
  private majorityVote: MajorityVoteBuffer;
  private motionTracker: MotionTracker;

  constructor() {
    this.smoother = new LandmarkSmoother(0.7);
    this.majorityVote = new MajorityVoteBuffer(5);
    this.motionTracker = new MotionTracker();
  }

  public process(
    rawHands: {
      landmarks: Landmark[];
      handedness: Handedness;
      score: number;
    }[]
  ): DetectionOutput {
    if (!rawHands || rawHands.length === 0) {
      this.smoother.reset();
      this.motionTracker.clear();
      const primary = this.majorityVote.push(null);
      return {
        primaryGesture: primary,
        handGestures: [],
        analyses: [],
        smoothedLandmarks: [],
      };
    }

    // 1. Smooth landmarks with EMA
    const smoothedLandmarks = rawHands.map((h, i) =>
      this.smoother.smooth(h.landmarks, i)
    );

    // 2. Perform geometric analysis
    const analyses = rawHands.map((h, i) =>
      analyzeHand(smoothedLandmarks[i], h.handedness)
    );

    // 3. Update temporal motion buffer
    this.motionTracker.update(
      smoothedLandmarks.map((lm, i) => ({
        landmarks: lm,
        analysis: analyses[i],
      }))
    );

    // 4. Check for motion / sequence gestures
    const motionGesture = this.motionTracker.detectMotionGestures();

    // 5. Detect single-hand gestures for each hand
    const handGestures: (RecognizedGesture | null)[] = smoothedLandmarks.map((lm, i) =>
      detectSingleHandGestures(lm, analyses[i], i)
    );

    let candidateGesture: RecognizedGesture | null = null;

    if (motionGesture) {
      candidateGesture = motionGesture;
    } else if (rawHands.length >= 2) {
      // 6. Check two-hand gestures
      const twoHandGesture = detectTwoHandGestures(
        smoothedLandmarks[0],
        analyses[0],
        smoothedLandmarks[1],
        analyses[1],
        handGestures[0],
        handGestures[1]
      );

      if (twoHandGesture) {
        candidateGesture = twoHandGesture;
      } else {
        // Pick hand gesture with highest confidence
        const g1 = handGestures[0];
        const g2 = handGestures[1];
        if (g1 && g2) {
          candidateGesture = g1.confidence >= g2.confidence ? g1 : g2;
        } else {
          candidateGesture = g1 || g2 || null;
        }
      }
    } else {
      candidateGesture = handGestures[0] || null;
    }

    // 7. Pass candidate through majority vote buffer
    const primaryGesture = this.majorityVote.push(candidateGesture);

    return {
      primaryGesture,
      handGestures,
      analyses,
      smoothedLandmarks,
    };
  }

  public reset(): void {
    this.smoother.reset();
    this.majorityVote.clear();
    this.motionTracker.clear();
  }
}
