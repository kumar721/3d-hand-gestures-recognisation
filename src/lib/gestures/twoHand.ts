import { Landmark, RecognizedGesture, HandAnalysis, Handedness } from './types';
import { LANDMARK_INDEX, dist3D, dist2D } from './geometry';

export function detectTwoHandGestures(
  hand1Landmarks: Landmark[],
  analysis1: HandAnalysis,
  hand2Landmarks: Landmark[],
  analysis2: HandAnalysis,
  single1: RecognizedGesture | null,
  single2: RecognizedGesture | null
): RecognizedGesture | null {
  const lm1 = hand1Landmarks;
  const lm2 = hand2Landmarks;

  const wrist1 = lm1[LANDMARK_INDEX.WRIST];
  const wrist2 = lm2[LANDMARK_INDEX.WRIST];
  const avgScale = (analysis1.scale + analysis2.scale) / 2;

  const thumbTip1 = lm1[LANDMARK_INDEX.THUMB_TIP];
  const thumbTip2 = lm2[LANDMARK_INDEX.THUMB_TIP];
  const indexTip1 = lm1[LANDMARK_INDEX.INDEX_TIP];
  const indexTip2 = lm2[LANDMARK_INDEX.INDEX_TIP];
  const middleTip1 = lm1[LANDMARK_INDEX.MIDDLE_TIP];
  const middleTip2 = lm2[LANDMARK_INDEX.MIDDLE_TIP];

  const wristDist = dist3D(wrist1, wrist2) / avgScale;
  const palmDist = dist3D(analysis1.palmCenter, analysis2.palmCenter) / avgScale;
  const thumbTipDist = dist3D(thumbTip1, thumbTip2) / avgScale;
  const indexTipDist = dist3D(indexTip1, indexTip2) / avgScale;
  const middleTipDist = dist3D(middleTip1, middleTip2) / avgScale;

  const matches: { id: string; name: string; emoji: string; confidence: number; desc: string }[] = [];

  // 25. Heart Hands 🫶
  // Index fingertips touching (or very close), thumb fingertips touching (or very close),
  // with wrists separated to form a curved heart arch.
  if (
    indexTipDist < 0.45 &&
    thumbTipDist < 0.55 &&
    wristDist > 0.8 &&
    wristDist < 3.2
  ) {
    const proximity = 1 - (indexTipDist + thumbTipDist) / 1.0;
    matches.push({
      id: 'heart_hands',
      name: 'Heart Hands',
      emoji: '🫶',
      confidence: Math.min(99, Math.round(82 + Math.max(0, proximity) * 16)),
      desc: 'Both hands curving together to form a heart shape',
    });
  }

  // 27. Prayer / Namaste 🙏
  // Both palms flat against each other, fingers pointing upright, wrists touching
  const allFingersUp1 = analysis1.fingers.index.extended && analysis1.fingers.middle.extended;
  const allFingersUp2 = analysis2.fingers.index.extended && analysis2.fingers.middle.extended;
  if (
    allFingersUp1 &&
    allFingersUp2 &&
    palmDist < 0.6 &&
    middleTipDist < 0.5 &&
    wristDist < 0.9 &&
    indexTip1.y < wrist1.y &&
    indexTip2.y < wrist2.y
  ) {
    matches.push({
      id: 'prayer',
      name: 'Prayer / Namaste',
      emoji: '🙏',
      confidence: 96,
      desc: 'Palms pressed together with fingers pointing up',
    });
  }

  // 26. Clapping 👏 (Both palms facing each other and touching/very close)
  if (
    palmDist < 0.5 &&
    wristDist < 0.85 &&
    !matches.some((m) => m.id === 'prayer')
  ) {
    matches.push({
      id: 'clapping',
      name: 'Clapping Hands',
      emoji: '👏',
      confidence: 90,
      desc: 'Both hands touching together in a clap',
    });
  }

  // 28. High Five (both open palms facing forward/each other in proximity)
  const open1 = analysis1.fingers.index.extended && analysis1.fingers.middle.extended && analysis1.fingers.ring.extended && analysis1.fingers.pinky.extended;
  const open2 = analysis2.fingers.index.extended && analysis2.fingers.middle.extended && analysis2.fingers.ring.extended && analysis2.fingers.pinky.extended;
  if (
    open1 &&
    open2 &&
    palmDist < 1.4 &&
    palmDist > 0.45 &&
    wrist1.y > indexTip1.y &&
    wrist2.y > indexTip2.y
  ) {
    matches.push({
      id: 'high_five',
      name: 'High Five',
      emoji: '✋',
      confidence: 92,
      desc: 'Both palms open facing forward in a high-five gesture',
    });
  }

  // 29. Peace + Peace ✌️✌️ (Double Victory)
  if (
    single1?.id === 'victory' &&
    single2?.id === 'victory'
  ) {
    matches.push({
      id: 'double_peace',
      name: 'Double Peace',
      emoji: '✌️✌️',
      confidence: 97,
      desc: 'Both hands displaying Victory / Peace gesture simultaneously',
    });
  }

  // 30. Thumbs Up + Thumbs Up 👍👍 (Double Thumbs Up)
  if (
    single1?.id === 'thumbs_up' &&
    single2?.id === 'thumbs_up'
  ) {
    matches.push({
      id: 'double_thumbs_up',
      name: 'Double Thumbs Up',
      emoji: '👍👍',
      confidence: 97,
      desc: 'Both hands giving thumbs up together',
    });
  }

  // 33. Thumbs Up + Thumbs Down 👍👎 (Contrast Pair)
  if (
    (single1?.id === 'thumbs_up' && single2?.id === 'thumbs_down') ||
    (single1?.id === 'thumbs_down' && single2?.id === 'thumbs_up')
  ) {
    matches.push({
      id: 'thumbs_up_down',
      name: 'Thumbs Up + Thumbs Down',
      emoji: '👍👎',
      confidence: 96,
      desc: 'Contrast gesture: one hand thumbs up and the other thumbs down',
    });
  }

  // 32. Finger Heart 🫰 (Single hand or two-hand tiny heart)
  // Thumb and index crossed over each other
  const checkFingerHeart = (lm: Landmark[], an: HandAnalysis): boolean => {
    const tTip = lm[LANDMARK_INDEX.THUMB_TIP];
    const iTip = lm[LANDMARK_INDEX.INDEX_TIP];
    const iPip = lm[LANDMARK_INDEX.INDEX_PIP];
    const d = dist3D(tTip, iTip) / an.scale;
    // Thumb crosses near index tip or DIP, while other fingers are curled
    return (
      d < 0.35 &&
      an.fingers.middle.curled &&
      an.fingers.ring.curled &&
      an.fingers.pinky.curled &&
      tTip.y < iPip.y
    );
  };

  if (checkFingerHeart(lm1, analysis1) || checkFingerHeart(lm2, analysis2)) {
    matches.push({
      id: 'finger_heart',
      name: 'Finger Heart',
      emoji: '🫰',
      confidence: 91,
      desc: 'Thumb and index fingers crossed forming a small heart',
    });
  }

  if (matches.length === 0) return null;

  matches.sort((a, b) => b.confidence - a.confidence);
  const best = matches[0];

  return {
    id: best.id,
    name: best.name,
    emoji: best.emoji,
    category: 'two-hand',
    confidence: best.confidence,
    description: best.desc,
    handedness: 'Both',
    timestamp: Date.now(),
  };
}
