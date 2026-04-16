'use client';

import { useState, useMemo, useEffect } from 'react';
import type { ScheduleMatch, EliminationMatch } from '../data/types';
import { SCHEDULE, formatDate, formatDateFull } from '../data/schedule';
import { ELIMINATION_MATCHES, ROUND_NAMES } from '../data/elimination';
import { fetchEliminationClient, fetchResultsClient, type GroupResult } from '../lib/sheets-client';

/* ------------------------------------------------------------------ */
/*  Build schedule from data                                           */
/* ------------------------------------------------------------------ */

const ELIM_DATE = '2026-02-01';

const ROUND_LABELS: Record<number, string> = {
  1: 'Primera Ronda', 2: 'Segunda Ronda', 3: 'Octavos de Final',
  4: 'Cuartos de Final', 5: 'Semifinal', 6: 'Final',
};

function findResult(results: GroupResult[], group: number, playerA: string, playerB: string): GroupResult | undefined {
  return results.find(r =>
    r.group === group && (
      (r.playerA.includes(playerA.split(' ')[0]) && r.playerB.includes(playerB.split(' ')[0])) ||
      (r.playerA.includes(playerB.split(' ')[0]) && r.playerB.includes(playerA.split(' ')[0]))
    )
  );
}

function buildElimSchedule(elimData: EliminationMatch[]): ScheduleMatch[] {
  const matches: ScheduleMatch[] = [];
  const real = elimData.filter(m => !m.isBye);
  let hour = 9, slotCount = 0;

  for (const m of real) {
    const table = (slotCount % 2) + 1;
    const time = `${hour.toString().padStart(2, '0')}:00`;
    const hasScore = m.carambolasA > 0 || m.carambolasB > 0;
    matches.push({
      date: ELIM_DATE, time, table,
      round: ROUND_LABELS[m.round] || `Ronda ${m.round}`,
      playerA: m.playerA, playerB: m.playerB,
      scoreA: hasScore ? m.carambolasA : undefined,
      scoreB: hasScore ? m.carambolasB : undefined,
      winner: m.winner || undefined,
      status: hasScore ? 'ended' : 'scheduled',
    });
    slotCount++;
    if (slotCount % 2 === 0) { hour++; if (hour === 13) hour = 14; }
  }
  return matches;
}

/* ------------------------------------------------------------------ */
/*  UI Components                                                      */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: 'scheduled' | 'live' | 'ended' }) {
  if (status === 'live') return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> EN VIVO
    </span>
  );
  if (status === 'ended') return (
    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Finalizado</span>
  );
  return <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">Programado</span>;
}

