'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Stethoscope, Activity, FileText, ArrowRight,
  TrendingUp, Clock, Shield, Heart, Sparkles, Calendar
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { patientApi } from '@/lib/api';
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { BlurText, ShinyText, SpotlightCard, CountUp } from '@/components/ui/AnimatedComponents';
import ContextualHelp from '@/components/ui/ContextualHelp';
import { driver } from 'driver.js';

// Mock chart data for premium visualization
const healthData = [
  { name: 'Jun 29', score: 78, activeMin: 35 },
  { name: 'Jun 30', score: 82, activeMin: 45 },
  { name: 'Jul 01', score: 80, activeMin: 30 },
  { name: 'Jul 02', score: 85, activeMin: 55 },
  { name: 'Jul 03', score: 88, activeMin: 60 },
  { name: 'Jul 04', score: 92, activeMin: 70 },
  { name: 'Jul 05', score: 91, activeMin: 65 },
];

const mockRecentActivity = [
  {
    id: 1,
    type: 'symptom_check',
    date: 'Yesterday, 8:40 PM',
    title: 'Migraine and Light Sensitivity',
    urgency: 'MEDIUM',
    recommendation: 'Neurologist referral suggested',
  },
  {
    id: 2,
    type: 'profile_update',
    date: 'July 4, 3:15 PM',
    title: 'Medical History Updated',
    details: 'Added Lisinopril 10mg to medications',
  }
];

