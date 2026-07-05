import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Textarea = forwardRef(({ className, error, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[120px] w-full rounded-lg border border-border bg-surface px-4 py-3',
        'text-sm text-foreground placeholder:text-muted-foreground',
        'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent',
        'transition-all duration-150 resize-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-danger focus:ring-red-400',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
