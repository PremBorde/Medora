'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Nova Healthcare Companion
 *
 * A premium animated SVG avatar representing "Nova", the medical guide.
 * Features: gentle bobbing animation, natural eye blinking, interactive
 * state styling, and staggered speech bubble rendering.
 */
export default function Mascot({ state = 'idle', urgencyLevel = null, speechText = '' }) {
  const [displayedWords, setDisplayedWords] = useState([]);
  const intervalRef = useRef(null);

  // Blinking cycle triggers
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 4000); // Blink every 4s
    return () => clearInterval(blinkInterval);
  }, []);

  const theme = getTheme(urgencyLevel, state);

  // Word-by-word reveal when entering explaining state
  useEffect(() => {
    if (state === 'explaining' && speechText) {
      setDisplayedWords([]);
      const words = speechText.trim().split(/\s+/);
      let idx = 0;
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        idx++;
        setDisplayedWords(words.slice(0, idx));
        if (idx >= words.length) clearInterval(intervalRef.current);
      }, 70);
    } else {
      clearInterval(intervalRef.current);
      setDisplayedWords([]);
    }
    return () => clearInterval(intervalRef.current);
  }, [state, speechText]);

  return (
    <div className="flex flex-col items-center gap-3.5 w-full select-none">
      {/* ── Speech Bubble ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {state === 'explaining' && displayedWords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative w-full max-w-[220px] z-10"
          >
            <div
              className="rounded-2xl border px-3.5 py-3 text-[11px] font-semibold leading-relaxed text-center shadow-md shadow-black/5"
              style={{
                background: theme.bubbleBg,
                borderColor: theme.bubbleBorder,
                color: theme.bubbleText,
              }}
            >
              {displayedWords.join(' ')}
              {displayedWords.length < speechText.trim().split(/\s+/).length && (
                <span className="ml-0.5 inline-block w-1.5 h-3.5 bg-current opacity-70 animate-pulse rounded-full align-middle" />
              )}
            </div>
            {/* Speech bubble tail */}
            <div
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 border-r border-b"
              style={{
                background: theme.bubbleBg,
                borderColor: theme.bubbleBorder,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Nova Floating Avatar ─────────────────────────────────────── */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex items-center justify-center"
      >
        {/* Soft backlighting */}
        <div
          className="absolute w-20 h-20 rounded-full blur-xl opacity-20 scale-125 transition-all duration-300 pointer-events-none"
          style={{ background: theme.glow }}
        />

        <svg width="84" height="96" viewBox="0 0 84 96" fill="none" aria-hidden="true" className="overflow-visible">
          {/* Antenna / Light */}
          <circle cx="42" cy="10" r="3.5" fill={theme.light} />
          <line x1="42" y1="10" x2="42" y2="20" stroke={theme.body} strokeWidth="2.5" />

          {/* Left Arm (Waving or idle) */}
          <motion.rect
            x="8"
            y="44"
            width="12"
            height="7"
            rx="3.5"
            fill={theme.body}
            transformOrigin="20px 47px"
            animate={state === 'explaining' ? { rotate: [0, 45, 0, 45, 0] } : { rotate: 0 }}
            transition={{ duration: 1.5, repeat: state === 'explaining' ? 1 : 0 }}
          />

          {/* Right Arm (Pointing or idle) */}
          <motion.rect
            x="64"
            y="44"
            width="12"
            height="7"
            rx="3.5"
            fill={theme.body}
            transformOrigin="64px 47px"
            animate={state === 'explaining' ? { rotate: [0, -30, 0] } : { rotate: 0 }}
            transition={{ duration: 1.2, repeat: state === 'explaining' ? 1 : 0 }}
          />

          {/* Torso */}
          <rect x="20" y="38" width="44" height="34" rx="14" fill={theme.body} />
          {/* Inner chest panel */}
          <rect x="27" y="44" width="30" height="20" rx="6" fill={theme.panel} opacity="0.85" />
          {/* Floating legs */}
          <rect x="28" y="70" width="8" height="12" rx="4" fill={theme.body} />
          <rect x="48" y="70" width="8" height="12" rx="4" fill={theme.body} />

          {/* Head */}
          <ellipse cx="42" cy="28" rx="20" ry="19" fill={theme.face} stroke={theme.body} strokeWidth="2.5" />

          {/* Eyes (Blinking support) */}
          {blink ? (
            <>
              {/* Blinking eyes (closed state) */}
              <line x1="30" y1="28" x2="36" y2="28" stroke={theme.detail} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="48" y1="28" x2="54" y2="28" stroke={theme.detail} strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Standard open eyes */}
              <ellipse cx="33" cy="27" rx="3.5" ry="4" fill={theme.detail} />
              <ellipse cx="51" cy="27" rx="3.5" ry="4" fill={theme.detail} />
              {/* Eye highlights */}
              <circle cx="34.5" cy="25.5" r="1" fill="white" />
              <circle cx="52.5" cy="25.5" r="1" fill="white" />
            </>
          )}

          {/* Mouth (Dynamic smiles) */}
          {state === 'thinking' ? (
            <path d="M38 34 H46" stroke={theme.detail} strokeWidth="2" strokeLinecap="round" />
          ) : urgencyLevel === 'EMERGENCY' ? (
            // Serious expression
            <path d="M37 34 Q42 33 47 34" stroke={theme.detail} strokeWidth="2" strokeLinecap="round" fill="none" />
          ) : (
            // Reassuring warm smile
            <path d="M36 32 Q42 38 48 32" stroke={theme.detail} strokeWidth="2" strokeLinecap="round" fill="none" />
          )}

          {/* Rosy Cheeks */}
          <circle cx="26" cy="31" r="2.5" fill={theme.cheek} opacity="0.6" />
          <circle cx="58" cy="31" r="2.5" fill={theme.cheek} opacity="0.6" />
        </svg>

        {/* Outer Orbit Loading Ring for Thinking State */}
        {state === 'thinking' && (
          <div className="absolute inset-0 flex items-center justify-center scale-125">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: '#0891b2',
                  originX: '0px',
                  originY: '32px',
                }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1.8,
                  delay: i * 0.35,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Label / Subtitle ───────────────────────────────────────────── */}
      <span className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground/60 mt-6 relative z-10">
        {state === 'thinking' ? 'Nova thinking…' : 'Companion Nova'}
      </span>
    </div>
  );
}

