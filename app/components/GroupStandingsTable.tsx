import type { GroupData } from '../data/types';

function getMedal(pos: number) {
  if (pos === 1) return <span className="medal-gold">1</span>;
  if (pos === 2) return <span className="medal-silver">2</span>;
  return <span className="text-text-muted">{pos}</span>;
}

export default function GroupStandingsTable({ group }: { group: GroupData }) {
  const hasP3 = group.standings.some(s => s.caP3 !== null);

  return (
    <div className="glass-card rounded-xl overflow-hidden glow-hover">
      <div className="bg-bg-header px-4 py-3 border-b border-border-light">
        <h3 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">
          Grupo {group.number}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-text-muted/70 border-b border-border-subtle">
              <th className="px-3 py-2.5 text-left font-semibold w-8">#</th>
              <th className="px-3 py-2.5 text-left font-semibold min-w-[140px]">Jugador</th>
              <th className="px-2 py-2.5 text-center font-semibold">CA</th>
              <th className="px-2 py-2.5 text-center font-semibold">CR</th>
              <th className="px-2 py-2.5 text-center font-semibold">Dif</th>
              <th className="px-2 py-2.5 text-center font-semibold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {group.standings.map((s, i) => (
              <tr
                key={i}
                className={`table-row-hover border-b border-border-subtle ${s.groupOrder <= 2 ? 'bg-emerald/[0.04]' : ''}`}
              >
                <td className="px-3 py-2.5 font-bold">{getMedal(s.groupOrder)}</td>
                <td className="px-3 py-2.5 font-semibold text-text-primary">{s.player}</td>
                <td className="px-2 py-2.5 text-center font-mono text-emerald-400">{s.totalCA}</td>
                <td className="px-2 py-2.5 text-center font-mono text-text-muted">{s.totalCR}</td>
                <td className={`px-2 py-2.5 text-center font-mono font-bold ${s.differential > 0 ? 'text-positive' : s.differential < 0 ? 'text-negative' : 'text-text-muted'}`}>
                  {s.differential > 0 ? '+' : ''}{s.differential}
                </td>
                <td className="px-2 py-2.5 text-center font-mono font-bold text-text-primary">{s.totalPts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detailed view - hidden on small screens */}
      <details className="border-t border-border-subtle">
        <summary className="px-4 py-2 text-[11px] text-text-muted cursor-pointer hover:text-emerald-400 transition-colors">
          Ver detalle por partido
        </summary>
        <div className="overflow-x-auto px-2 pb-3">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-text-muted/60">
                <th className="px-2 py-1.5 text-left">Jugador</th>
                <th className="px-1.5 py-1.5 text-center">CA1</th>
                <th className="px-1.5 py-1.5 text-center">CA2</th>
                {hasP3 && <th className="px-1.5 py-1.5 text-center">CA3</th>}
                <th className="px-1.5 py-1.5 text-center">Tot</th>
                <th className="px-1.5 py-1.5 text-center">P1</th>
                <th className="px-1.5 py-1.5 text-center">P2</th>
                {hasP3 && <th className="px-1.5 py-1.5 text-center">P3</th>}
                <th className="px-1.5 py-1.5 text-center">Pts</th>
              </tr>
            </thead>
            <tbody>
              {group.standings.map((s, i) => (
                <tr key={i} className="border-t border-border-subtle/50">
                  <td className="px-2 py-1.5 font-medium">{s.player}</td>
                  <td className="px-1.5 py-1.5 text-center font-mono">{s.caP1}</td>
                  <td className="px-1.5 py-1.5 text-center font-mono">{s.caP2}</td>
                  {hasP3 && <td className="px-1.5 py-1.5 text-center font-mono">{s.caP3 ?? '-'}</td>}
                  <td className="px-1.5 py-1.5 text-center font-mono font-bold text-emerald-400">{s.totalCA}</td>
                  <td className="px-1.5 py-1.5 text-center font-mono">{s.ptsP1}</td>
                  <td className="px-1.5 py-1.5 text-center font-mono">{s.ptsP2}</td>
                  {hasP3 && <td className="px-1.5 py-1.5 text-center font-mono">{s.ptsP3 ?? '-'}</td>}
                  <td className="px-1.5 py-1.5 text-center font-mono font-bold">{s.totalPts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
