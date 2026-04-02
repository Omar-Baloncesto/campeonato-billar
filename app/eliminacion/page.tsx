'use client';

import { useState } from 'react';
import { ELIMINATION_MATCHES, ROUND_NAMES, getMatchesByRound } from '../data/elimination';
import FilterPills from '../components/FilterPills';

function MatchBox({ match, compact }: { match: typeof ELIMINATION_MATCHES[0]; compact?: boolean }) {
  const isWinnerA = match.winner === match.playerA;
  const isWinnerB = match.winner === match.playerB;

  if (match.isBye) {
    return (
      <div className="glass-card rounded-lg p-2.5 opacity-50">
        <div className="text-xs font-semibold text-emerald-400 truncate">{match.playerA}</div>
        <div className="text-[10px] text-text-muted">BYE - avanza automaticamente</div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-lg p-3 glow-hover">
      {!compact && (
        <div className="text-[10px] text-text-muted/60 mb-2 tracking-wider uppercase">
          Partido {match.match}
        </div>
      )}
      <div className="space-y-1.5">
        <div className={`flex items-center gap-2 text-xs ${isWinnerA ? 'text-emerald-400 font-bold' : 'text-text-muted'}`}>
          <span className="flex-1 truncate">{match.playerA}</span>
          <span className="font-mono w-6 text-center">{match.carambolasA}</span>
          <span className="font-mono text-text-muted/50 w-6 text-center text-[10px]">{match.entriesA}</span>
          <span className="font-mono text-text-muted/50 w-10 text-right text-[10px]">{match.averageA.toFixed(3)}</span>
        </div>
        <div className={`flex items-center gap-2 text-xs ${isWinnerB ? 'text-emerald-400 font-bold' : 'text-text-muted'}`}>
          <span className="flex-1 truncate">{match.playerB}</span>
          <span className="font-mono w-6 text-center">{match.carambolasB}</span>
          <span className="font-mono text-text-muted/50 w-6 text-center text-[10px]">{match.entriesB}</span>
          <span className="font-mono text-text-muted/50 w-10 text-right text-[10px]">{match.averageB.toFixed(3)}</span>
        </div>
      </div>
    </div>
  );
}

export default function EliminacionPage() {
  const [roundFilter, setRoundFilter] = useState('all');
  const rounds = [1, 2, 3, 4, 5, 6];

  const roundItems = [
    { key: 'all', label: 'Todas' },
    ...rounds.map(r => ({ key: String(r), label: ROUND_NAMES[r] })),
  ];

  const champion = ELIMINATION_MATCHES.find(m => m.round === 6)?.winner;
  const finalMatch = ELIMINATION_MATCHES.find(m => m.round === 6);

  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text mb-2">
          Eliminacion Simple
        </h2>
        <p className="text-sm text-text-muted mb-6">42 jugadores · 6 rondas · Eliminacion directa</p>

        {/* Champion box */}
        {champion && (
          <div className="relative overflow-hidden rounded-2xl p-6 text-center mb-6 border border-[rgba(245,184,0,0.2)]"
            style={{
              background: 'linear-gradient(135deg, rgba(245,184,0,0.06), rgba(16,185,129,0.04))',
            }}
          >
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-[10px] tracking-[0.24em] text-text-muted uppercase mb-2 font-bold">Campeon</div>
            <div className="text-xl font-black text-[#F5B800]">{champion}</div>
            {finalMatch && (
              <div className="text-xs text-text-muted mt-2">
                Final: {finalMatch.carambolasA} - {finalMatch.carambolasB} ({finalMatch.entriesA} entradas)
              </div>
            )}
          </div>
        )}

        <div className="mb-6">
          <FilterPills items={roundItems} active={roundFilter} onChange={setRoundFilter} />
        </div>

        {/* Rounds */}
        {(roundFilter === 'all' ? rounds : [Number(roundFilter)]).map(round => {
          const matches = getMatchesByRound(round);
          const actualMatches = matches.filter(m => !m.isBye);
          const byeMatches = matches.filter(m => m.isBye);

          return (
            <div key={round} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">
                  {ROUND_NAMES[round]}
                </h3>
                <span className="text-[11px] text-text-muted">
                  {actualMatches.length} partido{actualMatches.length !== 1 ? 's' : ''}
                  {byeMatches.length > 0 && ` + ${byeMatches.length} BYE`}
                </span>
              </div>

              {/* Actual matches */}
              {actualMatches.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {actualMatches.map((m) => (
                    <MatchBox key={`${m.round}-${m.match}`} match={m} />
                  ))}
                </div>
              )}

              {/* BYE matches collapsed */}
              {byeMatches.length > 0 && (
                <details className="mt-2">
                  <summary className="text-[11px] text-text-muted cursor-pointer hover:text-emerald-400 transition-colors">
                    {byeMatches.length} jugadores avanzaron por BYE
                  </summary>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {byeMatches.map((m) => (
                      <div key={`${m.round}-${m.match}`} className="glass-card rounded-lg px-3 py-2 opacity-60">
                        <div className="text-xs text-text-primary truncate">{m.playerA}</div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
