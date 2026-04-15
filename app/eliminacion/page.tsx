'use client';

import { useState } from 'react';
import {
  ELIMINATION_MATCHES,
  ROUND_NAMES,
  getMatchesByRound,
} from '../data/elimination';
import FilterPills from '../components/FilterPills';
import TournamentBracket from '../components/TournamentBracket';
import RondasBracket from '../components/RondasBracket';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const hasPreOctavos = ELIMINATION_MATCHES.some(
  (m) => m.round <= 2 && !m.isBye,
);

// Get BYE players sorted by match number (= ranking position)
const byePlayers = ELIMINATION_MATCHES
  .filter((m) => m.round === 1 && m.isBye)
  .sort((a, b) => a.match - b.match);

type ViewMode = 'lista' | 'rondas' | 'cuadro';

/* ------------------------------------------------------------------ */
/*  List view components                                               */
/* ------------------------------------------------------------------ */

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

function MatchBox({ match }: { match: (typeof ELIMINATION_MATCHES)[0] }) {
  const isWinnerA = match.winner === match.playerA;
  const isWinnerB = match.winner === match.playerB;

  if (match.isBye) {
    return (
      <div className="glass-card rounded-lg p-2.5 opacity-50">
        <div className="text-xs font-semibold text-emerald-400 truncate">
          {match.playerA}
        </div>
        <div className="text-[10px] text-text-muted">
          BYE - avanza automáticamente
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

/* ------------------------------------------------------------------ */
/*  BYE Players Panel - always visible                                 */
/* ------------------------------------------------------------------ */

function ByePlayersPanel() {
  if (byePlayers.length === 0) return null;

  return (
    <div
      className="rounded-xl border border-emerald-500/20 overflow-hidden mb-6"
      style={{ background: 'rgba(16, 185, 129, 0.04)' }}
    >
      <div className="px-4 py-3 border-b border-emerald-500/15 flex items-center justify-between"
        style={{ background: 'rgba(16, 185, 129, 0.06)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-black bg-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded tracking-wider">
            BYE
          </span>
          <h3 className="text-sm font-bold text-white">
            {byePlayers.length} Jugadores Avanzan Directo a 2da Ronda
          </h3>
        </div>
        <span className="text-[10px] text-text-muted hidden sm:block">
          Top {byePlayers.length} de la fase de grupos — no juegan 1ra ronda
        </span>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {byePlayers.map((m) => (
            <div
              key={m.match}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-500/10"
              style={{ background: 'rgba(16, 185, 129, 0.05)' }}
            >
              <span className="text-[10px] font-mono text-emerald-400/60 w-5 shrink-0">
                #{m.match}
              </span>
              <span className="text-xs text-white font-semibold truncate">
                {m.playerA}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-text-muted/60 mt-3 px-1">
          Estos jugadores quedaron entre los primeros {byePlayers.length} en la
          clasificación general de grupos. Por su buen rendimiento, avanzan
          directamente a la Segunda Ronda sin necesidad de jugar la Primera
          Ronda de eliminación. Los demás ({42 - byePlayers.length} jugadores)
          deben jugar la Primera Ronda para clasificar.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function EliminacionPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('lista');
  const [roundFilter, setRoundFilter] = useState('all');
  const rounds = [1, 2, 3, 4, 5, 6];

  const roundItems = [
    { key: 'all', label: 'Todas' },
    ...rounds.map((r) => ({ key: String(r), label: ROUND_NAMES[r] })),
  ];

  const champion = ELIMINATION_MATCHES.find((m) => m.round === 6)?.winner;
  const finalMatch = ELIMINATION_MATCHES.find((m) => m.round === 6);
  const totalReal = ELIMINATION_MATCHES.filter((m) => !m.isBye).length;

  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text">
              Eliminación Directa
            </h2>
            <p className="text-sm text-text-muted mt-1">
              42 jugadores · {totalReal} partidos · 6 rondas
            </p>
          </div>

          {/* View toggle - top right */}
          <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10 shrink-0">
            <ViewButton
              active={viewMode === 'lista'}
              onClick={() => setViewMode('lista')}
              label="Lista"
            />
            {hasPreOctavos && (
              <ViewButton
                active={viewMode === 'rondas'}
                onClick={() => setViewMode('rondas')}
                label="Rondas"
              />
            )}
            <ViewButton
              active={viewMode === 'cuadro'}
              onClick={() => setViewMode('cuadro')}
              label="Cuadro"
            />
          </div>
        </div>

        {/* ============ BYE PANEL - visible in lista & rondas ============ */}
        {viewMode !== 'cuadro' && <ByePlayersPanel />}

        {/* ============ LISTA VIEW ============ */}
        {viewMode === 'lista' && (
          <>
            {/* Champion box */}
            {champion && (
              <div
                className="relative overflow-hidden rounded-2xl p-5 text-center mb-6 border border-[rgba(245,184,0,0.2)]"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(245,184,0,0.06), rgba(16,185,129,0.04))',
                }}
              >
                <div className="text-[10px] tracking-[0.24em] text-text-muted uppercase mb-1 font-bold">
                  Campeón
                </div>
                <div className="text-xl font-black text-[#F5B800]">
                  {champion}
                </div>
                {finalMatch && (
                  <div className="text-xs text-text-muted mt-2">
                    Final: {finalMatch.carambolasA} -{' '}
                    {finalMatch.carambolasB} ({finalMatch.entriesA} entradas)
                  </div>
                )}
              </div>
            )}

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

                if (actualMatches.length === 0 && round === 1) {
                  // Round 1 only has BYEs that are shown in the panel above
                  return null;
                }

                return (
                  <div key={round} className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">
                        {ROUND_NAMES[round]}
                      </h3>
                      <span className="text-[11px] text-text-muted">
                        {actualMatches.length} partido
                        {actualMatches.length !== 1 ? 's' : ''}
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
                  </div>
                );
              },
            )}
          </>
        )}

        {/* ============ RONDAS VIEW ============ */}
        {viewMode === 'rondas' && (
          <div className="mt-2">
            <div className="mb-4">
              <h3 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">
                Rondas Previas a Octavos de Final
              </h3>
              <p className="text-[11px] text-text-muted mt-1">
                Primera Ronda (22 BYE + 10 partidos) → Segunda Ronda (16
                partidos) → Octavos
              </p>
            </div>
            <RondasBracket matches={ELIMINATION_MATCHES} />
          </div>
        )}

        {/* ============ CUADRO VIEW ============ */}
        {viewMode === 'cuadro' && (
          <div className="mt-2">
            <TournamentBracket matches={ELIMINATION_MATCHES} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  View toggle button                                                 */
/* ------------------------------------------------------------------ */

function ViewButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
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
