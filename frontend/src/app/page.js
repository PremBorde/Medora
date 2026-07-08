'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Heart, ArrowRight, Check, Lock, Sparkles, Users,
  MessageSquare, UserCheck, FolderOpen, CalendarDays, Shield, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import useAuthStore from '@/store/authStore';

function Navbar({ activeSection, scrollTo }) {
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F5A3E] flex items-center justify-center shadow-md shadow-emerald-900/10">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-[#0B3B2C] font-display leading-tight">Medora</span>
            <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase leading-none">Better care, every day.</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Home', id: 'home' },
            { label: 'Features', id: 'features' },
            { label: 'Triage Guide', id: 'triage-guide' },
            { label: 'Safety Protocol', id: 'safety-protocol' }
          ].map((item) => {
            const isActive = activeSection === item.id;
            return (
              <div key={item.label} className="relative py-2">
                <span
                  onClick={() => scrollTo(item.id)}
                  className={`text-sm font-semibold cursor-pointer transition-colors ${isActive ? 'text-[#0F5A3E]' : 'text-muted-foreground hover:text-[#0F5A3E]'}`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F5A3E]"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Auth Actions */}
        <div className="flex items-center gap-4">
          {mounted && isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <span className="text-sm font-bold text-[#0B3B2C] hover:text-[#0F5A3E] transition-colors cursor-pointer mr-2">
                  Dashboard
                </span>
              </Link>
              <Link href="/symptom-check">
                <Button className="bg-[#0F5A3E] hover:bg-[#0B3B2C] text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-all shadow-md shadow-emerald-950/10">
                  Symptom Checker
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <span className="text-sm font-bold text-[#0B3B2C] hover:text-[#0F5A3E] transition-colors cursor-pointer mr-2">
                  Sign in
                </span>
              </Link>
              <Link href="/register">
                <Button className="bg-[#0F5A3E] hover:bg-[#0B3B2C] text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-all shadow-md shadow-emerald-950/10">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const urgencyLevels = [
  { level: 'LOW URGENCY', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', desc: 'Mild symptoms. Educational self-care parameters suggested. Consult clinic at your next convenience.' },
  { level: 'MEDIUM URGENCY', color: 'bg-amber-100 text-amber-800 border-amber-200', desc: 'Moderate symptoms detected. Schedule primary care physician consultation within 24 to 48 hours.' },
  { level: 'HIGH URGENCY', color: 'bg-orange-100 text-orange-800 border-orange-200', desc: 'Severe indicators present. Prompt professional diagnostic valuation required today.' },
  { level: 'EMERGENCY ALERT', color: 'bg-red-100 text-red-800 border-red-200', desc: 'Critical symptoms active. Please proceed directly to the nearest emergency department or call 911.' },
];

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      
      const features = document.getElementById('features');
      const triage = document.getElementById('triage-guide');
      const safety = document.getElementById('safety-protocol');

      if (safety && scrollPosition >= safety.offsetTop) {
        setActiveSection('safety-protocol');
      } else if (triage && scrollPosition >= triage.offsetTop) {
        setActiveSection('triage-guide');
      } else if (features && scrollPosition >= features.offsetTop) {
        setActiveSection('features');
      } else {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(id);
      if (el) {
        const offset = el.offsetTop - 100;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    }
  };

  // Scroll reveal variants
  const revealVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#FAFCFB]">
      <Navbar activeSection={activeSection} scrollTo={scrollTo} />

      {/* Hero Section */}
      <main className="relative pt-32 pb-8 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[520px]">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-8 text-left">
            {/* Trusted Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-100 bg-[#EBF7F2] text-[#0F5A3E] text-xs font-bold shadow-sm">
              <Check className="w-3.5 h-3.5 text-[#0F5A3E]" />
              Trusted. Private. Secure.
            </div>

            {/* Header Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display leading-[1.1] text-foreground">
              <span className="text-[#111827]">Better Decisions</span>
              <br />
              <span className="text-[#0F5A3E]">For Your Health</span>
            </h1>

            {/* Description Paragraph */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
              Medora helps you understand your health better, find the right care, and stay on top of your medical journey.
            </p>

            {/* Call To Actions */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/register">
                <Button className="bg-[#0F5A3E] hover:bg-[#0B3B2C] text-white font-bold text-base px-8 py-3 rounded-lg transition-all shadow-lg shadow-emerald-950/15 flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="secondary" className="bg-white border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/10 font-bold text-base px-8 py-3 rounded-lg transition-all">
                Explore Features
              </Button>
            </div>

            {/* Under Button Badges */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-muted-foreground font-semibold pt-4">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#0F5A3E]" />
                HIPAA Compliant
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#0F5A3E]" />
                Secure & Private
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#0F5A3E]" />
                AI-Powered Insights
              </div>
            </div>
          </div>

          {/* Right Image/Graphic Column */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end relative">
            {/* Organic, layered teal-gray backing shape behind photo to match mockup exactly */}
            <div className="absolute -left-6 -top-6 bottom-6 right-0 bg-[#EBF5F1] rounded-l-[320px] rounded-r-[60px] -z-10" />

            {/* The Curved Image Container */}
            <div className="relative rounded-l-[300px] rounded-r-[50px] overflow-hidden w-full max-w-[480px] h-[460px] shadow-lg border border-[#EBF5F1]/40">
              <img
                src="/doctor_patient_hero.png"
                alt="Doctor consulting with elderly patient"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1000&auto=format&fit=crop';
                }}
              />
            </div>

            {/* Floating Card Badge */}
            <div className="absolute bottom-6 right-8 z-20 bg-white/95 rounded-2xl shadow-xl p-3 border border-border/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBF7F2] flex items-center justify-center text-[#0F5A3E]">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground font-bold uppercase leading-none">Trusted by</span>
                <span className="text-sm font-extrabold text-[#0B3B2C] leading-tight">10K+ Users</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid (Bottom of Hero) */}
        <div id="features" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-16">
          {/* Card 1: Symptom Check (Active card matching mockup) */}
          <div className="bg-white border border-border/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#EBF7F2] flex items-center justify-center text-[#0F5A3E] shrink-0 transition-transform group-hover:scale-105">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-[#0B3B2C] text-sm">Symptom Check</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Understand your symptoms and get clear guidance.
                </p>
              </div>
            </div>
            {/* Active Accent underline matching mockup */}
            <div className="absolute bottom-0 left-6 right-6 h-1 bg-[#0F5A3E] rounded-t-full" />
          </div>

          {/* Card 2: Find Specialists */}
          <div className="bg-white border border-border/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#EBF7F2] flex items-center justify-center text-[#0F5A3E] shrink-0 transition-transform group-hover:scale-105">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-[#0B3B2C] text-sm">Find Specialists</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Connect with the right doctors near you.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Health Records */}
          <div className="bg-white border border-border/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#EBF7F2] flex items-center justify-center text-[#0F5A3E] shrink-0 transition-transform group-hover:scale-105">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-[#0B3B2C] text-sm">Health Records</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Store and manage your medical records securely.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Book Appointments */}
          <div className="bg-white border border-border/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#EBF7F2] flex items-center justify-center text-[#0F5A3E] shrink-0 transition-transform group-hover:scale-105">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-[#0B3B2C] text-sm">Book Appointments</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Schedule appointments effortlessly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="flex flex-col items-center justify-center pt-20 pb-4 select-none">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-[#0F5A3E] transition-colors"
            onClick={() => window.scrollTo({ top: window.innerHeight * 0.95, behavior: 'smooth' })}
          >
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#0F5A3E]">Explore Medora</span>
            <ChevronDown className="w-4 h-4 text-[#0F5A3E]" />
          </motion.div>
        </div>
      </main>

      {/* Down sections (Scroll Reveal Content) */}
      <div className="space-y-24 pb-20">
        
        {/* Section 1: Urgency Assessment Guidance */}
        <motion.section
          id="triage-guide"
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-6xl mx-auto px-6 lg:px-8 pt-16"
        >
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <Badge className="bg-[#EBF7F2] text-[#0F5A3E] border border-emerald-100 font-bold uppercase tracking-widest text-[9px] px-3 py-1">
              Urgency Telemetry
            </Badge>
            <h2 className="text-3xl font-extrabold text-[#0B3B2C] tracking-tight font-display">
              Know How Quickly to Seek Care
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our clinical safety engine maps symptoms into clear, actionable triage urgency brackets, helping you navigate next steps responsibly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {urgencyLevels.map((u, i) => (
              <motion.div
                key={u.level}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-border/50 p-6 rounded-2xl flex flex-col justify-between h-56 hover:shadow-md transition-shadow"
              >
                <div>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider border uppercase ${u.color}`}>
                    {u.level}
                  </span>
                  <p className="text-xs text-muted-foreground mt-4 leading-relaxed font-medium">
                    {u.desc}
                  </p>
                </div>
                <div className="border-t border-border/40 pt-4 flex items-center justify-between text-[10px] font-bold text-[#0F5A3E]">
                  <span>Telemetry Active</span>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Section 2: Clinical Protocol active */}
        <motion.section
          id="safety-protocol"
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-6xl mx-auto px-6 lg:px-8"
        >
          <div className="relative overflow-hidden rounded-3xl border border-primary-200/50 bg-gradient-to-r from-primary-50/40 via-white/80 to-accent-50/20 p-8 sm:p-12 backdrop-blur-md shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(at_top_left,rgba(8,145,178,0.04),transparent_50%),radial-gradient(at_top_right,rgba(5,150,105,0.03),transparent_50%)] pointer-events-none" />

            <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-[#EBF7F2] flex items-center justify-center text-[#0F5A3E] shrink-0 shadow-sm border border-emerald-100">
                <Shield className="w-8 h-8" />
              </div>
              <div className="space-y-3 text-left">
                <h3 className="text-xl font-bold font-display text-[#0B3B2C] flex items-center gap-2">
                  Clinical Safety & Safety Protocols First
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Medora AI does not perform medical diagnoses or replace a physician's valuation. We integrate advanced clinical parameters and doctor-visit preparation lists to help patients understand symptoms, find matching specialists, and communicate efficiently during doctor appointments.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Section 3: Premium CTA Section */}
        <motion.section
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-5xl mx-auto px-6 lg:px-8"
        >
          <div className="relative overflow-hidden rounded-3xl bg-[#0B3B2C] text-white p-8 sm:p-16 text-center shadow-xl">
            {/* Grid background effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_24px] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(at_center,rgba(8,145,178,0.15),transparent_60%)] pointer-events-none" />

            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-white">
                Take Control of Your Healthcare Journey
              </h2>
              <p className="text-sm sm:text-base text-emerald-100/80 leading-relaxed font-medium">
                Create a secure medical profile, evaluate physical parameters using clinical reasoning engines, and prepare for appointments within seconds.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/register">
                  <Button className="bg-[#EBF7F2] hover:bg-[#D5EFE2] text-[#0B3B2C] font-bold text-base px-8 py-3 rounded-lg transition-all shadow-lg flex items-center gap-2">
                    Create Free Account
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <span className="text-sm font-bold text-white hover:text-emerald-200 transition-colors cursor-pointer">
                    Sign in to your account
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-white py-8 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0F5A3E] flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-sm font-extrabold text-[#0B3B2C] font-display">Medora</span>
          </div>
          <p className="text-xs text-muted-foreground text-center max-w-md">
            Not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.
          </p>
          <p className="text-xs text-muted-foreground">© 2026 Medora. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
