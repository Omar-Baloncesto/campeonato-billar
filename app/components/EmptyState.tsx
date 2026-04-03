interface EmptyStateProps {
  message: string;
  onReset?: () => void;
}

export default function EmptyState({ message, onReset }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="glass-card rounded-2xl px-8 py-10 text-center max-w-sm">
        <div className="text-5xl mb-4">&#127921;</div>
        <p className="text-text-muted text-sm mb-5">{message}</p>
        {onReset && (
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-lg bg-emerald/15 text-emerald-400 text-sm font-medium
                       hover:bg-emerald/25 transition-colors cursor-pointer active:scale-95"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
