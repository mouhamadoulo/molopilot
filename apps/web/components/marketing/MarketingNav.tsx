'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
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
