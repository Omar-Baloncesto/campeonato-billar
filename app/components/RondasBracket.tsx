'use client';

import type { EliminationMatch } from '../data/types';

/* ------------------------------------------------------------------ */
/*  Layout constants (compact – 32 entries is tall)                    */
/* ------------------------------------------------------------------ */
const MH  = 40;   // match card height
const MW  = 175;   // match card width
const VG  = 4;    // vertical gap between adjacent R1 entries
const HG  = 36;   // horizontal gap for connector lines
const LW  = 2;    // line width
const LC  = 'rgba(255,255,255,0.15)';

/* ------------------------------------------------------------------ */
/*  Build bracket-ordered entries                                      */
/*  R2 match i → playerA came from one R1 entry, playerB from another */
/*  Visual order: for each R2 match, show both feeder R1 entries.     */
/* ------------------------------------------------------------------ */

function buildBracketOrder(
  r1: EliminationMatch[],
  r2: EliminationMatch[],
): { r1Entries: EliminationMatch[]; r2Matches: EliminationMatch[] } {
  const r1Entries: EliminationMatch[] = [];

  for (const r2m of r2) {
    const feederA = r1.find((m) => m.winner === r2m.playerA);
    const feederB = r1.find((m) => m.winner === r2m.playerB);
    if (feederA) r1Entries.push(feederA);
    if (feederB) r1Entries.push(feederB);
  }

  return { r1Entries, r2Matches: r2 };
}

/* ------------------------------------------------------------------ */
/*  Match card component (compact)                                     */
/* ------------------------------------------------------------------ */

