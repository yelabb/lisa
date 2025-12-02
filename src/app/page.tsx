'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function Home() {
  const router = useRouter();
  const t = useTranslations('common');

  useEffect(() => {
    // Redirection directe vers l'écran d'apprentissage
    router.push('/learn');
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-gray-400 text-sm">{t('loading')}</div>
    </div>
  );
}