function PlayerRow({ name, score, isWinner, hasScores }: { name: string; score?: number; isWinner: boolean; hasScores: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-bg-darkest/30 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-text-muted/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
        </svg>
      </div>
      <span className={`flex-1 text-sm font-semibold truncate ${isWinner ? 'text-text-primary' : hasScores ? 'text-text-muted' : 'text-text-primary'}`}>
        {name}
      </span>
      {hasScores && (
        <div className="flex items-center gap-2">
          <span className={`text-lg font-black ${isWinner ? 'text-emerald-400' : 'text-text-muted'}`}>{score}</span>
          {isWinner && (
            <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <span className="text-[8px] font-black text-white">W</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function ScheduleCard({ match }: { match: ScheduleMatch }) {
  const hasScores = match.scoreA != null && match.scoreB != null;
  const isWinnerA = hasScores && match.winner === match.playerA;
  const isWinnerB = hasScores && match.winner === match.playerB;

  return (
    <div className="glass-card rounded-xl overflow-hidden glow-hover">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-light">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-text-primary">{match.time}</span>
          {hasScores && <StatusBadge status={match.status} />}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-muted tracking-wider uppercase">
            {match.round}{match.group ? ` · G${match.group}` : ''}
          </span>
          <span className="text-[10px] text-text-muted/80 bg-bg-darkest/30 px-1.5 py-0.5 rounded">Mesa {match.table}</span>
        </div>
      </div>
      <div className="px-4 py-3 space-y-2">
        <PlayerRow name={match.playerA} score={match.scoreA} isWinner={isWinnerA} hasScores={hasScores} />
        <PlayerRow name={match.playerB} score={match.scoreB} isWinner={isWinnerB} hasScores={hasScores} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function CalendarioClient() {
  // Static data shown immediately (always the base — never replaced)
  const staticGroups = useMemo(() => [...SCHEDULE], []);
  const staticElim = useMemo(() => buildElimSchedule(ELIMINATION_MATCHES), []);

  // Live scores from Google Sheets (overlay on top of static)
  const [liveResults, setLiveResults] = useState<GroupResult[] | null>(null);
  const [liveElim, setLiveElim] = useState<ScheduleMatch[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [elimData, resultsData] = await Promise.all([
        fetchEliminationClient(),
        fetchResultsClient(),
      ]);
      if (cancelled) return;
      if (elimData) setLiveElim(buildElimSchedule(elimData));
      if (resultsData) setLiveResults(resultsData);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Merge: static groups + live scores overlay
  const groupsWithScores = useMemo(() => {
    if (!liveResults) return staticGroups;
    return staticGroups.map(m => {
      if (!m.group) return m;
      const result = findResult(liveResults, m.group, m.playerA, m.playerB);
      const hasResult = result && (result.carambolasA > 0 || result.carambolasB > 0);
      if (!hasResult) return { ...m, status: 'scheduled' as const };
      return {
        ...m,
        scoreA: result.carambolasA,
        scoreB: result.carambolasB,
        winner: result.winner,
        status: 'ended' as const,
      };
    });
  }, [staticGroups, liveResults]);

  const allMatches = useMemo(() => {
    const elim = liveElim ?? staticElim;
    return [...groupsWithScores, ...elim];
  }, [groupsWithScores, liveElim, staticElim]);

  const dates = useMemo(() => [...new Set(allMatches.map(m => m.date))].sort(), [allMatches]);
  const [selectedDate, setSelectedDate] = useState('');

  // Set initial date once dates are available
  useEffect(() => {
    if (dates.length > 0 && !selectedDate) setSelectedDate(dates[0]);
  }, [dates, selectedDate]);

  const [viewTab, setViewTab] = useState<'schedule' | 'results'>('schedule');
  const dayMatches = allMatches.filter(m => m.date === selectedDate);
  const filteredMatches = viewTab === 'results' ? dayMatches.filter(m => m.scoreA != null) : dayMatches;

  const byTime: Record<string, ScheduleMatch[]> = {};
  for (const m of filteredMatches) {
    if (!byTime[m.time]) byTime[m.time] = [];
    byTime[m.time].push(m);
  }

  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text mb-2">Calendario</h2>
        <p className="text-sm text-text-muted mb-6">Programación de partidos y resultados por jornada</p>

        <div className="flex gap-0 mb-4 border-b border-border-light">
          {(['schedule', 'results'] as const).map(tab => (
            <button key={tab} onClick={() => setViewTab(tab)}
              className={`px-5 py-2.5 text-sm font-semibold transition-colors relative ${viewTab === tab ? 'text-emerald-400' : 'text-text-muted hover:text-text-primary'}`}>
              {tab === 'schedule' ? 'Programación' : 'Resultados'}
              {viewTab === tab && <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-emerald-400 rounded-full" />}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
          {dates.map(date => {
            const isActive = date === selectedDate;
            const count = allMatches.filter(m => m.date === date).length;
            return (
              <button key={date} onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-bg-secondary text-text-muted border border-border-light hover:border-emerald/20'}`}>
                <span className="text-xs">{formatDate(date)}</span>
                <span className={`ml-1.5 text-[10px] ${isActive ? 'text-emerald-400' : 'text-text-muted/70'}`}>({count})</span>
              </button>
            );
          })}
        </div>

        <div className="text-sm text-text-muted mb-4 font-medium">{formatDateFull(selectedDate)}</div>

        {Object.keys(byTime).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-text-muted text-sm">No hay partidos {viewTab === 'results' ? 'con resultados' : ''} para esta fecha</div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(byTime).sort(([a], [b]) => a.localeCompare(b)).map(([time, matches]) => (
              <div key={time} className="space-y-3">
                {matches.map((match, idx) => (
                  <ScheduleCard key={`${match.date}-${match.time}-${idx}`} match={match} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
