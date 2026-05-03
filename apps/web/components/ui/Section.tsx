import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

type Pad = 'sm' | 'md' | 'lg';
type Bg = 'default' | 'accent' | 'dark';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  pad?: Pad;
  bg?: Bg;
  children: ReactNode;
}

const pads: Record<Pad, string> = {
  sm: 'py-10 sm:py-14',
  md: 'py-14 sm:py-20',
  lg: 'py-20 sm:py-28',
};

const bgs: Record<Bg, string> = {
  default: 'bg-white',
  accent: 'bg-accent-50',
  dark: 'bg-neutral-900 text-white',
};

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ pad = 'md', bg = 'default', className, children, ...props }, ref) => (
    <section ref={ref} className={cn(pads[pad], bgs[bg], className)} {...props}>
      {children}
    </section>
  ),
);
Section.displayName = 'Section';
