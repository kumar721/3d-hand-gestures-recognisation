import { create } from 'zustand';
import { RecognizedGesture, Landmark, GestureDefinition } from '../gestures/types';
import { GESTURE_REGISTRY } from '../gestures/registry';

interface PracticeState {
  active: boolean;
  targetGesture: GestureDefinition | null;
  score: number;
  streak: number;
  highestStreak: number;
  timeRemaining: number;
  feedback: 'correct' | 'wrong' | null;
  completedIds: string[];
}

interface GestureStore {
  // Live Detection State
  primaryGesture: RecognizedGesture | null;
  handGestures: (RecognizedGesture | null)[];
  landmarks: Landmark[][];
  fps: number;
  isCameraActive: boolean;
  isCameraLoading: boolean;
  cameraError: string | null;
  isDemoMode: boolean;

  // History Log (last 10 recognized gestures)
  history: RecognizedGesture[];

  // Practice Mode State
  practice: PracticeState;

  // Actions
  setDetection: (
    primary: RecognizedGesture | null,
    hands: (RecognizedGesture | null)[],
    landmarks: Landmark[][],
    fps: number
  ) => void;
  setCameraActive: (active: boolean) => void;
  setCameraLoading: (loading: boolean) => void;
  setCameraError: (error: string | null) => void;
  setDemoMode: (enabled: boolean) => void;
  clearHistory: () => void;

  // Practice Actions
  startPractice: () => void;
  stopPractice: () => void;
  nextPracticeTarget: () => void;
  recordPracticeSuccess: () => void;
  setPracticeFeedback: (feedback: 'correct' | 'wrong' | null) => void;
  tickPracticeTimer: () => void;
}

export const useGestureStore = create<GestureStore>((set, get) => ({
  primaryGesture: null,
  handGestures: [],
  landmarks: [],
  fps: 0,
  isCameraActive: false,
  isCameraLoading: false,
  cameraError: null,
  isDemoMode: false,
  history: [],

  practice: {
    active: false,
    targetGesture: null,
    score: 0,
    streak: 0,
    highestStreak: 0,
    timeRemaining: 15,
    feedback: null,
    completedIds: [],
  },

  setDetection: (primary, hands, landmarks, fps) => {
    set((state) => {
      let newHistory = state.history;
      if (
        primary &&
        (state.history.length === 0 ||
          state.history[0].id !== primary.id ||
          Date.now() - state.history[0].timestamp > 2500)
      ) {
        newHistory = [primary, ...state.history].slice(0, 10);
      }

      // Check practice target hit
      const practice = state.practice;
      let updatedPractice = practice;
      if (
        practice.active &&
        practice.targetGesture &&
        primary &&
        primary.id === practice.targetGesture.id &&
        practice.feedback !== 'correct'
      ) {
        const newStreak = practice.streak + 1;
        const newScore = practice.score + 100 + newStreak * 20;
        const newHighest = Math.max(practice.highestStreak, newStreak);
        
        // Pick next random gesture from registry
        const remaining = GESTURE_REGISTRY.filter((g) => g.id !== practice.targetGesture?.id);
        const nextTarget = remaining[Math.floor(Math.random() * remaining.length)];

        updatedPractice = {
          ...practice,
          score: newScore,
          streak: newStreak,
          highestStreak: newHighest,
          timeRemaining: 15,
          feedback: 'correct',
          completedIds: [...practice.completedIds, primary.id],
          targetGesture: nextTarget,
        };
      }

      return {
        primaryGesture: primary,
        handGestures: hands,
        landmarks,
        fps,
        history: newHistory,
        practice: updatedPractice,
      };
    });
  },

  setCameraActive: (active) => set({ isCameraActive: active }),
  setCameraLoading: (loading) => set({ isCameraLoading: loading }),
  setCameraError: (error) => set({ cameraError: error }),
  setDemoMode: (enabled) => set({ isDemoMode: enabled }),
  clearHistory: () => set({ history: [] }),

  startPractice: () => {
    const randomGesture =
      GESTURE_REGISTRY[Math.floor(Math.random() * GESTURE_REGISTRY.length)];
    set({
      practice: {
        active: true,
        targetGesture: randomGesture,
        score: 0,
        streak: 0,
        highestStreak: 0,
        timeRemaining: 15,
        feedback: null,
        completedIds: [],
      },
    });
  },

  stopPractice: () => {
    set((state) => ({
      practice: {
        ...state.practice,
        active: false,
        feedback: null,
      },
    }));
  },

  nextPracticeTarget: () => {
    set((state) => {
      const remaining = GESTURE_REGISTRY.filter(
        (g) => g.id !== state.practice.targetGesture?.id
      );
      const nextTarget = remaining[Math.floor(Math.random() * remaining.length)];
      return {
        practice: {
          ...state.practice,
          targetGesture: nextTarget,
          timeRemaining: 15,
          feedback: null,
        },
      };
    });
  },

  recordPracticeSuccess: () => {
    set((state) => {
      const newStreak = state.practice.streak + 1;
      const newScore = state.practice.score + 100 + newStreak * 20;
      const newHighest = Math.max(state.practice.highestStreak, newStreak);
      return {
        practice: {
          ...state.practice,
          score: newScore,
          streak: newStreak,
          highestStreak: newHighest,
          feedback: 'correct',
        },
      };
    });
  },

  setPracticeFeedback: (feedback) => {
    set((state) => ({
      practice: { ...state.practice, feedback },
    }));
  },

  tickPracticeTimer: () => {
    set((state) => {
      if (!state.practice.active) return state;
      if (state.practice.timeRemaining <= 1) {
        // Time ran out for this gesture, pick next with streak reset
        const remaining = GESTURE_REGISTRY.filter(
          (g) => g.id !== state.practice.targetGesture?.id
        );
        const nextTarget = remaining[Math.floor(Math.random() * remaining.length)];
        return {
          practice: {
            ...state.practice,
            streak: 0,
            timeRemaining: 15,
            feedback: 'wrong',
            targetGesture: nextTarget,
          },
        };
      }
      return {
        practice: {
          ...state.practice,
          timeRemaining: state.practice.timeRemaining - 1,
        },
      };
    });
  },
}));
