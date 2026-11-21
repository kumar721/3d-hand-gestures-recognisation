import { Landmark, RecognizedGesture, HandAnalysis } from './types';
import { LANDMARK_INDEX, dist3D, dist2D, sub, normalize } from './geometry';

export interface SingleHandDetection {
  gesture: RecognizedGesture | null;
  allMatches: { id: string; name: string; emoji: string; confidence: number }[];
}

export function detectSingleHandGestures(
  landmarks: Landmark[],
  analysis: HandAnalysis,
  handIndex = 0
): RecognizedGesture | null {
  const { fingers, scale, wrist, palmNormal, handedness } = analysis;
  const lm = landmarks;

  const thumb = fingers.thumb;
  const index = fingers.index;
  const middle = fingers.middle;
  const ring = fingers.ring;
  const pinky = fingers.pinky;

  const matches: { id: string; name: string; emoji: string; confidence: number; desc: string }[] = [];

  const thumbTip = lm[LANDMARK_INDEX.THUMB_TIP];
  const indexTip = lm[LANDMARK_INDEX.INDEX_TIP];
  const middleTip = lm[LANDMARK_INDEX.MIDDLE_TIP];
  const ringTip = lm[LANDMARK_INDEX.RING_TIP];
  const pinkyTip = lm[LANDMARK_INDEX.PINKY_TIP];

  const thumbMcp = lm[LANDMARK_INDEX.THUMB_MCP];
  const indexMcp = lm[LANDMARK_INDEX.INDEX_MCP];
  const middleMcp = lm[LANDMARK_INDEX.MIDDLE_MCP];
  const ringMcp = lm[LANDMARK_INDEX.RING_MCP];
  const pinkyMcp = lm[LANDMARK_INDEX.PINKY_MCP];

  // Distances normalized by hand scale
  const thumbIndexDist = dist3D(thumbTip, indexTip) / scale;
  const indexMiddleDist = dist3D(indexTip, middleTip) / scale;
  const middleRingDist = dist3D(middleTip, ringTip) / scale;
  const ringPinkyDist = dist3D(ringTip, pinkyTip) / scale;

  // 1. Thumbs Up 👍
  if (
    thumb.extended &&
    index.curled &&
    middle.curled &&
    ring.curled &&
    pinky.curled &&
    thumbTip.y < wrist.y - 0.25 * scale &&
    thumbTip.y < thumbMcp.y
  ) {
    const verticalAlign = Math.max(0, -thumb.direction.y);
    matches.push({
      id: 'thumbs_up',
      name: 'Thumbs Up',
      emoji: '👍',
      confidence: Math.min(99, Math.round(75 + verticalAlign * 24)),
      desc: 'Thumb pointing upward with fingers curled',
    });
  }

  // 2. Thumbs Down 👎
  if (
    thumb.extended &&
    index.curled &&
    middle.curled &&
    ring.curled &&
    pinky.curled &&
    thumbTip.y > wrist.y + 0.15 * scale &&
    thumbTip.y > thumbMcp.y
  ) {
    const downAlign = Math.max(0, thumb.direction.y);
    matches.push({
      id: 'thumbs_down',
      name: 'Thumbs Down',
      emoji: '👎',
      confidence: Math.min(99, Math.round(75 + downAlign * 24)),
      desc: 'Thumb pointing downward with fingers curled',
    });
  }

  // 3. Victory / Peace ✌️
  if (
    index.extended &&
    middle.extended &&
    ring.curled &&
    pinky.curled &&
    indexMiddleDist > 0.2
  ) {
    matches.push({
      id: 'victory',
      name: 'Victory / Peace',
      emoji: '✌️',
      confidence: Math.min(99, Math.round(82 + Math.min(16, indexMiddleDist * 20))),
      desc: 'Index and middle fingers extended in a V shape',
    });
  }

  // 6. OK Sign 👌 (Check before Pinch & Open Palm)
  if (
    thumbIndexDist < 0.32 &&
    middle.extended &&
    ring.extended &&
    pinky.extended
  ) {
    const touchBonus = Math.max(0, (0.32 - thumbIndexDist) / 0.32);
    matches.push({
      id: 'ok_sign',
      name: 'OK Sign',
      emoji: '👌',
      confidence: Math.min(99, Math.round(80 + touchBonus * 18)),
      desc: 'Thumb and index tips touching with other fingers extended',
    });
  }

  // 16. Pinch 🤏
  if (
    thumbIndexDist < 0.26 &&
    !middle.extended &&
    !ring.extended &&
    !pinky.extended
  ) {
    const proximity = Math.max(0, (0.26 - thumbIndexDist) / 0.26);
    matches.push({
      id: 'pinch',
      name: 'Pinch',
      emoji: '🤏',
      confidence: Math.min(99, Math.round(82 + proximity * 16)),
      desc: 'Thumb and index tips touching with other fingers folded',
    });
  }

  // 17. Fingers Crossed 🤞
  if (
    index.extended &&
    middle.extended &&
    ring.curled &&
    pinky.curled &&
    indexMiddleDist < 0.22
  ) {
    // Check if index and middle cross over in X
    const crossed = (indexTip.x - middleTip.x) * (indexMcp.x - middleMcp.x) < 0 || indexMiddleDist < 0.15;
    if (crossed) {
      matches.push({
        id: 'fingers_crossed',
        name: 'Fingers Crossed',
        emoji: '🤞',
        confidence: 88,
        desc: 'Index and middle fingers crossed over each other',
      });
    }
  }

  // 18. Vulcan Salute 🖖
  if (
    index.extended &&
    middle.extended &&
    ring.extended &&
    pinky.extended &&
    indexMiddleDist < 0.28 &&
    ringPinkyDist < 0.28 &&
    middleRingDist > 0.38
  ) {
    matches.push({
      id: 'vulcan_salute',
      name: 'Vulcan Salute',
      emoji: '🖖',
      confidence: Math.min(99, Math.round(80 + (middleRingDist - 0.38) * 35)),
      desc: 'Fingers parted between middle and ring in a V split',
    });
  }

  // 11. Rock On / Horns 🤘
  if (
    index.extended &&
    pinky.extended &&
    middle.curled &&
    ring.curled
  ) {
    matches.push({
      id: 'rock_on',
      name: 'Rock On / Horns',
      emoji: '🤘',
      confidence: 93,
      desc: 'Index and pinky fingers extended, middle and ring curled',
    });
  }

  // 15. Shaka / Call Me 🤙
  if (
    thumb.extended &&
    pinky.extended &&
    index.curled &&
    middle.curled &&
    ring.curled
  ) {
    matches.push({
      id: 'shaka',
      name: 'Shaka / Call Me',
      emoji: '🤙',
      confidence: 92,
      desc: 'Thumb and pinky extended outward, inner fingers curled',
    });
  }

  // 19. Gun Shape 🔫
  if (
    thumb.extended &&
    index.extended &&
    middle.curled &&
    ring.curled &&
    pinky.curled &&
    thumb.direction.y < -0.4 &&
    Math.abs(index.direction.x) > 0.4
  ) {
    matches.push({
      id: 'gun_shape',
      name: 'Gun Shape',
      emoji: '🔫',
      confidence: 90,
      desc: 'Thumb pointing up, index pointing horizontal',
    });
  }

  // 7, 8, 9, 10. Pointing Directions
  if (
    index.extended &&
    middle.curled &&
    ring.curled &&
    pinky.curled &&
    !thumb.extended
  ) {
    const dir = index.direction;
    if (dir.y < -0.65) {
      matches.push({
        id: 'pointing_up',
        name: 'Pointing Up',
        emoji: '☝️',
        confidence: Math.min(99, Math.round(80 + (-dir.y) * 18)),
        desc: 'Index finger pointing upward',
      });
    } else if (dir.y > 0.65) {
      matches.push({
        id: 'pointing_down',
        name: 'Pointing Down',
        emoji: '👇',
        confidence: Math.min(99, Math.round(80 + dir.y * 18)),
        desc: 'Index finger pointing downward',
      });
    } else if (dir.x < -0.55) {
      matches.push({
        id: 'pointing_left',
        name: 'Pointing Left',
        emoji: '👈',
        confidence: Math.min(99, Math.round(80 + (-dir.x) * 18)),
        desc: 'Index finger pointing left',
      });
    } else if (dir.x > 0.55) {
      matches.push({
        id: 'pointing_right',
        name: 'Pointing Right',
        emoji: '👉',
        confidence: Math.min(99, Math.round(80 + dir.x * 18)),
        desc: 'Index finger pointing right',
      });
    }
  }

  // 12. Three Fingers Up
  if (
    index.extended &&
    middle.extended &&
    ring.extended &&
    pinky.curled &&
    !thumb.extended
  ) {
    matches.push({
      id: 'three_fingers',
      name: 'Three Fingers Up',
      emoji: '3️⃣',
      confidence: 91,
      desc: 'Index, middle, and ring fingers extended',
    });
  }

  // 13. Four Fingers Up
  if (
    index.extended &&
    middle.extended &&
    ring.extended &&
    pinky.extended &&
    !thumb.extended
  ) {
    matches.push({
      id: 'four_fingers',
      name: 'Four Fingers Up',
      emoji: '4️⃣',
      confidence: 92,
      desc: 'Four fingers extended upright, thumb tucked',
    });
  }

  // 14. Pinky Only
  if (
    pinky.extended &&
    index.curled &&
    middle.curled &&
    ring.curled &&
    !thumb.extended
  ) {
    matches.push({
      id: 'pinky_only',
      name: 'Pinky Only',
      emoji: '🤙',
      confidence: 90,
      desc: 'Pinky extended upright, other fingers curled',
    });
  }

  // 20. Middle Finger 🖕 (Handled with family-safe elegance)
  if (
    middle.extended &&
    index.curled &&
    ring.curled &&
    pinky.curled &&
    !thumb.extended
  ) {
    matches.push({
      id: 'middle_finger',
      name: 'Middle Finger (Solo Salute)',
      emoji: '🖕',
      confidence: 92,
      desc: 'Middle finger extended alone (handled respectfully)',
    });
  }

  // 21. Claw / Grip
  if (
    index.halfCurled &&
    middle.halfCurled &&
    ring.halfCurled &&
    pinky.halfCurled
  ) {
    matches.push({
      id: 'claw_grip',
      name: 'Claw / Grip',
      emoji: '🦅',
      confidence: 86,
      desc: 'Fingers curved halfway in a grip claw posture',
    });
  }

  // 22. Open Hand Facing Side
  if (
    index.extended &&
    middle.extended &&
    ring.extended &&
    pinky.extended &&
    Math.abs(palmNormal.x) > 0.65
  ) {
    matches.push({
      id: 'open_hand_side',
      name: 'Open Hand Facing Side',
      emoji: '🫱',
      confidence: 88,
      desc: 'Palm held vertically facing side',
    });
  }

  // 24. Flat Palm Stop ✋ (Palm facing camera, fingers together)
  if (
    index.extended &&
    middle.extended &&
    ring.extended &&
    pinky.extended &&
    indexMiddleDist < 0.28 &&
    middleRingDist < 0.28 &&
    ringPinkyDist < 0.28 &&
    Math.abs(palmNormal.z) > 0.4
  ) {
    matches.push({
      id: 'flat_palm_stop',
      name: 'Flat Palm Stop',
      emoji: '✋',
      confidence: 94,
      desc: 'Palm facing camera with fingers held tightly together',
    });
  }

  // 5. Open Palm ✋ (Standard spread)
  if (
    thumb.extended &&
    index.extended &&
    middle.extended &&
    ring.extended &&
    pinky.extended
  ) {
    matches.push({
      id: 'open_palm',
      name: 'Open Palm',
      emoji: '🖐️',
      confidence: 96,
      desc: 'All five fingers fully extended and spread',
    });
  }

  // 23. Raised Fist Power (thumb crossed over knuckles)
  if (
    index.curled &&
    middle.curled &&
    ring.curled &&
    pinky.curled &&
    thumb.curled &&
    dist3D(thumbTip, indexMcp) / scale < 0.45
  ) {
    matches.push({
      id: 'raised_fist_power',
      name: 'Raised Fist Power',
      emoji: '✊',
      confidence: 94,
      desc: 'Closed fist with thumb firmly wrapped across knuckles',
    });
  }

  // 4. Fist ✊ (Generic closed fist)
  if (
    index.curled &&
    middle.curled &&
    ring.curled &&
    pinky.curled &&
    thumb.curled
  ) {
    matches.push({
      id: 'fist',
      name: 'Fist',
      emoji: '✊',
      confidence: 90,
      desc: 'All fingers curled tightly into a closed fist',
    });
  }

  if (matches.length === 0) return null;

  // Sort by highest confidence and return best match
  matches.sort((a, b) => b.confidence - a.confidence);
  const best = matches[0];

  return {
    id: best.id,
    name: best.name,
    emoji: best.emoji,
    category: 'single',
    confidence: best.confidence,
    description: best.desc,
    handedness,
    timestamp: Date.now(),
  };
}
