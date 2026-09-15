import type { GroupResult } from '../data/types';
import { fmtInt, fmtAvg, fmtPct, EMPTY } from '../lib/format';

const GROUP_COLORS = [
  '#10b981', '#f59e0b', '#3b82f6', '#a855f7', '#06b6d4',
  '#ec4899', '#f97316', '#f43f5e', '#84cc16', '#8b5cf6', '#14b8a6',
];

function groupColor(group: number): string {
  return GROUP_COLORS[(group - 1 + GROUP_COLORS.length) % GROUP_COLORS.length];
}

const STATUS_STYLE: Record<GroupResult['status'], { label: string; className: string }> = {
  played: { label: 'Finalizado', className: 'bg-emerald-500/10 text-emerald-400' },
  pending: { label: 'Sin jugar', className: 'bg-white/5 text-text-muted' },
  draw: { label: 'Empate', className: 'bg-yellow-500/15 text-yellow-400' },
  walkover: { label: 'W.O.', className: 'bg-red-500/15 text-red-400' },
};

function PlayerRow({
  name, carambolas, entries, average, target, pct, isWinner, showPct, dim,
}: {
  name: string;
  carambolas: number | null;
  entries: number | null;
  average: number | null;
  target: number | null;
  pct: number | null;
  isWinner: boolean;
  showPct: boolean;
  dim: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
      style={{
        background: isWinner ? 'rgba(16, 185, 129, 0.08)' : 'var(--row-bg, rgba(255,255,255,0.02))',
        border: isWinner ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--color-border-light)',
      }}
    >
      <div className={`flex-1 min-w-0 ${dim ? 'opacity-70' : ''}`}>
        <div className={`text-sm font-semibold truncate ${isWinner ? 'text-text-primary' : 'text-text-muted'}`}>
          {name}
        </div>
        {target !== null && (
          <div className="text-[9px] text-text-muted/60 tabular-nums">objetivo {target}</div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs font-mono shrink-0 tabular-nums">
        <span className={`w-8 text-center font-bold ${isWinner ? 'text-emerald-400' : 'text-text-muted'}`}>
          {fmtInt(carambolas)}
        </span>
        <span className="text-text-muted/80 w-8 text-center">{fmtInt(entries)}</span>
        <span className="text-text-muted/80 w-12 text-center">{fmtAvg(average)}</span>
        {showPct && (
          <span className={`w-14 text-right ${isWinner ? 'text-emerald-400 font-bold' : 'text-text-muted/80'}`}>
            {fmtPct(pct)}
          </span>
        )}
      </div>

      <span className="w-5 shrink-0 flex justify-center">
        {isWinner && (
          <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <span className="text-[8px] font-black text-white">W</span>
          </span>
        )}
      </span>
    </div>
  );
}

export default function MatchResultCard({ result }: { result: GroupResult }) {
  const winnerA = result.winner !== '' && result.winner === result.playerA;
  const winnerB = result.winner !== '' && result.winner === result.playerB;
  const pending = result.status === 'pending';
  const status = STATUS_STYLE[result.status];

  // El % de objetivo solo aporta cuando de verdad hay objetivo y
  // hay carambolas con las que compararlo.
  const showPct =
    !pending &&
    result.targetA !== null &&
    result.targetB !== null &&
    (result.pctA !== null || result.pctB !== null);

  const decidedByHandicap =
    showPct &&
    result.targetA !== result.targetB &&
    result.carambolasA !== null &&
    result.carambolasB !== null &&
    ((winnerA && result.carambolasA < result.carambolasB) ||
      (winnerB && result.carambolasB < result.carambolasA));

  return (
    <div
      className={`glass-card rounded-xl p-3.5 glow-hover ${pending ? 'opacity-60' : ''}`}
      style={{ borderLeft: `3px solid ${groupColor(result.group)}` }}
    >
      <div className="flex items-center justify-between mb-2.5 gap-2">
        <span className="text-[11px] text-text-muted tracking-wider uppercase">
          Grupo {result.group} · Partido {result.match}
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${status.className}`}>
          {status.label}
        </span>
      </div>

      <div className="flex gap-2 text-[9px] text-text-muted/80 mb-1.5 px-3 font-medium uppercase tracking-wider">
        <span className="flex-1">Jugador</span>
        <span className="w-8 text-center">Car</span>
        <span className="w-8 text-center">Ent</span>
        <span className="w-12 text-center">Prom</span>
        {showPct && <span className="w-14 text-right">% Obj</span>}
        <span className="w-5" />
      </div>

      <div className="space-y-1.5">
        <PlayerRow
          name={result.playerA}
          carambolas={result.carambolasA}
          entries={result.entriesA}
          average={result.averageA}
          target={result.targetA}
          pct={result.pctA}
          isWinner={winnerA}
          showPct={showPct}
          dim={pending}
        />
        <PlayerRow
          name={result.playerB}
          carambolas={result.carambolasB}
          entries={result.entriesB}
          average={result.averageB}
          target={result.targetB}
          pct={result.pctB}
          isWinner={winnerB}
          showPct={showPct}
          dim={pending}
        />
      </div>

      {decidedByHandicap && (
        <p className="text-[10px] text-text-muted/70 mt-2 px-1 leading-snug">
          Gana <span className="text-emerald-400 font-semibold">{result.winner}</span> con menos
          carambolas: su objetivo es más alto, así que cuenta el porcentaje conseguido.
        </p>
      )}

      {result.status === 'draw' && (
        <p className="text-[10px] text-text-muted/70 mt-2 px-1">
          Los dos consiguieron el mismo porcentaje de su objetivo: 1 punto para cada uno.
        </p>
      )}

      {pending && result.rawResult === '' && (
        <p className="text-[10px] text-text-muted/50 mt-2 px-1">
          Pendiente de disputar. {EMPTY} indica que aún no hay dato.
        </p>
      )}
    </div>
  );
}
