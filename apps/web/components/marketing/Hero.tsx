import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';

export function Hero() {
  return (
    <section className="bg-gradient-to-br from-primary-500 to-accent-500 py-24 text-white">
      <Container>
        <Heading as="h1" size="4xl" className="text-white sm:text-6xl">
          Pilotez votre établissement, même sans réseau.
        </Heading>
      </Container>
    </section>
  );
}
