'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { useUserProgressStore } from '@/stores';

export function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { progress } = useUserProgressStore();
  
  // Don't add bottom padding during onboarding or on learn/settings pages
  const hasCompletedOnboarding = progress?.hasCompletedOnboarding ?? false;
  const isOnLearnPage = pathname === '/learn';
  const isOnSettingsPage = pathname === '/settings';
  const needsBottomPadding = hasCompletedOnboarding && !isOnLearnPage && !isOnSettingsPage;
  
  return (
    <div className={`min-h-screen bg-[#242424] ${needsBottomPadding ? 'pb-16' : ''}`}>
      {children}
    </div>
  );
}
