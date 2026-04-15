'use client';

import { useState } from 'react';
import {
  SCHEDULE,
  getScheduleDates,
  getMatchesByDate,
  formatDate,
  formatDateFull,
} from '../data/schedule';

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
      <span className="text-[10px] font-bold text-emerald-400/70 bg-emerald-500/10 px-2 py-0.5 rounded-full">
        Finalizado
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold text-blue-400/70 bg-blue-500/10 px-2 py-0.5 rounded-full">
      Programado
    </span>
  );
}

function ScheduleCard({
  match,
}: {
  match: (typeof SCHEDULE)[0];
}) {
  const isEnded = match.status === 'ended';
  const isWinnerA = isEnded && match.winner === match.playerA;
  const isWinnerB = isEnded && match.winner === match.playerB;

  return (
    <div className="glass-card rounded-xl overflow-hidden glow-hover">
      {/* Match header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-text-primary">{match.time}</span>
          <StatusBadge status={match.status} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-muted/60 tracking-wider uppercase">
            {match.round}
            {match.group ? ` · G${match.group}` : ''}
          </span>
          <span className="text-[10px] text-text-muted/40 bg-white/5 px-1.5 py-0.5 rounded">
            Mesa {match.table}
          </span>
        </div>
      </div>

      {/* Players */}
      <div className="px-4 py-3 space-y-2">
        {/* Player A */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
            </svg>
          </div>
          <span className={`flex-1 text-sm font-semibold truncate ${isWinnerA ? 'text-white' : 'text-text-muted'}`}>
            {match.playerA}
          </span>
          {isEnded && (
            <div className="flex items-center gap-2">
              <span className={`text-lg font-black ${isWinnerA ? 'text-emerald-400' : 'text-text-muted/50'}`}>
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
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
            </svg>
          </div>
          <span className={`flex-1 text-sm font-semibold truncate ${isWinnerB ? 'text-white' : 'text-text-muted'}`}>
            {match.playerB}
          </span>
          {isEnded && (
            <div className="flex items-center gap-2">
              <span className={`text-lg font-black ${isWinnerB ? 'text-emerald-400' : 'text-text-muted/50'}`}>
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

export default function CalendarioPage() {
  const dates = getScheduleDates();
  const [selectedDate, setSelectedDate] = useState(dates[dates.length - 1] || dates[0]);
  const [viewTab, setViewTab] = useState<'schedule' | 'results'>('results');

  const dayMatches = getMatchesByDate(selectedDate);
  const filteredMatches =
    viewTab === 'results'
      ? dayMatches.filter((m) => m.status === 'ended')
      : dayMatches;

  // Group by time slot
  const byTime: Record<string, typeof dayMatches> = {};
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
        <div className="flex gap-0 mb-4 border-b border-white/10">
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
            const matchCount = getMatchesByDate(date).length;
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-text-muted border border-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-xs">{formatDate(date)}</span>
                <span className={`ml-1.5 text-[10px] ${isActive ? 'text-emerald-400/60' : 'text-text-muted/40'}`}>
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

        {/* Time notice */}
        <div className="flex items-center gap-2 text-[11px] text-text-muted/50 mb-4 px-1">
          <div className="w-2 h-2 rounded-full bg-text-muted/30" />
          Todos los horarios son hora local
        </div>

        {/* Matches grouped by time */}
        {Object.keys(byTime).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-text-muted/40 text-sm">
              No hay partidos {viewTab === 'results' ? 'finalizados' : ''} para esta fecha
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