function getTheme(urgencyLevel, state) {
  if (state === 'thinking') {
    return {
      body: '#0891b2',
      face: '#f0fdfa',
      panel: '#ccfbf1',
      detail: '#0f766e',
      light: '#38bdf8',
      cheek: '#99f6e4',
      glow: '#0891b2',
      bubbleBg: '#f0fdfa',
      bubbleBorder: '#99f6e4',
      bubbleText: '#0f766e',
    };
  }
  switch (urgencyLevel) {
    case 'HOME_CARE':
      return {
        body: '#0d9488',
        face: '#f0fdfa',
        panel: '#ccfbf1',
        detail: '#0f766e',
        light: '#2dd4bf',
        cheek: '#99f6e4',
        glow: '#0d9488',
        bubbleBg: '#f0fdfa',
        bubbleBorder: '#99f6e4',
        bubbleText: '#115e59',
      };
    case 'ROUTINE':
      return {
        body: '#0284c7',
        face: '#f0f9ff',
        panel: '#e0f2fe',
        detail: '#0369a1',
        light: '#38bdf8',
        cheek: '#bae6fd',
        glow: '#0284c7',
        bubbleBg: '#f0f9ff',
        bubbleBorder: '#bae6fd',
        bubbleText: '#075985',
      };
    case 'URGENT':
      return {
        body: '#d97706',
        face: '#fffbeb',
        panel: '#fef3c7',
        detail: '#b45309',
        light: '#fbbf24',
        cheek: '#fde68a',
        glow: '#d97706',
        bubbleBg: '#fffbeb',
        bubbleBorder: '#fde68a',
        bubbleText: '#78350f',
      };
    case 'EMERGENCY':
      return {
        body: '#e11d48',
        face: '#fff1f2',
        panel: '#ffe4e6',
        detail: '#be123c',
        light: '#fb7185',
        cheek: '#fecdd3',
        glow: '#e11d48',
        bubbleBg: '#fff1f2',
        bubbleBorder: '#fecdd3',
        bubbleText: '#9f1239',
      };
    default:
      return {
        body: '#0891b2',
        face: '#f0fdfa',
        panel: '#ccfbf1',
        detail: '#0f766e',
        light: '#38bdf8',
        cheek: '#99f6e4',
        glow: '#0891b2',
        bubbleBg: '#f0fdfa',
        bubbleBorder: '#99f6e4',
        bubbleText: '#0f766e',
      };
  }
}
