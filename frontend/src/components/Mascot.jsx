'use client';

import { motion, AnimatePresence } from 'framer-motion';

/**
 * Mascot
 *
 * A small animated SVG character with 4 visual states driven by
 * the urgencyLevel returned from the backend.
 *
 * state prop: 'idle' | 'thinking' | 'calm' | 'alert'
 *
 * Mapping from urgencyLevel:
 *  HOME_CARE → 'calm'
 *  ROUTINE   → 'idle'
 *  URGENT    → 'calm'
 *  EMERGENCY → 'alert'
 *  (loading) → 'thinking'
 */
export default function Mascot({ state = 'idle' }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <AnimatePresence mode="wait">
        {state === 'idle' && <IdleMascot key="idle" />}
        {state === 'thinking' && <ThinkingMascot key="thinking" />}
        {state === 'calm' && <CalmMascot key="calm" />}
        {state === 'alert' && <AlertMascot key="alert" />}
      </AnimatePresence>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
        {stateLabel(state)}
      </p>
    </div>
  );
}

function stateLabel(state) {
  switch (state) {
    case 'idle':     return 'Standing by';
    case 'thinking': return 'Analysing…';
    case 'calm':     return 'All good';
    case 'alert':    return 'Urgent!';
    default:         return '';
  }
}

// ─── Shared SVG primitives ──────────────────────────────────────────────────

/** Base mascot SVG structure. Children slots: eyes, mouth, extras. */
function MascotBase({ children, bodyColor = '#0891b2', faceColor = '#e0f7ff' }) {
  return (
    <svg width="72" height="88" viewBox="0 0 72 88" fill="none" aria-hidden="true">
      {/* Body */}
      <rect x="18" y="40" width="36" height="32" rx="8" fill={bodyColor} />
      {/* Legs */}
      <rect x="22" y="68" width="10" height="14" rx="5" fill={bodyColor} />
      <rect x="40" y="68" width="10" height="14" rx="5" fill={bodyColor} />
      {/* Arms */}
      <rect x="6"  y="42" width="14" height="8" rx="4" fill={bodyColor} />
      <rect x="52" y="42" width="14" height="8" rx="4" fill={bodyColor} />
      {/* Head */}
      <ellipse cx="36" cy="26" rx="18" ry="18" fill={faceColor} stroke={bodyColor} strokeWidth="2" />
      {children}
    </svg>
  );
}

// ─── State: Idle ────────────────────────────────────────────────────────────

function IdleMascot() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <MascotBase bodyColor="#0891b2">
          {/* Eyes — calm dots */}
          <ellipse cx="28" cy="24" rx="3" ry="3" fill="#0e7490" />
          <ellipse cx="44" cy="24" rx="3" ry="3" fill="#0e7490" />
          {/* Neutral smile */}
          <path d="M28 33 Q36 38 44 33" stroke="#0e7490" strokeWidth="2" strokeLinecap="round" fill="none" />
        </MascotBase>
      </motion.div>
    </motion.div>
  );
}

// ─── State: Thinking ────────────────────────────────────────────────────────

function ThinkingMascot() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <MascotBase bodyColor="#7c3aed" faceColor="#ede9fe">
          {/* Eyes — looking up */}
          <ellipse cx="28" cy="22" rx="3" ry="3.5" fill="#5b21b6" />
          <ellipse cx="44" cy="22" rx="3" ry="3.5" fill="#5b21b6" />
          {/* Thinking mouth — straight line */}
          <path d="M30 33 H42" stroke="#5b21b6" strokeWidth="2" strokeLinecap="round" />
        </MascotBase>
        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute top-0 right-1 w-2 h-2 bg-violet-400 rounded-full"
            style={{ originX: '-14px', originY: '14px' }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.6,
              delay: i * 0.28,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── State: Calm ────────────────────────────────────────────────────────────

function CalmMascot() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <MascotBase bodyColor="#059669" faceColor="#d1fae5">
          {/* Happy squint eyes */}
          <path d="M25 23 Q28 19 31 23" stroke="#065f46" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M41 23 Q44 19 47 23" stroke="#065f46" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Big smile */}
          <path d="M26 31 Q36 40 46 31" stroke="#065f46" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Rosy cheeks */}
          <ellipse cx="22" cy="30" rx="4" ry="2.5" fill="#6ee7b7" fillOpacity="0.5" />
          <ellipse cx="50" cy="30" rx="4" ry="2.5" fill="#6ee7b7" fillOpacity="0.5" />
        </MascotBase>
      </motion.div>
    </motion.div>
  );
}

// ─── State: Alert ────────────────────────────────────────────────────────────

function AlertMascot() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.3 }}
    >
      {/* Red glow aura */}
      <motion.div
        className="relative"
        animate={{ x: [0, -3, 3, -3, 3, 0] }}
        transition={{ duration: 0.5, repeat: 3, repeatDelay: 2 }}
      >
        <div className="absolute inset-0 rounded-full bg-red-500/20 blur-lg scale-110 pointer-events-none" />
        <MascotBase bodyColor="#dc2626" faceColor="#fee2e2">
          {/* Wide alarmed eyes */}
          <ellipse cx="28" cy="23" rx="4.5" ry="5" fill="#991b1b" />
          <ellipse cx="44" cy="23" rx="4.5" ry="5" fill="#991b1b" />
          {/* Pupil highlight */}
          <ellipse cx="29.5" cy="21.5" rx="1.5" ry="1.5" fill="white" />
          <ellipse cx="45.5" cy="21.5" rx="1.5" ry="1.5" fill="white" />
          {/* Alarmed open mouth */}
          <ellipse cx="36" cy="34" rx="5" ry="4" fill="#991b1b" />
        </MascotBase>

        {/* Pulsing exclamation marks */}
        {[-16, 16].map((x, i) => (
          <motion.div
            key={i}
            className="absolute top-1 text-red-500 font-black text-lg"
            style={{ left: `calc(50% + ${x}px)` }}
            animate={{ opacity: [1, 0.3, 1], y: [0, -3, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.25 }}
          >
            !
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
