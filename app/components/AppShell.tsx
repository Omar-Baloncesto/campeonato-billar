'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Navigation from './Navigation';
import MobileMenu from './MobileMenu';
import ScrollToTop from './ScrollToTop';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <Header
        isMenuOpen={isMenuOpen}
        onMenuToggle={() => setIsMenuOpen((prev) => !prev)}
      />
      <Navigation />
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        pathname={pathname}
      />
      {children}
      <ScrollToTop />
    </>
  );
}
