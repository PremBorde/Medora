'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Crosshair } from 'lucide-react';

export default function LocationRefineMap({ parentRegion = 'abdomen', subRegions, onSubmit }) {
  const [selectedSub, setSelectedSub] = useState(null);

  const defaultSubs = [
    { id: 'upper-left',  label: 'Upper Left Quadrant' },
    { id: 'upper-right', label: 'Upper Right Quadrant' },
    { id: 'lower-left',  label: 'Lower Left Quadrant' },
    { id: 'lower-right', label: 'Lower Right Quadrant' },
    { id: 'periumbilical', label: 'Middle (Around Navel)' },
    { id: 'all-over',    label: 'All Over / Diffuse' },
  ];

  const regionsList = subRegions && subRegions.length > 0
    ? subRegions.map((s) => ({ id: s, label: s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }))
    : defaultSubs;

  const handleSelect = (id) => {
    setSelectedSub(id);
  };

  const handleConfirm = () => {
    const matched = regionsList.find((r) => r.id === selectedSub);
    if (matched) {
      onSubmit(`Specific location: ${matched.label} of the ${parentRegion}`);
    }
  };

  return (
    <div className="w-full flex flex-col sm:flex-row gap-5 items-center py-2">
      {/* ── Zoom Quadrant Map Interface ───────────────────────────────── */}
      <div className="relative w-full max-w-[190px] aspect-square bg-gradient-to-tr from-muted/5 to-muted/20 border border-border/40 rounded-2xl p-3 flex flex-col justify-between shadow-inner shrink-0">
        {/* Radar crosshairs background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
          <Crosshair className="w-32 h-32 text-primary" />
        </div>
        <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-primary/20" />
        <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-primary/20" />
        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-primary/20" />
        <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-primary/20" />

        {/* 2x2 Grid of Quadrant paths for location refining */}
        <div className="grid grid-cols-2 gap-2 w-full h-full">
          {['upper-left', 'upper-right', 'lower-left', 'lower-right'].map((quad) => {
            const isSelected = selectedSub === quad;
            const hasRegion = regionsList.some((r) => r.id === quad);
            if (!hasRegion) return null;

            return (
              <motion.button
                key={quad}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleSelect(quad)}
                className={`w-full h-full rounded-xl border flex flex-col items-center justify-center p-2 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-primary/10 border-primary text-primary shadow-sm shadow-primary/5'
                    : 'bg-white hover:bg-muted/40 border-border/80 text-muted-foreground/60 hover:text-foreground'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected ? 'border-primary bg-primary/20' : 'border-border bg-muted/40'
                }`}>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </div>
                <span className="text-[8px] font-bold uppercase tracking-wider mt-1.5 leading-none">
                  {quad.replace(/-/g, ' ')}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Selection details and actions list ─────────────────────────── */}
      <div className="flex-1 w-full space-y-4">
        <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
          {regionsList.map((reg) => {
            const isSelected = selectedSub === reg.id;
            return (
              <button
                key={reg.id}
                type="button"
                onClick={() => handleSelect(reg.id)}
                className={`w-full flex items-center justify-between px-3 py-2 border rounded-xl text-left text-[11px] font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary/10 border-primary text-primary shadow-sm'
                    : 'bg-muted/10 hover:bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{reg.label}</span>
                {isSelected && <span className="text-primary text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="primary"
          disabled={!selectedSub}
          onClick={handleConfirm}
          className="w-full font-bold py-3.5 text-xs rounded-xl shadow-glow cursor-pointer"
        >
          Confirm Location
        </Button>
      </div>
    </div>
  );
}
