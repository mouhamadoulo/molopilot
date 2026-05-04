'use client';

import { useState } from 'react';

import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
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
