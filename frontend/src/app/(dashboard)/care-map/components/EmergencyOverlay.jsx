'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Siren, Phone, Navigation, MapPin, X, AlertTriangle } from 'lucide-react';

/**
 * EmergencyOverlay — Full-screen emergency mode when urgencyLevel is EMERGENCY.
 */
export default function EmergencyOverlay({ isOpen, onClose, nearestEmergency, onDirections }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-red-900/90 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-red-500 to-rose-600 p-6 text-center relative">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-20 h-20 rounded-full bg-white/20 mx-auto flex items-center justify-center mb-4"
              >
                <Siren className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-xl font-extrabold text-white">Emergency</h2>
              <p className="text-sm text-red-100 mt-1">
                Immediate medical attention recommended
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Nearest Emergency Hospital */}
              {nearestEmergency && (
                <div className="p-4 rounded-xl border-2 border-red-200 bg-red-50">
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">
                    Nearest Emergency Hospital
                  </p>
                  <h3 className="text-sm font-bold text-foreground">{nearestEmergency.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {nearestEmergency.distanceText} · {nearestEmergency.travelTime}
                  </div>
                </div>
              )}

              {/* Emergency Actions */}
              <a
                href="tel:112"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all shadow-lg"
              >
                <Phone className="w-5 h-5" />
                Call Ambulance (112)
              </a>

              <button
                onClick={() => {
                  if (nearestEmergency) onDirections?.(nearestEmergency);
                  onClose?.();
                }}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-red-300 text-red-700 text-sm font-bold hover:bg-red-50 transition-all"
              >
                <Navigation className="w-5 h-5" />
                Get Directions Now
              </button>

              {/* Emergency Contacts */}
              <div className="pt-3 border-t border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Emergency Contacts
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Ambulance', number: '112' },
                    { label: 'Police', number: '100' },
                    { label: 'Fire', number: '101' },
                    { label: 'Women Helpline', number: '1091' },
                  ].map(({ label, number }) => (
                    <a
                      key={number}
                      href={`tel:${number}`}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <Phone className="w-3 h-3 text-red-500" />
                      <span>{label}</span>
                      <span className="ml-auto text-muted-foreground font-bold">{number}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
