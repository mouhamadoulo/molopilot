import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';

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
