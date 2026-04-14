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
        relative border-b border-emerald/30
        transition-shadow duration-300
        ${scrolled ? 'shadow-lg shadow-black/30' : ''}
      `}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1f15] via-bg-secondary to-[#0a1f15]" />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald/[0.04] to-transparent" />
      </div>

      <div className="relative px-3 py-2.5 md:px-7 md:py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 md:gap-4 no-underline group">
          {/* Billiard balls icon - professional style */}
          <div className="relative">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3), inset 0 2px 4px rgba(255,255,255,0.1)',
              }}
            >
              <svg viewBox="0 0 40 40" className="w-6 h-6 md:w-8 md:h-8" fill="none">
                {/* Main ball */}
                <circle cx="20" cy="20" r="16" fill="white" opacity="0.15" />
                <circle cx="20" cy="20" r="14" stroke="white" strokeWidth="1.5" opacity="0.9" />
                {/* Number circle */}
                <circle cx="20" cy="17" r="6" fill="white" opacity="0.95" />
                {/* Number 3 */}
                <text x="20" y="20" textAnchor="middle" fill="#059669" fontSize="9" fontWeight="900" fontFamily="system-ui">3</text>
                {/* Stripe */}
                <path d="M6 20 Q20 12 34 20 Q20 28 6 20" fill="white" opacity="0.15" />
              </svg>
            </div>
            {/* Small red ball accent */}
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 md:w-5 md:h-5 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
              }}
            />
          </div>

          <div>
            <h1 className="text-lg md:text-2xl font-black tracking-[0.15em] text-white uppercase">
              {APP_CONFIG.title}
            </h1>
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 max-w-[30px] bg-gradient-to-r from-emerald-400 to-transparent" />
              <p className="text-[10px] md:text-xs text-emerald-400/80 tracking-[0.2em] uppercase font-semibold">
                {APP_CONFIG.subtitle}
              </p>
              <div className="h-px flex-1 max-w-[30px] bg-gradient-to-l from-emerald-400 to-transparent" />
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Year badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald/20 bg-emerald/5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-400 tracking-wider">{APP_CONFIG.year}</span>
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
