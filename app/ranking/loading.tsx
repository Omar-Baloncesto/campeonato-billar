export default function RankingLoading() {
  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <div className="skeleton h-7 w-40 mb-2" />
        <div className="skeleton h-4 w-64 mb-6" />

        {/* Tab pills */}
        <div className="flex gap-2 mb-6">
          <div className="skeleton h-9 w-28 rounded-full" />
          <div className="skeleton h-9 w-32 rounded-full" />
        </div>

        {/* Ranking table skeleton */}
        <div className="bg-bg-secondary rounded-xl overflow-hidden border border-border-light">
          {/* Table header */}
          <div className="bg-bg-header px-5 py-3.5 flex gap-6">
            <div className="skeleton h-3.5 w-6" />
            <div className="skeleton h-3.5 w-28" />
            <div className="skeleton h-3.5 w-24 ml-auto" />
            <div className="skeleton h-3.5 w-16" />
          </div>
          {/* Table rows */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-5 py-3.5 border-b border-border-subtle"
              style={{ opacity: 1 - i * 0.06 }}
            >
              <div className="skeleton h-6 w-6 rounded-full shrink-0" />
              <div className="skeleton h-4 flex-1 max-w-[180px]" />
              <div className="skeleton h-4 w-20 shrink-0 ml-auto" />
              <div className="skeleton h-4 w-16 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
