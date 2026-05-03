import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 to-accent-500 text-white">
      <Container>
        <div className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:py-32">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white backdrop-blur">
              🇸🇳 Pour resto · café · boutique
            </span>

            <Heading
              as="h1"
              size="4xl"
              className="mt-6 text-white sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              Pilotez votre établissement,{' '}
              <span className="text-accent-200">même sans réseau.</span>
            </Heading>

            <p className="mt-6 text-lg text-white/90 sm:text-xl">
              Caisse, stock et rapports — pensé pour les commerces du Sénégal. Fonctionne offline,
              synchro dès que la 4G revient.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="primary"
                size="lg"
                asChild
                className="bg-white text-primary-700 hover:bg-neutral-100"
              >
                <Link href="/auth/signup">Créer mon compte</Link>
              </Button>
              <Button variant="ghost" size="lg" asChild className="text-white hover:bg-white/10">
                <Link href="#fonctionnalites">Découvrir comment ça marche</Link>
              </Button>
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
              <li>Cash · Wave · Orange Money</li>
              <li>100% offline-first</li>
              <li>Hébergé en Europe</li>
            </ul>
          </div>

          <div className="hidden lg:block">
            <Image
              src="/images/hero-mockup.svg"
              alt="Capture interface caisse Molopilot avec validation de vente à 12 500 FCFA"
              width={480}
              height={360}
              priority
              className="drop-shadow-2xl"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
