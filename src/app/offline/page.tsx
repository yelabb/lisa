'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LisaCompanion } from '@/components/lisa';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OfflinePage() {
  const router = useRouter();

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <WifiOff className="w-24 h-24 mx-auto mb-6 text-gray-400" />
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            You're Offline
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Looks like your internet connection is having a little nap! 😴
          </p>
        </div>

        <LisaCompanion
          mood="thinking"
          message="Don't worry! Check your internet connection and we'll be back to reading in no time!"
          size="lg"
        />

        <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <h3 className="font-bold text-gray-800 mb-3">What you can do:</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span>📡</span>
              <span>Check your Wi-Fi or mobile data connection</span>
            </li>
            <li className="flex items-start gap-2">
              <span>🔄</span>
              <span>Try refreshing the page once you're back online</span>
            </li>
            <li className="flex items-start gap-2">
              <span>📖</span>
              <span>Your saved progress is safe and will be here when you return!</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-4 mt-8">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleGoHome}
          >
            <Home className="mr-2" size={16} />
            Go Home
          </Button>
          <Button
            className="flex-1"
            onClick={handleRetry}
          >
            <RefreshCw className="mr-2" size={16} />
            Try Again
          </Button>
        </div>
      </Card>
    </div>
  );
}
