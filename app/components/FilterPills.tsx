interface FilterPillsProps {
  items: { key: string; label: string; color?: string }[];
  active: string;
  onChange: (key: string) => void;
  variant?: 'solid' | 'outline';
}

export default function FilterPills({ items, active, onChange, variant = 'solid' }: FilterPillsProps) {
  return (
    <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Filtros">
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
              className="px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-150"
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
              transition-all duration-150
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
  );
}
