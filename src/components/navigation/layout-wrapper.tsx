'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // All pages have padding for bottom nav
  const paddingClass = 'pb-16';
  
  return (
    <div className={paddingClass}>
      {children}
    </div>
  );
}
