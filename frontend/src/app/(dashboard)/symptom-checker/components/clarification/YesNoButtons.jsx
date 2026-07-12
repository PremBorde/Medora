'use client';

import { motion } from 'framer-motion';

export default function YesNoButtons({ onSubmit }) {
  return (
    <div className="flex gap-4 items-center justify-center py-2 w-full">
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        type="button"
        onClick={() => onSubmit('Yes')}
        className="flex-1 py-3 px-6 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-sm border border-emerald-200/50 rounded-xl transition-all shadow-sm cursor-pointer"
      >
        Yes
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        type="button"
        onClick={() => onSubmit('No')}
        className="flex-1 py-3 px-6 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-sm border border-rose-200/50 rounded-xl transition-all shadow-sm cursor-pointer"
      >
        No
      </motion.button>
    </div>
  );
}
