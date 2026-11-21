# 🖐️ GestureCraft 3D — Real-Time Spatial Hand Recognition

> An award-winning, Awwwards/FWA-caliber 3D product website for real-time hand gesture recognition running 100% in the browser with **MediaPipe Tasks Vision** and **Three.js**.

---

## ⚡ Core Highlights
- **37+ Supported Hand Gestures**: 24 Single-Hand Static, 9 Dual-Hand / Two-Hand, 4 Dynamic & Sequence gestures.
- **Client-Side Neural Vision**: Powered by `@mediapipe/tasks-vision` (HandLandmarker) running at **60 FPS** with zero server latency and 100% user privacy.
- **Procedural 3D Mirrored Hand**: Real-time floating cybernetic hand avatar built with Three.js (21 joints, 20 bones) that mirrors the user's real hand kinematics in 3D.
- **Glowing Cyber Skeleton Overlay**: Neon holographic canvas drawing palm polygons, bone links, and pulsating fingertip rings directly over the webcam feed.
- **Rock-Solid Stability**: Exponential Moving Average (EMA) landmark smoothing + 5-frame majority vote buffer to eliminate all jitter and classification flicker.
- **Live HUD & History**: Floating labels tracking each hand independently, live confidence meters (0–100%), FPS counter, and gesture history log.
- **Practice & Challenge Arena**: Timed interactive challenge game tracking score, streaks, multiplier bonuses, and celebratory confetti.
- **Hardware-Free Simulation Fallback**: Built-in procedural demo simulation mode allows full testing and demonstration even if camera access is denied or unavailable.

---

## 📂 Project Architecture

```
gesture-app/
├── public/                      # Static assets
├── src/
│   ├── app/
│   │   ├── globals.css          # Dark cyber styling, neon glows & scrollbars
│   │   ├── layout.tsx           # Cyber shell, custom cursor, navbar & footer
│   │   └── page.tsx             # Master page assembling all 7 sections
│   ├── components/
│   │   ├── 3d/
│   │   │   ├── CyberScene.tsx   # Three.js Canvas with particles, rings & lights
│   │   │   └── MirrorHand3D.tsx # Procedural 3D mirrored hand kinematics rig
│   │   ├── demo/
│   │   │   ├── CameraFeed.tsx   # WebCam & MediaPipe frame processing loop
│   │   │   ├── GestureHUD.tsx   # Floating hand HUD with confidence meters
│   │   │   ├── GestureHistory.tsx # Live last 7 recognized gestures with timestamps
│   │   │   ├── LiveDemo.tsx     # Demo console & live metrics panel
│   │   │   └── SkeletonCanvas.tsx # Glowing holographic 2D skeleton overlay
│   │   ├── gallery/
│   │   │   ├── GestureCard.tsx  # 3D tilting card with hover glow & instructions
│   │   │   └── GesturesGallery.tsx # Filterable catalog (37 gestures, search)
│   │   ├── practice/
│   │   │   └── PracticeMode.tsx # Challenge game with streak, timer & confetti
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx  # "Control with a Gesture" + 3D mirror scene
│   │   │   ├── HowItWorks.tsx   # 4-stage pipeline architectural breakdown
│   │   │   ├── TechStack.tsx    # Floating holographic tech stack badges
│   │   │   └── Footer.tsx       # Minimalist cyber footer
│   │   └── ui/
│   │       ├── CustomCursor.tsx # Smooth trailing cyber cursor follower
│   │       ├── CyberButton.tsx  # Magnetic gradient button component
│   │       ├── LoadingScreen.tsx # High-tech booting screen
│   │       └── Navbar.tsx       # Floating glass header with live status
│   └── lib/
│       ├── gestures/
│       │   ├── detector.ts      # Master GestureDetector orchestrator
│       │   ├── geometry.ts      # 3D vector math, angles, scale & palm normals
│       │   ├── motion.ts        # Temporal buffer for velocity & sequence tracking
│       │   ├── registry.ts      # Metadata catalog for all 37 gestures
│       │   ├── singleHand.ts    # Detection rules for 24 single-hand gestures
│       │   ├── smoothing.ts     # EMA smoothing + 5-frame majority voting
│       │   ├── twoHand.ts       # Detection rules for 9 two-hand gestures
│       │   └── types.ts         # TypeScript definitions
│       ├── store/
│       │   └── useGestureStore.ts # Zustand reactive state store
│       └── vision/
│           └── handLandmarker.ts # MediaPipe loader & procedural simulation
├── next.config.mjs              # Next.js configuration
├── package.json                 # Dependencies & scripts
├── tailwind.config.js           # Cyber color palette & animations
└── tsconfig.json                # TypeScript compiler configuration
```

---

## 🖐️ The 37 Gestures Library

