'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Star, MapPin, Clock, Phone, Navigation, Calendar,
  Shield, Siren, Accessibility, Building2, Stethoscope,
  CheckCircle, User, Car, Heart, ShieldAlert, BadgeAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MOCK_DOCTORS = [
  { name: 'Dr. Sarah Jenkins', specialty: 'General Practitioner', exp: '12 yrs exp', available: true },
  { name: 'Dr. Alex Rivera', specialty: 'Emergency Medicine', exp: '9 yrs exp', available: true },
  { name: 'Dr. Priya Nair', specialty: 'Internal Medicine', exp: '15 yrs exp', available: false },
];

const INSURANCES = ['Aetna', 'Blue Cross Blue Shield', 'Cigna', 'UnitedHealthcare', 'Medicare'];

/**
 * DetailDrawer — Slide-in side drawer showing full hospital details.
 */
export default function DetailDrawer({ place, isOpen, onClose, onDirections, onBook }) {
  if (!place) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/15 backdrop-blur-sm z-50"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header Image Cover */}
            <div className="relative h-44 bg-gradient-to-br from-primary-500 to-cyan-600 flex flex-col justify-end p-6 text-white shrink-0 overflow-hidden">
              {/* Blurred grid vector background */}
              <div className="absolute inset-0 bg-medical-grid opacity-25 pointer-events-none" />
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all text-white border border-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title Info */}
              <div className="relative z-10 space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[9px] font-extrabold tracking-widest uppercase">
                    {place.placeType || 'Hospital'}
                  </span>
                  {place.hasEmergency && (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-extrabold tracking-widest uppercase flex items-center gap-1">
                      <Siren className="w-3 h-3" />
                      Emergency
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold leading-tight font-display tracking-tight mt-1">{place.name}</h2>
                <div className="flex items-center gap-3 text-xs text-white/80 font-medium pt-1">
                  <span className="flex items-center gap-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {place.rating || '4.5'}
                  </span>
                  <span>·</span>
                  <span>{place.distanceText || '1.2 km'}</span>
                  <span>·</span>
                  <span>{place.travelTime || '6 mins'}</span>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* AI Recommendations */}
              {place.aiReasons?.length > 0 && (
                <div className="rounded-2xl border border-primary-100 bg-primary-50/20 p-4.5 space-y-2">
                  <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    AI MATCH JUSTIFICATION
                  </h4>
                  <ul className="space-y-1.5">
                    {place.aiReasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-primary-900 font-semibold leading-relaxed">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Address */}
              <div>
                <h4 className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest mb-1.5">
                  Location Address
                </h4>
                <p className="text-xs text-foreground font-semibold leading-relaxed flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  {place.vicinity || '123 Medical Center Lane, City Hub'}
                </p>
              </div>

              {/* Doctors Section */}
              <div>
                <h4 className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2.5">
                  On-Duty Specialists
                </h4>
                <div className="space-y-2">
                  {MOCK_DOCTORS.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors">
                      <div className="w-8.5 h-8.5 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center text-primary shrink-0">
                        <User className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{doc.name}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{doc.specialty} · {doc.exp}</p>
                      </div>
                      <span className={cn(
                        'text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0',
                        doc.available ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-muted-foreground'
                      )}>
                        {doc.available ? 'Available' : 'Busy'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quality & Ratings Breakdown */}
              <div>
                <h4 className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2.5">
                  Performance & Care Ratings
                </h4>
                <div className="space-y-2.5">
                  {[
                    { label: 'Quality of Care', score: 4.8 },
                    { label: 'Average Wait Time', score: 4.2 },
                    { label: 'Staff friendliness', score: 4.7 },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-foreground">
                        <span>{item.label}</span>
                        <span className="text-muted-foreground">{item.score} / 5.0</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          style={{ width: `${(item.score / 5.0) * 100}%` }}
                          className="h-full bg-gradient-to-r from-primary to-cyan-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accepted Insurance */}
              <div>
                <h4 className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2">
                  Accepted Insurance Network
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {INSURANCES.map((ins) => (
                    <span
                      key={ins}
                      className="px-2.5 py-1 rounded-xl bg-muted text-[10px] font-bold text-muted-foreground border border-border/40"
                    >
                      {ins}
                    </span>
                  ))}
                </div>
              </div>

              {/* Facilities & Parking */}
              <div>
                <h4 className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2.5">
                  Amenities & Access
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Siren, label: 'Emergency Room', desc: '24/7 Trauma Care' },
                    { icon: Shield, label: 'Accreditation', desc: 'JCI Accredited' },
                    { icon: Accessibility, label: 'Wheelchair Access', desc: 'Ramps & Lifts' },
                    { icon: Car, label: 'Parking Space', desc: 'Valet & Self Parking' },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div
                      key={label}
                      className="p-3 rounded-xl border border-border/50 bg-white shadow-inner flex flex-col gap-1 text-left"
                    >
                      <Icon className="w-4.5 h-4.5 text-primary shrink-0" />
                      <p className="text-xs font-bold text-foreground mt-1">{label}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold leading-none">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Working Hours */}
              <div className="pt-2 border-t border-border/50">
                <h4 className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest mb-1">
                  Operating Hours
                </h4>
                <p className="text-xs text-foreground font-semibold">
                  {place.is24x7 ? 'Open 24 hours, 7 days a week' : 'Mon – Sat: 8:00 AM – 9:00 PM (Emergency 24x7)'}
                </p>
              </div>
            </div>

            {/* Sticky Actions Footer */}
            <div className="border-t border-border p-4 flex gap-2.5 bg-white shrink-0">
              <button
                onClick={() => window.open(`tel:+91`)}
                className="p-3 rounded-xl bg-muted text-muted-foreground hover:bg-primary-50 hover:text-primary transition-all border border-transparent hover:border-primary/20 shrink-0 cursor-pointer"
                title="Call Hospital"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDirections?.(place)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl border border-border hover:border-primary/30 hover:bg-primary-50/10 text-xs font-bold text-foreground transition-all cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                Get Directions
              </button>
              <button
                onClick={() => onBook?.(place)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl bg-primary text-white text-xs font-extrabold hover:bg-primary-600 transition-all hover:shadow-glow cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                Book Appointment
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
