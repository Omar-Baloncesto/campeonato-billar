'use client';

import { useState } from 'react';
import type { EliminationMatch } from '../data/types';
import { ROUND_NAMES } from '../data/elimination';

// Build the bracket tree: for each match in a round, find which matches fed into it
function buildBracketTree(matches: EliminationMatch[]) {
  // Group by round
  const byRound: Record<number, EliminationMatch[]> = {};
  for (const m of matches) {
    if (!byRound[m.round]) byRound[m.round] = [];
    byRound[m.round].push(m);
  }
  return byRound;
}

function PlayerSlot({
  name,
  score,
  isWinner,
  isBye,
  isEmpty,
  position,
}: {
  name: string;
  score: number;
  isWinner: boolean;
  isBye: boolean;
  isEmpty: boolean;
  position: 'top' | 'bottom';
}) {
  if (isEmpty) {
    return (
      <div
        className={`flex items-center h-8 px-2 ${
          position === 'top'
            ? 'border-b border-white/10 rounded-t'
            : 'rounded-b'
        }`}
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        <span className="text-[10px] text-text-muted/30 italic">TBD</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center h-8 px-2 gap-1 ${
        position === 'top'
          ? 'border-b border-white/10 rounded-t'
          : 'rounded-b'
      } ${isWinner ? 'bg-emerald-500/10' : ''}`}
      style={{
        background: isWinner
          ? 'rgba(16, 185, 129, 0.08)'
          : 'rgba(255,255,255,0.02)',
      }}
    >
      <span
        className={`flex-1 text-[10px] xl:text-[11px] truncate font-medium ${
          isWinner ? 'text-white font-bold' : 'text-text-muted'
        } ${isBye ? 'italic opacity-50' : ''}`}
      >
        {name}
      </span>
      {!isBye && (
        <span
          className={`text-[11px] font-mono font-bold min-w-[18px] text-center rounded px-1 ${
            isWinner
              ? 'text-emerald-400 bg-emerald-400/10'
              : 'text-text-muted/60'
          }`}
        >
          {score}
        </span>
      )}
      {isWinner && !isBye && (
        <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
          <span className="text-[8px] font-black text-white">W</span>
        </span>
      )}
    </div>
  );
}

function MatchCard({
  match,
  compact,
}: {
  match: EliminationMatch;
  compact?: boolean;
}) {
  const isWinnerA = match.winner === match.playerA;
  const isWinnerB = match.winner === match.playerB;

  if (match.isBye) {
    return (
      <div
        className="rounded border border-white/5 overflow-hidden opacity-40"
        style={{ width: compact ? 160 : 190 }}
      >
        <PlayerSlot
          name={match.playerA}
          score={0}
          isWinner={false}
          isBye={true}
          isEmpty={false}
          position="top"
        />
        <PlayerSlot
          name="BYE"
          score={0}
          isWinner={false}
          isBye={true}
          isEmpty={false}
          position="bottom"
        />
      </div>
    );
  }

  return (
    <div
      className="rounded border border-white/10 overflow-hidden hover:border-emerald-500/30 transition-colors"
      style={{ width: compact ? 160 : 190 }}
    >
      <PlayerSlot
        name={match.playerA || 'TBD'}
        score={match.carambolasA}
        isWinner={isWinnerA}
        isBye={false}
        isEmpty={!match.playerA}
        position="top"
      />
      <PlayerSlot
        name={match.playerB || 'TBD'}
        score={match.carambolasB}
        isWinner={isWinnerB}
        isBye={false}
        isEmpty={!match.playerB}
        position="bottom"
      />
    </div>
  );
}

function ChampionBadge({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative">
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          className="drop-shadow-lg"
        >
          {/* Outer ring */}
          <circle
            cx="40"
            cy="40"
            r="38"
            stroke="url(#goldGrad)"
            strokeWidth="3"
            fill="none"
          />
          {/* Inner fill */}
          <circle cx="40" cy="40" r="34" fill="url(#goldGradFill)" />
          {/* Trophy icon */}
          <path
            d="M30 28h20v4c0 6-4 11-10 13-6-2-10-7-10-13v-4z"
            fill="#1a1a2e"
            stroke="#F5B800"
            strokeWidth="1.5"
          />
          <path d="M26 28h-3c0 5 3 8 7 9v-1c-3-1-4-4-4-8z" fill="#F5B800" />
          <path d="M54 28h3c0 5-3 8-7 9v-1c3-1 4-4 4-8z" fill="#F5B800" />
          <rect x="37" y="45" width="6" height="4" rx="1" fill="#F5B800" />
          <rect x="33" y="49" width="14" height="3" rx="1.5" fill="#F5B800" />
          {/* Number 1 */}
          <text
            x="40"
            y="42"
            textAnchor="middle"
            fill="#F5B800"
            fontSize="14"
            fontWeight="900"
            fontFamily="system-ui"
          >
            1
          </text>
          <defs>
            <linearGradient id="goldGrad" x1="0" y1="0" x2="80" y2="80">
              <stop offset="0%" stopColor="#F5B800" />
              <stop offset="50%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#B8860B" />
            </linearGradient>
            <linearGradient id="goldGradFill" x1="0" y1="0" x2="80" y2="80">
              <stop offset="0%" stopColor="rgba(245,184,0,0.15)" />
              <stop offset="100%" stopColor="rgba(245,184,0,0.05)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="text-center">
        <div className="text-[10px] tracking-[0.2em] text-[#F5B800]/70 uppercase font-bold mb-1">
          Campeón
        </div>
        <div className="text-sm font-black text-[#F5B800] max-w-[120px] leading-tight">
          {name}
        </div>
      </div>
    </div>
  );
}

export default function TournamentBracket({
  matches,
}: {
  matches: EliminationMatch[];
}) {
  const byRound = buildBracketTree(matches);
  // Only show rounds 3-6 in bracket view (Octavos, Cuartos, Semi, Final)
  const bracketRounds = [3, 4, 5, 6];
  const champion = matches.find((m) => m.round === 6)?.winner;

  // Filter out BYEs for display
  const getRoundMatches = (round: number) => {
    const roundMatches = byRound[round] || [];
    return roundMatches.filter((m) => !m.isBye);
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="min-w-[900px]">
        {/* Round labels */}
        <div className="flex items-end mb-4">
          {bracketRounds.map((round) => (
            <div
              key={round}
              className="flex-1 text-center"
              style={{ minWidth: 200 }}
            >
              <span className="text-[10px] tracking-[0.15em] text-text-muted/60 uppercase font-bold">
                {ROUND_NAMES[round]}
              </span>
            </div>
          ))}
          <div className="flex-shrink-0" style={{ width: 140 }}>
            <span className="text-[10px] tracking-[0.15em] text-[#F5B800]/60 uppercase font-bold block text-center">
              Campeón
            </span>
          </div>
        </div>

        {/* Bracket grid */}
        <div className="flex items-stretch relative">
          {bracketRounds.map((round) => {
            const roundMatches = getRoundMatches(round);
            const matchHeight = 64;
            const gaps = [32, 80, 160, 0];
            const gap = gaps[round - 3] || 32;

            return (
              <div
                key={round}
                className="flex-1 flex flex-col justify-center relative"
                style={{
                  minWidth: 200,
                  gap: `${gap}px`,
                }}
              >
                {roundMatches.map((match, idx) => (
                  <div
                    key={`${match.round}-${match.match}`}
                    className="flex items-center"
                  >
                    <MatchCard match={match} compact={round <= 3} />
                    {/* Connector line to next round */}
                    {round < 6 && (
                      <div
                        className="flex-1 h-px"
                        style={{
                          background:
                            'linear-gradient(to right, rgba(16,185,129,0.3), rgba(16,185,129,0.1))',
                          minWidth: 10,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            );
          })}

          {/* Champion badge */}
          <div
            className="flex-shrink-0 flex items-center justify-center"
            style={{ width: 140 }}
          >
            {champion && <ChampionBadge name={champion} />}
          </div>
        </div>
      </div>
    </div>
  );
}
