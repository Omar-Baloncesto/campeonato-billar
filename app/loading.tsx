export default function DashboardLoading() {
  return (
    <div className="animate-fade-in">
      {/* Stats bar */}
      <div className="px-4 py-6 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-4 text-center">
              <div className="skeleton h-8 w-8 rounded-full mx-auto mb-2" />
              <div className="skeleton h-8 w-14 mx-auto mb-2" />
              <div className="skeleton h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Champion highlight skeleton */}
      <div className="px-4 pb-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl p-6 md:p-8 text-center border border-border-subtle" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="skeleton h-12 w-12 rounded-full mx-auto mb-3" />
            <div className="skeleton h-3 w-20 mx-auto mb-3" />
            <div className="skeleton h-7 w-48 mx-auto mb-3" />
            <div className="skeleton h-4 w-36 mx-auto" />
          </div>
        </div>
      </div>

      {/* Podium skeleton */}
      <div className="px-4 pb-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="skeleton h-4 w-24 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-4 text-center">
                <div className="skeleton h-8 w-8 rounded-full mx-auto mb-2" />
                <div className="skeleton h-4 w-24 mx-auto mb-1" />
                <div className="skeleton h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cities skeleton */}
      <div className="px-4 pb-8 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="skeleton h-4 w-36 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-card rounded-lg p-3 flex items-center gap-2" style={{ opacity: 1 - i * 0.08 }}>
                <div className="skeleton h-2.5 w-2.5 rounded-full shrink-0" />
                <div className="skeleton h-3 flex-1 max-w-[80px]" />
                <div className="skeleton h-4 w-6 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links skeleton */}
      <div className="px-4 pb-8 md:px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-4 text-center">
              <div className="skeleton h-8 w-8 rounded-full mx-auto mb-2" />
              <div className="skeleton h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
