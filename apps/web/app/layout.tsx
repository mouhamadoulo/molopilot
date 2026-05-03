import type { Metadata } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';

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
