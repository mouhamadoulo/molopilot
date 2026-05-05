import type { ReactNode } from 'react';

import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { MarketingNav } from '@/components/marketing/MarketingNav';

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
