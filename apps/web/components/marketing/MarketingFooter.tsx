import Link from 'next/link';

import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';

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
