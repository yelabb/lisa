'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Learn page needs extra padding for reading controls above bottom nav
  const paddingClass = pathname === '/learn' ? 'pb-32' : 'pb-16';
  
  return (
    <div className={paddingClass}>
      {children}
    </div>
  );
}
