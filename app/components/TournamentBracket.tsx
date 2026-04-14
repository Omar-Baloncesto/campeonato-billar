'use client';

import type { EliminationMatch } from '../data/types';

/* ------------------------------------------------------------------ */
/*  Layout constants                                                   */
/* ------------------------------------------------------------------ */
const MATCH_W = 200;   // match card width
const MATCH_H = 56;    // match card height (2 rows × 28px)
const V_GAP   = 16;    // vertical gap between adjacent octavos matches
const H_GAP   = 44;    // horizontal space for connector lines
const CHAMP_W = 140;   // champion badge column width
const LINE_W  = 2;     // connector line thickness

const LINE_COLOR = 'rgba(255,255,255,0.15)';
const LINE_COLOR_GOLD = 'rgba(245,184,0,0.3)';

/* ------------------------------------------------------------------ */
/*  Position math – pixel-perfect bracket alignment                   */
/* ------------------------------------------------------------------ */

// Octavos: 8 matches stacked vertically
const octTops = Array.from({ length: 8 }, (_, i) => i * (MATCH_H + V_GAP));
const octCenters = octTops.map((t) => t + MATCH_H / 2);

// Cuartos: centered between each pair of octavos
const cuaCenters = Array.from({ length: 4 }, (_, i) =>
  (octCenters[2 * i] + octCenters[2 * i + 1]) / 2,
);
const cuaTops = cuaCenters.map((c) => c - MATCH_H / 2);

// Semis: centered between each pair of cuartos
const semiCenters = Array.from({ length: 2 }, (_, i) =>
  (cuaCenters[2 * i] + cuaCenters[2 * i + 1]) / 2,
);
const semiTops = semiCenters.map((c) => c - MATCH_H / 2);

// Final: centered between the two semis
const finalCenter = (semiCenters[0] + semiCenters[1]) / 2;
const finalTop = finalCenter - MATCH_H / 2;

// Column X positions (left edge of each match card column)
const colX = [
  0,
  MATCH_W + H_GAP,
  2 * (MATCH_W + H_GAP),
  3 * (MATCH_W + H_GAP),
];

// Total dimensions
const totalH = 8 * MATCH_H + 7 * V_GAP;
const totalW = 4 * (MATCH_W + H_GAP) + CHAMP_W;

// Labels row height
const LABEL_H = 32;

/* ------------------------------------------------------------------ */
/*  Match card component                                               */
/* ------------------------------------------------------------------ */

