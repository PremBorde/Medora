'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Stethoscope, Send, AlertTriangle, CheckCircle,
  Info, RefreshCw, Shield, MapPin, ChevronRight,
  AlertCircle, Home, Clock, Activity,
} from 'lucide-react';
import { symptomApi } from '@/lib/api';
import Link from 'next/link';
import { getUrgencyConfig, getErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SpotlightCard, BlurText, CountUp } from '@/components/ui/AnimatedComponents';
import useAuthStore from '@/store/authStore';
import BodyMap from './components/BodyMap';
import Mascot from '@/components/Mascot';
import UrgencyBanner from '@/components/UrgencyBanner';

// ── Zod schema ──────────────────────────────────────────────────────────────

const schema = z.object({
  symptoms: z
    .string()
    .min(10, 'Please describe your symptoms in more detail (at least 10 characters)')
    .max(2000, 'Description too long (max 2000 characters)'),
  additionalContext: z.string().optional(),
});

// ── Helpers ─────────────────────────────────────────────────────────────────

function urgencyToMascotState(urgencyLevel, isLoading) {
  if (isLoading) return 'thinking';
  switch (urgencyLevel) {
    case 'HOME_CARE': return 'calm';
    case 'ROUTINE':   return 'idle';
    case 'URGENT':    return 'calm';
    case 'EMERGENCY': return 'alert';
    default:          return 'idle';
  }
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2.5 h-2.5 bg-white rounded-full"
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

// ── Result Card ──────────────────────────────────────────────────────────────

function ResultCard({ result }) {
  const config = getUrgencyConfig(result.urgencyLevel);

  const urgencyIcons = {
    HOME_CARE: Home,
    ROUTINE:   Clock,
    URGENT:    AlertTriangle,
    EMERGENCY: AlertTriangle,
  };
  const Icon = urgencyIcons[result.urgencyLevel] || Info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20 }}
      className="space-y-5"
    >
      {/* Main analysis card */}
      <SpotlightCard className={`border-2 ${config.border}`}>
        <div className="p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center shrink-0 border border-current/10`}>
                <Icon className={`w-6 h-6 ${config.color}`} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                  Triage Output
                </span>
                <h3 className={`text-xl font-bold font-display leading-none mt-1 ${config.color}`}>
                  {config.label} Urgency
                </h3>
              </div>
            </div>
          </div>

          <div className="border-t border-border/40 pt-5 space-y-4">
            {/* Reasoning */}
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                Clinical Reasoning
              </h4>
              <p className="text-sm text-foreground leading-relaxed font-medium">{result.reasoning}</p>
            </div>

            {/* Recommended action */}
            {result.recommendedAction && (
              <div className="p-4 bg-muted/30 rounded-xl border border-border/40">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                  Recommended Next Step
                </h4>
                <p className="text-sm text-foreground leading-relaxed font-medium">{result.recommendedAction}</p>
              </div>
            )}

            {/* Red flags */}
            {result.redFlags?.length > 0 && (
              <div className="p-4 bg-red-50/60 rounded-xl border border-red-200/60">
                <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2">
                  ⚠ Red Flags Detected
                </h4>
                <ul className="space-y-1.5">
                  {result.redFlags.map((flag, i) => (
                    <li key={i} className="text-xs text-red-800 font-medium flex gap-2">
                      <span className="shrink-0 mt-0.5">•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Home care steps */}
            {result.homeCareSteps?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Home Care Steps
                </h4>
                <div className="space-y-2">
                  {result.homeCareSteps.map((step, i) => (
                    <div key={i} className="flex gap-2 p-3 bg-muted/30 rounded-xl border border-border/40">
                      <span className="text-xs font-bold text-primary shrink-0">{i + 1}.</span>
                      <p className="text-xs text-foreground font-medium leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specialist recommendation */}
            {result.specialistType && (
              <div className="flex items-center gap-3 p-3 bg-accent/5 rounded-xl border border-accent/20">
                <Stethoscope className="w-4 h-4 text-accent shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-accent-700 uppercase tracking-widest block">
                    Recommended Specialist
                  </span>
                  <span className="text-sm font-bold text-foreground">{result.specialistType}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </SpotlightCard>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-white/40 border border-border/60 backdrop-blur-md">
        <Shield className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">{result.disclaimer}</p>
      </div>
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SymptomCheckerPage() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBodyRegion, setSelectedBodyRegion] = useState(null);
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await symptomApi.analyze({
        symptoms: data.symptoms,
        additionalContext: data.additionalContext || null,
        bodyLocation: selectedBodyRegion || null,
        age: user?.dateOfBirth
          ? Math.floor((Date.now() - new Date(user.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000))
          : null,
        gender: user?.gender || null,
        knownConditions: user?.chronicConditions
          ? user.chronicConditions.split(',').map((s) => s.trim())
          : [],
        currentMedications: user?.currentMedications
          ? user.currentMedications.split(',').map((s) => s.trim())
          : [],
      });
      setResult(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setSelectedBodyRegion(null);
    reset();
  };

  const mascotState = urgencyToMascotState(result?.urgencyLevel, isLoading);

  return (
    <div className="relative min-h-screen pb-16">
      {/* Ambient gradients */}
      <div className="absolute top-[-8%] left-[-8%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-8%] right-[-8%] w-[500px] h-[500px] rounded-full bg-accent/8 blur-[130px] pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:16px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-foreground leading-none">
              <BlurText text="Symptom Checker" />
            </h1>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Select a body region, describe your symptoms, and receive AI-guided triage with a built-in safety layer.
            </p>
          </div>
        </div>

        {/* ── Urgency Banner (above results) ────────────────────────────── */}
        {result && <UrgencyBanner urgencyLevel={result.urgencyLevel} />}

        {/* ── Main Grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left: Body Map ───────────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <SpotlightCard className="h-full">
              <div className="p-5 flex flex-col items-center gap-4">
                <div className="space-y-0.5 text-center w-full">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                    Body Location
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    Tap a region to pre-fill the location field
                  </p>
                </div>
                <BodyMap
                  selectedRegion={selectedBodyRegion}
                  onSelect={setSelectedBodyRegion}
                />
              </div>
            </SpotlightCard>
          </div>

          {/* Centre: Form or Results ──────────────────────────────────────── */}
          <div className="lg:col-span-6 space-y-5">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.35 }}
                >
                  <SpotlightCard>
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-6">
                      {/* Selected body region pill */}
                      {selectedBodyRegion && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/8 border border-primary/20 rounded-xl px-3 py-2"
                        >
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          Location: <span className="capitalize">{selectedBodyRegion.replace(/-/g, ' ')}</span>
                        </motion.div>
                      )}

                      {/* Symptoms textarea */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="symptoms"
                          className="text-xs font-bold text-muted-foreground uppercase tracking-widest"
                        >
                          Describe Symptoms in Detail *
                        </Label>
                        <textarea
                          id="symptoms"
                          placeholder={
                            selectedBodyRegion
                              ? `Describe what you're feeling in the ${selectedBodyRegion.replace(/-/g, ' ')} area...`
                              : 'e.g. Sharp pain in lower right abdomen, started 4 hours ago, worsens with movement…'
                          }
                          {...register('symptoms')}
                          className={`w-full bg-white/50 border rounded-xl pl-5 pr-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all shadow-inner resize-none min-h-[160px] ${
                            errors.symptoms ? 'border-red-400 focus:ring-red-400' : 'border-border/80'
                          }`}
                        />
                        {errors.symptoms && (
                          <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors.symptoms.message}
                          </p>
                        )}
                      </div>

                      {/* Additional context */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="additionalContext"
                          className="text-xs font-bold text-muted-foreground uppercase tracking-widest"
                        >
                          Additional Context (optional)
                        </Label>
                        <textarea
                          id="additionalContext"
                          placeholder="Recent stressors, family history, dietary changes, or specific concerns…"
                          {...register('additionalContext')}
                          className="w-full bg-white/50 border border-border/80 rounded-xl pl-5 pr-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all shadow-inner resize-none min-h-[90px]"
                        />
                      </div>

                      {error && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {error}
                        </div>
                      )}

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={isLoading}
                        className="w-full shadow-glow font-bold py-4 text-sm rounded-xl"
                      >
                        {isLoading ? (
                          <>
                            <LoadingDots />
                            Synthesising Clinical Model…
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 text-white" />
                            Submit for Assessment
                          </>
                        )}
                      </Button>
                    </form>
                  </SpotlightCard>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <ResultCard result={result} />
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleReset}
                    className="w-full border-border/80 bg-white/60 text-foreground hover:bg-muted font-bold rounded-xl py-3 text-sm"
                  >
                    <RefreshCw className="w-4 h-4 text-muted-foreground" />
                    Start New Assessment
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Mascot + Patient Context ─────────────────────────────── */}
          <div className="lg:col-span-3 space-y-5">
            {/* Mascot */}
            <SpotlightCard>
              <div className="p-5 flex flex-col items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Medora Assistant
                </span>
                <Mascot state={mascotState} />
              </div>
            </SpotlightCard>

            {/* Patient context */}
            <SpotlightCard>
              <div className="p-5 space-y-4">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                    Active Patient Context
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    Integrated with your submission.
                  </p>
                </div>

                <div className="space-y-3 text-xs font-medium border-t border-border/40 pt-4">
                  {/* Age / Gender */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 bg-muted/40 rounded-xl border border-border/40 space-y-1">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Age</span>
                      <span className="text-sm font-extrabold text-foreground font-display">
                        {user?.dateOfBirth
                          ? `${Math.floor((Date.now() - new Date(user.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000))} yrs`
                          : '—'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-muted/40 rounded-xl border border-border/40 space-y-1">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Gender</span>
                      <span className="text-sm font-extrabold text-foreground font-display">{user?.gender || '—'}</span>
                    </div>
                  </div>

                  {/* Chronic conditions */}
                  <div className="p-2.5 bg-muted/40 rounded-xl border border-border/40 space-y-1.5">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Conditions</span>
                    {user?.chronicConditions ? (
                      <div className="flex flex-wrap gap-1">
                        {user.chronicConditions.split(',').map((c) => (
                          <span key={c} className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
                            {c.trim()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground/60 italic">None reported</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-border/40 pt-3 text-center">
                  <Link href="/profile">
                    <span className="text-[10px] text-primary hover:underline font-bold tracking-wider uppercase cursor-pointer flex items-center justify-center gap-1">
                      Update profile
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </div>
  );
}
