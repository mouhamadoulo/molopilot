import { createElement, forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

type As = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type Size = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: As;
  size?: Size;
  children: ReactNode;
}

const sizes: Record<Size, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
  '6xl': 'text-6xl',
  '7xl': 'text-7xl',
};

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as = 'h2', size = '3xl', className, children, ...props }, ref) =>
    createElement(
      as,
      {
        ref,
        className: cn(
          'font-display font-extrabold leading-tight tracking-tight',
          sizes[size],
          className,
        ),
        ...props,
      },
      children,
    ),
);
Heading.displayName = 'Heading';
