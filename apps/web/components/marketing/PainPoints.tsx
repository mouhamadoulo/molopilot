import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';

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
