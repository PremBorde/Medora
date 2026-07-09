'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BODY_REGIONS, getBodyRegion } from '../constants/bodyRegions';

/**
 * BodyMap
 *
 * Renders a clickable front / back SVG human figure divided into tappable regions.
 * Hovering a region shows a subtle highlight; clicking it calls `onSelect(regionId)`.
 *
 * Props:
 *  - selectedRegion  : currently selected region id (or null)
 *  - onSelect        : (regionId: string | null) => void
 */
export default function BodyMap({ selectedRegion, onSelect }) {
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [side, setSide] = useState('front'); // 'front' | 'back'

  const visibleRegions = BODY_REGIONS.filter((r) => r.side === side);
  const hoveredInfo = hoveredRegion ? getBodyRegion(hoveredRegion) : null;
  const selectedInfo = selectedRegion ? getBodyRegion(selectedRegion) : null;

  const handleRegionClick = (id) => {
    // Clicking the already-selected region deselects it
    onSelect(selectedRegion === id ? null : id);
  };

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {/* ── View Toggle ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border/60 text-xs font-bold">
        {['front', 'back'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSide(s)}
            className={`px-4 py-1.5 rounded-lg capitalize transition-all duration-200 ${
              side === s
                ? 'bg-white shadow-sm text-primary border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {s === 'front' ? 'Front' : 'Back'}
          </button>
        ))}
      </div>

      {/* ── SVG Figure ──────────────────────────────────────────────────── */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={side}
            initial={{ opacity: 0, x: side === 'front' ? -12 : 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: side === 'front' ? 12 : -12 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <svg
              viewBox="0 0 120 260"
              width="140"
              height="280"
              className="overflow-visible"
              aria-label={`${side} body map`}
            >
              {/* Background figure silhouette */}
              <g opacity="0.08" fill="#0891b2">
                {/* Head silhouette */}
                <ellipse cx="60" cy="22" rx="18" ry="18" />
                {/* Neck */}
                <rect x="54" y="40" width="12" height="16" />
                {/* Torso */}
                <rect x="34" y="56" width="52" height="102" rx="4" />
                {/* Arms */}
                <rect x="82" y="56" width="18" height="64" rx="6" />
                <rect x="20" y="56" width="18" height="64" rx="6" />
                {/* Legs */}
                <rect x="40" y="158" width="20" height="82" rx="6" />
                <rect x="60" y="158" width="20" height="82" rx="6" />
              </g>

              {/* ── Clickable Regions ─────────────────────────────────── */}
              {visibleRegions.map((region) => {
                const isSelected = selectedRegion === region.id;
                const isHovered = hoveredRegion === region.id;

                return (
                  <g key={region.id}>
                    {/* Glow ring when selected */}
                    {isSelected && (
                      <motion.path
                        d={region.path}
                        fill="none"
                        stroke="#0891b2"
                        strokeWidth="3"
                        strokeOpacity={0.5}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.4 }}
                      />
                    )}

                    <motion.path
                      d={region.path}
                      fill={
                        isSelected
                          ? '#0891b2'
                          : isHovered
                          ? '#bae6fd'
                          : '#e0f2fe'
                      }
                      fillOpacity={isSelected ? 0.7 : isHovered ? 0.6 : 0.3}
                      stroke={isSelected ? '#0e7490' : '#7dd3fc'}
                      strokeWidth={isSelected ? 1.5 : 0.8}
                      style={{ cursor: 'pointer' }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      onClick={() => handleRegionClick(region.id)}
                      onMouseEnter={() => setHoveredRegion(region.id)}
                      onMouseLeave={() => setHoveredRegion(null)}
                      aria-label={`Select ${region.label}`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleRegionClick(region.id)}
                    />
                  </g>
                );
              })}
            </svg>
          </motion.div>
        </AnimatePresence>

        {/* ── Hover Tooltip ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {hoveredInfo && !selectedRegion && (
            <motion.div
              key={hoveredInfo.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className="absolute -bottom-14 left-1/2 -translate-x-1/2 w-52 bg-white/95 backdrop-blur-sm border border-border/60 rounded-xl shadow-lg p-3 text-center pointer-events-none z-20"
            >
              <p className="text-xs font-bold text-foreground">{hoveredInfo.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{hoveredInfo.description}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Selected Region Chip ──────────────────────────────────────────── */}
      <div className="min-h-[32px] flex items-center">
        <AnimatePresence mode="wait">
          {selectedInfo ? (
            <motion.button
              key={selectedInfo.id}
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              onClick={() => onSelect(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/25 rounded-full text-xs font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all group"
              title="Click to deselect"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary group-hover:bg-red-500 transition-colors" />
              {selectedInfo.label}
              <span className="text-muted-foreground group-hover:text-red-500 ml-1">✕</span>
            </motion.button>
          ) : (
            <motion.p
              key="prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[11px] text-muted-foreground/70 italic"
            >
              Tap a region to specify location
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
