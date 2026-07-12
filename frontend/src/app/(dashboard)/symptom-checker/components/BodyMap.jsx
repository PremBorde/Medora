'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BODY_REGIONS, getBodyRegion } from '../constants/bodyRegions';

/**
 * Premium Anatomical BodyMap
 *
 * Renders an interactive vector human schematic styled as a medical diagnostic interface.
 * Features grid targeting overlays, guidelines, glowing highlights, and floating tooltips.
 */
export default function BodyMap({ selectedRegion, onSelect }) {
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [side, setSide] = useState('front');

  const visibleRegions = BODY_REGIONS.filter((r) => r.side === side);
  const hoveredInfo = hoveredRegion ? getBodyRegion(hoveredRegion) : null;
  const selectedInfo = selectedRegion ? getBodyRegion(selectedRegion) : null;

  const handleRegionClick = useCallback((id) => {
    onSelect(selectedRegion === id ? null : id);
  }, [selectedRegion, onSelect]);

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.closest('svg').getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const switchSide = useCallback((newSide) => {
    if (newSide !== side) {
      setSide(newSide);
    }
  }, [side]);

  return (
    <div className="flex flex-col items-center gap-4 select-none w-full">
      {/* ── View Toggle ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 p-0.5 bg-muted/40 rounded-xl border border-border/40 text-[10px] font-bold">
        {['front', 'back'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => switchSide(s)}
            className={`px-4 py-1.5 rounded-lg capitalize transition-all duration-200 cursor-pointer ${
              side === s
                ? 'bg-white shadow-sm text-primary font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {s === 'front' ? 'Front view' : 'Back view'}
          </button>
        ))}
      </div>

      {/* ── Medical Vector Schematic Viewport ────────────────────────────── */}
      <div className="relative w-full max-w-[250px] aspect-[1/1.3] bg-gradient-to-b from-muted/5 to-muted/20 border border-border/40 rounded-2xl p-4 flex items-center justify-center shadow-inner">
        
        {/* Decorative corner crosshair ticks */}
        <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-primary/20" />
        <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-primary/20" />
        <div className="absolute bottom-3 left-3 w-2.5 h-2.5 border-b border-l border-primary/20" />
        <div className="absolute bottom-3 right-3 w-2.5 h-2.5 border-b border-r border-primary/20" />

        <AnimatePresence mode="wait">
          <motion.div
            key={side}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-full h-full flex items-center justify-center relative"
          >
            <svg
              viewBox="0 0 120 270"
              width="100%"
              height="100%"
              className="overflow-visible"
              aria-label={`${side} body map`}
            >
              {/* Medical target ring overlay */}
              <circle cx="60" cy="110" r="48" stroke="rgba(8,145,178,0.06)" strokeWidth="1" strokeDasharray="3,3" fill="none" />
              <circle cx="60" cy="110" r="76" stroke="rgba(8,145,178,0.03)" strokeWidth="1.5" strokeDasharray="5,5" fill="none" />
              
              {/* Diagnostic guidelines */}
              <line x1="60" y1="5" x2="60" y2="265" stroke="rgba(8,145,178,0.04)" strokeWidth="1" strokeDasharray="2,4" />
              <line x1="5" y1="110" x2="115" y2="110" stroke="rgba(8,145,178,0.04)" strokeWidth="1" strokeDasharray="2,4" />

              {/* Grid Ruler Markings (Side) */}
              <g stroke="rgba(8,145,178,0.12)" strokeWidth="0.8" opacity="0.6">
                <line x1="6" y1="20" x2="12" y2="20" />
                <line x1="6" y1="70" x2="10" y2="70" />
                <line x1="6" y1="120" x2="12" y2="120" />
                <line x1="6" y1="170" x2="10" y2="170" />
                <line x1="6" y1="220" x2="12" y2="220" />
              </g>

              {/* Faint base silhouette (holographic/medical style) */}
              <g opacity="0.08" fill="#0891b2">
                <ellipse cx="60" cy="22" rx="16" ry="16" />
                <rect x="54" y="38" width="12" height="18" rx="2" />
                <rect x="38" y="56" width="44" height="96" rx="4" />
                <rect x="82" y="56" width="18" height="76" rx="5" />
                <rect x="20" y="56" width="18" height="76" rx="5" />
                <rect x="41" y="152" width="18" height="106" rx="5" />
                <rect x="61" y="152" width="18" height="106" rx="5" />
              </g>

              {/* ── Clickable Regions ─────────────────────────────────── */}
              {visibleRegions.map((region) => {
                const isSelected = selectedRegion === region.id;
                const isHovered = hoveredRegion === region.id;

                return (
                  <g key={region.id}>
                    {/* Glowing outer shadow ring when selected */}
                    {isSelected && (
                      <motion.path
                        d={region.path}
                        fill="none"
                        stroke="#0891b2"
                        strokeWidth="3.5"
                        strokeOpacity={0.4}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.35 }}
                      />
                    )}

                    <motion.path
                      d={region.path}
                      fill={
                        isSelected
                          ? 'url(#grad-selected)'
                          : isHovered
                          ? 'url(#grad-hover)'
                          : 'url(#grad-default)'
                      }
                      fillOpacity={isSelected ? 0.8 : isHovered ? 0.75 : 0.35}
                      stroke={isSelected ? '#0891b2' : isHovered ? '#0ea5e9' : '#0891b2'}
                      strokeWidth={isSelected ? 1.5 : isHovered ? 0.8 : 0.45}
                      strokeOpacity={isSelected ? 1 : isHovered ? 0.8 : 0.25}
                      style={{ cursor: 'pointer' }}
                      whileHover={{ scale: 1.025 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                      onClick={() => handleRegionClick(region.id)}
                      onMouseEnter={(e) => {
                        setHoveredRegion(region.id);
                        handleMouseMove(e);
                      }}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={() => setHoveredRegion(null)}
                      aria-label={`Select ${region.label}`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleRegionClick(region.id)}
                    />
                  </g>
                );
              })}

              {/* SVG Gradients definitions */}
              <defs>
                <linearGradient id="grad-default" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#bae6fd" />
                  <stop offset="100%" stopColor="#e0f2fe" />
                </linearGradient>
                <linearGradient id="grad-hover" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7dd3fc" />
                  <stop offset="100%" stopColor="#bae6fd" />
                </linearGradient>
                <linearGradient id="grad-selected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#0891b2" />
                </linearGradient>
              </defs>

              {/* Floating Hover Label */}
              <AnimatePresence>
                {hoveredInfo && (
                  <motion.g
                    key={hoveredInfo.id + '-label'}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                  >
                    <foreignObject
                      x={Math.max(4, Math.min(tooltipPos.x - 38, 44))}
                      y={Math.max(4, tooltipPos.y - 42)}
                      width="80"
                      height="30"
                      style={{ pointerEvents: 'none' }}
                    >
                      <div
                        xmlns="http://www.w3.org/1999/xhtml"
                        className="bg-white/95 border border-primary/20 rounded-lg shadow-sm px-1.5 py-0.5 text-center"
                      >
                        <p className="text-[9px] font-bold text-foreground truncate">
                          {hoveredInfo.label}
                        </p>
                      </div>
                    </foreignObject>
                  </motion.g>
                )}
              </AnimatePresence>
            </svg>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Hover Description / Selected Chip ────────────────────────── */}
      <div className="min-h-[44px] flex flex-col items-center justify-center w-full max-w-[250px] text-center border-t border-border/20 pt-2.5">
        <AnimatePresence mode="wait">
          {selectedInfo ? (
            <motion.button
              key={selectedInfo.id}
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => onSelect(null)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all cursor-pointer group"
              title="Click to deselect"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary group-hover:bg-red-500 transition-colors" />
              {selectedInfo.label}
              <span className="text-muted-foreground group-hover:text-red-500 ml-0.5">✕</span>
            </motion.button>
          ) : hoveredInfo ? (
            <motion.p
              key={hoveredInfo.id}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 3 }}
              className="text-[10px] text-muted-foreground leading-normal"
            >
              {hoveredInfo.description}
            </motion.p>
          ) : (
            <motion.p
              key="prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[10px] text-muted-foreground/60 italic"
            >
              Tap anatomy model to select region
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
