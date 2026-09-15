export default function StatCard({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="glass-card rounded-lg p-3 text-center glow-hover">
      <div className={`text-lg md:text-xl font-black tabular-nums ${accent ? 'text-[#F5B800]' : 'text-emerald-400'}`}>
        {value}
      </div>
      <div className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">{label}</div>
      {hint && <div className="text-[9px] text-text-muted/60 mt-0.5 truncate">{hint}</div>}
    </div>
  );
}
