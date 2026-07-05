'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Loader2, ShieldAlert } from 'lucide-react';
import { symptomApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

// Global session cache for metric explanations to save API calls
const explanationCache = {};

export default function ContextualHelp({ metricName = '', value = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [disclaimer, setDisclaimer] = useState('');
  const [error, setError] = useState('');
  
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);

  const cacheKey = `${metricName}_${value}`;

  const handleOpen = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    setError('');

    // Check cache first
    if (explanationCache[cacheKey]) {
      setExplanation(explanationCache[cacheKey].explanation);
      setDisclaimer(explanationCache[cacheKey].disclaimer);
      return;
    }

    setIsLoading(true);
    try {
      const response = await symptomApi.explain({ metricName, value });
      const { explanation: exp, disclaimer: disc } = response.data;
      
      explanationCache[cacheKey] = { explanation: exp, disclaimer: disc };
      setExplanation(exp);
      setDisclaimer(disc);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleClickOutside = (e) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(e.target) && 
        triggerRef.current && 
        !triggerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block ml-1.5">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        aria-label={`Explain ${metricName}`}
        aria-expanded={isOpen}
        className="w-5 h-5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary-50 flex items-center justify-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            aria-label={`${metricName} explanation`}
            className="absolute z-50 right-0 mt-2 w-80 rounded-xl border border-primary-200/50 bg-gradient-to-br from-white to-primary-50/20 p-4 shadow-lg shadow-primary-500/5 backdrop-blur-md text-left"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-display">
                AI Metric Definition
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close explanation"
                className="text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {isLoading ? (
              <div className="py-6 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Consulting Copilot...
                </span>
              </div>
            ) : error ? (
              <p className="text-xs text-danger font-medium">{error}</p>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-foreground font-semibold leading-relaxed">
                  {explanation}
                </p>
                <div className="border-t border-primary-200/20 pt-2 flex items-start gap-1.5">
                  <ShieldAlert className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                  <p className="text-[9px] text-muted-foreground leading-normal font-medium">
                    {disclaimer}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
