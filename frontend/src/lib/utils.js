import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes safely
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to a readable string
 */
export function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get urgency level display config
 */
export function getUrgencyConfig(urgencyLevel) {
  const configs = {
    LOW: {
      label: 'Low',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      badge: 'urgency-low',
      icon: '✓',
    },
    MEDIUM: {
      label: 'Medium',
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'urgency-medium',
      icon: '!',
    },
    HIGH: {
      label: 'High',
      color: 'text-orange-700',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      badge: 'urgency-high',
      icon: '!!',
    },
    EMERGENCY: {
      label: 'Emergency',
      color: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-200',
      badge: 'urgency-emergency',
      icon: '🚨',
    },
  };
  return configs[urgencyLevel] || configs.MEDIUM;
}

/**
 * Extract error message from axios error
 */
export function getErrorMessage(error) {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Calculate BMI
 */
export function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  const heightM = heightCm / 100;
  return (weightKg / (heightM * heightM)).toFixed(1);
}
