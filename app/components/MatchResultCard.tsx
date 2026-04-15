import type { GroupResult } from '../data/types';

const GROUP_BORDER_COLORS = [
  '#10b981', // emerald
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#a855f7', // purple
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#f97316', // orange
  '#f43f5e', // rose
  '#84cc16', // lime
  '#8b5cf6', // violet
  '#14b8a6', // teal
];

function getGroupColor(group: number): string {
  return GROUP_BORDER_COLORS[(group - 1) % GROUP_BORDER_COLORS.length];
}

function PlayerRow({
  name,
  carambolas,
  entries,
  average,
  isWinner,
  isWalkover,
}: {
  name: string;
  carambolas: number;
  entries: number;
  average: number;
  isWinner: boolean;
  isWalkover: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
      style={{
        background: isWinner
          ? 'rgba(16, 185, 129, 0.08)'
          : 'var(--row-bg, rgba(255,255,255,0.02))',
        border: isWinner
          ? '1px solid rgba(16, 185, 129, 0.2)'
          : '1px solid var(--color-border-light)',
      }}
    >
      {/* Player name */}
      <div
        className={`flex-1 text-sm font-semibold truncate ${
          isWinner ? 'text-text-primary' : 'text-text-muted'
        }`}
      >
        {name}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 text-xs font-mono shrink-0">
        <span
          className={`w-8 text-center font-bold ${
            isWinner ? 'text-emerald-400' : 'text-text-muted/60'
          }`}
        >
          {isWalkover && entries === 0 ? '-' : carambolas}
        </span>
        <span className="text-text-muted/40 w-8 text-center">
          {isWalkover && entries === 0 ? '-' : entries}
        </span>
        <span className="text-text-muted/40 w-12 text-center">
          {isWalkover && entries === 0 ? '-' : average.toFixed(3)}
        </span>
      </div>

      {/* Winner badge */}
      {isWinner && (
        <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
          <span className="text-[8px] font-black text-white">W</span>
        </span>
      )}
      {!isWinner && <span className="w-5 shrink-0" />}
    </div>
  );
}

export default function MatchResultCard({ result }: { result: GroupResult }) {
  const isEmpate = result.winner === 'EMPATE';
  const isWO = result.walkover;
  const winnerA = !isEmpate && !isWO && result.winner === result.playerA;
  const winnerB = !isEmpate && !isWO && result.winner === result.playerB;
  const woWinnerA = isWO && result.carambolasA > 0;
  const woWinnerB = isWO && result.carambolasB > 0;
  const borderColor = getGroupColor(result.group);

  return (
    <div
      className="glass-card rounded-xl p-3.5 glow-hover"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-text-muted tracking-wider uppercase">
            Grupo {result.group} · Partido {result.match}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {isEmpate && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 font-semibold">
              EMPATE
            </span>
          )}
          {isWO && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-semibold">
              W.O.
            </span>
          )}
          {!isEmpate && !isWO && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400/70 font-semibold">
              Finalizado
            </span>
          )}
        </div>
      </div>

      {/* Column headers */}
      <div className="flex gap-2 text-[9px] text-text-muted/40 mb-1.5 px-3 font-medium uppercase tracking-wider">
        <span className="flex-1">Jugador</span>
        <span className="w-8 text-center">Car</span>
        <span className="w-8 text-center">Ent</span>
        <span className="w-12 text-center">Prom</span>
        <span className="w-5" />
      </div>

      {/* Players */}
      <div className="flex flex-col gap-1.5">
        <PlayerRow
          name={result.playerA}
          carambolas={result.carambolasA}
          entries={result.entriesA}
          average={result.averageA}
          isWinner={winnerA || woWinnerA}
          isWalkover={isWO}
        />
        <PlayerRow
          name={result.playerB}
          carambolas={result.carambolasB}
          entries={result.entriesB}
          average={result.averageB}
          isWinner={winnerB || woWinnerB}
          isWalkover={isWO}
        />
      </div>
    </div>
  );
}
