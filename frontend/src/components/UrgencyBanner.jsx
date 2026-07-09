'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, Phone } from 'lucide-react';

/**
 * UrgencyBanner
 *
 * Colour-coded informational banner rendered above the analysis results.
 * Always paired with a fixed medical disclaimer.
 *
 * Props:
 *  - urgencyLevel : 'HOME_CARE' | 'ROUTINE' | 'URGENT' | 'EMERGENCY' | null
 */
export default function UrgencyBanner({ urgencyLevel }) {
  if (!urgencyLevel) return null;

  const config = BANNER_CONFIG[urgencyLevel] ?? BANNER_CONFIG.ROUTINE;

  return (
    <AnimatePresence>
      <motion.div
        key={urgencyLevel}
        initial={{ opacity: 0, y: -16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className={`rounded-2xl border-2 ${config.border} ${config.bg} overflow-hidden`}
      >
        {/* Emergency pulse bar at top */}
        {urgencyLevel === 'EMERGENCY' && (
          <motion.div
            className="h-1 bg-red-500"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
          />
        )}

        <div className="p-4 sm:p-5 flex items-start gap-4">
          {/* Icon */}
          <motion.div
            className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center shrink-0 shadow-sm`}
            animate={urgencyLevel === 'EMERGENCY' ? { scale: [1, 1.12, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <config.Icon className={`w-5 h-5 ${config.iconColor}`} />
          </motion.div>

          <div className="flex-1 min-w-0 space-y-1">
            {/* Label row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-black uppercase tracking-widest ${config.labelColor}`}>
                {config.levelLabel}
              </span>
              <span className={`text-xs font-bold ${config.textColor}`}>
                {config.headline}
              </span>
            </div>

            {/* Fixed disclaimer */}
            <p className={`text-[11px] leading-relaxed ${config.disclaimerColor}`}>
              <span className="font-bold">Note:</span>{' '}
              This is not a medical diagnosis. For emergencies, call{' '}
              <span className="font-bold">112</span> or visit the nearest hospital.
            </p>

            {/* Emergency call-to-action */}
            {urgencyLevel === 'EMERGENCY' && (
              <motion.div
                className="mt-2 flex items-center gap-2 text-red-700 font-bold text-xs"
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <Phone className="w-3.5 h-3.5" />
                Call emergency services (112) immediately or proceed to the nearest A&amp;E.
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Configuration map ─────────────────────────────────────────────────────────

const BANNER_CONFIG = {
  HOME_CARE: {
    levelLabel:     'Home Care',
    headline:       'Manage comfortably at home',
    bg:             'bg-emerald-50/80',
    border:         'border-emerald-200',
    iconBg:         'bg-emerald-500',
    iconColor:      'text-white',
    Icon:           CheckCircle,
    textColor:      'text-emerald-800',
    labelColor:     'text-emerald-600',
    disclaimerColor:'text-emerald-700/80',
  },
  ROUTINE: {
    levelLabel:     'Routine',
    headline:       'Schedule an appointment within a few days',
    bg:             'bg-sky-50/80',
    border:         'border-sky-200',
    iconBg:         'bg-sky-500',
    iconColor:      'text-white',
    Icon:           Clock,
    textColor:      'text-sky-800',
    labelColor:     'text-sky-600',
    disclaimerColor:'text-sky-700/80',
  },
  URGENT: {
    levelLabel:     'Urgent',
    headline:       'Seek medical attention today',
    bg:             'bg-amber-50/80',
    border:         'border-amber-300',
    iconBg:         'bg-amber-500',
    iconColor:      'text-white',
    Icon:           AlertTriangle,
    textColor:      'text-amber-800',
    labelColor:     'text-amber-600',
    disclaimerColor:'text-amber-700/80',
  },
  EMERGENCY: {
    levelLabel:     'EMERGENCY',
    headline:       'Seek immediate emergency care now',
    bg:             'bg-red-50/90',
    border:         'border-red-400',
    iconBg:         'bg-red-500',
    iconColor:      'text-white',
    Icon:           AlertTriangle,
    textColor:      'text-red-900 font-bold',
    labelColor:     'text-red-600',
    disclaimerColor:'text-red-700/90',
  },
};
