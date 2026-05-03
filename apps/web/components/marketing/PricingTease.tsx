import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';

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
