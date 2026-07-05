'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer whitespace-nowrap',
  {
    variants: {
      variant: {
        primary:   'bg-primary text-white hover:bg-primary-600 focus:ring-primary-400 shadow-sm hover:shadow-md',
        secondary: 'bg-surface border border-border text-foreground hover:bg-muted focus:ring-primary-400',
        ghost:     'text-muted-foreground hover:bg-muted hover:text-foreground focus:ring-primary-400',
        danger:    'bg-danger text-white hover:bg-red-600 focus:ring-red-400 shadow-sm',
        accent:    'bg-accent text-white hover:bg-accent-600 focus:ring-accent-400 shadow-sm hover:shadow-md',
        link:      'text-primary underline-offset-4 hover:underline focus:ring-primary-400 p-0 h-auto',
      },
      size: {
        sm:   'text-sm px-3 py-1.5',
        md:   'text-sm px-4 py-2',
        lg:   'text-base px-6 py-3',
        xl:   'text-base px-8 py-4',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

const Button = forwardRef(({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  children,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {children}
        </>
      ) : children}
    </Comp>
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };
