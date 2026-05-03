import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/cn';

type Size = 'sm' | 'md' | 'lg';
type Variant = 'mark' | 'full';

export interface LogoProps {
  size?: Size;
  variant?: Variant;
  className?: string;
}

const dims: Record<Size, { px: number; text: string }> = {
  sm: { px: 28, text: 'text-lg' },
  md: { px: 36, text: 'text-xl' },
  lg: { px: 48, text: 'text-2xl' },
};

export function Logo({ size = 'md', variant = 'full', className }: LogoProps) {
  const d = dims[size];
  return (
    <Link
      href="/"
      className={cn('inline-flex items-center gap-2', className)}
      aria-label="Molopilot — accueil"
    >
      <Image src="/images/logo-mark.svg" alt="" width={d.px} height={d.px} priority />
      {variant === 'full' && (
        <span className={cn('font-display font-extrabold tracking-tight text-neutral-900', d.text)}>
          Molopilot
        </span>
      )}
    </Link>
  );
}
