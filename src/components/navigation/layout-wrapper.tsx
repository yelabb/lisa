'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // All pages have padding for bottom nav with matching dark background
  return (
    <div className="min-h-screen pb-16 bg-[#242424]">
      {children}
    </div>
  );
}
