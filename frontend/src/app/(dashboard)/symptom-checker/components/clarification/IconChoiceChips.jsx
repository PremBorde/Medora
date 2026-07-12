'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

// ── Sensation SVG Icons Library ──────────────────────────────────────────────

function SensationIcon({ name, className = 'w-4 h-4' }) {
  switch (name) {
    case 'throbbing':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4" opacity="0.6" />
        </svg>
      );
    case 'sharp':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );
    case 'dull':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 16c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" strokeDasharray="3 3" />
        </svg>
      );
    case 'burning':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
          <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z" />
        </svg>
      );
    case 'cramping':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
          <path d="M4.5 16.5c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0" />
          <path d="M4.5 12c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0" />
          <path d="M4.5 7.5C6 6 7.5 6 9 7.5s3 1.5 4.5 0 3-1.5 4.5 0" />
        </svg>
      );
    case 'tingling':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" strokeDasharray="2 2" />
          <circle cx="12" cy="12" r="1.5" />
        </svg>
      );
    case 'pressure':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
          <path d="M12 3v13M12 16l-4-4M12 16l4-4M4 21h16" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="1" />
        </svg>
      );
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function IconChoiceChips({ options, onSubmit }) {
  const [selectedId, setSelectedId] = useState(null);

  // Fallback default sensation list if LLM provides no specific icon options list
  const defaultOptions = [
    { id: 'throbbing', label: 'Throbbing Pain', icon: 'throbbing' },
    { id: 'sharp',     label: 'Sharp / Stabbing', icon: 'sharp' },
    { id: 'dull',      label: 'Dull / Aching',    icon: 'dull' },
    { id: 'burning',   label: 'Burning Sensation', icon: 'burning' },
    { id: 'cramping',  label: 'Cramping / Spasm', icon: 'cramping' },
    { id: 'tingling',  label: 'Tingling / Numb',  icon: 'tingling' },
    { id: 'pressure',  label: 'Heavy Pressure',   icon: 'pressure' },
  ];

  const list = options && options.length > 0 ? options : defaultOptions;

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  const handleConfirm = () => {
    const matched = list.find((o) => o.id === selectedId);
    if (matched) {
      onSubmit(`Sensation description: ${matched.label}`);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 py-2">
      <div className="grid grid-cols-2 gap-2.5">
        {list.map((opt) => {
          const isSelected = selectedId === opt.id;
          return (
            <motion.button
              key={opt.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => handleSelect(opt.id)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs font-bold text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-primary/10 border-primary text-primary shadow-sm shadow-primary/5'
                  : 'bg-white hover:bg-muted/40 border-border/80 text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className={`p-1.5 rounded-lg border shrink-0 transition-colors ${
                isSelected ? 'bg-primary/20 border-primary/20 text-primary' : 'bg-muted/30 border-border/40 text-muted-foreground/60'
              }`}>
                <SensationIcon name={opt.icon} className="w-4.5 h-4.5" />
              </div>
              <span className="truncate leading-none">{opt.label}</span>
            </motion.button>
          );
        })}
      </div>

      <Button
        type="button"
        variant="primary"
        disabled={!selectedId}
        onClick={handleConfirm}
        className="w-full font-bold py-3.5 text-xs rounded-xl shadow-glow mt-1.5 cursor-pointer"
      >
        Confirm Sensation
      </Button>
    </div>
  );
}
