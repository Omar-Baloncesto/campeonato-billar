'use client';

import { useState, useMemo } from 'react';
import FilterPills from '../components/FilterPills';
import BracketTree from '../components/BracketTree';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import { shortRoundName } from '../lib/rounds';
import { fmtInt, fmtAvg, fmtPct, EMPTY } from '../lib/format';
import type { EliminationMatch, TournamentConfig } from '../data/types';

/* ------------------------------------------------------------------ */
/*  Tarjeta de partido                                                 */
/* ------------------------------------------------------------------ */

function PlayerSlot({
  name, carambolas, entries, average, target, pct, isWinner, showPct,
}: {
  name: string;
  carambolas: number | null;
  entries: number | null;
  average: number | null;
  target: number | null;
  pct: number | null;
  isWinner: boolean;
  showPct: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg ${
        isWinner
          ? 'bg-emerald-500/8 border border-emerald-500/20'
          : 'bg-white/[0.02] border border-white/5'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-semibold truncate ${isWinner ? 'text-text-primary' : 'text-text-muted'}`}>
          {name}
        </div>
        {target !== null && (
          <div className="text-[9px] text-text-muted/60 tabular-nums">objetivo {target}</div>
        )}
      </div>
      <span className={`font-mono text-xs w-7 text-center font-bold tabular-nums ${isWinner ? 'text-emerald-400' : 'text-text-muted'}`}>
        {fmtInt(carambolas)}
      </span>
      <span className="font-mono text-text-muted/80 w-7 text-center text-[10px] tabular-nums">{fmtInt(entries)}</span>
      <span className="font-mono text-text-muted/80 w-10 text-right text-[10px] tabular-nums">{fmtAvg(average)}</span>
      {showPct && (
        <span className={`font-mono w-12 text-right text-[10px] tabular-nums ${isWinner ? 'text-emerald-400 font-bold' : 'text-text-muted/80'}`}>
          {fmtPct(pct, 0)}
        </span>
      )}
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

function MatchBox({ match, showPct }: { match: EliminationMatch; showPct: boolean }) {
  const winnerA = match.winner !== '' && match.winner === match.playerA;
  const winnerB = match.winner !== '' && match.winner === match.playerB;
  const pending = match.status === 'pending';

  const decidedByHandicap =
    showPct &&
    match.targetA !== null && match.targetB !== null && match.targetA !== match.targetB &&
    match.carambolasA !== null && match.carambolasB !== null &&
    ((winnerA && match.carambolasA < match.carambolasB) ||
      (winnerB && match.carambolasB < match.carambolasA));

  return (
    <div className={`glass-card rounded-xl p-3.5 glow-hover ${pending ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between mb-2.5 gap-2">
        <span className="text-[10px] text-text-muted tracking-wider uppercase">
          Partido {match.match}
        </span>
        <div className="flex gap-2 text-[9px] text-text-muted/80 font-medium">
          <span className="w-7 text-center">Car</span>
          <span className="w-7 text-center">Ent</span>
          <span className="w-10 text-right">Prom</span>
          {showPct && <span className="w-12 text-right">% Obj</span>}
          <span className="w-5" />
        </div>
      </div>
      <div className="space-y-1.5">
        <PlayerSlot
          name={match.playerA} carambolas={match.carambolasA} entries={match.entriesA}
          average={match.averageA} target={match.targetA} pct={match.pctA}
          isWinner={winnerA} showPct={showPct}
        />
        <PlayerSlot
          name={match.playerB} carambolas={match.carambolasB} entries={match.entriesB}
          average={match.averageB} target={match.targetB} pct={match.pctB}
          isWinner={winnerB} showPct={showPct}
        />
      </div>
      {decidedByHandicap && (
        <p className="text-[10px] text-text-muted/70 mt-2 px-1 leading-snug">
          Pasa <span className="text-emerald-400 font-semibold">{match.winner}</span> con menos
          carambolas: consiguió un porcentaje más alto de su objetivo.
        </p>
      )}
      {pending && (
        <p className="text-[10px] text-text-muted/50 mt-2 px-1">Pendiente de disputar.</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Panel de BYEs                                                      */
/* ------------------------------------------------------------------ */

function ByePanel({ byes, totalPlayers }: { byes: EliminationMatch[]; totalPlayers: number }) {
  if (byes.length === 0) return null;
  const nextRound = byes[0].round + 1;
  const play = totalPlayers - byes.length;

  return (
    <div className="rounded-xl border border-emerald-500/20 overflow-hidden mb-6" style={{ background: 'rgba(16,185,129,0.04)' }}>
      <div
        className="px-4 py-3 border-b border-emerald-500/15 flex items-center justify-between gap-3 flex-wrap"
        style={{ background: 'rgba(16,185,129,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-black bg-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded tracking-wider">BYE</span>
          <h3 className="text-sm font-bold text-text-primary">
            {byes.length} jugadores pasan directo a la ronda {nextRound}
          </h3>
        </div>
        <span className="text-[10px] text-text-muted">
          Los {byes.length} mejores de la fase de grupos
        </span>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {byes.map(m => (
            <div
              key={m.match}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-500/10"
              style={{ background: 'rgba(16,185,129,0.05)' }}
            >
              <span className="text-[10px] font-mono text-emerald-400/60 w-5 shrink-0">#{m.match}</span>
              <span className="text-xs text-text-primary font-semibold truncate">{m.playerA}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-text-muted/60 mt-3 px-1 leading-relaxed">
          El cuadro tiene {byes.length + play} posiciones y hay {totalPlayers} jugadores, así que
          sobran {byes.length} plazas. Se las llevan los mejor clasificados de grupos: entran
          directamente en la ronda siguiente. Los otros {play} juegan la primera ronda.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Podio                                                              */
/* ------------------------------------------------------------------ */

function Podium({ matches, maxRound }: { matches: EliminationMatch[]; maxRound: number }) {
  const final = matches.find(m => m.round === maxRound && !m.isBye);
  if (!final || !final.winner) return null;

  const runnerUp = final.winner === final.playerA ? final.playerB : final.playerA;
  const semis = matches.filter(m => m.round === maxRound - 1 && !m.isBye && m.winner);
  const thirds = semis.map(m => (m.winner === m.playerA ? m.playerB : m.playerA)).filter(Boolean);

  const podium = [
    { pos: 1, player: final.winner, color: '#F5B800', label: 'Campeón' },
    { pos: 2, player: runnerUp, color: '#C0C0C0', label: 'Subcampeón' },
    ...thirds.map((p, i) => ({ pos: 3, player: p, color: '#CD7F32', label: `Semifinalista`, key: i })),
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {podium.map((p, i) => (
        <div
          key={`${p.pos}-${p.player}-${i}`}
          className="glass-card rounded-xl p-4 text-center"
          style={{ borderTop: `3px solid ${p.color}` }}
        >
          <div className="text-[10px] uppercase tracking-wider text-text-muted">{p.label}</div>
          <div className="text-sm font-black mt-1" style={{ color: p.color }}>{p.player}</div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Página                                                             */
/* ------------------------------------------------------------------ */

export default function EliminacionClient({
  matches,
  config,
}: {
  matches: EliminationMatch[];
  config: TournamentConfig;
}) {
  const [viewMode, setViewMode] = useState<'lista' | 'cuadro'>('lista');
  const [roundFilter, setRoundFilter] = useState('all');

  const rounds = useMemo(
    () => [...new Set(matches.map(m => m.round))].sort((a, b) => a - b),
    [matches],
  );

  const roundNames = useMemo(() => {
    const names: Record<number, string> = {};
    for (const m of matches) names[m.round] = m.roundName;
    return names;
  }, [matches]);

  const maxRound = rounds.length ? rounds[rounds.length - 1] : 0;
  const firstRound = rounds.length ? rounds[0] : 0;

  const byes = useMemo(
    () => matches.filter(m => m.round === firstRound && m.isBye).sort((a, b) => a.match - b.match),
    [matches, firstRound],
  );

  const realMatches = matches.filter(m => !m.isBye);
  const playedMatches = realMatches.filter(m => m.status === 'played').length;
  const bracketSize = rounds.length ? matches.filter(m => m.round === firstRound).length * 2 : 0;
  const totalPlayers = bracketSize - byes.length;

  const champion = matches.find(m => m.round === maxRound && !m.isBye)?.winner || '';

  // El % de objetivo solo tiene sentido si el torneo cruza categorías.
  const showPct = config.mixedCategories && matches.some(m => m.targetA !== null && m.targetB !== null);

  const roundItems = [
    { key: 'all', label: 'Todas' },
    ...rounds.map(r => ({ key: String(r), label: shortRoundName(roundNames[r] || `Ronda ${r}`) })),
  ];

  if (matches.length === 0) {
    return (
      <div className="animate-fade-in px-4 py-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text mb-6">
            Eliminación Directa
          </h2>
          <EmptyState message="El cuadro de eliminación todavía no está creado. Corre el paso 7 del menú «Torneo Billar» en el Google Sheets." />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text">
              Eliminación Directa
            </h2>
            <p className="text-sm text-text-muted mt-1">
              Cuadro de {bracketSize} · {totalPlayers} jugadores · {rounds.length} rondas ·{' '}
              {playedMatches} de {realMatches.length} partidos jugados
            </p>
          </div>

          <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10 shrink-0">
            <ViewButton active={viewMode === 'lista'} onClick={() => setViewMode('lista')} label="Lista" />
            <ViewButton active={viewMode === 'cuadro'} onClick={() => setViewMode('cuadro')} label="Cuadro" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          <StatCard label="Rondas" value={rounds.length} />
          <StatCard label="Partidos" value={`${playedMatches}/${realMatches.length}`} />
          <StatCard label="BYE" value={byes.length} hint={`cuadro de ${bracketSize}`} />
          {champion ? (
            <StatCard label="Campeón" value={champion} accent />
          ) : (
            <StatCard
              label="Ronda actual"
              value={shortRoundName(roundNames[currentRound(matches, rounds)] || EMPTY)}
              accent
            />
          )}
        </div>

        <Podium matches={matches} maxRound={maxRound} />

        {viewMode === 'lista' && (
          <>
            <ByePanel byes={byes} totalPlayers={totalPlayers} />

            <div className="mb-6">
              <FilterPills items={roundItems} active={roundFilter} onChange={setRoundFilter} />
            </div>

            {(roundFilter === 'all' ? rounds : [Number(roundFilter)]).map(round => {
              const real = matches.filter(m => m.round === round && !m.isBye);
              if (real.length === 0) return null;
              const done = real.filter(m => m.status === 'played').length;

              return (
                <div key={round} className="mb-8">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <h3 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">
                      {roundNames[round]}
                    </h3>
                    <span className="text-[11px] text-text-muted">
                      {done} de {real.length} partido{real.length !== 1 ? 's' : ''} jugado{done !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {real.map(m => (
                      <MatchBox key={`${m.round}-${m.match}`} match={m} showPct={showPct} />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {viewMode === 'cuadro' && (
          <div className="mt-2">
            <BracketTree matches={matches} showPct={showPct} />
            <p className="text-[10px] text-text-muted/60 mt-3 px-1">
              Siembra en espejo: el 1 del ranking se cruza con el último, el 2 con el penúltimo,
              y así en cada ronda. Por eso el primero y el segundo de la fase de grupos solo
              pueden encontrarse en la final.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Primera ronda que todavía tiene partidos por jugar. */
function currentRound(matches: EliminationMatch[], rounds: number[]): number {
  for (const r of rounds) {
    const real = matches.filter(m => m.round === r && !m.isBye);
    if (real.some(m => m.status === 'pending')) return r;
  }
  return rounds[rounds.length - 1] ?? 0;
}

function ViewButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded text-[11px] font-semibold transition-all ${
        active
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          : 'text-text-muted hover:text-text-primary border border-transparent'
      }`}
    >
      {label}
    </button>
  );
}
