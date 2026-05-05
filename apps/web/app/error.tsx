'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center py-20">
      <Container width="narrow">
        <div className="text-center">
          <Heading as="h1" size="3xl">
            Une erreur est survenue
          </Heading>
          <p className="mt-4 text-lg text-neutral-600">
            Quelque chose s&apos;est mal passé. Réessayez dans un instant.
          </p>
          <div className="mt-8">
            <Button variant="primary" size="lg" onClick={() => reset()}>
              Réessayer
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
