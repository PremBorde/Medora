'use client';

import { AnimatePresence } from 'framer-motion';
import { MapPin, SearchX } from 'lucide-react';
import HospitalCard from './HospitalCard';

/**
 * Skeleton loader for hospital cards.
 */
function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 animate-pulse">
      <div className="flex gap-3.5">
        <div className="w-12 h-12 rounded-xl bg-muted/60 shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="h-4 bg-muted/60 rounded-lg w-3/4" />
          <div className="h-3 bg-muted/40 rounded-lg w-1/2" />
          <div className="flex gap-2 mt-2">
            <div className="h-5 bg-muted/40 rounded-md w-16" />
            <div className="h-5 bg-muted/40 rounded-md w-12" />
          </div>
          <div className="h-8 bg-muted/30 rounded-lg w-full mt-3" />
        </div>
      </div>
    </div>
  );
}

/**
 * HospitalList — Scrollable vertical list of hospital cards.
 */
export default function HospitalList({
  places,
  loading,
  selectedPlaceId,
  hoveredPlaceId,
  onSelectPlace,
  onHoverPlace,
  onLeavePlace,
  onDirections,
  onBook,
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!places || places.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 rounded-2xl bg-muted/50 mb-4">
          <SearchX className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-bold text-foreground mb-1">
          No hospitals found
        </h3>
        <p className="text-xs text-muted-foreground max-w-[220px]">
          Try adjusting your search or filters to find nearby healthcare facilities.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {places.length} hospitals found
        </span>
      </div>

      <AnimatePresence mode="popLayout">
        {places.map((place, index) => (
          <HospitalCard
            key={place.place_id}
            place={place}
            index={index}
            isSelected={selectedPlaceId === place.place_id}
            isHovered={hoveredPlaceId === place.place_id}
            onSelect={onSelectPlace}
            onHover={onHoverPlace}
            onLeave={onLeavePlace}
            onDirections={onDirections}
            onBook={onBook}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
