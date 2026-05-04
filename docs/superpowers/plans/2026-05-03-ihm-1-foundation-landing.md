# IHM-1 — Design System + Landing publique — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Livrer un design system minimal (tokens + 5 composants UI primitives) + page d'accueil `/` complète + smoke E2E + Lighthouse CI, en restant conforme spec `docs/superpowers/specs/2026-05-02-ihm-foundation-design.md`.

**Architecture:** Next.js 15 App Router, Tailwind v4 (config CSS-first via `@theme`), tokens en CSS custom properties, polices self-hostées via `next/font/local`, route group `(marketing)` isolé, Server Components par défaut (`'use client'` réservé à nav drawer + accordéon FAQ). Pas de package `@molopilot/ui` V1 — composants vivent dans `apps/web/components/`.

**Tech Stack:** Next.js 15 · React 19 RC · TypeScript strict · Tailwind v4 · `clsx` + `tailwind-merge` · `next/font/local` · Playwright + axe-core · Lighthouse CI.

**Note TDD :** Le spec §10 décide explicitement "pas de tests unit composants présentation V1 (ROI faible)". Validation = TypeScript strict + ESLint + 1 smoke E2E + axe + Lighthouse. Le smoke test est écrit tôt (Task 10) contre une page minimale puis reste vert au fil des sections ajoutées.

---

## File Structure

### Created (`apps/web/`)

```
app/
  (marketing)/
    layout.tsx              # nav + footer + skip link + main wrapper
    page.tsx                # composition landing
  not-found.tsx
  error.tsx                 # 'use client'
  globals.css               # @import tailwindcss + @import tokens.css + @theme
  robots.ts
  sitemap.ts
components/
  ui/
    Button.tsx
    Container.tsx
    Section.tsx
    Heading.tsx
    Logo.tsx
  marketing/
    MarketingNav.tsx        # 'use client' (drawer state)
    MarketingFooter.tsx
    Hero.tsx
    PainPoints.tsx
    Features.tsx
    DemoMockup.tsx
    PricingTease.tsx
    Faq.tsx                 # 'use client' (accordion state)
lib/
  cn.ts                     # clsx + tailwind-merge
styles/
  tokens.css                # CSS custom properties
public/
  fonts/                    # Inter-{400,500,600}.woff2 + PlusJakartaSans-{700,800}.woff2
  images/
    hero-mockup.svg         # placeholder vectoriel V1
    og-image.png            # 1200x630 placeholder
    logo-mark.svg
e2e/
  landing.spec.ts
postcss.config.mjs
playwright.config.ts
```

### Modified

- `apps/web/package.json` — deps Tailwind v4, clsx, tailwind-merge, devDeps Playwright, axe.
- `apps/web/app/layout.tsx` — fonts self-hostées, metadata base, lang fr.
- `apps/web/app/page.tsx` — supprimé (déplacé dans `(marketing)/page.tsx`).
- `apps/web/next.config.mjs` — pas de modif a priori.
- `.github/workflows/ci.yml` — jobs `e2e` + `lighthouse`.
- `lighthouserc.json` (racine) — budgets Perf 90, A11y 95, SEO 90, BP 95.
- `TASKS.md` — nouvelle section "Track Frontend (IHM)" entre Phase 0 et Phase 1.
- `CLAUDE.md` — référence spec IHM + rappel routes V1.

---

## Task 1: Installer Tailwind v4 + helpers + setup PostCSS

**Files:**

- Modify: `apps/web/package.json`
- Create: `apps/web/postcss.config.mjs`

- [ ] **Step 1: Ajouter dépendances**

```bash
pnpm --filter @molopilot/web add tailwindcss@^4 @tailwindcss/postcss postcss clsx tailwind-merge
```

- [ ] **Step 2: Créer `apps/web/postcss.config.mjs`**

```js
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
```

- [ ] **Step 3: Vérifier installation**

Run: `pnpm --filter @molopilot/web exec tsc --noEmit`
Expected: PASS (rien cassé).

- [ ] **Step 4: Commit**

```bash
git add apps/web/package.json apps/web/postcss.config.mjs pnpm-lock.yaml
git commit -m "feat(web): install tailwindcss v4 and styling helpers"
```

---

## Task 2: Tokens CSS + globals.css avec @theme Tailwind v4

**Files:**

- Create: `apps/web/styles/tokens.css`
- Create: `apps/web/app/globals.css`

- [ ] **Step 1: Créer `apps/web/styles/tokens.css`**

```css
:root {
  /* Primary — Orange Mali */
  --color-primary-50: #fff4ed;
  --color-primary-100: #ffe4d2;
  --color-primary-200: #ffc9a5;
  --color-primary-300: #ffa76e;
  --color-primary-400: #ff8849;
  --color-primary-500: #ff6b35;
  --color-primary-600: #e5511d;
  --color-primary-700: #c44114;
  --color-primary-800: #9a3411;
  --color-primary-900: #7c2a0e;

  /* Accent — Jaune Sénégal */
  --color-accent-50: #fef9e7;
  --color-accent-100: #fdf1c2;
  --color-accent-200: #fbe48a;
  --color-accent-300: #f9d34d;
  --color-accent-500: #f7b801;
  --color-accent-700: #b58400;
  --color-accent-900: #7a5800;

  /* Success — Vert Téranga */
  --color-success-50: #e6f7f0;
  --color-success-100: #b8e8d5;
  --color-success-300: #4cc79b;
  --color-success-500: #00a878;
  --color-success-700: #006b4d;
  --color-success-900: #003d2c;

  /* Neutrals — Charbon */
  --color-neutral-50: #fafaf9;
  --color-neutral-100: #f4f4f2;
  --color-neutral-200: #e5e5e2;
  --color-neutral-300: #d1d1cd;
  --color-neutral-400: #a1a19d;
  --color-neutral-500: #78787a;
  --color-neutral-600: #57575a;
  --color-neutral-700: #3f3f42;
  --color-neutral-900: #1a1a1a;

  /* Semantic */
  --color-danger-500: #dc2626;
  --color-warning-500: #f59e0b;
  --color-info-500: #0ea5e9;

  /* Custom shadow */
  --shadow-glow-primary: 0 8px 32px -8px rgba(255, 107, 53, 0.5);
}
```

- [ ] **Step 2: Créer `apps/web/app/globals.css`**

