import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

type Width = 'narrow' | 'default' | 'wide';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  width?: Width;
  children: ReactNode;
}

const widths: Record<Width, string> = {
  narrow: 'max-w-2xl',
  default: 'max-w-6xl',
  wide: 'max-w-[1440px]',
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ width = 'default', className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', widths[width], className)}
      {...props}
    >
      {children}
    </div>
  ),
);
Container.displayName = 'Container';
