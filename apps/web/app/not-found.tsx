import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center py-20">
      <Container width="narrow">
        <div className="text-center">
          <p className="font-display text-7xl font-extrabold text-primary-500">404</p>
          <Heading as="h1" size="3xl" className="mt-4">
            Page introuvable
          </Heading>
          <p className="mt-4 text-lg text-neutral-600">
            La page que vous cherchez n&apos;existe pas ou a été déplacée.
          </p>
          <div className="mt-8">
            <Button variant="primary" size="lg" asChild>
              <Link href="/">Retour à l&apos;accueil</Link>
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
