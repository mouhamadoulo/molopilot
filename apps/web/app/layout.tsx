import type { ReactNode } from 'react';

export const metadata = {
  title: 'Molopilot',
  description: 'Gestion d’établissements pour resto, café, boutique',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
