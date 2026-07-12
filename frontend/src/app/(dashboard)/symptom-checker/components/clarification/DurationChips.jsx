'use client';

import { motion } from 'framer-motion';

const DEFAULT_DURATIONS = ['<1hr', 'Few hours', '1-2 days', 'A week+'];

export default function DurationChips({ options, onSubmit }) {
  const displayOptions = options && options.length > 0 ? options : DEFAULT_DURATIONS;

  return (
    <div className="flex flex-wrap gap-2 items-center justify-center py-2 w-full">
      {displayOptions.map((opt) => (
        <motion.button
          key={opt}
          whileHover={{ scale: 1.025 }}
          whileTap={{ scale: 0.975 }}
          type="button"
          onClick={() => onSubmit(opt)}
          className="px-4 py-2.5 bg-muted/40 hover:bg-primary-50 rounded-xl text-xs font-bold text-muted-foreground hover:text-primary transition-all duration-200 border border-border/20 cursor-pointer"
        >
          {opt}
        </motion.button>
      ))}
    </div>
  );
}