function BracketMatchCard({
  match,
  width,
}: {
  match: EliminationMatch;
  width: number;
}) {
  const isWinnerA = match.winner === match.playerA;
  const isWinnerB = match.winner === match.playerB;
  const hasResult = match.carambolasA > 0 || match.carambolasB > 0;

  return (
    <div
      className="rounded overflow-hidden border border-white/10 hover:border-emerald-500/30 transition-colors"
      style={{ width, height: MATCH_H }}
    >
      {/* Player A */}
      <div
        className="flex items-center h-[28px] px-2 gap-1 border-b border-white/10"
        style={{
          background: isWinnerA
            ? 'rgba(16, 185, 129, 0.12)'
            : 'rgba(255,255,255,0.03)',
        }}
      >
        <span
          className={`flex-1 text-[11px] truncate ${
            isWinnerA ? 'text-white font-bold' : 'text-text-muted'
          }`}
        >
          {match.playerA}
        </span>
        <span className="text-text-muted/30 text-[10px] mx-0.5">-</span>
        <span
          className={`text-[11px] font-mono font-bold min-w-[20px] text-right ${
            isWinnerA ? 'text-emerald-400' : 'text-text-muted/50'
          }`}
        >
          {hasResult ? match.carambolasA : ''}
        </span>
      </div>
      {/* Player B */}
      <div
        className="flex items-center h-[28px] px-2 gap-1"
        style={{
          background: isWinnerB
            ? 'rgba(16, 185, 129, 0.12)'
            : 'rgba(255,255,255,0.03)',
        }}
      >
        <span
          className={`flex-1 text-[11px] truncate ${
            isWinnerB ? 'text-white font-bold' : 'text-text-muted'
          }`}
        >
          {match.playerB}
        </span>
        <span className="text-text-muted/30 text-[10px] mx-0.5">-</span>
        <span
          className={`text-[11px] font-mono font-bold min-w-[20px] text-right ${
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
/*  Champion badge                                                     */
/* ------------------------------------------------------------------ */

function ChampionBadge({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        width="90"
        height="90"
        viewBox="0 0 120 120"
        fill="none"
        className="drop-shadow-2xl"
      >
        <circle cx="60" cy="60" r="57" stroke="url(#bGoldOuter)" strokeWidth="2.5" />
        <circle cx="60" cy="60" r="52" stroke="url(#bGoldOuter)" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="60" cy="60" r="48" fill="url(#bGoldBg)" />
        {/* Laurel left */}
        <path d="M25 78c5-22 12-38 22-48C37 40 28 56 25 78z" fill="#B8860B" opacity="0.4" />
        <path d="M29 73c4-16 9-30 16-40C37 42 31 54 29 73z" fill="#B8860B" opacity="0.3" />
        {/* Laurel right */}
        <path d="M95 78c-5-22-12-38-22-48C83 40 92 56 95 78z" fill="#B8860B" opacity="0.4" />
        <path d="M91 73c-4-16-9-30-16-40C83 42 89 54 91 73z" fill="#B8860B" opacity="0.3" />
        {/* Trophy */}
        <path d="M44 36h32v5c0 10-6 18-16 21-10-3-16-11-16-21v-5z" fill="none" stroke="#F5B800" strokeWidth="2" />
        <path d="M38 38h-4c0 7 3 12 10 14v-2c-4-2-6-6-6-12z" fill="#F5B800" opacity="0.7" />
        <path d="M82 38h4c0 7-3 12-10 14v-2c4-2 6-6 6-12z" fill="#F5B800" opacity="0.7" />
        <rect x="56" y="62" width="8" height="6" rx="1.5" fill="#F5B800" />
        <rect x="50" y="68" width="20" height="5" rx="2.5" fill="#F5B800" />
        <rect x="46" y="73" width="28" height="4" rx="2" fill="#F5B800" opacity="0.6" />
        {/* Star */}
        <polygon points="60,41 62,47 68,47 63,51 65,56 60,52 55,56 57,51 52,47 58,47" fill="#F5B800" opacity="0.5" />
        <text x="60" y="94" textAnchor="middle" fill="#F5B800" fontSize="13" fontWeight="900" fontFamily="system-ui">1</text>
        <defs>
          <linearGradient id="bGoldOuter" x1="0" y1="0" x2="120" y2="120">
            <stop offset="0%" stopColor="#F5B800" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
          <linearGradient id="bGoldBg" x1="10" y1="10" x2="110" y2="110">
            <stop offset="0%" stopColor="rgba(245,184,0,0.12)" />
            <stop offset="100%" stopColor="rgba(245,184,0,0.04)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center">
        <div className="text-[10px] tracking-[0.2em] text-[#F5B800]/60 uppercase font-bold">
          Campeón
        </div>
        <div className="text-sm font-black text-[#F5B800] max-w-[120px] leading-tight mt-1">
          {name}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SVG connector lines                                                */
/* ------------------------------------------------------------------ */

function ConnectorLines() {
  const lines: React.ReactNode[] = [];

  // Helper: bracket connector between two source matches → one target
  function addBracket(
    srcCol: number,
    topCY: number,
    botCY: number,
    tgtCol: number,
    tgtCY: number,
    color: string,
    key: string,
  ) {
    const x1 = colX[srcCol] + MATCH_W;              // right edge of source cards
    const xMid = colX[srcCol] + MATCH_W + H_GAP / 2; // midpoint for vertical
    const x2 = colX[tgtCol];                          // left edge of target card

    lines.push(
      <g key={key}>
        {/* Horizontal from top source → mid */}
        <line x1={x1} y1={topCY} x2={xMid} y2={topCY} stroke={color} strokeWidth={LINE_W} />
        {/* Horizontal from bottom source → mid */}
        <line x1={x1} y1={botCY} x2={xMid} y2={botCY} stroke={color} strokeWidth={LINE_W} />
        {/* Vertical connecting top and bottom */}
        <line x1={xMid} y1={topCY} x2={xMid} y2={botCY} stroke={color} strokeWidth={LINE_W} />
        {/* Horizontal from midpoint → target */}
        <line x1={xMid} y1={tgtCY} x2={x2} y2={tgtCY} stroke={color} strokeWidth={LINE_W} />
      </g>,
    );
  }

  // Octavos → Cuartos (4 connectors)
  for (let i = 0; i < 4; i++) {
    addBracket(0, octCenters[2 * i], octCenters[2 * i + 1], 1, cuaCenters[i], LINE_COLOR, `oc${i}`);
  }

  // Cuartos → Semis (2 connectors)
  for (let i = 0; i < 2; i++) {
    addBracket(1, cuaCenters[2 * i], cuaCenters[2 * i + 1], 2, semiCenters[i], LINE_COLOR, `cs${i}`);
  }

  // Semis → Final (1 connector)
  addBracket(2, semiCenters[0], semiCenters[1], 3, finalCenter, LINE_COLOR, 'sf0');

  // Final → Champion (horizontal golden line)
  const fRight = colX[3] + MATCH_W;
  const champX = colX[3] + MATCH_W + H_GAP;
  lines.push(
    <line
      key="fc"
      x1={fRight}
      y1={finalCenter}
      x2={champX}
      y2={finalCenter}
      stroke={LINE_COLOR_GOLD}
      strokeWidth={LINE_W}
    />,
  );

  return <>{lines}</>;
}

/* ------------------------------------------------------------------ */
/*  Round labels                                                       */
/* ------------------------------------------------------------------ */

const ROUND_LABELS = ['Octavos de Final', 'Cuartos de Final', 'Semifinales', 'Final', 'Campeón'];

function RoundLabels({ yOffset }: { yOffset: number }) {
  const xs = [...colX, colX[3] + MATCH_W + H_GAP];
  const widths = [MATCH_W, MATCH_W, MATCH_W, MATCH_W, CHAMP_W - H_GAP];

  return (
    <>
      {ROUND_LABELS.map((label, i) => (
        <div
          key={label}
          className="absolute text-center"
          style={{
            left: xs[i],
            top: yOffset,
            width: widths[i],
          }}
        >
          <span
            className={`text-[10px] tracking-[0.12em] uppercase font-bold ${
              i === 4 ? 'text-[#F5B800]/60' : 'text-text-muted/50'
            }`}
          >
            {label}
          </span>
        </div>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main bracket component                                             */
/* ------------------------------------------------------------------ */

export default function TournamentBracket({
  matches,
}: {
  matches: EliminationMatch[];
}) {
  // Get matches by round (only non-BYE)
  const octavos = matches.filter((m) => m.round === 3 && !m.isBye);
  const cuartos = matches.filter((m) => m.round === 4 && !m.isBye);
  const semis = matches.filter((m) => m.round === 5 && !m.isBye);
  const final = matches.filter((m) => m.round === 6 && !m.isBye);
  const champion = matches.find((m) => m.round === 6)?.winner;

  return (
    <div className="overflow-x-auto pb-4 -mx-4 px-4">
      <div
        className="relative"
        style={{
          width: totalW,
          height: totalH + LABEL_H * 2,
          minWidth: totalW,
        }}
      >
        {/* Top labels */}
        <RoundLabels yOffset={0} />

        {/* Bottom labels */}
        <RoundLabels yOffset={totalH + LABEL_H + 8} />

        {/* Bracket area (offset by label height) */}
        <div
          className="absolute"
          style={{
            left: 0,
            top: LABEL_H,
            width: totalW,
            height: totalH,
          }}
        >
          {/* SVG connector lines */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={totalW}
            height={totalH}
          >
            <ConnectorLines />
          </svg>

          {/* Octavos match cards */}
          {octavos.map((m, i) => (
            <div
              key={`oct-${m.match}`}
              className="absolute"
              style={{
                left: colX[0],
                top: octTops[i],
                width: MATCH_W,
              }}
            >
              <BracketMatchCard match={m} width={MATCH_W} />
            </div>
          ))}

          {/* Cuartos match cards */}
          {cuartos.map((m, i) => (
            <div
              key={`cua-${m.match}`}
              className="absolute"
              style={{
                left: colX[1],
                top: cuaTops[i],
                width: MATCH_W,
              }}
            >
              <BracketMatchCard match={m} width={MATCH_W} />
            </div>
          ))}

          {/* Semis match cards */}
          {semis.map((m, i) => (
            <div
              key={`sem-${m.match}`}
              className="absolute"
              style={{
                left: colX[2],
                top: semiTops[i],
                width: MATCH_W,
              }}
            >
              <BracketMatchCard match={m} width={MATCH_W} />
            </div>
          ))}

          {/* Final match card */}
          {final.map((m) => (
            <div
              key={`fin-${m.match}`}
              className="absolute"
              style={{
                left: colX[3],
                top: finalTop,
                width: MATCH_W,
              }}
            >
              <BracketMatchCard match={m} width={MATCH_W} />
            </div>
          ))}

          {/* Champion badge */}
          {champion && (
            <div
              className="absolute flex items-center justify-center"
              style={{
                left: colX[3] + MATCH_W + H_GAP,
                top: finalCenter - 80,
                width: CHAMP_W - H_GAP,
                height: 160,
              }}
            >
              <ChampionBadge name={champion} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
