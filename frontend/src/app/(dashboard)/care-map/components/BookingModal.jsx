'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, CheckCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOCK_DOCTORS = [
  { id: 'd1', name: 'Dr. Priya Sharma', specialty: 'General Physician', rating: 4.8, available: true },
  { id: 'd2', name: 'Dr. Rajesh Kumar', specialty: 'Cardiologist', rating: 4.6, available: true },
  { id: 'd3', name: 'Dr. Anita Patel', specialty: 'Pulmonologist', rating: 4.7, available: false },
];

const MOCK_SLOTS = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '2:00 PM', '2:30 PM', '3:00 PM', '4:00 PM'];

const STEPS = ['doctor', 'date', 'time', 'confirm'];

/**
 * BookingModal — Multi-step appointment booking flow.
 */
export default function BookingModal({ place, isOpen, onClose }) {
  const [step, setStep] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  if (!isOpen || !place) return null;

  const handleClose = () => {
    setStep(0);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedTime(null);
    onClose?.();
  };

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  // Generate dates for next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden max-h-[90vh] pointer-events-auto"
            >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="text-sm font-bold text-foreground">Book Appointment</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">{place.name}</p>
              </div>
              <button onClick={handleClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center px-5 pt-4 pb-2 gap-1">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all',
                      i < step ? 'bg-primary text-white' : i === step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {i < step ? '✓' : i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn('flex-1 h-0.5 mx-1', i < step ? 'bg-primary' : 'bg-border')} />
                  )}
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <AnimatePresence mode="wait">
                {/* Step 1: Choose Doctor */}
                {step === 0 && (
                  <motion.div key="doctor" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Choose Doctor</h3>
                    {MOCK_DOCTORS.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => { setSelectedDoctor(doc); next(); }}
                        disabled={!doc.available}
                        className={cn(
                          'w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all',
                          selectedDoctor?.id === doc.id ? 'border-primary bg-primary-50' : 'border-border hover:border-primary/30 hover:bg-muted/30',
                          !doc.available && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-cyan-100 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">{doc.name}</p>
                          <p className="text-[11px] text-muted-foreground">{doc.specialty} · ★ {doc.rating}</p>
                        </div>
                        {doc.available ? (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <span className="text-[10px] font-semibold text-red-500">Unavailable</span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}

                {/* Step 2: Choose Date */}
                {step === 1 && (
                  <motion.div key="date" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Choose Date</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {dates.map((d) => {
                        const isToday = d.toDateString() === new Date().toDateString();
                        const isSelected = selectedDate?.toDateString() === d.toDateString();
                        return (
                          <button
                            key={d.toISOString()}
                            onClick={() => { setSelectedDate(d); next(); }}
                            className={cn(
                              'p-3 rounded-xl border text-center transition-all',
                              isSelected ? 'border-primary bg-primary-50' : 'border-border hover:border-primary/30'
                            )}
                          >
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                              {d.toLocaleDateString('en-US', { weekday: 'short' })}
                            </p>
                            <p className="text-lg font-bold text-foreground">{d.getDate()}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {isToday ? 'Today' : d.toLocaleDateString('en-US', { month: 'short' })}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Choose Time */}
                {step === 2 && (
                  <motion.div key="time" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Choose Time</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {MOCK_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => { setSelectedTime(slot); next(); }}
                          className={cn(
                            'p-3 rounded-xl border text-center text-sm font-semibold transition-all',
                            selectedTime === slot ? 'border-primary bg-primary-50 text-primary' : 'border-border text-foreground hover:border-primary/30'
                          )}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Confirmation */}
                {step === 3 && (
                  <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                    <div className="text-center py-4">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-100 mx-auto flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-600" />
                      </div>
                      <h3 className="text-base font-bold text-foreground">Appointment Confirmed!</h3>
                      <p className="text-xs text-muted-foreground mt-1">Your booking has been scheduled</p>
                    </div>

                    <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-primary" />
                        <span className="font-medium">{selectedDoctor?.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium">
                          {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {step === 3 ? (
              <div className="p-4 border-t border-border">
                <button
                  onClick={handleClose}
                  className="w-full py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-600 transition-all"
                >
                  Done
                </button>
              </div>
            ) : step > 0 ? (
              <div className="p-4 border-t border-border">
                <button
                  onClick={prev}
                  className="w-full py-3 rounded-xl bg-muted text-foreground text-sm font-semibold hover:bg-muted/80 transition-all"
                >
                  Back
                </button>
              </div>
            ) : null}
          </motion.div>
        </div>
      </>
    )}
  </AnimatePresence>
);
}
