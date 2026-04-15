'use client';

import { useState, useMemo } from 'react';
import FilterPills from '../components/FilterPills';
import MatchResultCard from '../components/MatchResultCard';
import EmptyState from '../components/EmptyState';

interface GroupResult {
  group: number;
  match: number;
  playerA: string;
  carambolasA: number;
  entriesA: number;
  averageA: number;
  playerB: string;
  carambolasB: number;
  entriesB: number;
  averageB: number;
  winner: string;
  walkover: boolean;
}

export default function ResultadosClient({ results }: { results: GroupResult[] }) {
  const [groupFilter, setGroupFilter] = useState('all');
  const groups = [...new Set(results.map(r => r.group))].sort((a, b) => a - b);

  const groupItems = [
    { key: 'all', label: 'Todos' },
    ...groups.map(g => ({ key: String(g), label: `Grupo ${g}` })),
  ];

  const filtered = groupFilter === 'all'
    ? results
    : results.filter(r => r.group === Number(groupFilter));

  // Calculate tournament stats
  const tournamentStats = useMemo(() => {
    const totalMatches = results.filter(r => !r.walkover).length;
    const totalCarambolas = results.reduce((sum, r) => sum + r.carambolasA + r.carambolasB, 0);
    const totalEntries = results.reduce((sum, r) => sum + r.entriesA + r.entriesB, 0);
    const avgGeneral = totalEntries > 0 ? totalCarambolas / totalEntries : 0;

    // Best individual average
    let bestAvg = 0;
    let bestAvgPlayer = '';
    for (const r of results) {
      if (r.averageA > bestAvg && !r.walkover) { bestAvg = r.averageA; bestAvgPlayer = r.playerA; }
      if (r.averageB > bestAvg && !r.walkover) { bestAvg = r.averageB; bestAvgPlayer = r.playerB; }
    }

    // Highest carambolas in a single match
    let bestScore = 0;
    let bestScorePlayer = '';
    for (const r of results) {
      if (r.carambolasA > bestScore) { bestScore = r.carambolasA; bestScorePlayer = r.playerA; }
      if (r.carambolasB > bestScore) { bestScore = r.carambolasB; bestScorePlayer = r.playerB; }
    }

    return { totalMatches, totalCarambolas, avgGeneral, bestAvg, bestAvgPlayer, bestScore, bestScorePlayer };
  }, [results]);

  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text">
              Resultados
            </h2>
            <p className="text-sm text-text-muted mt-1">Fase de grupos · {results.length} partidos</p>
          </div>
          <span className="text-sm text-text-muted bg-white/5 px-3 py-1 rounded-full">
            {filtered.length} partidos
          </span>
        </div>

        {/* Tournament stats summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6 mt-4">
          <div className="glass-card rounded-lg p-3 text-center">
            <div className="text-lg font-black text-emerald-400">{tournamentStats.totalCarambolas}</div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Total Carambolas</div>
          </div>
          <div className="glass-card rounded-lg p-3 text-center">
            <div className="text-lg font-black text-emerald-400">{tournamentStats.avgGeneral.toFixed(3)}</div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Promedio General</div>
          </div>
          <div className="glass-card rounded-lg p-3 text-center">
            <div className="text-lg font-black text-[#F5B800]">{tournamentStats.bestAvg.toFixed(3)}</div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Mejor Promedio</div>
            <div className="text-[9px] text-text-muted truncate">{tournamentStats.bestAvgPlayer}</div>
          </div>
          <div className="glass-card rounded-lg p-3 text-center">
            <div className="text-lg font-black text-[#F5B800]">{tournamentStats.bestScore}</div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Mayor Carambolas</div>
            <div className="text-[9px] text-text-muted truncate">{tournamentStats.bestScorePlayer}</div>
          </div>
        </div>

        <div className="mb-6">
          <FilterPills items={groupItems} active={groupFilter} onChange={setGroupFilter} />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            message="No se encontraron resultados para el grupo seleccionado."
            onReset={() => setGroupFilter('all')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger-children">
            {filtered.map((result) => (
              <MatchResultCard key={`${result.group}-${result.match}`} result={result} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
