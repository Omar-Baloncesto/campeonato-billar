export default function ConfiguracionLoading() {
  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <div className="skeleton h-7 w-56 mb-6" />

        {/* Config cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, c) => (
            <div key={c} className="glass-card rounded-xl overflow-hidden">
              {/* Card header */}
              <div className="bg-bg-header px-4 py-3 border-b border-border-light flex items-center gap-2">
                <div className="skeleton h-5 w-5 rounded" />
                <div className="skeleton h-4 w-28" />
              </div>
              {/* Card rows */}
              <div className="p-4">
                {Array.from({ length: c < 2 ? 4 : 3 }).map((_, r) => (
                  <div key={r} className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-0">
                    <div className="skeleton h-3.5 w-32" />
                    <div className="skeleton h-3.5 w-12" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Cities section */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="bg-bg-header px-4 py-3 border-b border-border-light">
            <div className="skeleton h-4 w-40" />
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg" style={{ opacity: 1 - i * 0.08 }}>
                  <div className="skeleton h-3 w-3 rounded-full shrink-0" />
                  <div className="skeleton h-3.5 flex-1 max-w-[120px]" />
                  <div className="skeleton h-3.5 w-6 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
