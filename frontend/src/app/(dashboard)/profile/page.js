'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Save, CheckCircle, AlertCircle, Heart, ShieldAlert, Sparkles, Info } from 'lucide-react';
import { patientApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BlurText, SpotlightCard } from '@/components/ui/AnimatedComponents';

const schema = z.object({
  firstName:          z.string().min(1, 'Required'),
  lastName:           z.string().min(1, 'Required'),
  phoneNumber:        z.string().optional(),
  dateOfBirth:        z.string().optional(),
  gender:             z.string().optional(),
  bloodType:          z.string().optional(),
  heightCm:           z.string().optional(),
  weightKg:           z.string().optional(),
  allergies:          z.string().optional(),
  chronicConditions:  z.string().optional(),
  currentMedications: z.string().optional(),
});

function FieldGroup({ label, error, children }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-display">
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-xs font-semibold text-danger flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuthStore();
  const router = useRouter();
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error'
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName:          user?.firstName || '',
      lastName:           user?.lastName || '',
      phoneNumber:        user?.phoneNumber || '',
      dateOfBirth:        user?.dateOfBirth || '',
      gender:             user?.gender || '',
      bloodType:          user?.bloodType || '',
      heightCm:           user?.heightCm?.toString() || '',
      weightKg:           user?.weightKg?.toString() || '',
      allergies:          user?.allergies || '',
      chronicConditions:  user?.chronicConditions || '',
      currentMedications: user?.currentMedications || '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setSaveStatus(null);
    try {
      const response = await patientApi.updateMe({
        ...data,
        heightCm: data.heightCm ? parseFloat(data.heightCm) : null,
        weightKg: data.weightKg ? parseFloat(data.weightKg) : null,
      });
      updateUser(response.data);
      reset(data);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen pb-12">
      {/* Decorative ambient glowing gradients */}
      <div className="absolute top-[-8%] left-[-8%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-8%] right-[-8%] w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:16px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
            <span className="text-xl font-bold text-primary font-display">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-foreground leading-none">
              <BlurText text="Patient Health Profile" />
            </h1>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Configure telemetry parameters that Medora AI uses for assessment models.
            </p>
          </div>
        </div>

        {/* Security Warning Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-accent-200/50 bg-accent-50/10 p-4 backdrop-blur-md">
          <div className="flex gap-3 items-center">
            <ShieldAlert className="w-5 h-5 text-accent shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Your medical telemetry is stored in compliance with local privacy frameworks and is encrypted in transit. Vitals are strictly analyzed within isolated AI runtimes.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Personal Info & App Preferences */}
            <div className="lg:col-span-7 space-y-6">
              <SpotlightCard>
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 className="text-base font-bold font-display text-foreground flex items-center gap-2">
                      <User className="w-4.5 h-4.5 text-primary" />
                      Personal Demographics
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">Configure age, gender, and physical baselines.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/40 pt-5">
                    <FieldGroup label="First Name" error={errors.firstName?.message}>
                      <Input {...register('firstName')} error={!!errors.firstName} className="bg-white/50 border-border/85" />
                    </FieldGroup>
                    <FieldGroup label="Last Name" error={errors.lastName?.message}>
                      <Input {...register('lastName')} error={!!errors.lastName} className="bg-white/50 border-border/85" />
                    </FieldGroup>
                    <FieldGroup label="Phone Number">
                      <Input {...register('phoneNumber')} type="tel" placeholder="+1 (555) 000-0000" className="bg-white/50 border-border/85" />
                    </FieldGroup>
                    <FieldGroup label="Date of Birth">
                      <Input {...register('dateOfBirth')} type="date" className="bg-white/50 border-border/85" />
                    </FieldGroup>
                    <FieldGroup label="Gender">
                      <select
                        {...register('gender')}
                        className="w-full bg-white/50 border border-border/85 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </FieldGroup>
                    <FieldGroup label="Blood Type">
                      <select
                        {...register('bloodType')}
                        className="w-full bg-white/50 border border-border/85 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all"
                      >
                        <option value="">Unknown</option>
                        {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </FieldGroup>
                    <FieldGroup label="Height (cm)">
                      <Input {...register('heightCm')} type="number" placeholder="175" step="0.1" className="bg-white/50 border-border/85" />
                    </FieldGroup>
                    <FieldGroup label="Weight (kg)">
                      <Input {...register('weightKg')} type="number" placeholder="70" step="0.1" className="bg-white/50 border-border/85" />
                    </FieldGroup>
                  </div>
                </div>
              </SpotlightCard>

              {/* System Settings & Onboarding */}
              <SpotlightCard>
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 className="text-base font-bold font-display text-foreground flex items-center gap-2">
                      <Sparkles className="w-4.5 h-4.5 text-primary" />
                      App Preferences
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Manage interactive onboarding sessions and preferences.
                    </p>
                  </div>

                  <div className="border-t border-border/40 pt-5 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Guided Onboarding Tour</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Reset onboarding prompts.</p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={async () => {
                        try {
                          const response = await patientApi.updateMe({ hasSeenTour: false });
                          updateUser(response.data);
                          router.push('/dashboard');
                        } catch (err) {
                          console.error("Failed to reset tour state", err);
                        }
                      }}
                      className="border-border/80 bg-white/60 hover:bg-muted font-bold text-xs shrink-0"
                    >
                      Replay Tour
                    </Button>
                  </div>

                  <div className="border-t border-border/40 pt-5 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Account Session</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Sign out of Medora AI.</p>
                    </div>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        logout();
                        router.push('/login');
                      }}
                      className="font-bold text-xs shrink-0"
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SpotlightCard>
            </div>

            {/* Right Column: Medical History & AI Telemetry Info */}
            <div className="lg:col-span-5 space-y-6">
              {/* Medical History */}
              <SpotlightCard>
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 className="text-base font-bold font-display text-foreground flex items-center gap-2">
                      <Heart className="w-4.5 h-4.5 text-danger animate-pulse" />
                      Clinical Context & History
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter baseline conditions to personalize the diagnostic reasoning weights.
                    </p>
                  </div>

                  <div className="space-y-4 border-t border-border/40 pt-5">
                    <FieldGroup label="Known Allergies">
                      <Textarea
                        {...register('allergies')}
                        placeholder="e.g., Penicillin, Peanuts, Latex"
                        className="min-h-[60px] bg-white/50 border-border/85 resize-none"
                      />
                    </FieldGroup>
                    <FieldGroup label="Chronic Conditions">
                      <Textarea
                        {...register('chronicConditions')}
                        placeholder="e.g., Type 2 Diabetes, Hypertension, Asthma"
                        className="min-h-[60px] bg-white/50 border-border/85 resize-none"
                      />
                    </FieldGroup>
                    <FieldGroup label="Current Medications">
                      <Textarea
                        {...register('currentMedications')}
                        placeholder="e.g., Metformin 500mg, Lisinopril 10mg"
                        className="min-h-[60px] bg-white/50 border-border/85 resize-none"
                      />
                    </FieldGroup>
                  </div>
                </div>
              </SpotlightCard>

              {/* AI Telemetry Guidance Card */}
              <div className="rounded-2xl border border-border bg-white p-6 space-y-4 shadow-sm">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 font-display">
                  <Info className="w-4.5 h-4.5 text-primary shrink-0" />
                  AI Telemetry Guidance
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  How Medora AI uses these metrics to personalize your health guidance safely:
                </p>
                <div className="space-y-3.5 text-[11px] font-semibold text-muted-foreground leading-relaxed">
                  <div className="flex gap-2.5 items-start">
                    <span className="w-4.5 h-4.5 rounded-lg bg-primary-50 text-primary font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="text-foreground font-bold">Allergies & Medications</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Restricts recommended provider listings and alerts you against contraindicating options.</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <span className="w-4.5 h-4.5 rounded-lg bg-primary-50 text-primary font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="text-foreground font-bold">Age & Physical Baselines</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Customizes symptom assessment triage limits (e.g. pediatric alerts vs senior risk calculations).</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <span className="w-4.5 h-4.5 rounded-lg bg-primary-50 text-primary font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <div>
                      <p className="text-foreground font-bold">Chronic Tracking</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Informs the Care Map matching algorithm to suggest clinics with relevant specialized support.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Action bar */}
          <div className="flex items-center justify-between gap-4 p-4 bg-white/40 border border-border/60 backdrop-blur-md rounded-2xl">
            <div>
              {saveStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-xs font-bold text-accent"
                >
                  <CheckCircle className="w-4 h-4" />
                  Telemetry records saved.
                </motion.div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center gap-2 text-xs font-bold text-danger">
                  <AlertCircle className="w-4 h-4" />
                  Save failed. Verify inputs.
                </div>
              )}
              {!saveStatus && <div className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-primary" /> Make edits to enable saving</div>}
            </div>
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              disabled={!isDirty && !isLoading}
              className="shadow-glow font-bold rounded-xl"
            >
              <Save className="w-4 h-4 text-white" />
              Save Parameters
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
