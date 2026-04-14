'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '../lib/constants';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegacion principal"
      className="hidden md:flex bg-[#0d1f16]/90 backdrop-blur-md border-b border-white/5 overflow-x-auto"
    >
      <div className="flex gap-0 px-3 md:px-5 min-w-max">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative px-4 py-3 text-[13px] whitespace-nowrap
                flex items-center gap-2 transition-all duration-200
                ${isActive
                  ? 'text-emerald-400 font-bold'
                  : 'text-text-muted/80 hover:text-text-primary hover:bg-white/[0.03]'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-xs opacity-70">{item.icon}</span>
              {item.label}
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-emerald-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
