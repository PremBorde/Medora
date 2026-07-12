'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Stethoscope, Send, AlertTriangle, CheckCircle,
  Info, RefreshCw, Shield, MapPin, ChevronRight, ChevronLeft,
  AlertCircle, Home, Clock, Activity, Mic, Calendar, User, Heart,
  Ruler, Database, FileSpreadsheet, Sparkles, Map, PhoneCall,
  Printer, Download
} from 'lucide-react';
import { symptomApi } from '@/lib/api';
import Link from 'next/link';
import { getUrgencyConfig, getErrorMessage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SpotlightCard, BlurText } from '@/components/ui/AnimatedComponents';
import useAuthStore from '@/store/authStore';
import BodyMap from './components/BodyMap';
import Mascot from '@/components/Mascot';
import UrgencyBanner from '@/components/UrgencyBanner';
import ClarificationRenderer from './components/clarification/ClarificationRenderer';

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
  if (urgencyLevel) return 'explaining';
  return 'idle';
}

// ── Suggestion Chips ────────────────────────────────────────────────────────

const SUGGESTED_CHIPS = [
  'Fever', 'Headache', 'Dry Cough', 'Chest Pain', 'Stomach Pain', 'Lower Back Pain', 'Fatigue'
];

// ── Stepper Header ──────────────────────────────────────────────────────────