export default function DashboardPage() {
  const { user, updateUser } = useAuthStore();
  const router = useRouter();
  const [quickSymptom, setQuickSymptom] = useState('');

  const handleQuickAnalyze = (e) => {
    e.preventDefault();
    if (!quickSymptom.trim()) return;
    router.push(`/symptom-check?prefill=${encodeURIComponent(quickSymptom)}`);
  };

  const handleSymptomTagClick = (tag) => {
    setQuickSymptom(`Experiencing persistent ${tag.toLowerCase()}...`);
  };

  // Persist tour seen state to backend DB & store
  const handleCompleteTour = async () => {
    try {
      const response = await patientApi.updateMe({ hasSeenTour: true });
      updateUser(response.data);
    } catch (err) {
      console.error('Failed to update tour flag', err);
    }
  };

  // Product tour trigger
  useEffect(() => {
    if (user && !user.hasSeenTour) {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        steps: [
          {
            element: '#vitals-score-card',
            popover: {
              title: 'Vitals Score',
              description: 'This updates daily based on your vitals and reported symptoms.',
              side: 'left',
              align: 'start'
            }
          },
          {
            element: '#wellness-trend-card',
            popover: {
              title: 'Wellness Index Trend',
              description: 'Track how your indicators move over time.',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '#analyze-symptoms-btn',
            popover: {
              title: 'Analyze Symptoms',
              description: 'Start here whenever something feels off.',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '#sidebar-nav',
            popover: {
              title: 'Sidebar Navigation',
              description: 'Explore your timeline, reports, and profile from here.',
              side: 'right',
              align: 'start'
            }
          }
        ],
        onDestroyed: () => {
          handleCompleteTour();
        }
      });

      const timer = setTimeout(() => {
        driverObj.drive();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Circular progress calculations for the score
  const score = 92;
  const radius = 45;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative min-h-screen pb-12">
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:16px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        {/* Welcome Section / Hero Header Depth */}
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
          {/* Subtle gradient mesh background ONLY inside the top header */}
          <div className="absolute inset-0 bg-[radial-gradient(at_top_left,rgba(8,145,178,0.08),transparent_50%),radial-gradient(at_top_right,rgba(5,150,105,0.06),transparent_50%)] pointer-events-none" />

          {/* Decorative heartbeat SVG motif in dead space */}
          <div className="absolute right-64 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none hidden xl:block">
            <svg width="220" height="60" viewBox="0 0 220 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-border">
              <path d="M0 30H60L70 5L80 55L90 20L100 35L110 30H220" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="relative z-10 space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-foreground leading-none">
              <BlurText text={`Good morning, ${user?.firstName || 'Demo'}`} /> 👋
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              Your personal AI healthcare dashboard. Live telemetry active.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <Link href="/symptom-check">
              <Button id="analyze-symptoms-btn" variant="primary" size="lg" className="shadow-glow hover:-translate-y-0.5 transition-transform group font-semibold">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
                Analyze Symptoms
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>

        {/* AI Disclaimer Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-primary-200/50 bg-gradient-to-r from-primary-50/40 via-white/80 to-accent-50/20 p-5 backdrop-blur-md shadow-sm">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-bold font-display text-primary-900 flex items-center gap-1.5">
                AI Clinical Safety Protocol Active
                <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
              </h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-4xl">
                Medora AI utilizes safe clinical reasoning models to categorize symptoms and guide specialist navigation. It does not issue diagnostic findings. If you believe you are experiencing a medical emergency, immediately seek professional clinical help.
              </p>
            </div>
          </div>
        </div>

        {/* Bento Grid Layer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bento Card 1: Wellness Index Trend */}
          <SpotlightCard id="wellness-trend-card" className="lg:col-span-2 flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg font-bold font-display flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  Wellness Index Trend
                  <ContextualHelp metricName="Wellness Index" value="91%" />
                </CardTitle>
                <CardDescription className="text-xs">Based on weekly sleep and vital indicators</CardDescription>
              </div>
              <Badge variant="primary" className="font-semibold text-xs px-2.5 py-0.5">
                <ShinyText speed="4s">Telemetry Active</ShinyText>
              </Badge>
            </CardHeader>
            <CardContent className="h-64 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={healthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0891B2" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#0891B2" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[60, 100]}
                    dx={-5}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    name="Wellness Score"
                    stroke="#0891B2"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </SpotlightCard>

          {/* Bento Card 2: Wellness Dial (Vary Card Elevation) */}
          <SpotlightCard id="vitals-score-card" className="flex flex-col justify-between border-2 border-primary/25 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold font-display flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
                Vitals Score
                <ContextualHelp metricName="Vitals Score" value="92%" />
              </CardTitle>
              <CardDescription className="text-xs">Consolidated vital assessment</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Background Circle */}
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="stroke-muted/40"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  {/* Progress Circle with glow */}
                  <motion.circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="stroke-primary"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: strokeDashoffset }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0px 0px 4px rgba(8, 145, 178, 0.3))' }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold tracking-tight font-display text-foreground leading-none">
                    <CountUp end={score} suffix="%" />
                  </span>
                  <span className="text-[10px] text-accent font-bold uppercase tracking-widest mt-1">Excellent</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-6 max-w-[200px] leading-relaxed">
                Your parameters suggest healthy cardiovascular and sleep efficiency levels.
              </p>
            </CardContent>
          </SpotlightCard>

          {/* Bento Card 3: Interactive Quick Symptom Logger */}
          <SpotlightCard className="lg:col-span-3">
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 bg-primary/10 px-3 py-1 rounded-full text-xs font-bold text-primary">
                    <Sparkles className="w-3.5 h-3.5" />
                    Interactive Triage Portal
                  </div>
                  <h3 className="text-xl font-bold font-display text-foreground">Symptom Quick-Scan</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                    Enter physical parameters or click a preset symptom tag below to instantiate an AI triaging model.
                  </p>
                  {/* Quick Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {['Headache', 'Chest Pain', 'Fatigue', 'Dizziness'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleSymptomTagClick(tag)}
                        className="text-[10px] font-semibold bg-muted/70 hover:bg-primary/10 hover:text-primary border border-border/80 hover:border-primary/20 rounded-full px-3 py-1 transition-all cursor-pointer"
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <form onSubmit={handleQuickAnalyze} className="relative">
                    <textarea
                      value={quickSymptom}
                      onChange={(e) => setQuickSymptom(e.target.value)}
                      placeholder="Describe symptoms in detail (e.g. Dull pain in forehead, mild photophobia, began 2 hours ago...)"
                      className="w-full bg-white/50 border border-border/80 rounded-2xl pl-5 pr-32 py-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all shadow-inner resize-none min-h-[110px]"
                    />
                    <div className="absolute right-3 bottom-3">
                      <Button
                        type="submit"
                        disabled={!quickSymptom.trim() || quickSymptom.length < 10}
                        className="btn-primary btn-md rounded-xl font-semibold shadow-glow"
                      >
                        Analyze
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </SpotlightCard>

          {/* Bento Card 4: Platform Services */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-display">Services Directory</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Triage */}
              <Link href="/symptom-check">
                <SpotlightCard className="p-5 cursor-pointer group hover:border-primary/30 transition-colors">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold font-display text-sm text-foreground group-hover:text-primary transition-colors">AI Symptom Check</h4>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        Assess symptoms and view recommended urgency levels instantly.
                      </p>
                    </div>
                  </div>
                </SpotlightCard>
              </Link>

              {/* Profile */}
              <Link href="/profile">
                <SpotlightCard className="p-5 cursor-pointer group hover:border-accent/30 transition-colors">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all shrink-0">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold font-display text-sm text-foreground group-hover:text-accent transition-colors">Medical Profile</h4>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        Configure baseline vitals, ongoing medications, and history.
                      </p>
                    </div>
                  </div>
                </SpotlightCard>
              </Link>

              {/* Phase 2: Report OCR */}
              <Link href="/reports" className="block">
                <SpotlightCard className="p-5 cursor-pointer group hover:border-accent/30 transition-all shadow-sm">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold font-display text-sm text-foreground group-hover:text-accent transition-colors">Report Summarizer</h4>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        Convert lab documents, imaging studies, and results using OCR.
                      </p>
                    </div>
                  </div>
                </SpotlightCard>
              </Link>

              {/* Phase 2: Timeline */}
              <Link href="/timeline" className="block">
                <SpotlightCard className="p-5 cursor-pointer group hover:border-accent/30 transition-all shadow-sm">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold font-display text-sm text-foreground group-hover:text-accent transition-colors">Health Timeline</h4>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        Graph chronological updates of logged diagnostic evaluations.
                      </p>
                    </div>
                  </div>
                </SpotlightCard>
              </Link>
            </div>
          </div>

          {/* Bento Card 5: Recent Activity Log */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-display flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5 text-primary" />
              </div>
              Activity Telemetry
            </h3>
            <SpotlightCard className="h-[238px] overflow-y-auto no-scrollbar flex flex-col justify-between">
              <div className="p-5 space-y-4 flex-1">
                {mockRecentActivity.map((activity, idx) => (
                  <div key={activity.id} className="text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3" />
                        {activity.date}
                      </span>
                      {activity.urgency && (
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          activity.urgency === 'HIGH' ? 'bg-orange-100 text-orange-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {activity.urgency}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-foreground text-sm font-display">{activity.title}</p>
                    <p className="text-[11px] text-muted-foreground leading-normal font-medium">
                      {activity.recommendation || activity.details}
                    </p>
                    {idx < mockRecentActivity.length - 1 && <div className="border-b border-border/40 pt-2" />}
                  </div>
                ))}
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </div>
  );
}
