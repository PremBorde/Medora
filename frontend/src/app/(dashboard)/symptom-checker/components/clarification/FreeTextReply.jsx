'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FreeTextReply({ placeholder = 'Describe details...', onSubmit }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2.5 items-center w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-white/50 border border-border/80 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent transition-all shadow-inner"
        required
      />
      <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={!value.trim()}
        className="rounded-xl px-4 py-3 shrink-0 cursor-pointer"
      >
        <Send className="w-3.5 h-3.5" />
      </Button>
    </form>
  );
}
