'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, FileText, Heart, Plus, Calendar, Clock, 
  Trash2, X, AlertCircle, Info, Filter, PlusCircle, Check, Loader2
} from 'lucide-react';
import api from '@/lib/api';

export default function TimelinePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, SYMPTOM_CHECK, REPORT_UPLOAD, MANUAL_LOG
  const [modalOpen, setModalOpen] = useState(false);
  
  // Form fields for new manual log
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSeverity, setFormSeverity] = useState('LOW');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTimeline();
  }, []);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const res = await api.get('/timeline');
      setEvents(res.data || []);
    } catch (err) {
      console.error('Error fetching timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: formTitle,
        description: formDesc,
        eventDate: formDate,
        eventType: 'MANUAL_LOG',
        severity: formSeverity
      };

      const res = await api.post('/timeline', payload);
      setEvents((prev) => [res.data, ...prev]);
      setModalOpen(false);
      
      // Reset form
      setFormTitle('');
      setFormDesc('');
      setFormSeverity('LOW');
      setFormDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      console.error('Error logging event:', err);
      alert('Could not save event. Please check details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/timeline/${id}`);
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Could not delete event. Please try again.');
    }
  };

  const getEventIcon = (type, severity) => {
    switch (type) {
      case 'SYMPTOM_CHECK':
        return <Activity className="w-4 h-4" />;
      case 'REPORT_UPLOAD':
        return <FileText className="w-4 h-4" />;
      default:
        return <Heart className="w-4 h-4" />;
    }
  };

  const getEventStyles = (type, severity) => {
    if (type === 'SYMPTOM_CHECK') {
      switch (severity?.toUpperCase()) {
        case 'EMERGENCY':
          return 'bg-red-50 text-red-600 border-red-200 ring-red-100';
        case 'HIGH':
          return 'bg-amber-50 text-amber-600 border-amber-200 ring-amber-100';
        case 'MEDIUM':
          return 'bg-yellow-50 text-yellow-600 border-yellow-200 ring-yellow-100';
        default:
          return 'bg-emerald-50 text-emerald-600 border-emerald-200 ring-emerald-100';
      }
    }
    if (type === 'REPORT_UPLOAD') {
      return 'bg-primary-50 text-primary border-primary-100 ring-primary-50';
    }
    return 'bg-cyan-50 text-cyan-600 border-cyan-100 ring-cyan-50';
  };

  const filteredEvents = events.filter((ev) => {
    if (filter === 'ALL') return true;
    return ev.eventType === filter;
  });

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col relative overflow-hidden bg-background bg-medical-grid p-1">
      {/* Decorative backdrop meshes */}
      <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-50 border border-primary-100 shadow-sm">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Health Timeline</h1>
            <p className="text-xs text-muted-foreground">
              A historical timeline mapping symptom logs, doctor visits, and diagnostic summaries
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Milestone
        </button>
      </div>

      {/* Filters & Scroll Content Container */}
      <div className="flex-1 flex flex-col min-h-0 relative z-10 bg-white/40 backdrop-blur-md rounded-2xl border border-border/80 shadow-sm p-4">
        {/* Filters bar */}
        <div className="flex items-center gap-2 border-b border-border/40 pb-3 mb-4 shrink-0 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1 hidden sm:inline">
            Filters:
          </span>
          {[
            { label: 'All Events', value: 'ALL' },
            { label: 'Symptom Checks', value: 'SYMPTOM_CHECK' },
            { label: 'Reports Summaries', value: 'REPORT_UPLOAD' },
            { label: 'Manual Entries', value: 'MANUAL_LOG' },
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wide border transition-all cursor-pointer whitespace-nowrap ${
                filter === btn.value
                  ? 'bg-primary border-primary text-white shadow-sm'
                  : 'bg-white/60 hover:bg-white text-muted-foreground border-border/60'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Scrollable list timeline */}
        <div className="flex-1 overflow-y-auto pr-1 no-scrollbar pb-6 relative">
          {loading ? (
            <div className="space-y-6 py-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-muted/60 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted/60 rounded w-44" />
                    <div className="h-3 bg-muted/40 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center p-6">
              <div className="p-4 rounded-2xl bg-muted/50 mb-3">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xs font-bold text-foreground">No events found</h3>
              <p className="text-[11px] text-muted-foreground max-w-[240px] mt-1 leading-normal">
                Try clearing active filters or click &apos;Add Milestone&apos; to record symptoms, prescriptions, or visits.
              </p>
            </div>
          ) : (
            <div className="relative pl-4 sm:pl-8 border-l border-border/60 ml-3 sm:ml-6 space-y-8 py-4">
              <AnimatePresence mode="popLayout">
                {filteredEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative group"
                  >
                    {/* Circle Node Indicator */}
                    <span className={`absolute -left-[27px] sm:-left-[43px] top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center ring-4 transition-transform duration-250 group-hover:scale-105 ${getEventStyles(event.eventType, event.severity)}`}>
                      {getEventIcon(event.eventType, event.severity)}
                    </span>

                    {/* Event Card */}
                    <div className="p-4.5 rounded-xl border border-border bg-white hover:border-primary/20 hover:shadow-md transition-all duration-200 relative">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
                        <div className="min-w-0">
                          <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                            event.eventType === 'SYMPTOM_CHECK' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : event.eventType === 'REPORT_UPLOAD' 
                              ? 'bg-primary-50 text-primary border-primary-100' 
                              : 'bg-cyan-50 text-cyan-700 border-cyan-100'
                          }`}>
                            {event.eventType.replace('_', ' ')}
                          </span>
                          <h3 className="text-xs font-bold text-foreground mt-1.5">
                            {event.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
                          <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(event.eventDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          <button
                            onClick={(e) => handleDeleteEvent(event.id, e)}
                            className="p-1.5 rounded bg-white hover:bg-red-50 text-muted-foreground hover:text-red-500 border border-transparent hover:border-red-200/50 transition-all cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* ── Dialog Modal: Add Manual Milestone Event ───────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black/15 backdrop-blur-sm z-50 pointer-events-auto"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[85vh] bg-white rounded-2xl border border-border shadow-2xl z-50 overflow-hidden flex flex-col pointer-events-auto"
            >
              <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20 shrink-0">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <PlusCircle className="w-5 h-5 text-primary" />
                  Log Health Milestone
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="flex-1 flex flex-col overflow-hidden min-h-0">
                {/* Scrollable Form Fields */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
                  {/* Event Date */}
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Date of Event
                    </label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold focus:border-primary/50 focus:outline-none"
                    />
                  </div>

                  {/* Event Title */}
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Milestone Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Started Hypertension meds, Dentist checkup"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                    />
                  </div>

                  {/* Event Description */}
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Description & Vitals Context
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Provide dosage updates, symptoms observed, or diagnostic details..."
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Severity Badge picker */}
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Severity Indicator
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Low', value: 'LOW', color: 'border-emerald-200 active:bg-emerald-50 text-emerald-700' },
                        { label: 'Medium', value: 'MEDIUM', color: 'border-yellow-200 active:bg-yellow-50 text-yellow-700' },
                        { label: 'High', value: 'HIGH', color: 'border-amber-200 active:bg-amber-50 text-amber-700' },
                      ].map((badge) => {
                        const isSelected = formSeverity === badge.value;
                        return (
                          <button
                            key={badge.value}
                            type="button"
                            onClick={() => setFormSeverity(badge.value)}
                            className={`py-1.5 border rounded-lg text-[10px] font-extrabold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1 ${badge.color} ${
                              isSelected ? 'bg-muted/80 ring-2 ring-primary/20' : 'bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                            {badge.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="p-5 border-t border-border bg-muted/10 shrink-0 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-border hover:bg-muted text-xs font-bold text-muted-foreground transition-all cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-600 disabled:bg-primary/50 text-white text-xs font-extrabold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Log
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
