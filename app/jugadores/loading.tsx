export default function JugadoresLoading() {
  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <div className="skeleton h-7 w-36 mb-2" />
        <div className="skeleton h-4 w-56 mb-6" />

        {/* Search bar skeleton */}
        <div className="skeleton h-11 w-full rounded-xl mb-4" />

        {/* Filter pills */}
        <div className="flex gap-2 mb-2 overflow-hidden">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="skeleton h-8 w-20 rounded-full shrink-0" />
          ))}
        </div>
        <div className="flex gap-2 mb-6 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-8 w-28 rounded-full shrink-0" />
          ))}
        </div>

        {/* Player count */}
        <div className="skeleton h-3 w-24 mb-4" />

        {/* Player cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-4 flex items-center gap-3" style={{ opacity: 1 - i * 0.05 }}>
              <div className="skeleton h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-32" />
                <div className="flex gap-2">
                  <div className="skeleton h-3 w-16" />
                  <div className="skeleton h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