### 1. Single-Hand Static Gestures (1–24)
| # | Gesture | Emoji | Category | Key Geometric Criteria |
|---|---|:---:|---|---|
| 1 | Thumbs Up | 👍 | Single | Thumb extended upward (`dir.y < -0.25`), fingers 2–5 curled |
| 2 | Thumbs Down | 👎 | Single | Thumb extended downward (`dir.y > 0.15`), fingers 2–5 curled |
| 3 | Victory / Peace | ✌️ | Single | Index + Middle extended in V (`dist(tip8, tip12) > 0.2`), Ring + Pinky curled |
| 4 | Fist | ✊ | Single | All fingers curled tightly against palm |
| 5 | Open Palm | ✋ | Single | All 5 fingers extended and spread |
| 6 | OK Sign | 👌 | Single | Thumb tip & Index tip touching (`dist < 0.32`), fingers 3–5 extended |
| 7 | Pointing Up | ☝️ | Single | Index extended upright (`dir.y < -0.65`), other fingers curled |
| 8 | Pointing Down | 👇 | Single | Index extended downward (`dir.y > 0.65`), other fingers curled |
| 9 | Pointing Left | 👈 | Single | Index extended leftward (`dir.x < -0.55`), other fingers curled |
| 10 | Pointing Right | 👉 | Single | Index extended rightward (`dir.x > 0.55`), other fingers curled |
| 11 | Rock On / Horns | 🤘 | Single | Index + Pinky extended, Middle + Ring curled |
| 12 | Three Fingers Up | 3️⃣ | Single | Index + Middle + Ring extended, Pinky curled, Thumb folded |
| 13 | Four Fingers Up | 4️⃣ | Single | Index + Middle + Ring + Pinky extended, Thumb folded across palm |
| 14 | Pinky Only | 🤙 | Single | Pinky extended upright, other 4 fingers curled |
| 15 | Shaka / Call Me | 🤙 | Single | Thumb + Pinky extended outward, Middle 3 curled tightly |
| 16 | Pinch | 🤏 | Single | Thumb tip & Index tip touching, other fingers folded |
| 17 | Fingers Crossed | 🤞 | Single | Index + Middle extended, crossing in X space (`dist < 0.22`) |
| 18 | Vulcan Salute | 🖖 | Single | Index+Middle paired, Ring+Pinky paired, wide split between Middle and Ring |
| 19 | Gun Shape | 🔫 | Single | Thumb pointing up, Index forward horizontal, others curled |
| 20 | Middle Finger | 🖕 | Single | Middle extended alone (classified gracefully & family-safe) |
| 21 | Claw / Grip | 🦅 | Single | All 5 fingers curved halfway in an arched claw grip |
| 22 | Open Hand Side | 🫱 | Single | Palm plane held vertically sideways (`\|palmNormal.x\| > 0.65`) |
| 23 | Raised Fist Power | ✊ | Single | Tight fist with thumb firmly crossed over knuckles |
| 24 | Flat Palm Stop | ✋ | Single | Flat palm facing camera lens with fingers pressed together |

### 2. Dual-Hand / Two-Hand Gestures (25–33)
| # | Gesture | Emoji | Category | Key Geometric Criteria |
|---|---|:---:|---|---|
| 25 | Heart Hands | 🫶 | Two-Hand | Index tips meet at top, thumb tips meet at bottom to form heart |
| 26 | Clapping | 👏 | Two-Hand | Both palms facing each other and touching closely |
| 27 | Prayer / Namaste | 🙏 | Two-Hand | Both palms pressed flat together with fingers pointing straight up |
| 28 | High Five | ✋ | Two-Hand | Both hands open facing camera/each other in proximity |
| 29 | Double Peace | ✌️✌️ | Two-Hand | Both hands displaying Victory / Peace simultaneously |
| 30 | Double Thumbs Up | 👍👍 | Two-Hand | Both hands displaying Thumbs Up simultaneously |
| 31 | Hand Wave | 👋 | Dynamic | Open palm oscillating back and forth laterally |
| 32 | Finger Heart | 🫰 | Two-Hand | Thumb and index crossed over each other into a mini heart |
| 33 | Thumbs Up + Down | 👍👎 | Two-Hand | Contrast gesture: one thumb up and one thumb down |

### 3. Motion & Sequence Gestures (34–37)
| # | Gesture | Emoji | Category | Key Geometric Criteria |
|---|---|:---:|---|---|
| 34 | Swipe Left | ⬅️ | Motion | Open palm traveling left across screen with velocity `vx < -0.7` |
| 35 | Swipe Right | ➡️ | Motion | Open palm traveling right across screen with velocity `vx > 0.7` |
| 36 | Pinch-to-Zoom | 🔍 | Motion | Both hands moving apart (Zoom In) or together (Zoom Out) |
| 37 | Rotating Hand | 🔄 | Motion | Hand continuously twisting axially around wrist (`Δroll > 48°`) |
| 38 | Fist-to-Open Flash| 💥 | Sequence | Sudden explosive burst transitioning from closed fist to open hand |

---

## 🚀 Setup & Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Modern Browser**: Chrome, Edge, Safari, Firefox with WebGL enabled and webcam access.

### 2. Running Locally

```bash
# Navigate to gesture-app directory
cd gesture-app

# Install dependencies (if needed)
npm install --legacy-peer-deps

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm run start
```

---

## 🛠️ Technology Stack
- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript
- **3D Graphics**: Three.js + React Three Fiber (`@react-three/fiber`) + `@react-three/drei`
- **Vision Machine Learning**: `@mediapipe/tasks-vision` (HandLandmarker)
- **State Management**: Zustand 5
- **Styling**: Tailwind CSS + Custom Cyberpunk Glow System
- **Animation & Effects**: Framer Motion + Canvas-Confetti + CSS 3D Transforms
