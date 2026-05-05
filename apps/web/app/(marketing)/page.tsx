import type { Metadata } from 'next';

import { DemoMockup } from '@/components/marketing/DemoMockup';
import { Faq } from '@/components/marketing/Faq';
import { Features } from '@/components/marketing/Features';
import { Hero } from '@/components/marketing/Hero';
import { PainPoints } from '@/components/marketing/PainPoints';
import { PricingTease } from '@/components/marketing/PricingTease';

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
