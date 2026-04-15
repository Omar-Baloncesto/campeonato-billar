'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '../lib/theme';
import Header from './Header';
import Navigation from './Navigation';
import MobileMenu from './MobileMenu';
import ScrollToTop from './ScrollToTop';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <ThemeProvider>
      <div className="sticky top-0 z-40">
        <Header
          isMenuOpen={isMenuOpen}
          onMenuToggle={() => setIsMenuOpen((prev) => !prev)}
        />
        <Navigation />
      </div>
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        pathname={pathname}
      />
      {children}
      <ScrollToTop />
    </ThemeProvider>
  );
}