```css
@import 'tailwindcss';
@import '../styles/tokens.css';

@theme {
  --color-primary-50: var(--color-primary-50);
  --color-primary-100: var(--color-primary-100);
  --color-primary-200: var(--color-primary-200);
  --color-primary-300: var(--color-primary-300);
  --color-primary-400: var(--color-primary-400);
  --color-primary-500: var(--color-primary-500);
  --color-primary-600: var(--color-primary-600);
  --color-primary-700: var(--color-primary-700);
  --color-primary-800: var(--color-primary-800);
  --color-primary-900: var(--color-primary-900);

  --color-accent-50: var(--color-accent-50);
  --color-accent-100: var(--color-accent-100);
  --color-accent-200: var(--color-accent-200);
  --color-accent-300: var(--color-accent-300);
  --color-accent-500: var(--color-accent-500);
  --color-accent-700: var(--color-accent-700);
  --color-accent-900: var(--color-accent-900);

  --color-success-50: var(--color-success-50);
  --color-success-100: var(--color-success-100);
  --color-success-300: var(--color-success-300);
  --color-success-500: var(--color-success-500);
  --color-success-700: var(--color-success-700);
  --color-success-900: var(--color-success-900);

  --color-neutral-50: var(--color-neutral-50);
  --color-neutral-100: var(--color-neutral-100);
  --color-neutral-200: var(--color-neutral-200);
  --color-neutral-300: var(--color-neutral-300);
  --color-neutral-400: var(--color-neutral-400);
  --color-neutral-500: var(--color-neutral-500);
  --color-neutral-600: var(--color-neutral-600);
  --color-neutral-700: var(--color-neutral-700);
  --color-neutral-900: var(--color-neutral-900);

  --color-danger-500: var(--color-danger-500);
  --color-warning-500: var(--color-warning-500);
  --color-info-500: var(--color-info-500);

  --shadow-glow-primary: var(--shadow-glow-primary);
}

html,
body {
  background-color: var(--color-neutral-50);
  color: var(--color-neutral-900);
}

/* Skip link visible on focus only */
.skip-link {
  position: absolute;
  left: -9999px;
}
.skip-link:focus {
  left: 0;
  top: 0;
  z-index: 100;
  padding: 0.75rem 1rem;
  background: var(--color-neutral-900);
  color: white;
}
```

- [ ] **Step 3: Vérifier compile en démarrant le dev server**

Run: `pnpm --filter @molopilot/web build`
Expected: build OK (nouveau CSS pris en compte, aucune erreur).

- [ ] **Step 4: Commit**

```bash
git add apps/web/styles apps/web/app/globals.css
git commit -m "feat(web): add design tokens and tailwind v4 theme bridge"
```

---

## Task 3: Helper `cn()` (clsx + tailwind-merge)

**Files:**

- Create: `apps/web/lib/cn.ts`

