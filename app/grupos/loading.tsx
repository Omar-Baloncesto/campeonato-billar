export default function GruposLoading() {
  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <div className="skeleton h-7 w-56 mb-2" />
        <div className="skeleton h-4 w-72 mb-6" />

        {/* Filter pills skeleton */}
        <div className="flex gap-2 mb-4">
          {['Fase de Grupos', 'Ranking General'].map((label, i) => (
            <div key={i} className="skeleton h-9 rounded-full" style={{ width: `${label.length * 8 + 24}px` }} />
          ))}
        </div>
        <div className="flex gap-2 mb-6 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-8 w-16 rounded-full shrink-0" />
          ))}
        </div>

        {/* Group tables skeleton */}
        {Array.from({ length: 3 }).map((_, g) => (
          <div key={g} className="mb-6" style={{ opacity: 1 - g * 0.2 }}>
            <div className="bg-bg-secondary rounded-xl overflow-hidden border border-border-light">
              {/* Group header */}
              <div className="bg-bg-header px-5 py-3.5 flex items-center gap-3">
                <div className="skeleton h-4 w-20" />
                <div className="skeleton h-3 w-32 ml-auto" />
              </div>
              {/* Table header */}
              <div className="flex gap-4 px-5 py-2.5 border-b border-border-subtle">
                <div className="skeleton h-3 w-6" />
                <div className="skeleton h-3 w-32" />
                <div className="skeleton h-3 w-8 ml-auto" />
                <div className="skeleton h-3 w-8" />
                <div className="skeleton h-3 w-8" />
                <div className="skeleton h-3 w-8" />
              </div>
              {/* Table rows */}
              {Array.from({ length: 4 }).map((_, r) => (
                <div key={r} className="flex items-center gap-4 px-5 py-3.5 border-b border-border-subtle" style={{ opacity: 1 - r * 0.1 }}>
                  <div className="skeleton h-6 w-6 rounded-full shrink-0" />
                  <div className="skeleton h-4 flex-1 max-w-[160px]" />
                  <div className="skeleton h-4 w-8 shrink-0 ml-auto" />
                  <div className="skeleton h-4 w-8 shrink-0" />
                  <div className="skeleton h-4 w-10 shrink-0" />
                  <div className="skeleton h-4 w-8 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
