'use client';

import { useState, useMemo } from 'react';
import type { ProgramacionDay } from '../lib/sheets';
import type { ScheduleMatch } from '../data/types';
import {
  SCHEDULE,
  getScheduleDates,
  getMatchesByDate,
  formatDate,
  formatDateFull,
} from '../data/schedule';

/* ------------------------------------------------------------------ */
/*  Merge dynamic programming (Sheets) + static elimination schedule   */
/* ------------------------------------------------------------------ */

function parseTime24(timeStr: string): string {
  const clean = timeStr.replace(/\s+/g, ' ').trim().toLowerCase();
  const match = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(a\.?\s*m\.?|p\.?\s*m\.?|m\.?)?$/);
  if (!match) return '00:00';
  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = (match[3] || '').replace(/[\s.]/g, '');
  if (period.startsWith('p') && hours < 12) hours += 12;
  if (period.startsWith('a') && hours === 12) hours = 0;
  if (period === 'm') hours = 12;
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

function buildSchedule(_programacion: ProgramacionDay[]): ScheduleMatch[] {
  // Use verified static schedule (groups + elimination)
  // The static data in schedule.ts is the source of truth.
  // When Google Sheets data is needed for a NEW tournament,
  // update schedule.ts with the new programming data.
  return [...SCHEDULE];
}

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: 'scheduled' | 'live' | 'ended' }) {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        EN VIVO
      </span>
    );
  }
  if (status === 'ended') {
    return (
      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
        Finalizado
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
      Programado
    </span>
  );
}

function ScheduleCard({ match }: { match: ScheduleMatch }) {
  const isEnded = match.status === 'ended';
  const hasScores = match.scoreA != null && match.scoreB != null;
  const isWinnerA = isEnded && hasScores && match.winner === match.playerA;
  const isWinnerB = isEnded && hasScores && match.winner === match.playerB;

  return (
    <div className="glass-card rounded-xl overflow-hidden glow-hover">
      {/* Match header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-light">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-text-primary">{match.time}</span>
          {hasScores && <StatusBadge status={match.status} />}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-muted tracking-wider uppercase">
            {match.round}
            {match.group ? ` · G${match.group}` : ''}
          </span>
          <span className="text-[10px] text-text-muted/80 bg-bg-darkest/30 px-1.5 py-0.5 rounded">
            Mesa {match.table}
          </span>
        </div>
      </div>

      {/* Players */}
      <div className="px-4 py-3 space-y-2">
        {/* Player A */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-bg-darkest/30 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-text-muted/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
            </svg>
          </div>
          <span className={`flex-1 text-sm font-semibold truncate ${isWinnerA ? 'text-text-primary' : hasScores ? 'text-text-muted' : 'text-text-primary'}`}>
            {match.playerA}
          </span>
          {hasScores && (
            <div className="flex items-center gap-2">
              <span className={`text-lg font-black ${isWinnerA ? 'text-emerald-400' : 'text-text-muted'}`}>
                {match.scoreA}
              </span>
              {isWinnerA && (
                <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-[8px] font-black text-white">W</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Player B */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-bg-darkest/30 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-text-muted/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
            </svg>
          </div>
          <span className={`flex-1 text-sm font-semibold truncate ${isWinnerB ? 'text-text-primary' : hasScores ? 'text-text-muted' : 'text-text-primary'}`}>
            {match.playerB}
          </span>
          {hasScores && (
            <div className="flex items-center gap-2">
              <span className={`text-lg font-black ${isWinnerB ? 'text-emerald-400' : 'text-text-muted'}`}>
                {match.scoreB}
              </span>
              {isWinnerB && (
                <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-[8px] font-black text-white">W</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main client component                                              */
/* ------------------------------------------------------------------ */

export default function CalendarioClient({
  programacion,
}: {
  programacion: ProgramacionDay[];
}) {
  const allMatches = useMemo(() => buildSchedule(programacion), [programacion]);

  const dates = useMemo(() => {
    return [...new Set(allMatches.map(m => m.date))].sort();
  }, [allMatches]);

  const [selectedDate, setSelectedDate] = useState(dates[0] || '');
  const [viewTab, setViewTab] = useState<'schedule' | 'results'>('schedule');

  const dayMatches = allMatches.filter(m => m.date === selectedDate);
  const filteredMatches =
    viewTab === 'results'
      ? dayMatches.filter((m) => m.scoreA != null)
      : dayMatches;

  // Group by time slot
  const byTime: Record<string, ScheduleMatch[]> = {};
  for (const m of filteredMatches) {
    if (!byTime[m.time]) byTime[m.time] = [];
    byTime[m.time].push(m);
  }

  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text mb-2">
          Calendario
        </h2>
        <p className="text-sm text-text-muted mb-6">
          Programación de partidos y resultados por jornada
        </p>

        {/* Schedule / Results toggle */}
        <div className="flex gap-0 mb-4 border-b border-border-light">
          <button
            onClick={() => setViewTab('schedule')}
            className={`px-5 py-2.5 text-sm font-semibold transition-colors relative ${
              viewTab === 'schedule'
                ? 'text-emerald-400'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Programación
            {viewTab === 'schedule' && (
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-emerald-400 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setViewTab('results')}
            className={`px-5 py-2.5 text-sm font-semibold transition-colors relative ${
              viewTab === 'results'
                ? 'text-emerald-400'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Resultados
            {viewTab === 'results' && (
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-emerald-400 rounded-full" />
            )}
          </button>
        </div>

        {/* Date pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
          {dates.map((date) => {
            const isActive = date === selectedDate;
            const matchCount = allMatches.filter(m => m.date === date).length;
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-bg-secondary text-text-muted border border-border-light hover:border-emerald/20'
                }`}
              >
                <span className="text-xs">{formatDate(date)}</span>
                <span className={`ml-1.5 text-[10px] ${isActive ? 'text-emerald-400' : 'text-text-muted/70'}`}>
                  ({matchCount})
                </span>
              </button>
            );
          })}
        </div>

        {/* Date header */}
        <div className="text-sm text-text-muted mb-4 font-medium">
          {formatDateFull(selectedDate)}
        </div>

        {/* Matches grouped by time */}
        {Object.keys(byTime).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-text-muted text-sm">
              No hay partidos {viewTab === 'results' ? 'con resultados' : ''} para esta fecha
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(byTime)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([time, matches]) => (
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
