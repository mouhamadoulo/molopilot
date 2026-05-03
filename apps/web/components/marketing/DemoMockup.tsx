import Image from 'next/image';

import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';

export function DemoMockup() {
  return (
    <Section pad="lg" bg="dark" id="demo">
      <Container>
        <div className="text-center">
          <Heading as="h2" size="3xl" className="text-white sm:text-4xl">
            Voici à quoi ressemble une vente, online ou offline.
          </Heading>
          <p className="mt-4 text-lg text-white/80">Aucune vente perdue. Jamais.</p>
        </div>

        <div className="mt-12 flex justify-center">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-2 shadow-2xl">
            <Image
              src="/images/hero-mockup.svg"
              alt="Mockup de l'interface caisse Molopilot"
              width={960}
              height={540}
              className="rounded-xl"
            />
            <div className="absolute -top-3 -right-3 rounded-full bg-success-500 px-4 py-1 text-sm font-semibold text-white shadow-lg">
              Synchronisé ✓
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
