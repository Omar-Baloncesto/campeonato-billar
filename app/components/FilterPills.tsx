'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface FilterPillsProps {
  items: { key: string; label: string; color?: string }[];
  active: string;
  onChange: (key: string) => void;
  variant?: 'solid' | 'outline';
}

export default function FilterPills({ items, active, onChange, variant = 'solid' }: FilterPillsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkOverflow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 4);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkOverflow();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkOverflow, { passive: true });
    window.addEventListener('resize', checkOverflow);
    return () => {
      el.removeEventListener('scroll', checkOverflow);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [checkOverflow, items]);

  return (
    <div className="relative" role="tablist" aria-label="Filtros">
      {/* Left fade */}
      {showLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-bg-primary to-transparent z-10 pointer-events-none rounded-l" />
      )}
      {/* Right fade */}
      {showRight && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-bg-primary to-transparent z-10 pointer-events-none rounded-r" />
      )}

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide py-0.5"
      >
        {items.map((item) => {
          const isActive = active === item.key;
          const color = item.color || '#10b981';

          if (variant === 'outline') {
            return (
              <button
                key={item.key}
                onClick={() => onChange(item.key)}
                role="tab"
                aria-selected={isActive}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-150 shrink-0 active:scale-95"
                style={{
                  border: isActive ? `2px solid ${color}` : '2px solid transparent',
                  background: isActive ? color + '20' : 'var(--color-bg-secondary)',
                  color: isActive ? color : 'var(--color-text-muted)',
                }}
              >
                {item.label}
              </button>
            );
          }

          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              role="tab"
              aria-selected={isActive}
              className={`
                px-3.5 py-1.5 rounded-full border-none text-xs font-medium cursor-pointer
                transition-all duration-150 shrink-0 active:scale-95
                ${isActive
                  ? 'bg-emerald text-bg-primary'
                  : 'bg-bg-secondary text-text-muted hover:text-emerald/80'
                }
              `}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