function StepIndicator({ activeStep }) {
  const steps = [
    { label: 'Describe Symptoms', num: 1 },
    { label: 'Verify Health Info', num: 2 },
    { label: 'AI Assessment', num: 3 },
    { label: 'Medical Guidance', num: 4 },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 px-4">
      <div className="flex items-center justify-between relative">
        {/* Progress bar line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border/40 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-300 z-0"
          style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const isCompleted = activeStep > step.num;
          const isActive = activeStep === step.num;

          return (
            <div key={step.num} className="flex flex-col items-center relative z-10">
              <motion.div
                animate={{
                  scale: isActive ? 1.15 : 1,
                  backgroundColor: isCompleted || isActive ? 'var(--color-primary)' : '#ffffff',
                  borderColor: isCompleted || isActive ? 'var(--color-primary)' : 'rgba(229, 231, 235, 0.8)',
                  color: isCompleted || isActive ? '#ffffff' : '#9ca3af',
                }}
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-sm transition-all duration-200"
              >
                {isCompleted ? '✓' : step.num}
              </motion.div>
              <span
                className={`text-[9px] font-bold mt-2 hidden sm:block uppercase tracking-wider ${
                  isActive ? 'text-primary' : 'text-muted-foreground/80'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Skeleton Loader ───────────────────────────────────────────────────────────

function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex gap-4">
        <div className="w-12 h-12 bg-muted/60 rounded-xl" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted/60 rounded-lg w-1/3" />
          <div className="h-4 bg-muted/40 rounded-lg w-1/4" />
        </div>
      </div>
      <div className="space-y-3 pt-4 border-t border-border/20">
        <div className="h-3.5 bg-muted/50 rounded-lg w-3/4" />
        <div className="h-3.5 bg-muted/50 rounded-lg w-full" />
        <div className="h-3.5 bg-muted/40 rounded-lg w-5/6" />
      </div>
      <div className="h-16 bg-muted/40 rounded-xl" />
      <div className="h-20 bg-muted/40 rounded-xl" />
    </div>
  );
}

// ── Basis Line ──────────────────────────────────────────────────────────────
// Replaced circular meter with non-numeric honest basis line

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20 }}
      className="space-y-4"
    >
      <SpotlightCard className={`border-2 ${config.border}`}>
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center shrink-0 border border-current/10`}>
                <Icon className={`w-6 h-6 ${config.color}`} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                  Triage Status
                </span>
                <h3 className={`text-xl font-extrabold font-display leading-none mt-1 ${config.color}`}>
                  {config.label} Urgency
                </h3>
              </div>
            </div>
          </div>

          <div className="border-t border-border/40 pt-5 space-y-5">
            {/* Simple Summary */}
            {result.simpleSummary && (
              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                  Summary
                </h4>
                <p className="text-sm text-foreground leading-relaxed font-semibold">{result.simpleSummary}</p>
              </div>
            )}

            {/* Basis Line (replacing Confidence Score) */}
            {result.basisLine && (
              <div className="flex items-center gap-2.5 bg-muted/20 border border-border/40 rounded-xl p-3.5 text-xs text-muted-foreground">
                <span className="font-bold text-primary uppercase tracking-widest text-[9px] shrink-0">Basis:</span>
                <span className="font-medium text-foreground">{result.basisLine}</span>
              </div>
            )}

            {/* Clinical Detail — expandable */}
            {result.clinicalDetail && <ClinicalDetailAccordion detail={result.clinicalDetail} />}

            {/* Recommended action */}
            {result.recommendedAction && (
              <div className="p-4 bg-muted/30 rounded-xl border border-border/40">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                  Recommended Action
                </h4>
                <p className="text-xs text-foreground leading-relaxed font-semibold">{result.recommendedAction}</p>
              </div>
            )}

            {/* Red flags */}
            {result.redFlags?.length > 0 && (
              <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200/50">
                <h4 className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Red Flags Identified
                </h4>
                <ul className="space-y-1.5">
                  {result.redFlags.map((flag, i) => (
                    <li key={i} className="text-xs text-rose-800 font-bold flex gap-2">
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
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Home Care Steps
                </h4>
                <div className="space-y-2">
                  {result.homeCareSteps.map((step, i) => (
                    <div key={i} className="flex gap-2.5 p-3.5 bg-muted/20 rounded-xl border border-border/40">
                      <span className="text-xs font-bold text-primary shrink-0">{i + 1}.</span>
                      <p className="text-xs text-foreground font-semibold leading-relaxed">{step}</p>
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
                  <span className="text-[9px] font-bold text-accent-700 uppercase tracking-widest block">
                    Recommended Specialist
                  </span>
                  <span className="text-xs font-bold text-foreground">{result.specialistType}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </SpotlightCard>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/40 border border-border/40 backdrop-blur-md">
        <Shield className="w-4.5 h-4.5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">{result.disclaimer}</p>
      </div>
    </motion.div>
  );
}

// ── Nearby Providers Card ───────────────────────────────────────────────────

function NearbyProvidersCard({ result }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <SpotlightCard>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-primary" />
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Suggested Local Providers
          </h4>
        </div>
        <div className="divide-y divide-border/30">
          <div className="py-2.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-foreground">City Central General Hospital</p>
              <p className="text-[10px] text-muted-foreground">1.2 miles away • Open 24/7</p>
            </div>
            <a href="tel:112" className="p-2 bg-muted/40 hover:bg-primary-50 rounded-lg text-primary transition-colors">
              <PhoneCall className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-foreground">Medora Urgent Care Clinic</p>
              <p className="text-[10px] text-muted-foreground">0.8 miles away • Closes at 8:00 PM</p>
            </div>
            <button className="p-2 bg-muted/40 hover:bg-primary-50 rounded-lg text-primary transition-colors cursor-pointer">
              <PhoneCall className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Link
            href={`/care-map?urgencyLevel=${encodeURIComponent(result.urgencyLevel || '')}&specialistType=${encodeURIComponent(result.specialistType || '')}&summary=${encodeURIComponent(result.simpleSummary || '')}&action=${encodeURIComponent(result.recommendedAction || '')}`}
            className="flex-1"
          >
            <Button className="w-full text-[10px] font-bold py-2 px-3 rounded-lg border border-border bg-white text-foreground hover:bg-muted cursor-pointer">
              Find Nearby Care
            </Button>
          </Link>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-border rounded-lg text-[10px] font-bold hover:bg-muted text-muted-foreground cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
        </div>
      </div>
    </SpotlightCard>
  );
}

// ── Clinical Detail Accordion ───────────────────────────────────────────────

function ClinicalDetailAccordion({ detail }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-widest hover:bg-muted/30 transition-colors cursor-pointer"
      >
        See full clinical reasoning
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="inline-block"
        >
          ›
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-4 pb-4">
              <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">{detail}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page Component ──────────────────────────────────────────────────────────

export default function SymptomCheckerPage() {
  const [step, setStep] = useState(1);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBodyRegion, setSelectedBodyRegion] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const [voiceActive, setVoiceActive] = useState(false);
  const [round, setRound] = useState(0);
  const [isClarifying, setIsClarifying] = useState(false);
  
  const { user } = useAuthStore();
  const symptomsRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setStep(3); // Loading screen step
    setIsLoading(true);
    setError(null);
    setResult(null);
    setRound(0);
    setIsClarifying(false);

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
        clarificationRound: 0,
      });

      setResult(response.data);
      if (response.data.responseType === 'CLARIFICATION_NEEDED') {
        setStep(1); // Return to Step 1 layout to display follow-up widget
        setIsClarifying(true);
      } else {
        setStep(4); // Assessment Complete
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setStep(1); // Go back to edit if request failed
    } finally {
      setIsLoading(false);
    }
  };

  const handleClarificationSubmit = async (answer) => {
    setIsClarifying(false);
    const nextRound = round + 1;
    setRound(nextRound);

    const currentSymptoms = getValues('symptoms') || '';
    const updatedSymptoms = `${currentSymptoms}\n\n[Follow-up ${nextRound}]: ${answer}`;
    setValue('symptoms', updatedSymptoms);
    setCharCount(updatedSymptoms.length);

    setStep(3); // Loading screen step
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await symptomApi.analyze({
        symptoms: updatedSymptoms,
        additionalContext: getValues('additionalContext') || null,
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
        clarificationRound: nextRound,
      });

      setResult(response.data);
      if (response.data.responseType === 'CLARIFICATION_NEEDED' && nextRound < 2) {
        setStep(1);
        setIsClarifying(true);
      } else {
        setStep(4);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextToStep2 = async () => {
    // Validate Step 1 form fields first
    const isValid = await trigger('symptoms');
    if (isValid) {
      setStep(2);
    }
  };

  const handleReset = () => {
    setStep(1);
    setResult(null);
    setError(null);
    setSelectedBodyRegion(null);
    setCharCount(0);
    setRound(0);
    setIsClarifying(false);
    reset();
  };

  const mascotState = isClarifying ? 'thinking' : urgencyToMascotState(result?.urgencyLevel, isLoading);

  const handleBodyRegionSelect = useCallback((regionId) => {
    setSelectedBodyRegion(regionId);
    if (regionId && symptomsRef.current) {
      symptomsRef.current.focus();
    }
  }, []);

  const handleChipClick = (symptom) => {
    const currentText = getValues('symptoms') || '';
    const newText = currentText ? `${currentText}, ${symptom}` : symptom;
    setValue('symptoms', newText);
    setCharCount(newText.length);
    if (symptomsRef.current) {
      symptomsRef.current.focus();
    }
  };

  const handleTextareaChange = (e) => {
    setCharCount(e.target.value.length);
  };

  // Mock voice interaction toggle
  const toggleVoiceMock = () => {
    setVoiceActive(!voiceActive);
    if (!voiceActive) {
      setTimeout(() => {
        const text = "Frequent coughing fits, severe throat soreness, feeling sluggish and dehydrated";
        setValue('symptoms', text);
        setCharCount(text.length);
        setVoiceActive(false);
      }, 2500);
    }
  };

  return (
    <div className="relative w-full h-full bg-medical-grid no-scroll-page flex flex-col">
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-[-5%] left-[-5%] w-[450px] h-[450px] rounded-full bg-primary/4 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[-5%] w-[450px] h-[450px] rounded-full bg-accent/4 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-6 px-2 sm:px-4">
        {/* Header Title */}
        <div className="flex items-center gap-3 border-b border-border/30 pb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-cyan-500 flex items-center justify-center shrink-0 shadow-md shadow-primary/10">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-foreground leading-none">
              Symptom Assessment Copilot
            </h1>
            <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">
              Medical intelligence tool providing clinical triage mapping and home care suggestions.
            </p>
          </div>
        </div>

        {/* Stepper removed for space */}

        {/* Main interactive area */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column: Premium Anatomy Illustration */}
              <div className="lg:col-span-4 xl:col-span-3">
                <SpotlightCard className="h-full">
                  <div className="p-5 flex flex-col items-center gap-4">
                    <div className="space-y-0.5 text-center w-full">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                        Anatomy Locator
                      </h3>
                      <p className="text-[10px] text-muted-foreground">
                        Select a target region on the schematic body
                      </p>
                    </div>
                    <BodyMap
                      selectedRegion={selectedBodyRegion}
                      onSelect={handleBodyRegionSelect}
                    />
                  </div>
                </SpotlightCard>
              </div>

              {/* Middle Column: Describe Symptoms Form or Clarification Widget */}
              <div className="lg:col-span-8 xl:col-span-6 space-y-5">
                {result?.responseType === 'CLARIFICATION_NEEDED' ? (
                  <SpotlightCard>
                    <div className="p-6 sm:p-8 space-y-6">
                      <div className="space-y-1.5 border-b border-border/30 pb-4">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">
                          Follow-up Question (Round {round + 1} of 2)
                        </span>
                        <h3 className="text-sm font-extrabold text-foreground leading-normal">
                          {result.question}
                        </h3>
                      </div>

                      <ClarificationRenderer
                        questionData={result}
                        onSubmitAnswer={handleClarificationSubmit}
                      />

                      <div className="flex justify-end pt-2 border-t border-border/30">
                        <button
                          type="button; reset-flow"
                          onClick={handleReset}
                          className="text-[10px] text-muted-foreground hover:text-rose-500 font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Cancel / Reset
                        </button>
                      </div>
                    </div>
                  </SpotlightCard>
                ) : (
                  <SpotlightCard>
                    <div className="p-6 sm:p-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="symptoms" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          Report Symptoms *
                        </Label>
                        <span className="text-[10px] font-semibold text-muted-foreground/60">{charCount} / 2000 chars</span>
                      </div>

                      {/* Suggested symptom chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {SUGGESTED_CHIPS.map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => handleChipClick(chip)}
                            className="px-2.5 py-1 bg-muted/40 hover:bg-primary-50 rounded-lg text-[10px] font-bold text-muted-foreground hover:text-primary transition-all duration-200 border border-border/20 cursor-pointer"
                          >
                            + {chip}
                          </button>
                        ))}
                      </div>

                      {/* Symptoms textarea with pulsing microphone input */}
                      <div className="relative space-y-2">
                        <textarea
                          id="symptoms"
                          ref={symptomsRef}
                          placeholder={
                            selectedBodyRegion
                              ? `Describe what you are feeling in the ${selectedBodyRegion.replace(/-/g, ' ')} region...`
                              : "Enter symptoms in detail (e.g. sharp localized pain, onset, duration, triggers)..."
                          }
                          {...register('symptoms')}
                          onChange={handleTextareaChange}
                          className={`w-full bg-white/50 border rounded-2xl pl-4 pr-12 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent transition-all shadow-inner resize-none min-h-[140px] ${
                            errors.symptoms ? 'border-rose-400 focus:ring-rose-400' : 'border-border/80'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={toggleVoiceMock}
                          className={`absolute right-3.5 bottom-3.5 p-2 rounded-xl border border-border/60 flex items-center justify-center transition-all duration-300 cursor-pointer ${
                            voiceActive
                              ? 'bg-rose-500 text-white animate-pulse'
                              : 'bg-white text-muted-foreground hover:text-primary hover:bg-primary-50'
                          }`}
                          title="Voice Input Mockup"
                        >
                          <Mic className="w-4 h-4" />
                        </button>
                        {errors.symptoms && (
                          <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors.symptoms.message}
                          </p>
                        )}
                      </div>

                      {/* AI typing Hint */}
                      <div className="p-3 bg-muted/20 border border-border/40 rounded-xl flex gap-2 items-start">
                        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-[10px] text-muted-foreground leading-normal font-medium">
                          💡 <strong>Hint:</strong> Including severity, what started it, and any other patterns helps Nova deliver accurate results.
                        </p>
                      </div>

                      {error && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {error}
                        </div>
                      )}

                      <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        onClick={handleNextToStep2}
                        className="w-full font-bold py-3.5 text-xs rounded-xl shadow-glow cursor-pointer"
                      >
                        Next: Verify Context
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </SpotlightCard>
                )}
              </div>

              {/* Right Column: Nova Companion Standby */}
              <div className="lg:col-span-12 xl:col-span-3 flex justify-center">
                <SpotlightCard className="w-full max-w-sm">
                  <div className="p-5 flex flex-col items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Medora Guide
                    </span>
                    <Mascot state="idle" speechText="Nova is standby. Describe symptoms to begin." />
                  </div>
                </SpotlightCard>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-6xl mx-auto space-y-6"
            >
              {/* Patient Context Cards Grid */}
              <SpotlightCard>
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="space-y-0.5 border-b border-border/30 pb-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                      Verify Active Patient Context
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      Confirm your baseline biometric data before launching analysis.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1.5 flex flex-col justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Age</span>
                      </div>
                      <span className="text-sm font-extrabold text-foreground font-display">
                        {user?.dateOfBirth
                          ? `${Math.floor((Date.now() - new Date(user.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000))} yrs`
                          : '—'}
                      </span>
                    </div>

                    <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1.5 flex flex-col justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Gender</span>
                      </div>
                      <span className="text-sm font-extrabold text-foreground font-display capitalize">
                        {user?.gender || '—'}
                      </span>
                    </div>

                    <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1.5 flex flex-col justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Blood Type</span>
                      </div>
                      <span className="text-sm font-extrabold text-foreground font-display">
                        {user?.bloodType || 'O+ (Default)'}
                      </span>
                    </div>

                    <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1.5 flex flex-col justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Ruler className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Height</span>
                      </div>
                      <span className="text-sm font-extrabold text-foreground font-display">
                        {user?.height || '176 cm'}
                      </span>
                    </div>

                    <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1.5 flex flex-col justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Activity className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Weight</span>
                      </div>
                      <span className="text-sm font-extrabold text-foreground font-display">
                        {user?.weight || '72 kg'}
                      </span>
                    </div>

                    <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1.5 flex flex-col justify-between">
                      <div className="flex items-center gap-2 text-rose-500">
                        <Shield className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Allergies</span>
                      </div>
                      <span className="text-[10px] font-bold text-foreground truncate">
                        {user?.allergies || 'None reported'}
                      </span>
                    </div>
                  </div>

                  {/* Conditions, Medications & Context — horizontal split */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border/30">
                    {/* Left: Conditions & Medications stacked */}
                    <div className="space-y-3">
                      <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Medical Conditions</span>
                        <p className="text-xs font-semibold text-foreground leading-normal truncate">
                          {user?.chronicConditions || 'None reported'}
                        </p>
                      </div>
                      <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Current Medications</span>
                        <p className="text-xs font-semibold text-foreground leading-normal truncate">
                          {user?.currentMedications || 'None reported'}
                        </p>
                      </div>
                    </div>

                    {/* Right: Additional Context Textarea */}
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="additionalContext" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Additional Context (Optional)
                      </Label>
                      <textarea
                        id="additionalContext"
                        placeholder="Recent travel, similar family history, or specific concern details..."
                        {...register('additionalContext')}
                        className="w-full flex-1 bg-white/50 border border-border/80 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent transition-all shadow-inner resize-none min-h-[78px]"
                      />
                    </div>
                  </div>

                  {/* Buttons Row */}
                  <div className="flex gap-4 pt-4 border-t border-border/30">
                    <Button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 font-bold py-3.5 text-xs rounded-xl border border-border bg-white text-foreground hover:bg-muted cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back to edit
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleSubmit(onSubmit)}
                      className="flex-1 font-bold py-3.5 text-xs rounded-xl shadow-glow cursor-pointer"
                    >
                      Start AI Assessment
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-xl mx-auto py-12 flex flex-col items-center justify-center text-center space-y-8"
            >
              {/* Nova Thinking illustration */}
              <div className="relative">
                <Mascot state="thinking" />
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-lg font-bold text-foreground">Analyzing Clinical Variables</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Nova is parsing symptoms and checking them against safety guidelines and emergency markers.
                </p>
              </div>
              <div className="w-full bg-white border border-border/40 rounded-2xl p-6 shadow-sm">
                <SkeletonLoader />
              </div>
            </motion.div>
          )}

          {step === 4 && result && (
            <motion.div
              key="step4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-12 gap-6"
            >
              {/* Left Column: Action report cards */}
              <div className="lg:col-span-2 xl:col-span-9 space-y-4">
                <ResultCard result={result} />
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleReset}
                  className="w-full border border-border/80 bg-white hover:bg-muted font-bold rounded-xl py-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Start New Assessment
                </Button>
              </div>

              {/* Right Column: Nova explaining speech & local providers */}
              <div className="lg:col-span-1 xl:col-span-3 space-y-4">
                <SpotlightCard className="w-full">
                  <div className="p-5 flex flex-col items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Nova Assessment
                    </span>
                    <Mascot
                      state={mascotState}
                      urgencyLevel={result.urgencyLevel}
                      speechText={result.simpleSummary}
                    />
                  </div>
                </SpotlightCard>

                <NearbyProvidersCard result={result} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
