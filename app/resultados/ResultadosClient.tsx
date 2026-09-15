'use client';

import { useState, useMemo } from 'react';
import FilterPills from '../components/FilterPills';
import MatchResultCard from '../components/MatchResultCard';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import type { GroupResult, TournamentConfig } from '../data/types';
import { fmtAvg, fmtPct } from '../lib/format';

export default function ResultadosClient({
  results,
  config,
}: {
  results: GroupResult[];
  config: TournamentConfig;
}) {
  const [groupFilter, setGroupFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const groups = [...new Set(results.map(r => r.group))].sort((a, b) => a - b);

  const groupItems = [
    { key: 'all', label: 'Todos' },
    ...groups.map(g => ({ key: String(g), label: `Grupo ${g}` })),
  ];

  const statusItems = [
    { key: 'all', label: 'Todos' },
    { key: 'played', label: 'Jugados' },
    { key: 'pending', label: 'Sin jugar' },
  ];

  const filtered = results.filter(r => {
    if (groupFilter !== 'all' && r.group !== Number(groupFilter)) return false;
    if (statusFilter === 'played' && r.status === 'pending') return false;
    if (statusFilter === 'pending' && r.status !== 'pending') return false;
    return true;
  });

  /**
   * Estadísticas del torneo. Solo cuentan los partidos realmente
   * jugados: un partido pendiente tiene carambolas en null y no debe
   * arrastrar los promedios hacia abajo. Los W.O. tampoco cuentan,
   * porque sus carambolas (1 y 0) son convencionales, no jugadas.
   */
  const stats = useMemo(() => {
    const real = results.filter(r => r.status === 'played' || r.status === 'draw');

    let carambolas = 0;
    let entries = 0;
    let best = { avg: -1, player: '' };
    let bestPct = { pct: -1, player: '' };
    let topScore = { car: -1, player: '' };

    for (const r of real) {
      for (const side of [
        { c: r.carambolasA, e: r.entriesA, a: r.averageA, p: r.pctA, n: r.playerA },
        { c: r.carambolasB, e: r.entriesB, a: r.averageB, p: r.pctB, n: r.playerB },
      ]) {
        if (side.c !== null) carambolas += side.c;
        if (side.e !== null) entries += side.e;
        if (side.a !== null && side.a > best.avg) best = { avg: side.a, player: side.n };
        if (side.p !== null && side.p > bestPct.pct) bestPct = { pct: side.p, player: side.n };
        if (side.c !== null && side.c > topScore.car) topScore = { car: side.c, player: side.n };
      }
    }

    return {
      played: real.length,
      pending: results.filter(r => r.status === 'pending').length,
      walkovers: results.filter(r => r.status === 'walkover').length,
      draws: results.filter(r => r.status === 'draw').length,
      carambolas,
      general: entries > 0 ? carambolas / entries : null,
      best: best.avg >= 0 ? best : null,
      bestPct: bestPct.pct >= 0 ? bestPct : null,
      topScore: topScore.car >= 0 ? topScore : null,
    };
  }, [results]);

  if (results.length === 0) {
    return (
      <div className="animate-fade-in px-4 py-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text mb-6">Resultados</h2>
          <EmptyState message="La hoja RESULTADOS todavía no tiene partidos. Corre los pasos 3 y 4 del menú «Torneo Billar» en el Google Sheets." />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text">
            Resultados
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Fase de grupos · {stats.played} jugados de {results.length}
            {stats.pending > 0 && ` · ${stats.pending} sin jugar`}
            {stats.walkovers > 0 && ` · ${stats.walkovers} W.O.`}
            {stats.draws > 0 && ` · ${stats.draws} empates`}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          <StatCard label="Total carambolas" value={stats.carambolas} />
          <StatCard label="Promedio general" value={fmtAvg(stats.general)} hint="carambolas por entrada" />
          <StatCard
            label="Mejor promedio"
            value={fmtAvg(stats.best?.avg ?? null)}
            hint={stats.best?.player}
            accent
          />
          {config.mixedCategories ? (
            <StatCard
              label="Mejor % objetivo"
              value={fmtPct(stats.bestPct?.pct ?? null)}
              hint={stats.bestPct?.player}
              accent
            />
          ) : (
            <StatCard
              label="Mayor tanteo"
              value={stats.topScore?.car ?? '—'}
              hint={stats.topScore?.player}
              accent
            />
          )}
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <FilterPills items={groupItems} active={groupFilter} onChange={setGroupFilter} />
          <FilterPills items={statusItems} active={statusFilter} onChange={setStatusFilter} />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            message="No hay partidos con ese filtro."
            onReset={() => {
              setGroupFilter('all');
              setStatusFilter('all');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger-children">
            {filtered.map(result => (
              <MatchResultCard key={`${result.group}-${result.match}`} result={result} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
