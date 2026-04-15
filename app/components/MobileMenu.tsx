'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { NAV_ITEMS } from '../lib/constants';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
}

export default function MobileMenu({ isOpen, onClose, pathname }: MobileMenuProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación"
      className="fixed inset-0 z-[9999]"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 mobile-menu-overlay bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <nav
        className="absolute top-0 right-0 h-full w-[85vw] max-w-[320px] bg-bg-secondary border-l border-border-light mobile-menu-panel flex flex-col"
      >
        {/* Close area / header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle">
          <span className="text-base font-bold text-text-primary tracking-wider uppercase">Menú</span>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Cerrar menú"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto py-3">
          {NAV_ITEMS.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-4 px-6 py-5 transition-colors duration-150 no-underline
                    ${isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-400'
                      : 'text-text-primary hover:bg-text-muted/10 border-l-4 border-transparent'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className={`text-base ${isActive ? 'font-bold' : 'font-semibold'}`}>{item.label}</span>
                </Link>
                {index < NAV_ITEMS.length - 1 && (
                  <div className="border-b border-border-subtle" />
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
