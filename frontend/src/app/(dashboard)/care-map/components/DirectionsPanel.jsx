'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Car, Footprints, Bike, Clock, MapPin, Navigation, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const MODES = [
  { id: 'DRIVING', label: 'Drive', icon: Car },
  { id: 'WALKING', label: 'Walk', icon: Footprints },
  { id: 'BICYCLING', label: 'Bike', icon: Bike },
];

/**
 * DirectionsPanel — Route details with mode tabs and ETA.
 */
export default function DirectionsPanel({ route, travelMode, onModeChange, onClear, loading }) {
  if (!route && !loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="rounded-2xl border border-border bg-white p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
          Directions
        </h3>
        <button
          onClick={onClear}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1.5 mb-3">
        {MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onModeChange?.(id)}
            className={cn(
              'flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all border',
              travelMode === id
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-muted-foreground border-border hover:bg-muted'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted/50 rounded w-1/2" />
          <div className="h-3 bg-muted/40 rounded w-3/4" />
        </div>
      ) : route ? (
        <div className="space-y-3">
          {/* ETA Summary */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-primary-50/50 border border-primary-100">
            <div className="flex items-center gap-1.5 text-primary-700">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-bold">{route.duration}</span>
            </div>
            <div className="flex items-center gap-1.5 text-primary-700">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-bold">{route.distance}</span>
            </div>
          </div>

          {/* Open in Google Maps */}
          <button
            onClick={() => {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(route.endAddress)}&travelmode=${travelMode.toLowerCase()}`;
              window.open(url, '_blank');
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-600 transition-all shadow-sm"
          >
            <Navigation className="w-3.5 h-3.5" />
            Start Navigation
          </button>
        </div>
      ) : null}
    </motion.div>
  );
}
