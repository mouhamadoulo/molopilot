import { Slot } from '@radix-ui/react-slot';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
  children: ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
  primary:
    'bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-900 shadow-md hover:shadow-glow-primary',
  secondary:
    'bg-white text-primary-700 border border-primary-200 hover:bg-primary-50 active:bg-primary-100',
  ghost: 'bg-transparent text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm font-semibold min-w-[44px]',
  md: 'h-11 px-5 text-base font-semibold min-w-[44px]',
  lg: 'h-14 px-7 text-lg font-bold min-w-[44px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', asChild = false, className, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props}>
        {children}
      </Comp>
    );
  },
);
Button.displayName = 'Button';
