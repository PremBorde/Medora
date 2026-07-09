'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Stethoscope, Send, AlertTriangle, CheckCircle,
  Info, ArrowRight, RefreshCw, Shield, Sparkles, User, FileText, Heart, Activity, CheckCircle2, ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { symptomApi } from '@/lib/api';
import Link from 'next/link';
import { getUrgencyConfig, getErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import useAuthStore from '@/store/authStore';
import { BlurText, ShinyText, SpotlightCard, CountUp } from '@/components/ui/AnimatedComponents';

const schema = z.object({
  symptoms: z
    .string()
    .min(10, 'Please describe your symptoms in more detail (at least 10 characters)')
    .max(2000, 'Description too long (max 2000 characters)'),
  additionalContext: z.string().optional(),
});

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

function UrgencyMeter({ currentLevel }) {
  const levels = ['HOME_CARE', 'ROUTINE', 'URGENT', 'EMERGENCY'];
  const getLevelColor = (lvl) => {
    switch (lvl) {
      case 'HOME_CARE': return 'bg-emerald-500';
      case 'ROUTINE':   return 'bg-sky-500';
      case 'URGENT':    return 'bg-amber-500';
      case 'EMERGENCY': return 'bg-red-500';
      // Legacy labels kept for forward-compat
      case 'LOW':       return 'bg-emerald-500';
      case 'MEDIUM':    return 'bg-amber-500';
      case 'HIGH':      return 'bg-orange-500';
      default:          return 'bg-muted';
    }
  };

  return (
    <div className="space-y-2 mt-4">
      <div className="flex justify-between text-[10px] font-bold text-muted-foreground tracking-wider">
        <span>URGENCY MATRIX</span>
        <span className="text-primary">{currentLevel} STATE</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {levels.map((lvl) => {
          const isActive = currentLevel === lvl;
          return (
            <div key={lvl} className="space-y-1">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  isActive ? getLevelColor(lvl) : 'bg-muted/60'
                } ${isActive ? 'ring-2 ring-offset-2 ring-primary/20 shadow-lg' : ''}`}
              />
              <span className={`block text-center text-[9px] font-bold tracking-tight ${isActive ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                {lvl.replace('_', '\u00a0')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UrgencyCard({ result }) {
  const config = getUrgencyConfig(result.urgencyLevel);

  const urgencyIcons = {
    LOW: CheckCircle2,
    MEDIUM: Info,
    HIGH: AlertTriangle,
    EMERGENCY: AlertTriangle,
  };
  const Icon = urgencyIcons[result.urgencyLevel] || Info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20 }}
      className="space-y-6"
    >
      {/* Emergency banner */}
      {result.seekImmediateCare && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-2xl border-2 border-red-200 bg-red-50/70 p-5 flex items-start gap-4 backdrop-blur-md shadow-lg shadow-red-500/5 animate-pulse"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shrink-0 shadow-md">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-red-900 font-display">Immediate Emergency Intervention Required</h3>
            <p className="text-sm text-red-700/90 mt-1 leading-relaxed">
              Your reported symptoms contain severe clinical indicators. Please visit the nearest emergency facility or dial local emergency services immediately.
            </p>
          </div>
        </motion.div>
      )}

      {/* Main Analysis Card */}
      <SpotlightCard className={`border-2 ${config.border}`}>
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center shrink-0 border border-current/10`}>
                <Icon className={`w-6 h-6 ${config.color}`} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Primary Triaging Output</span>
                <h3 className={`text-xl font-bold font-display leading-none mt-1 ${config.color}`}>
                  {result.urgencyLevel} Urgency
                </h3>
              </div>
            </div>
            <div className="sm:text-right shrink-0">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">AI Match Confidence</span>
              <span className="text-2xl font-extrabold text-foreground tracking-tight font-display mt-1 block">
                <CountUp end={result.confidence} suffix="%" />
              </span>
            </div>
          </div>

          <UrgencyMeter currentLevel={result.urgencyLevel} />

          <div className="border-t border-border/40 pt-5 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-display mb-1.5">Clinical Reasoning</h4>
              <p className="text-sm text-foreground leading-relaxed font-medium">{result.reasoning}</p>
            </div>

            {result.educationalSummary && (
              <div className="p-4 bg-muted/30 rounded-xl border border-border/40">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-display mb-1.5">Educational Insights</h4>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{result.educationalSummary}</p>
              </div>
            )}
          </div>
        </div>
      </SpotlightCard>

      {/* Specialist Recommendation Card */}
      {result.specialistType && (
        <SpotlightCard className="border border-accent-200/50 bg-gradient-to-r from-accent-50/10 to-white/50">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-100/80 flex items-center justify-center shrink-0 border border-accent-200">
                <Stethoscope className="w-6 h-6 text-accent" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-accent-700 uppercase tracking-widest">Recommended Navigation Pathway</span>
                <h4 className="font-bold text-lg text-foreground font-display">{result.specialistType}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{result.specialistReason}</p>
              </div>
            </div>
          </div>
        </SpotlightCard>
      )}

      {/* Questions card */}
      {result.followUpQuestions?.length > 0 && (
        <SpotlightCard>
          <div className="p-6">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-display mb-3">Suggested Consultation Checklist</h4>
            <p className="text-xs text-muted-foreground mb-4">Print or save these notes to discuss during your next clinical appointment.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {result.followUpQuestions.map((q, i) => (
                <div key={i} className="p-3 bg-muted/40 rounded-xl border border-border/50 flex gap-2">
                  <span className="text-xs font-bold text-primary shrink-0 mt-0.5">{i + 1}.</span>
                  <p className="text-xs text-foreground font-medium leading-relaxed">{q}</p>
                </div>
              ))}
            </div>
          </div>
        </SpotlightCard>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-white/40 border border-border/60 backdrop-blur-md">
        <Shield className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">{result.disclaimer}</p>
      </div>
    </motion.div>
  );
}

export default function SymptomCheckPage() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const prefill = params.get('prefill');
      if (prefill) {
        reset({ symptoms: prefill });
      }
    }
  }, [reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await symptomApi.analyze({
        symptoms: data.symptoms,
        additionalContext: data.additionalContext || null,
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
    reset();
  };

  return (
    <div className="relative min-h-screen pb-12">
      {/* Decorative ambient glowing gradients */}
      <div className="absolute top-[-8%] left-[-8%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-8%] right-[-8%] w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:16px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-foreground leading-none">
              <BlurText text="Clinical Symptom Triage" />
            </h1>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Obtain AI-guided urgency ratings and specialist mapping from Medora AI's safety engine.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel: Form or Results */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                >
                  <SpotlightCard>
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="symptoms" className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-display">
                          Describe Symptoms in Detail *
                        </Label>
                        <textarea
                          id="symptoms"
                          placeholder="e.g. Sharp pain in lower right abdomen, started 4 hours ago, worsens with movement. Also feeling mild nausea..."
                          {...register('symptoms')}
                          className={`w-full bg-white/50 border rounded-xl pl-5 pr-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all shadow-inner resize-none min-h-[160px] ${
                            errors.symptoms ? 'border-danger focus:ring-red-400' : 'border-border/80'
                          }`}
                        />
                        {errors.symptoms && (
                          <p className="text-xs font-semibold text-danger flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors.symptoms.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="additionalContext" className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-display">
                          Additional Context (optional)
                        </Label>
                        <textarea
                          id="additionalContext"
                          placeholder="Recent stressors, family history, dietary changes, or specific concerns..."
                          {...register('additionalContext')}
                          className="w-full bg-white/50 border border-border/80 rounded-xl pl-5 pr-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all shadow-inner resize-none min-h-[100px]"
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
                        loading={isLoading}
                        className="w-full shadow-glow font-bold py-4 text-sm rounded-xl"
                      >
                        {isLoading ? (
                          <>
                            <LoadingDots />
                            Synthesizing Clinical Model...
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
                  <UrgencyCard result={result} />
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleReset}
                    className="w-full border-border/80 bg-white/60 text-foreground hover:bg-muted font-bold rounded-xl py-3 text-sm"
                  >
                    <RefreshCw className="w-4 h-4 text-muted-foreground" />
                    Instantiate New Assessment
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right panel: Active Context Telemetry */}
          <div className="lg:col-span-1">
            <SpotlightCard className="h-full">
              <div className="p-6 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold font-display text-foreground tracking-tight uppercase tracking-wider">Patient Profile Context</h3>
                  <p className="text-[10px] text-muted-foreground">The AI engine integrates this active telemetry with your submission.</p>
                </div>

                <div className="space-y-4 text-xs font-medium border-t border-border/40 pt-5">
                  {/* Age / Gender */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/40 rounded-xl border border-border/40 space-y-1">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Age</span>
                      <span className="text-sm font-extrabold text-foreground font-display">
                        {user?.dateOfBirth ? (
                          `${Math.floor((Date.now() - new Date(user.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000))} yrs`
                        ) : '—'}
                      </span>
                    </div>
                    <div className="p-3 bg-muted/40 rounded-xl border border-border/40 space-y-1">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Gender</span>
                      <span className="text-sm font-extrabold text-foreground font-display">{user?.gender || '—'}</span>
                    </div>
                  </div>

                  {/* Vitals summary preview */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/40 rounded-xl border border-border/40 space-y-1">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Weight</span>
                      <span className="text-sm font-extrabold text-foreground font-display">{user?.weightKg ? `${user.weightKg} kg` : '—'}</span>
                    </div>
                    <div className="p-3 bg-muted/40 rounded-xl border border-border/40 space-y-1">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Height</span>
                      <span className="text-sm font-extrabold text-foreground font-display">{user?.heightCm ? `${user.heightCm} cm` : '—'}</span>
                    </div>
                  </div>

                  {/* Conditions List */}
                  <div className="space-y-1.5 p-3 bg-muted/40 rounded-xl border border-border/40">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Reported Chronic Conditions</span>
                    {user?.chronicConditions ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.chronicConditions.split(',').map((c) => (
                          <span key={c} className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
                            {c.trim()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground/60 italic font-medium pt-0.5">No reported conditions.</p>
                    )}
                  </div>

                  {/* Medications List */}
                  <div className="space-y-1.5 p-3 bg-muted/40 rounded-xl border border-border/40">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Active Medications</span>
                    {user?.currentMedications ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.currentMedications.split(',').map((c) => (
                          <span key={c} className="text-[10px] font-bold text-accent bg-accent-100/50 border border-accent/20 rounded-full px-2 py-0.5">
                            {c.trim()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground/60 italic font-medium pt-0.5">No active medications.</p>
                    )}
                  </div>

                  {/* Allergies List */}
                  <div className="space-y-1.5 p-3 bg-muted/40 rounded-xl border border-border/40">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Known Allergies</span>
                    {user?.allergies ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.allergies.split(',').map((c) => (
                          <span key={c} className="text-[10px] font-bold text-danger bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                            {c.trim()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground/60 italic font-medium pt-0.5">No reported allergies.</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-border/40 pt-4 text-center">
                  <Link href="/profile">
                    <span className="text-[10px] text-primary hover:underline font-bold tracking-wider uppercase cursor-pointer flex items-center justify-center gap-1">
                      Update context profile
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
