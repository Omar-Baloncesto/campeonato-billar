'use client';

import { useState } from 'react';
import {
  ELIMINATION_MATCHES,
  ROUND_NAMES,
  getMatchesByRound,
} from '../data/elimination';
import FilterPills from '../components/FilterPills';
import TournamentBracket from '../components/TournamentBracket';

function PlayerSlotList({
  name,
  carambolas,
  entries,
  average,
  isWinner,
}: {
  name: string;
  carambolas: number;
  entries: number;
  average: number;
  isWinner: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg ${
        isWinner
          ? 'bg-emerald-500/8 border border-emerald-500/20'
          : 'bg-white/[0.02] border border-white/5'
      }`}
    >
      <span
        className={`flex-1 text-xs font-semibold truncate ${
          isWinner ? 'text-white' : 'text-text-muted'
        }`}
      >
        {name}
      </span>
      <span
        className={`font-mono text-xs w-6 text-center font-bold ${
          isWinner ? 'text-emerald-400' : 'text-text-muted/60'
        }`}
      >
        {carambolas}
      </span>
      <span className="font-mono text-text-muted/40 w-6 text-center text-[10px]">
        {entries}
      </span>
      <span className="font-mono text-text-muted/40 w-10 text-right text-[10px]">
        {average.toFixed(3)}
      </span>
      {isWinner && (
        <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
          <span className="text-[8px] font-black text-white">W</span>
        </span>
      )}
    </div>
  );
}

function MatchBox({
  match,
}: {
  match: (typeof ELIMINATION_MATCHES)[0];
}) {
  const isWinnerA = match.winner === match.playerA;
  const isWinnerB = match.winner === match.playerB;

  if (match.isBye) {
    return (
      <div className="glass-card rounded-lg p-2.5 opacity-50">
        <div className="text-xs font-semibold text-emerald-400 truncate">
          {match.playerA}
        </div>
        <div className="text-[10px] text-text-muted">
          BYE - avanza automaticamente
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-3.5 glow-hover">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] text-text-muted/60 tracking-wider uppercase">
          Partido {match.match}
        </span>
        {/* Column headers */}
        <div className="flex gap-2 text-[9px] text-text-muted/40 font-medium">
          <span className="w-6 text-center">Car</span>
          <span className="w-6 text-center">Ent</span>
          <span className="w-10 text-right">Prom</span>
          <span className="w-5" />
        </div>
      </div>
      <div className="space-y-1.5">
        <PlayerSlotList
          name={match.playerA}
          carambolas={match.carambolasA}
          entries={match.entriesA}
          average={match.averageA}
          isWinner={isWinnerA}
        />
        <PlayerSlotList
          name={match.playerB}
          carambolas={match.carambolasB}
          entries={match.entriesB}
          average={match.averageB}
          isWinner={isWinnerB}
        />
      </div>
    </div>
  );
}

export default function EliminacionPage() {
  const [viewMode, setViewMode] = useState<'bracket' | 'list'>('bracket');
  const [roundFilter, setRoundFilter] = useState('all');
  const rounds = [1, 2, 3, 4, 5, 6];

  const roundItems = [
    { key: 'all', label: 'Todas' },
    ...rounds.map((r) => ({ key: String(r), label: ROUND_NAMES[r] })),
  ];

  const champion = ELIMINATION_MATCHES.find((m) => m.round === 6)?.winner;
  const finalMatch = ELIMINATION_MATCHES.find((m) => m.round === 6);

  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text">
              Eliminación Directa
            </h2>
            <p className="text-sm text-text-muted mt-1">
              42 jugadores · 6 rondas · Eliminación directa
            </p>
          </div>

          {/* View toggle */}
          <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
            <button
              onClick={() => setViewMode('bracket')}
              className={`px-3 py-1.5 rounded text-[11px] font-semibold transition-all ${
                viewMode === 'bracket'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-text-muted hover:text-text-primary border border-transparent'
              }`}
            >
              <span className="hidden sm:inline">Cuadro</span>
              <svg
                className="w-4 h-4 sm:hidden"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M4 6h4v4H4zM4 14h4v4H4zM14 10h4v4h-4zM20 10h0" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded text-[11px] font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-text-muted hover:text-text-primary border border-transparent'
              }`}
            >
              <span className="hidden sm:inline">Lista</span>
              <svg
                className="w-4 h-4 sm:hidden"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Champion box */}
        {champion && viewMode === 'list' && (
          <div
            className="relative overflow-hidden rounded-2xl p-6 text-center mb-6 border border-[rgba(245,184,0,0.2)]"
            style={{
              background:
                'linear-gradient(135deg, rgba(245,184,0,0.06), rgba(16,185,129,0.04))',
            }}
          >
            <div className="relative">
              <svg
                width="56"
                height="56"
                viewBox="0 0 80 80"
                fill="none"
                className="mx-auto mb-2 drop-shadow-lg"
              >
                <circle
                  cx="40"
                  cy="40"
                  r="38"
                  stroke="url(#chGold)"
                  strokeWidth="3"
                  fill="none"
                />
                <circle cx="40" cy="40" r="34" fill="rgba(245,184,0,0.1)" />
                <path
                  d="M30 28h20v4c0 6-4 11-10 13-6-2-10-7-10-13v-4z"
                  fill="none"
                  stroke="#F5B800"
                  strokeWidth="2"
                />
                <rect
                  x="37"
                  y="45"
                  width="6"
                  height="4"
                  rx="1"
                  fill="#F5B800"
                />
                <rect
                  x="33"
                  y="49"
                  width="14"
                  height="3"
                  rx="1.5"
                  fill="#F5B800"
                />
                <defs>
                  <linearGradient
                    id="chGold"
                    x1="0"
                    y1="0"
                    x2="80"
                    y2="80"
                  >
                    <stop offset="0%" stopColor="#F5B800" />
                    <stop offset="50%" stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#B8860B" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="text-[10px] tracking-[0.24em] text-text-muted uppercase mb-2 font-bold">
                Campeón
              </div>
              <div className="text-xl font-black text-[#F5B800]">
                {champion}
              </div>
              {finalMatch && (
                <div className="text-xs text-text-muted mt-2">
                  Final: {finalMatch.carambolasA} - {finalMatch.carambolasB} (
                  {finalMatch.entriesA} entradas)
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bracket View */}
        {viewMode === 'bracket' && (
          <div className="mt-6">
            <TournamentBracket matches={ELIMINATION_MATCHES} />
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <>
            <div className="mb-6">
              <FilterPills
                items={roundItems}
                active={roundFilter}
                onChange={setRoundFilter}
              />
            </div>

            {(roundFilter === 'all' ? rounds : [Number(roundFilter)]).map(
              (round) => {
                const matches = getMatchesByRound(round);
                const actualMatches = matches.filter((m) => !m.isBye);
                const byeMatches = matches.filter((m) => m.isBye);

                return (
                  <div key={round} className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">
                        {ROUND_NAMES[round]}
                      </h3>
                      <span className="text-[11px] text-text-muted">
                        {actualMatches.length} partido
                        {actualMatches.length !== 1 ? 's' : ''}
                        {byeMatches.length > 0 &&
                          ` + ${byeMatches.length} BYE`}
                      </span>
                    </div>

                    {actualMatches.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        {actualMatches.map((m) => (
                          <MatchBox
                            key={`${m.round}-${m.match}`}
                            match={m}
                          />
                        ))}
                      </div>
                    )}

                    {byeMatches.length > 0 && (
                      <details className="mt-2">
                        <summary className="text-[11px] text-text-muted cursor-pointer hover:text-emerald-400 transition-colors">
                          {byeMatches.length} jugadores avanzaron por BYE
                        </summary>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                          {byeMatches.map((m) => (
                            <div
                              key={`${m.round}-${m.match}`}
                              className="glass-card rounded-lg px-3 py-2 opacity-60"
                            >
                              <div className="text-xs text-text-primary truncate">
                                {m.playerA}
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                );
              }
            )}
          </>
        )}
      </div>
    </div>
  );
}
