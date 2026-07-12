'use client';

import { motion } from 'framer-motion';
import {
  Star, MapPin, Clock, Phone, Navigation, Calendar,
  Sparkles, Shield, Siren, CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * CircularProgress — Premium match score progress circle with gradient ring.
 */
function CircularProgress({ score }) {
  const radius = 20;
  const stroke = 3;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let labelText = 'Good Match';
  if (score >= 90) labelText = 'Excellent';
  else if (score >= 80) labelText = 'Very Good';

  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className="relative w-10 h-10 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            stroke="#f1f5f9"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <motion.circle
            stroke="url(#matchGrad)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="matchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute text-[10px] font-extrabold text-foreground">{score}%</span>
      </div>
      <div className="hidden sm:block text-left">
        <p className="text-[8px] font-extrabold text-muted-foreground uppercase tracking-wider">AI Match</p>
        <p className="text-[10px] font-bold text-teal-700 mt-0.5">{labelText}</p>
      </div>
    </div>
  );
}

/**
 * HospitalCard — Premium card for each hospital/clinic in the list.
 */
export default function HospitalCard({
  place,
  index,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onLeave,
  onDirections,
  onBook,
}) {
  const isTopMatch = index === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', damping: 20 }}
      onMouseEnter={() => onHover?.(place.place_id)}
      onMouseLeave={() => onLeave?.()}
      onClick={() => onSelect?.(place)}
      className={cn(
        'group relative rounded-2xl border bg-white p-5 cursor-pointer transition-all duration-300 shadow-sm',
        isSelected
          ? 'border-primary ring-4 ring-primary/5 scale-[1.01] shadow-md'
          : isHovered
          ? 'border-primary/40 -translate-y-1 scale-[1.01] shadow-md'
          : 'border-border hover:border-primary/30 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-md'
      )}
    >
      {/* Top Match Sparkle Badge */}
      {isTopMatch && (
        <div className="absolute -top-2.5 left-5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary text-white text-[9px] font-bold uppercase tracking-wider shadow-sm z-10">
          <Sparkles className="w-2.5 h-2.5 fill-white" />
          Best AI Match
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        {/* Left: Metadata */}
        <div className="space-y-1 flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
            {place.name}
          </h3>
          
          <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground font-medium">
            {/* Star Rating */}
            {place.rating && (
              <span className="inline-flex items-center gap-0.5 text-amber-600 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {place.rating}
                <span className="text-muted-foreground/60 font-normal">({place.user_ratings_total})</span>
              </span>
            )}
            
            {place.rating && <span>·</span>}

            {/* Distance • Travel Time */}
            <span>{place.distanceText}</span>
            <span>·</span>
            <span>{place.travelTime}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            {/* Specialist Department */}
            {place.departments?.length > 0 && (
              <span className="text-[10px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
                {place.departments[0]}
              </span>
            )}

            {/* Open / Closed dot */}
            <span className={cn(
              'inline-flex items-center gap-1 text-[10px] font-bold',
              place.isOpen ? 'text-emerald-600' : 'text-red-500'
            )}>
              <span>●</span>
              <span>{place.isOpen ? 'Open Now' : 'Closed'}</span>
            </span>
          </div>
        </div>

        {/* Right: Premium Circular AI Match */}
        <CircularProgress score={place.aiScore} />
      </div>

      {/* Dynamic Key Reasons (Short taglist) */}
      {place.aiReasons?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
          {place.aiReasons.slice(0, 2).map((reason, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-[10px] text-primary-700 font-semibold bg-primary-50/50 px-2 py-0.5 rounded-md">
              <CheckCircle className="w-2.5 h-2.5 text-primary" />
              {reason}
            </span>
          ))}
        </div>
      )}

      {/* Premium Buttons Row */}
      <div className="flex items-center gap-2 mt-4 pt-3.5 border-t border-border/50">
        {/* Call (Icon-only) */}
        <button
          onClick={(e) => { e.stopPropagation(); window.open(`tel:+91`); }}
          className="p-2 rounded-xl bg-muted text-muted-foreground hover:bg-primary-50 hover:text-primary transition-all border border-transparent hover:border-primary/20 shrink-0 cursor-pointer"
          title="Call Facility"
        >
          <Phone className="w-3.5 h-3.5" />
        </button>

        {/* Directions (Secondary) */}
        <button
          onClick={(e) => { e.stopPropagation(); onDirections?.(place); }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-border hover:border-primary/30 hover:bg-primary-50/10 text-[11px] font-bold text-foreground transition-all cursor-pointer"
        >
          <Navigation className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
          Directions
        </button>

        {/* Book Appointment (Primary with Hover Glow) */}
        <button
          onClick={(e) => { e.stopPropagation(); onBook?.(place); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-[11px] font-extrabold hover:bg-primary-600 transition-all hover:shadow-glow ml-auto cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5" />
          Book Appointment
        </button>
      </div>
    </motion.div>
  );
}
