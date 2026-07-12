'use client';

import { Phone, Navigation, Calendar, Share2 } from 'lucide-react';

/**
 * QuickActions — Bottom sticky bar with quick action buttons.
 */
export default function QuickActions({ selectedPlace, onDirections, onBook }) {
  if (!selectedPlace) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      <div className="glass-premium border-t border-border p-3 flex items-center gap-2">
        <button
          onClick={() => window.open('tel:+91')}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-muted text-xs font-semibold text-foreground hover:bg-muted/80 transition-all"
        >
          <Phone className="w-3.5 h-3.5" />
          Call
        </button>
        <button
          onClick={() => onDirections?.(selectedPlace)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-muted text-xs font-semibold text-foreground hover:bg-muted/80 transition-all"
        >
          <Navigation className="w-3.5 h-3.5" />
          Directions
        </button>
        <button
          onClick={() => onBook?.(selectedPlace)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-600 transition-all shadow-sm"
        >
          <Calendar className="w-3.5 h-3.5" />
          Book
        </button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: selectedPlace.name,
                text: `Check out ${selectedPlace.name} on Medora AI`,
                url: window.location.href,
              });
            }
          }}
          className="inline-flex items-center justify-center p-2.5 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-all"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
