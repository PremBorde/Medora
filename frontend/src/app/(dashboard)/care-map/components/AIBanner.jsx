'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle, Stethoscope, Phone, Siren, ChevronRight, Shield, Sparkles
} from 'lucide-react';
import { getUrgencyConfig } from '@/lib/utils';
import { cn } from '@/lib/utils';

/**
 * AIBanner — Premium inline context banner at top of Care Map to maximize map area.
 */
export default function AIBanner({ urgencyLevel, specialistType, summary, recommendedAction }) {
  const config = getUrgencyConfig(urgencyLevel);
  const isEmergency = urgencyLevel === 'EMERGENCY';

  const recommendationText = `Based on your assessment, a ${specialistType || 'General Physician'} is recommended. These nearby hospitals are the best match.`;

  if (isEmergency) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50/30 py-2.5 px-3.5 shadow-sm shrink-0"
      >
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-red-100 border border-red-200/50 shrink-0">
              <Siren className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            </div>
            <p className="text-xs text-red-700 font-bold leading-normal truncate">
              Immediate Emergency Alert: {summary || 'Medical attention is recommended.'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="tel:112"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-[10px] font-extrabold shadow-sm hover:bg-red-700 transition-all cursor-pointer"
            >
              <Phone className="w-3 h-3" />
              Call Ambulance (112)
            </a>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-white py-2.5 px-3.5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden shrink-0"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-center gap-3">
        {/* Left icon with cyan border */}
        <div className="p-1.5 rounded-lg bg-primary-50 border border-primary-100 shadow-sm shrink-0">
          <Stethoscope className="w-3.5 h-3.5 text-primary" />
        </div>
        
        {/* Right Info */}
        <div className="flex-1 min-w-0 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <p className="text-xs text-foreground font-semibold truncate leading-none">
            {recommendationText}
          </p>
          
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary-700 border border-primary-200/50">
              <Sparkles className="w-2.5 h-2.5" />
              {specialistType || 'General Physician'}
            </span>
            <span className={cn(
              'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-bold border',
              config.bg, config.color, config.border
            )}>
              {config.icon} {config.label}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
