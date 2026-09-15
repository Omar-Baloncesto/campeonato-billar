'use client';

import { useState, useMemo } from 'react';
import { getCityColor } from '../lib/constants';
import FilterPills from '../components/FilterPills';
import EmptyState from '../components/EmptyState';
import { fmtAvg, EMPTY } from '../lib/format';
import { shortRoundName } from '../lib/rounds';
import type { RankingFinalRow, RankingGroupRow, Player } from '../data/types';

function medal(pos: number) {
  if (pos === 1) return <span className="medal-gold text-lg">🥇</span>;
  if (pos === 2) return <span className="medal-silver text-lg">🥈</span>;
  if (pos === 3) return <span className="medal-bronze text-lg">🥉</span>;
  return <span className="text-text-muted text-sm tabular-nums">{pos}</span>;
}

function normalize(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
}

export default function RankingClient({
  rankingFinal,
  rankingGroups,
  roundNames,
  players,
}: {
  rankingFinal: RankingFinalRow[];
  rankingGroups: RankingGroupRow[];
  roundNames: Record<number, string>;
  players: Player[];
}) {
  const [tab, setTab] = useState(rankingFinal.length > 0 ? 'final' : 'groups');

  const byName = useMemo(() => {
    const m = new Map<string, Player>();
    for (const p of players) m.set(normalize(p.name), p);
    return m;
  }, [players]);

  const tabs = [
    { key: 'final', label: 'Ranking Final' },
    { key: 'groups', label: 'Ranking de Grupos' },
  ];

  const roundLabel = (round: number) => {
    const name = roundNames[round];
    if (name) return `Llegó a ${shortRoundName(name).toLowerCase()}`;
    return `Ronda ${round}`;
  };

  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text mb-2">
          Ranking
        </h2>
        <p className="text-sm text-text-muted mb-6">
          Estas dos tablas son fotos que genera el Google Sheets: se actualizan cuando se corre
          el paso correspondiente del menú «Torneo Billar».
        </p>

        <div className="mb-6">
          <FilterPills items={tabs} active={tab} onChange={setTab} />
        </div>

        {tab === 'final' && (
          rankingFinal.length === 0 ? (
            <EmptyState message="El ranking final todavía no está generado. Se crea al terminar la eliminación, desde el menú «Torneo Billar»." />
          ) : (
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="bg-bg-header px-4 py-3 border-b border-border-light">
                <h3 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">
                  Ranking Final por Ronda Alcanzada
                </h3>
                <p className="text-[11px] text-text-muted mt-1">{rankingFinal.length} jugadores</p>
              </div>
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-text-muted/70 text-xs border-b border-border-subtle">
                      <th className="px-4 py-3 text-left w-12">#</th>
                      <th className="px-4 py-3 text-left">Jugador</th>
                      <th className="px-3 py-3 text-left hidden sm:table-cell">Categoría</th>
                      <th className="px-3 py-3 text-left hidden md:table-cell">Club</th>
                      <th className="px-4 py-3 text-left">Etapa alcanzada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingFinal.map(r => {
                      const p = byName.get(normalize(r.player));
                      return (
                        <tr
                          key={`${r.ranking}-${r.player}`}
                          className={`table-row-hover border-b border-border-subtle ${r.ranking <= 3 ? 'bg-emerald/[0.03]' : ''}`}
                        >
                          <td className="px-4 py-3">{medal(r.ranking)}</td>
                          <td className="px-4 py-3 font-semibold">{r.player}</td>
                          <td className="px-3 py-3 text-xs text-text-muted hidden sm:table-cell">{p?.category || EMPTY}</td>
                          <td className="px-3 py-3 hidden md:table-cell">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: getCityColor(p?.city || '') }} />
                              <span className="text-xs text-text-muted">{p?.city || EMPTY}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-text-primary">{roundLabel(r.roundReached)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {tab === 'groups' && (
          rankingGroups.length === 0 ? (
            <EmptyState message="El ranking de grupos todavía no está generado." />
          ) : (
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="bg-bg-header px-4 py-3 border-b border-border-light">
                <h3 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">
                  Ranking de la Fase de Grupos
                </h3>
                <p className="text-[11px] text-text-muted mt-1">
                  {rankingGroups.length} jugadores · ordenados como se siembra la eliminación
                </p>
              </div>
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-text-muted/70 text-xs border-b border-border-subtle">
                      <th className="px-3 py-3 text-left w-10">#</th>
                      <th className="px-3 py-3 text-left">Jugador</th>
                      <th className="px-3 py-3 text-left hidden sm:table-cell">Categoría</th>
                      <th className="px-3 py-3 text-left hidden lg:table-cell">Club</th>
                      <th className="px-2 py-3 text-center" title="Grupo">Gr</th>
                      <th className="px-2 py-3 text-center" title="Carambolas a favor">Car</th>
                      <th className="px-2 py-3 text-center hidden sm:table-cell" title="Entradas">Ent</th>
                      <th className="px-2 py-3 text-center" title="Carambolas por entrada">Prom</th>
                      <th className="px-2 py-3 text-center">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingGroups.map(r => {
                      const p = byName.get(normalize(r.player));
                      // La columna C del Sheet se titula «Ciudad» pero trae la
                      // categoría. Se usa la de JUGADORES y esa queda de respaldo.
                      const category = p?.category || r.categoryOrCity;
                      const city = p?.city || '';
                      return (
                        <tr
                          key={`${r.ranking}-${r.player}`}
                          className={`table-row-hover border-b border-border-subtle ${r.ranking <= 3 ? 'bg-emerald/[0.03]' : ''}`}
                        >
                          <td className="px-3 py-3">{medal(r.ranking)}</td>
                          <td className="px-3 py-3 font-semibold">{r.player}</td>
                          <td className="px-3 py-3 text-xs text-text-muted hidden sm:table-cell">{category || EMPTY}</td>
                          <td className="px-3 py-3 hidden lg:table-cell">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: getCityColor(city) }} />
                              <span className="text-xs text-text-muted">{city || EMPTY}</span>
                            </div>
                          </td>
                          <td className="px-2 py-3 text-center font-mono text-text-muted tabular-nums">{p?.group ?? EMPTY}</td>
                          <td className="px-2 py-3 text-center font-mono text-emerald-400 tabular-nums">{r.carambolas}</td>
                          <td className="px-2 py-3 text-center font-mono text-text-muted hidden sm:table-cell tabular-nums">{r.entries}</td>
                          <td className="px-2 py-3 text-center font-mono text-text-primary tabular-nums">{fmtAvg(r.average)}</td>
                          <td className="px-2 py-3 text-center font-mono font-bold text-text-primary tabular-nums">{r.points}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
