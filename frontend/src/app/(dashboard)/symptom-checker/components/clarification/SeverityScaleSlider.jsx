'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function SeverityScaleSlider({ min = 1, max = 10, minLabel = 'Mild', maxLabel = 'Worst ever', onSubmit }) {
  const [val, setVal] = useState(5);

  const getFaceConfig = (score) => {
    if (score <= 3) {
      return {
        bg: '#ccfbf1',
        stroke: '#0f766e',
        mouthPath: 'M 14 21 Q 20 27 26 21', // happy smile
        eyes: 'open',
        label: 'Mild Discomfort',
        colorClass: 'text-teal-600',
      };
    } else if (score <= 6) {
      return {
        bg: '#fef3c7',
        stroke: '#b45309',
        mouthPath: 'M 14 22 H 26', // flat neutral line
        eyes: 'open',
        label: 'Moderate Pain',
        colorClass: 'text-amber-600',
      };
    } else if (score <= 8) {
      return {
        bg: '#ffedd5',
        stroke: '#c2410c',
        mouthPath: 'M 15 24 Q 20 20 25 24', // mild wince/frown
        eyes: 'wince',
        label: 'Severe Pain',
        colorClass: 'text-orange-600',
      };
    } else {
      return {
        bg: '#ffe4e6',
        stroke: '#be123c',
        mouthPath: 'M 14 25 C 16 21, 24 21, 26 25', // sharp frown wince
        eyes: 'wince-cry',
        label: 'Unbearable / Emergency',
        colorClass: 'text-rose-600 font-extrabold',
      };
    }
  };

  const face = getFaceConfig(val);

  const handleConfirm = () => {
    onSubmit(`Severity Level: ${val}/10 (${face.label})`);
  };

  return (
    <div className="w-full flex flex-col items-center gap-5 py-3 px-1">
      {/* Dynamic Animated Expression Face */}
      <div className="flex flex-col items-center gap-2">
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-16 h-16 rounded-full flex items-center justify-center border-2 shadow-sm transition-all duration-300"
          style={{ backgroundColor: face.bg, borderColor: face.stroke }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="overflow-visible">
            {/* Eyes */}
            {face.eyes === 'open' && (
              <>
                <circle cx="13" cy="14" r="2.5" fill={face.stroke} />
                <circle cx="27" cy="14" r="2.5" fill={face.stroke} />
              </>
            )}
            {face.eyes === 'wince' && (
              <>
                <path d="M 10 16 L 15 13 L 10 12" stroke={face.stroke} strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 30 16 L 25 13 L 30 12" stroke={face.stroke} strokeWidth="2.5" strokeLinecap="round" />
              </>
            )}
            {face.eyes === 'wince-cry' && (
              <>
                <path d="M 9 17 L 14 13 L 9 11" stroke={face.stroke} strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 31 17 L 26 13 L 31 11" stroke={face.stroke} strokeWidth="2.5" strokeLinecap="round" />
                {/* Tear drops */}
                <circle cx="11" cy="20" r="1.5" fill="#38bdf8" />
                <circle cx="29" cy="20" r="1.5" fill="#38bdf8" />
              </>
            )}

            {/* Mouth */}
            <path d={face.mouthPath} stroke={face.stroke} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
        </motion.div>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${face.colorClass}`}>
          {val} — {face.label}
        </span>
      </div>

      {/* Slider Input */}
      <div className="w-full space-y-2">
        <input
          type="range"
          min={min}
          max={max}
          value={val}
          onChange={(e) => setVal(parseInt(e.target.value))}
          className="w-full h-1.5 bg-muted/60 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
        />
        <div className="flex justify-between text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-1">
          <span>{minLabel} (Min: {min})</span>
          <span>{maxLabel} (Max: {max})</span>
        </div>
      </div>

      <Button
        type="button"
        variant="primary"
        onClick={handleConfirm}
        className="w-full font-bold py-3 text-xs rounded-xl shadow-glow cursor-pointer"
      >
        Confirm Pain Score
      </Button>
    </div>
  );
}
