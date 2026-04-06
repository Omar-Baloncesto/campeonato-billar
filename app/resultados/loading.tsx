export default function ResultadosLoading() {
  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <div className="skeleton h-7 w-64 mb-2" />
        <div className="skeleton h-4 w-48 mb-6" />

        {/* Filter pills */}
        <div className="flex gap-2 mb-6 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-8 w-20 rounded-full shrink-0" />
          ))}
        </div>

        {/* Match count */}
        <div className="skeleton h-3 w-28 mb-4" />

        {/* Match cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl overflow-hidden border-l-4 border-border-subtle" style={{ opacity: 1 - i * 0.08 }}>
              {/* Match header */}
              <div className="px-4 py-2.5 bg-bg-header flex items-center gap-2">
                <div className="skeleton h-3 w-16" />
                <div className="skeleton h-3 w-20 ml-auto" />
              </div>
              {/* Players */}
              <div className="p-4 space-y-3">
                {Array.from({ length: 2 }).map((_, p) => (
                  <div key={p} className="flex items-center gap-3">
                    <div className="skeleton h-4 flex-1 max-w-[120px]" />
                    <div className="skeleton h-5 w-8 shrink-0" />
                    <div className="skeleton h-3 w-6 shrink-0" />
                    <div className="skeleton h-3 w-12 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