- [ ] **Step 1: Créer `apps/web/lib/cn.ts`**

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @molopilot/web typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/lib/cn.ts
git commit -m "feat(web): add cn() className helper"
```

---

## Task 4: Polices self-hostées + root layout

**Files:**

- Create: `apps/web/public/fonts/Inter-Regular.woff2` (téléchargé)
- Create: `apps/web/public/fonts/Inter-Medium.woff2`
- Create: `apps/web/public/fonts/Inter-SemiBold.woff2`
- Create: `apps/web/public/fonts/PlusJakartaSans-Bold.woff2`
- Create: `apps/web/public/fonts/PlusJakartaSans-ExtraBold.woff2`
- Modify: `apps/web/app/layout.tsx`

- [ ] **Step 1: Télécharger les fichiers de polices**

Source recommandée : Google Fonts → bouton "Download family" → extraire WOFF2 des poids requis. Si Google Fonts ne fournit pas WOFF2 directement, convertir TTF via `npx ttf2woff2` ou utiliser fontsource :

```bash
pnpm --filter @molopilot/web add @fontsource/inter @fontsource/plus-jakarta-sans
```

Puis copier les `.woff2` depuis `node_modules/@fontsource/*/files/*.woff2` vers `apps/web/public/fonts/` avec les noms attendus :

- `Inter-Regular.woff2` (poids 400, latin)
- `Inter-Medium.woff2` (poids 500, latin)
- `Inter-SemiBold.woff2` (poids 600, latin)
- `PlusJakartaSans-Bold.woff2` (poids 700, latin)
- `PlusJakartaSans-ExtraBold.woff2` (poids 800, latin)

Ensuite, désinstaller fontsource (uniquement utilisé pour récupérer les fichiers) :

```bash
pnpm --filter @molopilot/web remove @fontsource/inter @fontsource/plus-jakarta-sans
```

- [ ] **Step 2: Modifier `apps/web/app/layout.tsx`**

Remplacer entièrement le contenu :

```tsx
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const inter = localFont({
  src: [
    { path: '../public/fonts/Inter-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/Inter-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/Inter-SemiBold.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakarta = localFont({
  src: [
    { path: '../public/fonts/PlusJakartaSans-Bold.woff2', weight: '700', style: 'normal' },
    {
      path: '../public/fonts/PlusJakartaSans-ExtraBold.woff2',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-display',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://molopilot.com'),
  title: {
    default: 'Molopilot — Caisse, stock et rapports pour resto, café, boutique au Sénégal',
    template: '%s · Molopilot',
  },
  description:
    'Logiciel de gestion offline-first pour les commerces sénégalais. Caisse, stock, rapports. 15 000 FCFA / mois.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Étendre `globals.css` pour mapper les polices dans `@theme`**

Ajouter dans le bloc `@theme` de `apps/web/app/globals.css` :

```css
--font-sans: var(--font-inter), system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
--font-display: var(--font-display), 'Plus Jakarta Sans', system-ui, sans-serif;
```

- [ ] **Step 4: Build pour vérifier intégration fonts**

Run: `pnpm --filter @molopilot/web build`
Expected: build OK, dossier `.next/static/media/` contient les `.woff2` hashés.

- [ ] **Step 5: Commit**

```bash
git add apps/web/public/fonts apps/web/app/layout.tsx apps/web/app/globals.css apps/web/package.json pnpm-lock.yaml
git commit -m "feat(web): self-host inter and plus jakarta fonts in root layout"
```

---

## Task 5: `<Button>` primitive

**Files:**

- Create: `apps/web/components/ui/Button.tsx`

- [ ] **Step 1: Écrire `apps/web/components/ui/Button.tsx`**

```tsx
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
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
    'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-md hover:shadow-glow-primary',
  secondary:
    'bg-white text-primary-700 border border-primary-200 hover:bg-primary-50 active:bg-primary-100',
  ghost: 'bg-transparent text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200',
};

// Note contraste AA : size sm force font-semibold pour rester conforme
// quand bg-primary-500 + text-white (ratio 3.5:1 demande ≥14px bold).
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
```

- [ ] **Step 2: Ajouter dépendance `@radix-ui/react-slot`**

```bash
pnpm --filter @molopilot/web add @radix-ui/react-slot
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @molopilot/web typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/ui/Button.tsx apps/web/package.json pnpm-lock.yaml
git commit -m "feat(web): add Button primitive with variants and AA contrast guards"
```

---

## Task 6: `<Container>` primitive

**Files:**

- Create: `apps/web/components/ui/Container.tsx`

- [ ] **Step 1: Écrire `apps/web/components/ui/Container.tsx`**

```tsx
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Width = 'narrow' | 'default' | 'wide';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  width?: Width;
  children: ReactNode;
}

const widths: Record<Width, string> = {
  narrow: 'max-w-2xl', // 640px
  default: 'max-w-6xl', // 1152px (~1200 cible)
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
```

- [ ] **Step 2: Typecheck + commit**

Run: `pnpm --filter @molopilot/web typecheck`
Expected: PASS.

```bash
git add apps/web/components/ui/Container.tsx
git commit -m "feat(web): add Container primitive"
```

---

## Task 7: `<Section>` primitive

**Files:**

- Create: `apps/web/components/ui/Section.tsx`

- [ ] **Step 1: Écrire `apps/web/components/ui/Section.tsx`**

```tsx
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
```

- [ ] **Step 2: Typecheck + commit**

Run: `pnpm --filter @molopilot/web typecheck`
Expected: PASS.

```bash
git add apps/web/components/ui/Section.tsx
git commit -m "feat(web): add Section primitive"
```

---

## Task 8: `<Heading>` primitive

**Files:**

- Create: `apps/web/components/ui/Heading.tsx`

- [ ] **Step 1: Écrire `apps/web/components/ui/Heading.tsx`**

```tsx
import { forwardRef, type HTMLAttributes, type ReactNode, createElement } from 'react';
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
```

- [ ] **Step 2: Typecheck + commit**

Run: `pnpm --filter @molopilot/web typecheck`
Expected: PASS.

```bash
git add apps/web/components/ui/Heading.tsx
git commit -m "feat(web): add Heading primitive with decoupled tag/size"
```

---

## Task 9: `<Logo>` primitive + asset SVG

**Files:**

- Create: `apps/web/public/images/logo-mark.svg`
- Create: `apps/web/components/ui/Logo.tsx`

- [ ] **Step 1: Créer `apps/web/public/images/logo-mark.svg`**

Logo placeholder géométrique simple V1 (cercle + flèche stylisée orange/jaune) :

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
  <circle cx="20" cy="20" r="18" fill="#FF6B35" />
  <path d="M14 20l5 5 9-11" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="32" cy="10" r="4" fill="#F7B801" />
</svg>
```

- [ ] **Step 2: Écrire `apps/web/components/ui/Logo.tsx`**

```tsx
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
```

- [ ] **Step 3: Typecheck + commit**

Run: `pnpm --filter @molopilot/web typecheck`
Expected: PASS.

```bash
git add apps/web/public/images/logo-mark.svg apps/web/components/ui/Logo.tsx
git commit -m "feat(web): add Logo primitive with placeholder mark"
```

---

## Task 10: Smoke test minimal — Hero placeholder + Playwright setup

**Files:**

- Create: `apps/web/playwright.config.ts`
- Create: `apps/web/e2e/landing.spec.ts`
- Create: `apps/web/components/marketing/Hero.tsx` (version minimale)
- Create: `apps/web/app/(marketing)/layout.tsx` (squelette minimal)
- Create: `apps/web/app/(marketing)/page.tsx`
- Delete: `apps/web/app/page.tsx`

**Pourquoi écrire le smoke maintenant :** valide la chaîne complète (route group + Tailwind + Playwright + axe) avant d'ajouter les sections. Le test reste vert tant que h1 contient "Pilotez".

- [ ] **Step 1: Installer Playwright + axe**

```bash
pnpm --filter @molopilot/web add -D @playwright/test @axe-core/playwright
pnpm --filter @molopilot/web exec playwright install --with-deps chromium
```

- [ ] **Step 2: Créer `apps/web/playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

const PORT = 3010;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm next start --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 3: Créer `apps/web/components/marketing/Hero.tsx` (version minimale)**

```tsx
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';

export function Hero() {
  return (
    <section className="bg-gradient-to-br from-primary-500 to-accent-500 py-24 text-white">
      <Container>
        <Heading as="h1" size="4xl" className="text-white sm:text-6xl">
          Pilotez votre établissement, même sans réseau.
        </Heading>
      </Container>
    </section>
  );
}
```

- [ ] **Step 4: Créer `apps/web/app/(marketing)/layout.tsx` (squelette minimal)**

```tsx
import type { ReactNode } from 'react';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Aller au contenu principal
      </a>
      <main id="main-content">{children}</main>
    </>
  );
}
```

- [ ] **Step 5: Créer `apps/web/app/(marketing)/page.tsx`**

```tsx
import { Hero } from '@/components/marketing/Hero';

export default function HomePage() {
  return <Hero />;
}
```

- [ ] **Step 6: Supprimer l'ancien `apps/web/app/page.tsx`**

```bash
rm apps/web/app/page.tsx
```

- [ ] **Step 7: Créer `apps/web/e2e/landing.spec.ts`**

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Landing /', () => {
  test('renders h1 with hero copy', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    await expect(page.locator('h1')).toContainText('Pilotez');
    expect(consoleErrors).toEqual([]);
  });

  test('has no critical or serious a11y violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(blocking).toEqual([]);
  });
});
```

- [ ] **Step 8: Ajouter scripts au `apps/web/package.json`**

Modifier la section `scripts` pour ajouter :

```json
    "e2e": "playwright test",
    "e2e:install": "playwright install --with-deps chromium"
```

- [ ] **Step 9: Build + run e2e en local**

Run: `pnpm --filter @molopilot/web build && pnpm --filter @molopilot/web e2e`
Expected: 2 tests verts, statut 200, h1 contient "Pilotez", 0 violations a11y bloquantes.

- [ ] **Step 10: Commit**

```bash
git add apps/web/playwright.config.ts apps/web/e2e apps/web/components/marketing/Hero.tsx apps/web/app/(marketing) apps/web/package.json pnpm-lock.yaml
git rm apps/web/app/page.tsx
git commit -m "feat(web): scaffold (marketing) route group with hero placeholder and playwright smoke"
```

---

## Task 11: `<MarketingNav>` complète + drawer mobile

**Files:**

- Create: `apps/web/components/marketing/MarketingNav.tsx`

- [ ] **Step 1: Écrire `apps/web/components/marketing/MarketingNav.tsx`**

```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/cn';

const links = [
  { href: '/#fonctionnalites', label: 'Fonctionnalités' },
  { href: '/tarifs', label: 'Tarifs' },
  { href: '/contact', label: 'Contact' },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-colors',
        scrolled ? 'bg-white/90 backdrop-blur border-b border-neutral-200' : 'bg-white',
      )}
    >
      <Container>
        <nav className="flex h-16 items-center justify-between" aria-label="Navigation principale">
          <Logo />

          <ul className="hidden md:flex md:items-center md:gap-8">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm font-medium text-neutral-700 hover:text-primary-600"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex md:items-center md:gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Se connecter</Link>
            </Button>
            <Button variant="primary" size="sm" asChild>
              <Link href="/auth/signup">Créer mon compte</Link>
            </Button>
          </div>

          <button
            type="button"
            className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-md text-neutral-900 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            aria-expanded={open}
            aria-controls="mobile-drawer"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <span
              aria-hidden
              className="block h-0.5 w-6 bg-current relative before:absolute before:-top-2 before:left-0 before:h-0.5 before:w-6 before:bg-current after:absolute after:top-2 after:left-0 after:h-0.5 after:w-6 after:bg-current"
            />
          </button>
        </nav>
      </Container>

      {open && (
        <div
          id="mobile-drawer"
          className="md:hidden fixed inset-0 top-16 z-30 bg-neutral-900/95 backdrop-blur"
          role="dialog"
          aria-modal="true"
        >
          <Container className="py-8">
            <ul className="flex flex-col gap-6">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block text-2xl font-display font-bold text-white hover:text-accent-500"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li className="pt-6 flex flex-col gap-3">
                <Button variant="ghost" size="lg" asChild className="text-white hover:bg-white/10">
                  <Link href="/auth/login" onClick={() => setOpen(false)}>
                    Se connecter
                  </Link>
                </Button>
                <Button variant="primary" size="lg" asChild>
                  <Link href="/auth/signup" onClick={() => setOpen(false)}>
                    Créer mon compte
                  </Link>
                </Button>
              </li>
            </ul>
          </Container>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `pnpm --filter @molopilot/web typecheck`
Expected: PASS.

```bash
git add apps/web/components/marketing/MarketingNav.tsx
git commit -m "feat(web): add MarketingNav with sticky bar and mobile drawer"
```

---

## Task 12: `<MarketingFooter>`

**Files:**

- Create: `apps/web/components/marketing/MarketingFooter.tsx`

- [ ] **Step 1: Écrire `apps/web/components/marketing/MarketingFooter.tsx`**

```tsx
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';

const cols = [
  {
    title: 'Produit',
    links: [
      { href: '/#fonctionnalites', label: 'Fonctionnalités' },
      { href: '/tarifs', label: 'Tarifs' },
      { href: '/#demo', label: 'Démo' },
    ],
  },
  {
    title: 'Entreprise',
    links: [
      { href: '/contact', label: 'Contact' },
      { href: '/mentions-legales', label: 'Mentions légales' },
    ],
  },
  {
    title: 'Ressources',
    links: [{ href: '/#faq', label: 'FAQ' }],
  },
];

export function MarketingFooter() {
  return (
    <Section bg="dark" pad="md" aria-labelledby="footer-heading">
      <Container>
        <h2 id="footer-heading" className="sr-only">
          Pied de page
        </h2>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-accent-300">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-base text-white/80 hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent-300">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-base text-white/80">
              <li>
                <a href="https://wa.me/221000000000" className="hover:text-white">
                  WhatsApp +221 00 000 00 00
                </a>
              </li>
              <li>
                <a href="mailto:contact@molopilot.com" className="hover:text-white">
                  contact@molopilot.com
                </a>
              </li>
              <li>Dakar, Sénégal</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between gap-2 text-sm text-white/60">
          <p>© 2026 Molopilot</p>
          <p>Made in Sénégal 🇸🇳</p>
        </div>
      </Container>
    </Section>
  );
}
```

**Note placeholders :** numéro WhatsApp et email sont des placeholders V1. À remplacer par valeurs réelles avant prod (suivi via TODO TASKS.md Phase 9 polish).

- [ ] **Step 2: Typecheck + commit**

Run: `pnpm --filter @molopilot/web typecheck`
Expected: PASS.

```bash
git add apps/web/components/marketing/MarketingFooter.tsx
git commit -m "feat(web): add MarketingFooter with placeholder contact info"
```

---

## Task 13: `<Hero>` complet (remplace version minimale)

**Files:**

- Modify: `apps/web/components/marketing/Hero.tsx`
- Create: `apps/web/public/images/hero-mockup.svg`

- [ ] **Step 1: Créer `apps/web/public/images/hero-mockup.svg` (placeholder)**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360" fill="none">
  <rect width="480" height="360" rx="24" fill="#FFFFFF" />
  <rect x="24" y="24" width="432" height="48" rx="12" fill="#F4F4F2" />
  <circle cx="48" cy="48" r="10" fill="#FF6B35" />
  <text x="72" y="54" font-family="sans-serif" font-size="18" font-weight="700" fill="#1A1A1A">Caisse — Vente #214</text>
  <rect x="24" y="96" width="280" height="240" rx="12" fill="#FAFAF9" stroke="#E5E5E2" />
  <rect x="320" y="96" width="136" height="240" rx="12" fill="#00A878" />
  <text x="388" y="220" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#FFFFFF">VALIDER</text>
  <text x="388" y="244" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="800" fill="#FFFFFF">12 500</text>
  <text x="388" y="262" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#FFFFFF">FCFA</text>
</svg>
```

- [ ] **Step 2: Réécrire `apps/web/components/marketing/Hero.tsx`**

```tsx
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Button } from '@/components/ui/Button';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 to-accent-500 text-white">
      <Container>
        <div className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:py-32">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white backdrop-blur">
              🇸🇳 Pour resto · café · boutique
            </span>

            <Heading
              as="h1"
              size="4xl"
              className="mt-6 text-white sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              Pilotez votre établissement,{' '}
              <span className="text-accent-200">même sans réseau.</span>
            </Heading>

            <p className="mt-6 text-lg text-white/90 sm:text-xl">
              Caisse, stock et rapports — pensé pour les commerces du Sénégal. Fonctionne offline,
              synchro dès que la 4G revient.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="primary"
                size="lg"
                asChild
                className="bg-white text-primary-700 hover:bg-neutral-100"
              >
                <Link href="/auth/signup">Créer mon compte</Link>
              </Button>
              <Button variant="ghost" size="lg" asChild className="text-white hover:bg-white/10">
                <Link href="#fonctionnalites">Découvrir comment ça marche</Link>
              </Button>
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
              <li>Cash · Wave · Orange Money</li>
              <li>100% offline-first</li>
              <li>Hébergé en Europe</li>
            </ul>
          </div>

          <div className="hidden lg:block">
            <Image
              src="/images/hero-mockup.svg"
              alt="Capture interface caisse Molopilot avec validation de vente à 12 500 FCFA"
              width={480}
              height={360}
              priority
              className="drop-shadow-2xl"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 3: Re-run smoke test pour vérifier h1 toujours présent**

Run: `pnpm --filter @molopilot/web build && pnpm --filter @molopilot/web e2e`
Expected: 2 tests verts.

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/marketing/Hero.tsx apps/web/public/images/hero-mockup.svg
git commit -m "feat(web): build full Hero with mockup, eyebrow, dual CTA, trust strip"
```

---

## Task 14: `<PainPoints>`

**Files:**

- Create: `apps/web/components/marketing/PainPoints.tsx`

- [ ] **Step 1: Écrire `apps/web/components/marketing/PainPoints.tsx`**

```tsx
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';

const items = [
  {
    icon: '📵',
    title: 'La 4G coupe en plein service',
    body: "Vente perdue, client mécontent, file qui s'allonge.",
  },
  {
    icon: '📓',
    title: 'Le cahier de caisse a disparu',
    body: 'Impossible de savoir précisément ce qui a été vendu hier.',
  },
  {
    icon: '📦',
    title: 'Le stock est invisible',
    body: 'On rupture sur le best-seller un samedi soir.',
  },
];

export function PainPoints() {
  return (
    <Section pad="lg" bg="default">
      <Container>
        <Heading as="h2" size="3xl" className="text-center sm:text-4xl">
          Vous reconnaissez ces galères ?
        </Heading>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <li
              key={it.title}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <span className="text-4xl" aria-hidden>
                {it.icon}
              </span>
              <h3 className="mt-4 font-display text-xl font-bold text-neutral-900">{it.title}</h3>
              <p className="mt-2 text-base text-neutral-600">{it.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `pnpm --filter @molopilot/web typecheck`
Expected: PASS.

```bash
git add apps/web/components/marketing/PainPoints.tsx
git commit -m "feat(web): add PainPoints section"
```

---

## Task 15: `<Features>`

**Files:**

- Create: `apps/web/components/marketing/Features.tsx`

- [ ] **Step 1: Écrire `apps/web/components/marketing/Features.tsx`**

```tsx
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';

const features = [
  {
    icon: '⚡',
    title: 'Caisse offline-first',
    body: 'Encaissez même sans réseau. Synchro automatique au retour de la 4G.',
  },
  {
    icon: '📊',
    title: 'Stock temps réel',
    body: 'Mouvements suivis, alertes seuil bas, inventaire fiable.',
  },
  {
    icon: '📈',
    title: 'Rapports clairs',
    body: 'CA jour/semaine/mois, top produits, par caissier, exports CSV.',
  },
  {
    icon: '🏪',
    title: 'Multi-établissement',
    body: 'Un compte, plusieurs points de vente, vue consolidée.',
  },
];

export function Features() {
  return (
    <Section pad="lg" bg="default" id="fonctionnalites">
      <Container>
        <Heading as="h2" size="3xl" className="text-center sm:text-4xl">
          Tout ce qu&apos;il faut pour bien tourner.
        </Heading>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <li
              key={f.title}
              className="rounded-2xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <span
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-2xl"
                aria-hidden
              >
                {f.icon}
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-neutral-900">{f.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{f.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `pnpm --filter @molopilot/web typecheck`
Expected: PASS.

```bash
git add apps/web/components/marketing/Features.tsx
git commit -m "feat(web): add Features section"
```

---

## Task 16: `<DemoMockup>`

**Files:**

- Create: `apps/web/components/marketing/DemoMockup.tsx`

- [ ] **Step 1: Écrire `apps/web/components/marketing/DemoMockup.tsx`**

```tsx
import Image from 'next/image';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';

export function DemoMockup() {
  return (
    <Section pad="lg" bg="dark" id="demo">
      <Container>
        <div className="text-center">
          <Heading as="h2" size="3xl" className="text-white sm:text-4xl">
            Voici à quoi ressemble une vente, online ou offline.
          </Heading>
          <p className="mt-4 text-lg text-white/80">Aucune vente perdue. Jamais.</p>
        </div>

        <div className="mt-12 flex justify-center">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-2 shadow-2xl">
            <Image
              src="/images/hero-mockup.svg"
              alt="Mockup de l'interface caisse Molopilot"
              width={960}
              height={540}
              className="rounded-xl"
            />
            <div className="absolute -top-3 -right-3 rounded-full bg-success-500 px-4 py-1 text-sm font-semibold text-white shadow-lg">
              Synchronisé ✓
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `pnpm --filter @molopilot/web typecheck`
Expected: PASS.

```bash
git add apps/web/components/marketing/DemoMockup.tsx
git commit -m "feat(web): add DemoMockup section"
```

---

## Task 17: `<PricingTease>`

**Files:**

- Create: `apps/web/components/marketing/PricingTease.tsx`

- [ ] **Step 1: Écrire `apps/web/components/marketing/PricingTease.tsx`**

```tsx
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Button } from '@/components/ui/Button';

const inclusions = [
  'Tout inclus, mises à jour gratuites',
  'Pas de % sur vos ventes',
  'Annulable à tout moment',
];

export function PricingTease() {
  return (
    <Section pad="lg" bg="accent" id="tarifs-tease">
      <Container width="narrow">
        <Heading as="h2" size="3xl" className="text-center sm:text-4xl">
          Un seul tarif, sans surprise.
        </Heading>

        <div className="mt-10 mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-primary-100">
          <p className="text-center font-display text-5xl font-extrabold text-neutral-900 sm:text-6xl">
            15 000 <span className="text-2xl font-bold text-neutral-500">FCFA</span>
          </p>
          <p className="mt-1 text-center text-base text-neutral-600">/ mois / établissement</p>

          <ul className="mt-8 space-y-3">
            {inclusions.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span aria-hidden className="mt-0.5 text-success-500">
                  ✓
                </span>
                <span className="text-base text-neutral-800">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex justify-center">
            <Button variant="secondary" size="lg" asChild>
              <Link href="/tarifs">Voir le détail des tarifs</Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `pnpm --filter @molopilot/web typecheck`
Expected: PASS.

```bash
git add apps/web/components/marketing/PricingTease.tsx
git commit -m "feat(web): add PricingTease section"
```

---

## Task 18: `<Faq>` accordéon

**Files:**

- Create: `apps/web/components/marketing/Faq.tsx`

- [ ] **Step 1: Écrire `apps/web/components/marketing/Faq.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { cn } from '@/lib/cn';

const items: { q: string; a: string }[] = [
  {
    q: 'Ça marche vraiment offline ?',
    a: 'Oui. La caisse fonctionne sans connexion : ventes, encaissement, impression ticket. Tout est stocké localement et synchronisé dès que le réseau revient.',
  },
  {
    q: 'Mes données vont où ?',
    a: 'Hébergement chez un fournisseur européen (Neon ou Supabase, région EU), conformité RGPD. Vos données vous appartiennent, export possible à tout moment.',
  },
  {
    q: 'Puis-je essayer avant de payer ?',
    a: "Oui, période d'essai disponible — contactez-nous pour activation.",
  },
  {
    q: "Comment je paie l'abonnement ?",
    a: 'Paiement mensuel par virement bancaire ou Wave/Orange Money via reçu manuel. Pas de prélèvement automatique en V1.',
  },
  {
    q: 'Wave / Orange Money intégrés directement ?',
    a: "Pas en V1 : enregistrez le mode de paiement à l'encaissement, la confirmation se fait dans l'app du client. Intégration API prévue V2.",
  },
  {
    q: 'Combien de caissiers puis-je créer ?',
    a: "Illimité. Chaque caissier a son code PIN personnel pour l'ouverture de session caisse.",
  },
];

function FaqItem({ q, a, idx }: { q: string; a: string; idx: number }) {
  const [open, setOpen] = useState(false);
  const panelId = `faq-panel-${idx}`;
  const buttonId = `faq-button-${idx}`;
  return (
    <li className="border-b border-neutral-200 last:border-b-0">
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-4 py-5 text-left font-display text-lg font-bold text-neutral-900 hover:text-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          <span>{q}</span>
          <span
            aria-hidden
            className={cn('text-2xl text-primary-500 transition-transform', open && 'rotate-45')}
          >
            +
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className="pb-5 text-base text-neutral-700"
      >
        {a}
      </div>
    </li>
  );
}

export function Faq() {
  return (
    <Section pad="lg" bg="default" id="faq">
      <Container width="narrow">
        <Heading as="h2" size="3xl" className="text-center sm:text-4xl">
          Questions fréquentes
        </Heading>
        <ul className="mt-10">
          {items.map((it, i) => (
            <FaqItem key={it.q} q={it.q} a={it.a} idx={i} />
          ))}
        </ul>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `pnpm --filter @molopilot/web typecheck`
Expected: PASS.

```bash
git add apps/web/components/marketing/Faq.tsx
git commit -m "feat(web): add Faq accordion with aria-expanded pattern"
```

---

## Task 19: Composer landing complète + layout marketing avec nav et footer

**Files:**

- Modify: `apps/web/app/(marketing)/layout.tsx`
- Modify: `apps/web/app/(marketing)/page.tsx`

- [ ] **Step 1: Réécrire `apps/web/app/(marketing)/layout.tsx`**

```tsx
import type { ReactNode } from 'react';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Aller au contenu principal
      </a>
      <MarketingNav />
      <main id="main-content">{children}</main>
      <MarketingFooter />
    </>
  );
}
```

- [ ] **Step 2: Réécrire `apps/web/app/(marketing)/page.tsx`**

```tsx
import type { Metadata } from 'next';
import { Hero } from '@/components/marketing/Hero';
import { PainPoints } from '@/components/marketing/PainPoints';
import { Features } from '@/components/marketing/Features';
import { DemoMockup } from '@/components/marketing/DemoMockup';
import { PricingTease } from '@/components/marketing/PricingTease';
import { Faq } from '@/components/marketing/Faq';

export const metadata: Metadata = {
  title: 'Molopilot — Caisse, stock et rapports pour resto, café, boutique au Sénégal',
  description:
    'Logiciel de gestion offline-first pour les commerces sénégalais. Caisse, stock, rapports. 15 000 FCFA / mois.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Molopilot — Caisse offline-first pour le Sénégal',
    description:
      'Logiciel de gestion pour resto, café, boutique. Fonctionne sans réseau, synchro automatique.',
    url: '/',
    siteName: 'Molopilot',
    images: [{ url: '/images/og-image.png', width: 1200, height: 630, alt: 'Molopilot' }],
    locale: 'fr_SN',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <PainPoints />
      <Features />
      <DemoMockup />
      <PricingTease />
      <Faq />
    </>
  );
}
```

- [ ] **Step 3: Re-run smoke test sur la page complète**

Run: `pnpm --filter @molopilot/web build && pnpm --filter @molopilot/web e2e`
Expected: 2 tests verts (h1 contient "Pilotez", 0 violations a11y bloquantes).

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/(marketing)
git commit -m "feat(web): compose landing page with all sections + nav/footer layout"
```

---

## Task 20: OG image placeholder + pages erreur

**Files:**

- Create: `apps/web/public/images/og-image.png` (placeholder 1200x630)
- Create: `apps/web/app/not-found.tsx`
- Create: `apps/web/app/error.tsx`

- [ ] **Step 1: Générer un OG image placeholder 1200x630**

Méthode rapide ImageMagick (si dispo) :

```bash
magick -size 1200x630 \
  gradient:'#FF6B35-#F7B801' \
  -gravity center -font Arial -pointsize 96 -fill white \
  -annotate +0-40 'Molopilot' \
  -pointsize 36 -annotate +0+60 'Caisse offline-first · Sénégal' \
  apps/web/public/images/og-image.png
```

Si ImageMagick indisponible : créer un PNG 1200x630 manuellement (Figma, Canva) ou copier un placeholder neutre. Le visuel propre est planifié V2.

- [ ] **Step 2: Créer `apps/web/app/not-found.tsx`**

```tsx
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center py-20">
      <Container width="narrow">
        <div className="text-center">
          <p className="font-display text-7xl font-extrabold text-primary-500">404</p>
          <Heading as="h1" size="3xl" className="mt-4">
            Page introuvable
          </Heading>
          <p className="mt-4 text-lg text-neutral-600">
            La page que vous cherchez n&apos;existe pas ou a été déplacée.
          </p>
          <div className="mt-8">
            <Button variant="primary" size="lg" asChild>
              <Link href="/">Retour à l&apos;accueil</Link>
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
```

- [ ] **Step 3: Créer `apps/web/app/error.tsx`**

```tsx
'use client';

import { useEffect } from 'react';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sentry intégré en Phase 9.
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center py-20">
      <Container width="narrow">
        <div className="text-center">
          <Heading as="h1" size="3xl">
            Une erreur est survenue
          </Heading>
          <p className="mt-4 text-lg text-neutral-600">
            Quelque chose s&apos;est mal passé. Réessayez dans un instant.
          </p>
          <div className="mt-8">
            <Button variant="primary" size="lg" onClick={() => reset()}>
              Réessayer
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
```

- [ ] **Step 4: Build pour vérifier**

Run: `pnpm --filter @molopilot/web build`
Expected: build OK, routes `/_not-found` et boundary error détectées.

- [ ] **Step 5: Commit**

```bash
git add apps/web/public/images/og-image.png apps/web/app/not-found.tsx apps/web/app/error.tsx
git commit -m "feat(web): add styled 404 and error boundary pages plus og image"
```

---

## Task 21: SEO — robots.ts + sitemap.ts

**Files:**

- Create: `apps/web/app/robots.ts`
- Create: `apps/web/app/sitemap.ts`

- [ ] **Step 1: Créer `apps/web/app/robots.ts`**

```ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://molopilot.com/sitemap.xml',
  };
}
```

- [ ] **Step 2: Créer `apps/web/app/sitemap.ts`**

```ts
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://molopilot.com';
  return [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
```

- [ ] **Step 3: Build + vérifier endpoints**

Run: `pnpm --filter @molopilot/web build`
Expected: build OK. `apps/web/.next/server/app/robots.txt.body` et `sitemap.xml.body` générés.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/robots.ts apps/web/app/sitemap.ts
git commit -m "feat(web): add robots and sitemap routes"
```

---

## Task 22: Lighthouse CI config + budgets

**Files:**

- Create: `lighthouserc.json` (racine repo)

- [ ] **Step 1: Créer `lighthouserc.json` à la racine**

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3010/"],
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop",
        "emulatedFormFactor": "mobile",
        "throttlingMethod": "simulate"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lighthouserc.json
git commit -m "ci: add lighthouse budgets config (perf 90 a11y 95 seo 90 bp 95)"
```

---

## Task 23: Étendre CI — jobs e2e + lighthouse

**Files:**

- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Ajouter 2 jobs au workflow**

Modifier `.github/workflows/ci.yml` en ajoutant après le job `quality` :

```yaml
e2e:
  name: E2E · A11y (Playwright + axe)
  runs-on: ubuntu-latest
  needs: quality

  steps:
    - uses: actions/checkout@v4

    - uses: pnpm/action-setup@v4
      with:
        version: ${{ env.PNPM_VERSION }}

    - uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'pnpm'

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Install Playwright browsers
      run: pnpm --filter @molopilot/web exec playwright install --with-deps chromium

    - name: Build web
      run: pnpm --filter @molopilot/web build

    - name: Run Playwright tests
      run: pnpm --filter @molopilot/web e2e

    - name: Upload Playwright report on failure
      if: failure()
      uses: actions/upload-artifact@v4
      with:
        name: playwright-report
        path: apps/web/playwright-report
        retention-days: 7

lighthouse:
  name: Lighthouse budgets
  runs-on: ubuntu-latest
  needs: quality

  steps:
    - uses: actions/checkout@v4

    - uses: pnpm/action-setup@v4
      with:
        version: ${{ env.PNPM_VERSION }}

    - uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'pnpm'

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Build web
      run: pnpm --filter @molopilot/web build

    - name: Start web server
      run: pnpm --filter @molopilot/web start &
      env:
        PORT: 3010

    - name: Wait for server
      run: npx wait-on http://localhost:3010 --timeout 60000

    - name: Run Lighthouse CI
      run: npx --yes @lhci/cli@0.13.x autorun
```

**Note :** le script `start` actuel utilise `--port 3000`. Le pipeline Lighthouse cible `3010` pour matcher Playwright. Modifier `apps/web/package.json` :

```json
    "start": "next start --port 3010",
```

(Cela impacte aussi `pnpm dev` ? Non — `dev` reste 3000. Seul `start` change pour aligner Playwright + Lighthouse sur 3010.)

- [ ] **Step 2: Mettre à jour `apps/web/package.json` script `start`**

Faire la modification mentionnée ci-dessus.

- [ ] **Step 3: Vérifier syntaxe YAML localement**

Run: `npx --yes js-yaml .github/workflows/ci.yml > /dev/null`
Expected: pas d'erreur.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml apps/web/package.json
git commit -m "ci: add e2e (playwright+axe) and lighthouse jobs"
```

---

## Task 24: Mettre à jour TASKS.md + CLAUDE.md

**Files:**

- Modify: `TASKS.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Ajouter section "Track Frontend (IHM)" dans `TASKS.md`**

Insérer entre la fin de "Phase 0 — Fondations ✅" et "Phase 1 — Auth + multi-tenant + RLS ⬜" :

```markdown
---

## Track Frontend (IHM) — parallèle aux phases backend

> Track parallèle à la roadmap backend. Préfixe `IHM-` pour éviter conflit avec numérotation Plan 1..10. Plan IHM-1 fournit le design system utilisé par toutes les phases suivantes (auth, back-office, caisse).

### Plan IHM-1 — Design system + Landing `/` ✅

**Objectif :** identité visuelle Molopilot, page d'accueil convertit visiteur → "Créer mon compte", primitives UI réutilisables Phase 1+.

**Spec :** `docs/superpowers/specs/2026-05-02-ihm-foundation-design.md`
**Plan :** `docs/superpowers/plans/2026-05-03-ihm-1-foundation-landing.md`

| Tâche                                          | Statut | Date       | Notes                                                                  |
| ---------------------------------------------- | ------ | ---------- | ---------------------------------------------------------------------- |
| Tailwind v4 + tokens CSS-first                 | ✅     | 2026-05-03 | `globals.css` `@theme`, palette Vibrant Afro                           |
| Polices self-hostées (Inter + Plus Jakarta)    | ✅     | 2026-05-03 | `next/font/local`, preload Plus Jakarta 800                            |
| Primitives UI (Button, Container, …)           | ✅     | 2026-05-03 | 5 composants `components/ui/`                                          |
| Landing `/` (Hero, PainPoints, Features, …)    | ✅     | 2026-05-03 | Route group `(marketing)`, 8 sections                                  |
| Pages erreur (404 + error boundary)            | ✅     | 2026-05-03 | `app/not-found.tsx`, `app/error.tsx`                                   |
| SEO (metadata, robots, sitemap, og)            | ✅     | 2026-05-03 | OG image placeholder, lang fr, locale fr_SN                            |
| Smoke E2E Playwright + axe-core                | ✅     | 2026-05-03 | `apps/web/e2e/landing.spec.ts`                                         |
| Lighthouse CI (Perf 90, A11y 95, SEO 90)       | ✅     | 2026-05-03 | `lighthouserc.json` + job CI                                           |

### Plan IHM-2 — Page `/tarifs` ⬜

| Tâche             | Statut | Date | Notes                       |
| ----------------- | ------ | ---- | --------------------------- |
| Rédiger Plan IHM-2 | ⬜     |      | Réutilise design system IHM-1 |

### Plan IHM-3 — Page `/contact` ⬜

| Tâche             | Statut | Date | Notes |
| ----------------- | ------ | ---- | ----- |
| Rédiger Plan IHM-3 | ⬜     |      |       |

### Plan IHM-4 — Page `/mentions-legales` ⬜

| Tâche             | Statut | Date | Notes                 |
| ----------------- | ------ | ---- | --------------------- |
| Rédiger Plan IHM-4 | ⬜     |      | Conformité Sénégal   |

---
```

- [ ] **Step 2: Mettre à jour `CLAUDE.md`**

Dans la section "Documents de référence", ajouter sous la spec V1 :

```markdown
- **Spec IHM Foundation :** [docs/superpowers/specs/2026-05-02-ihm-foundation-design.md](docs/superpowers/specs/2026-05-02-ihm-foundation-design.md)
```

Dans la section "Structure repo", remplacer le bloc `apps/web/` par :

```
  apps/
    web/        # Next.js — route groups (marketing) public + (auth)/(app) à venir
                # design system : tokens.css + components/ui/
    api/        # NestJS (back)
```

Dans la section "Phases d'implémentation", ajouter après la ligne `0. Fondations ...` :

```markdown
**Track parallèle Frontend (IHM) :** IHM-1 (design system + landing `/`) ✅, IHM-2 (`/tarifs`), IHM-3 (`/contact`), IHM-4 (`/mentions-legales`). Préfixe `IHM-` pour éviter conflit numérotation backend.
```

- [ ] **Step 3: Format check**

Run: `pnpm format:check`
Expected: PASS. (Si fail : `pnpm format` puis re-stage.)

- [ ] **Step 4: Commit final groupé code + sync docs**

Le spec impose : "TASKS.md + CLAUDE.md mis à jour dans le même commit que le code concerné". Comme les commits précédents incrémentaux n'incluent pas la sync docs, faire ici un commit dédié de clôture :

```bash
git add TASKS.md CLAUDE.md
git commit -m "docs: close Plan IHM-1 — sync TASKS.md and CLAUDE.md with new IHM track"
```

---

## Task 25: Validation finale + push

- [ ] **Step 1: Lint + format + typecheck full repo**

Run: `pnpm lint && pnpm format:check && pnpm typecheck`
Expected: tout vert.

- [ ] **Step 2: Build + smoke E2E + a11y**

Run: `pnpm --filter @molopilot/web build && pnpm --filter @molopilot/web e2e`
Expected: 2 tests Playwright verts.

- [ ] **Step 3: Lighthouse local (sanity check)**

Run: `pnpm --filter @molopilot/web start &` puis `npx --yes @lhci/cli@0.13.x autorun`
Expected: tous les scores ≥ budgets (Perf 90, A11y 95, SEO 90, BP 95).

Si un budget fail localement : noter le score, identifier la cause (image trop lourde ? JS bundle ? font preload ?), corriger avant push.

- [ ] **Step 4: Test manuel browser**

Run: `pnpm --filter @molopilot/web dev`
Naviguer `http://localhost:3000` :

- [ ] Hero visible avec h1 + 2 CTAs visibles.
- [ ] Sticky nav fonctionne au scroll (fond passe transparent → blanc/blur).
- [ ] Drawer mobile ouvre/ferme (DevTools mode mobile 375px).
- [ ] Toutes sections présentes dans l'ordre.
- [ ] FAQ accordéon ouvre/ferme avec clavier (Tab + Enter).
- [ ] Footer affiche 4 colonnes en lg, 2 en md, 1 en sm.
- [ ] Liens vers `/tarifs`, `/contact`, `/auth/signup` etc. → page 404 stylée.
- [ ] Console DevTools : aucune erreur.

- [ ] **Step 5: Push**

```bash
git push origin main
```

Vérifier : workflow CI démarre, tous jobs verts (`quality`, `e2e`, `lighthouse`).

- [ ] **Step 6: Si CI rouge**

Lire les logs du job en échec, corriger localement, re-commit, re-push. Ne pas merger / push sans CI vert.

---

## Self-review checklist (à dérouler après écriture du plan)

**Spec coverage — chaque section spec → tâche :**

| Spec §                                             | Couvert par                                                                                        |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| §2 in-scope tokens + 5 primitives                  | Tasks 2, 5–9                                                                                       |
| §2 in-scope page `/` (8 sections)                  | Tasks 13–19                                                                                        |
| §2 in-scope layout root + (marketing)              | Tasks 4, 10, 19                                                                                    |
| §2 in-scope pages erreur                           | Task 20                                                                                            |
| §2 in-scope SEO (metadata, robots, sitemap)        | Tasks 19, 20, 21                                                                                   |
| §2 in-scope polices self-hostées                   | Task 4                                                                                             |
| §2 in-scope responsive mobile-first                | Tasks 11, 13–18                                                                                    |
| §2 in-scope a11y WCAG 2.1 AA                       | Tasks 5 (focus), 11 (aria), 18 (aria-expanded), 19 (skip link), 24 (a11y test)                     |
| §2 in-scope smoke Playwright + axe                 | Task 10                                                                                            |
| §2 in-scope Lighthouse CI                          | Tasks 22, 23                                                                                       |
| §3 décisions cadrage                               | Respectées (Tailwind v4 CSS-first, palette Vibrant Afro, route group, components/ui dans apps/web) |
| §4 archi fichiers                                  | File Structure (haut du plan)                                                                      |
| §5 design system tokens                            | Task 2                                                                                             |
| §5 règles contraste (Button size sm font-semibold) | Task 5                                                                                             |
| §6 chaque section landing                          | Tasks 13–18                                                                                        |
| §7 routing & SEO (canonical, og, hreflang fr_SN)   | Task 19                                                                                            |
| §8 responsive + skip link + focus rings            | Tasks 5, 11, 19                                                                                    |
| §9 perf (preload, next/image, RSC)                 | Tasks 4, 13, 16                                                                                    |
| §10 critères "done"                                | Task 25                                                                                            |

**Placeholders identifiés et explicitement marqués :**

- WhatsApp `+221 00 000 00 00` (Task 12) — V1 placeholder, à remplacer Phase 9.
- Email `contact@molopilot.com` (Task 12) — à valider domaine prod.
- OG image (Task 20) — placeholder gradient + texte, design pro V2.
- Logo mark SVG (Task 9) — géométrique placeholder, à redessiner avec un graphiste V2.

**Type consistency vérifiée :**

- `Button.variant`, `Button.size`, `asChild` cohérents Tasks 5, 11, 13, 17, 19, 20.
- `Container.width` utilisé `narrow` Tasks 17, 18, 20.
- `Section.bg` valeurs `default | accent | dark` cohérentes Tasks 14, 15, 16, 17, 18.
- `Heading.as` / `size` cohérents toutes utilisations.

**Aucune référence à fonction/type non défini.**

---

## Notes finales

- Plan focal sur **livrer page `/` + design system**. Toutes autres routes (`/tarifs`, `/contact`, `/mentions-legales`, `/auth/*`) = 404 stylée jusqu'à plan correspondant. Comportement attendu, pas un bug.
- Si `pnpm --filter @molopilot/web e2e` échoue avec "browser not found" sur Windows : `pnpm exec playwright install chromium` (sans `--with-deps`, qui est Linux-only).
- Pour l'OG image, ImageMagick n'est pas un prérequis dur : tout PNG 1200×630 fait l'affaire en V1.
