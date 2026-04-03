'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { APP_CONFIG } from '../lib/constants';

interface HeaderProps {
  isMenuOpen?: boolean;
  onMenuToggle?: () => void;
}

export default function Header({ isMenuOpen = false, onMenuToggle }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`
        sticky top-0 z-40 relative border-b-2 border-emerald
        transition-shadow duration-300
        ${scrolled ? 'shadow-lg shadow-black/20' : ''}
      `}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-bg-secondary via-bg-secondary to-[#1a3828]" />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald/[0.03] to-transparent" />
      </div>

      <div className="relative px-3 py-2 md:px-7 md:py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 md:gap-3 no-underline group">
          {/* Billiard ball SVG icon */}
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-shadow">
            <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-7 md:h-7 text-white/90" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <ellipse cx="12" cy="10" rx="4" ry="3.5" />
              <circle cx="12" cy="10" r="2" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div>
            <h1 className="text-base md:text-2xl font-bold gradient-text tracking-wider">
              {APP_CONFIG.title}
            </h1>
            <p className="text-[10px] md:text-xs text-text-muted tracking-wide">
              {APP_CONFIG.subtitle}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <div
            className="bg-emerald/20 text-emerald text-[10px] md:text-[11px] font-bold px-2 md:px-3 py-1 rounded-full tracking-wider flex items-center gap-1.5 border border-emerald/30"
            role="status"
          >
            FINALIZADO
          </div>

          {/* Hamburger button - mobile only */}
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className={`md:hidden relative p-2 ml-1 text-text-primary hover:text-emerald transition-colors ${isMenuOpen ? 'hamburger-open' : ''}`}
              aria-label={isMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
              aria-expanded={isMenuOpen}
            >
              <div className="flex flex-col gap-[5px]">
                <span className="hamburger-line" />
                <span className="hamburger-line" />
                <span className="hamburger-line" />
              </div>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
