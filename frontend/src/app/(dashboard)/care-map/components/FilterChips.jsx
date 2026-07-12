'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Shield, Siren, MapPin, Star, Building2, Landmark,
  Accessibility, Sparkles, SlidersHorizontal, ChevronDown, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PRIMARY_TABS = [
  { id: 'all_types', label: 'All facilities' },
  { id: 'type_hospital', label: 'Hospitals' },
  { id: 'type_clinic', label: 'Clinics' },
  { id: 'type_emergency', label: 'Emergency' },
];

const SECONDARY_FILTERS = [
  { id: 'openNow', label: 'Open Now', icon: Clock },
  { id: '24x7', label: '24×7 Available', icon: Shield },
  { id: 'highestRated', label: 'Highest Rated', icon: Star },
  { id: 'nearest', label: 'Nearest Distance', icon: MapPin },
  { id: 'government', label: 'Government Hospital', icon: Landmark },
  { id: 'private', label: 'Private Facility', icon: Building2 },
  { id: 'wheelchair', label: 'Wheelchair Accessible', icon: Accessibility },
];

/**
 * FilterChips — Premium segmented filters and dropdown control.
 */
export default function FilterChips({ activeFilters = [], onToggle }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Determine active primary tab
  const activePrimary = PRIMARY_TABS.find((t) => activeFilters.includes(t.id))?.id || 'all_types';

  const handlePrimaryClick = (tabId) => {
    // Clear other primary types
    PRIMARY_TABS.forEach((t) => {
      if (t.id !== 'all_types' && activeFilters.includes(t.id)) {
        onToggle?.(t.id);
      }
    });
    if (tabId !== 'all_types') {
      onToggle?.(tabId);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const activeSecondaryCount = SECONDARY_FILTERS.filter((f) => activeFilters.includes(f.id)).length;

  return (
    <div className="flex items-center gap-3 relative" ref={dropdownRef}>
      {/* Primary Apple-style Segmented Control */}
      <div className="flex p-0.5 rounded-xl bg-muted/65 border border-border/50 shrink-0">
        {PRIMARY_TABS.map((tab) => {
          const isActive = activePrimary === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handlePrimaryClick(tab.id)}
              className="relative px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all focus:outline-none cursor-pointer"
            >
              {isActive && (
                <motion.div
                  layoutId="activePrimaryTab"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm border border-border/20"
                  transition={{ type: 'spring', damping: 20, stiffness: 220 }}
                />
              )}
              <span className={cn(
                'relative z-10',
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer bg-white',
          activeSecondaryCount > 0
            ? 'border-primary/20 bg-primary-50/20 text-primary'
            : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/30'
        )}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>More Filters</span>
        {activeSecondaryCount > 0 ? (
          <span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
            {activeSecondaryCount}
          </span>
        ) : (
          <ChevronDown className="w-3 h-3 text-muted-foreground/60" />
        )}
      </button>

      {/* Slide-down Secondary Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute left-auto right-0 top-full mt-2 w-56 bg-white border border-border shadow-xl rounded-2xl z-40 p-2 space-y-1"
          >
            <p className="text-[9px] font-extrabold text-muted-foreground px-2.5 py-1 uppercase tracking-wider">
              Filter Options
            </p>
            {SECONDARY_FILTERS.map((f) => {
              const Icon = f.icon;
              const isActive = activeFilters.includes(f.id);
              return (
                <button
                  key={f.id}
                  onClick={() => onToggle?.(f.id)}
                  className="w-full inline-flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/40 transition-colors text-left cursor-pointer"
                >
                  <div className={cn(
                    'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                    isActive ? 'border-primary bg-primary text-white' : 'border-border bg-white'
                  )}>
                    {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