function CompactCard({
  match,
  width,
}: {
  match: EliminationMatch;
  width: number;
}) {
  const isWinnerA = match.winner === match.playerA;
  const isWinnerB = match.winner === match.playerB;
  const rowH = MH / 2;

  if (match.isBye) {
    return (
      <div
        className="rounded border border-white/5 overflow-hidden opacity-40"
        style={{ width, height: MH }}
      >
        <div
          className="flex items-center px-2 border-b border-white/5"
          style={{ height: rowH, background: 'rgba(255,255,255,0.02)' }}
        >
          <span className="text-[10px] text-text-muted truncate flex-1">
            {match.playerA}
          </span>
        </div>
        <div
          className="flex items-center px-2"
          style={{ height: rowH, background: 'rgba(255,255,255,0.01)' }}
        >
          <span className="text-[9px] text-text-muted/30 italic">BYE</span>
        </div>
      </div>
    );
  }

  const hasResult = match.carambolasA > 0 || match.carambolasB > 0;

  return (
    <div
      className="rounded border border-white/10 overflow-hidden hover:border-emerald-500/30 transition-colors"
      style={{ width, height: MH }}
    >
      <div
        className="flex items-center px-2 gap-1 border-b border-white/10"
        style={{
          height: rowH,
          background: isWinnerA
            ? 'rgba(16, 185, 129, 0.12)'
            : 'rgba(255,255,255,0.03)',
        }}
      >
        <span
          className={`flex-1 text-[10px] truncate ${
            isWinnerA ? 'text-white font-bold' : 'text-text-muted'
          }`}
        >
          {match.playerA}
        </span>
        <span className="text-text-muted/30 text-[9px]">-</span>
        <span
          className={`text-[10px] font-mono font-bold min-w-[16px] text-right ${
            isWinnerA ? 'text-emerald-400' : 'text-text-muted/50'
          }`}
        >
          {hasResult ? match.carambolasA : ''}
        </span>
      </div>
      <div
        className="flex items-center px-2 gap-1"
        style={{
          height: rowH,
          background: isWinnerB
            ? 'rgba(16, 185, 129, 0.12)'
            : 'rgba(255,255,255,0.03)',
        }}
      >
        <span
          className={`flex-1 text-[10px] truncate ${
            isWinnerB ? 'text-white font-bold' : 'text-text-muted'
          }`}
        >
          {match.playerB}
        </span>
        <span className="text-text-muted/30 text-[9px]">-</span>
        <span
          className={`text-[10px] font-mono font-bold min-w-[16px] text-right ${
            isWinnerB ? 'text-emerald-400' : 'text-text-muted/50'
          }`}
        >
          {hasResult ? match.carambolasB : ''}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SVG connector lines (R1 → R2)                                     */
/* ------------------------------------------------------------------ */

function RondasConnectors({
  r1Centers,
  r2Centers,
  col0X,
  col1X,
}: {
  r1Centers: number[];
  r2Centers: number[];
  col0X: number;
  col1X: number;
}) {
  const lines: React.ReactNode[] = [];

  for (let i = 0; i < r2Centers.length; i++) {
    const topY = r1Centers[2 * i];
    const botY = r1Centers[2 * i + 1];
    const tgtY = r2Centers[i];
    const x1 = col0X + MW;
    const xMid = col0X + MW + HG / 2;
    const x2 = col1X;

    lines.push(
      <g key={`c${i}`}>
        <line x1={x1} y1={topY} x2={xMid} y2={topY} stroke={LC} strokeWidth={LW} />
        <line x1={x1} y1={botY} x2={xMid} y2={botY} stroke={LC} strokeWidth={LW} />
        <line x1={xMid} y1={topY} x2={xMid} y2={botY} stroke={LC} strokeWidth={LW} />
        <line x1={xMid} y1={tgtY} x2={x2} y2={tgtY} stroke={LC} strokeWidth={LW} />
      </g>,
    );
  }

  // Arrow to "Octavos" on the right
  const arrowX = col1X + MW + 8;
  for (let i = 0; i < r2Centers.length; i++) {
    lines.push(
      <line
        key={`a${i}`}
        x1={col1X + MW}
        y1={r2Centers[i]}
        x2={arrowX}
        y2={r2Centers[i]}
        stroke={LC}
        strokeWidth={LW}
        strokeDasharray="4 3"
      />,
    );
  }

  return <>{lines}</>;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function RondasBracket({
  matches,
}: {
  matches: EliminationMatch[];
}) {
  const r1All = matches.filter((m) => m.round === 1);
  const r2All = matches.filter((m) => m.round === 2);

  if (r1All.length === 0 && r2All.length === 0) {
    return (
      <div className="text-center py-16 text-text-muted">
        <p className="text-sm">No hay rondas previas a Octavos de Final.</p>
        <p className="text-xs mt-1 text-text-muted/60">
          Los grupos clasifican directamente a Octavos.
        </p>
      </div>
    );
  }

  const { r1Entries, r2Matches } = buildBracketOrder(r1All, r2All);
  const numR1 = r1Entries.length; // 32
  const numR2 = r2Matches.length; // 16

  // Y positions for R1 entries
  const r1Tops = Array.from({ length: numR1 }, (_, i) => i * (MH + VG));
  const r1Centers = r1Tops.map((t) => t + MH / 2);

  // Y positions for R2 matches (centered between each pair)
  const r2Centers = Array.from({ length: numR2 }, (_, i) =>
    (r1Centers[2 * i] + r1Centers[2 * i + 1]) / 2,
  );
  const r2Tops = r2Centers.map((c) => c - MH / 2);

  const totalH = numR1 * MH + (numR1 - 1) * VG;
  const col0X = 0;
  const col1X = MW + HG;
  const totalW = 2 * MW + HG + 20; // 20px extra for dashed arrows
  const LABEL_H = 28;

  const labels = ['Primera Ronda', 'Segunda Ronda', '→ Octavos'];
  const labelXs = [col0X, col1X, col1X + MW + 4];
  const labelWs = [MW, MW, 80];

  return (
    <div className="overflow-x-auto overflow-y-auto pb-4 -mx-4 px-4" style={{ maxHeight: '80vh' }}>
      <div
        className="relative"
        style={{
          width: totalW + 80,
          height: totalH + LABEL_H * 2,
          minWidth: totalW,
        }}
      >
        {/* Top labels */}
        {labels.map((label, i) => (
          <div
            key={`tl-${i}`}
            className="absolute"
            style={{ left: labelXs[i], top: 0, width: labelWs[i] }}
          >
            <span
              className={`text-[9px] tracking-[0.1em] uppercase font-bold ${
                i === 2 ? 'text-emerald-400/50' : 'text-text-muted/50'
              }`}
            >
              {label}
            </span>
          </div>
        ))}

        {/* Bottom labels */}
        {labels.slice(0, 2).map((label, i) => (
          <div
            key={`bl-${i}`}
            className="absolute"
            style={{ left: labelXs[i], top: totalH + LABEL_H + 4, width: labelWs[i] }}
          >
            <span className="text-[9px] tracking-[0.1em] uppercase font-bold text-text-muted/50">
              {label}
            </span>
          </div>
        ))}

        {/* Bracket area */}
        <div
          className="absolute"
          style={{ left: 0, top: LABEL_H, width: totalW + 80, height: totalH }}
        >
          {/* SVG connectors */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={totalW + 80}
            height={totalH}
          >
            <RondasConnectors
              r1Centers={r1Centers}
              r2Centers={r2Centers}
              col0X={col0X}
              col1X={col1X}
            />
          </svg>

          {/* R1 entries */}
          {r1Entries.map((m, i) => (
            <div
              key={`r1-${i}`}
              className="absolute"
              style={{ left: col0X, top: r1Tops[i] }}
            >
              <CompactCard match={m} width={MW} />
            </div>
          ))}

          {/* R2 matches */}
          {r2Matches.map((m, i) => (
            <div
              key={`r2-${m.match}`}
              className="absolute"
              style={{ left: col1X, top: r2Tops[i] }}
            >
              <CompactCard match={m} width={MW} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
