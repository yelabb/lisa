'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirection directe vers l'écran d'apprentissage
    router.push('/learn');
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-gray-400 text-sm">Chargement...</div>
    </div>
  );
}
