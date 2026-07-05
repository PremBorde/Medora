import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:   'bg-muted text-muted-foreground',
        primary:   'bg-primary-100 text-primary-700',
        accent:    'bg-accent-100 text-accent-700',
        warning:   'bg-amber-100 text-amber-700',
        danger:    'bg-red-100 text-red-700',
        low:       'bg-emerald-100 text-emerald-700',
        medium:    'bg-amber-100 text-amber-700',
        high:      'bg-orange-100 text-orange-700',
        emergency: 'bg-red-100 text-red-700 animate-pulse',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
