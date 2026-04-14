'use client';

import { useState, useMemo } from 'react';
import FilterPills from '../components/FilterPills';
import GroupStandingsTable from '../components/GroupStandingsTable';
import CuadroPrincipal from '../components/CuadroPrincipal';
import EmptyState from '../components/EmptyState';
import type { GroupStanding, GroupData } from '../data/types';

function getMedal(pos: number) {
  if (pos === 1) return <span className="text-lg">🥇</span>;
  if (pos === 2) return <span className="text-lg">🥈</span>;
  if (pos === 3) return <span className="text-lg">🥉</span>;
  return <span className="text-text-muted text-sm">{pos}</span>;
}

export default function GruposClient({ groups }: { groups: GroupData[] }) {
  const [view, setView] = useState('groups');
  const [groupFilter, setGroupFilter] = useState('all');

  const viewItems = [
    { key: 'cuadro', label: 'Cuadro Principal' },
    { key: 'groups', label: 'Tablas de Grupo' },
    { key: 'ranking', label: 'Ranking General' },
  ];

  const groupItems = [
    { key: 'all', label: 'Todos' },
    ...groups.map(g => ({ key: String(g.number), label: `Grupo ${g.number}` })),
  ];

  const filtered = groupFilter === 'all'
    ? groups
    : groups.filter(g => g.number === Number(groupFilter));

  // Build ranking of all players sorted by generalClassification
  const playerRanking = useMemo(() => {
    const allPlayers: (GroupStanding & { group: number })[] = [];
    for (const g of groups) {
      for (const s of g.standings) {
        allPlayers.push({ ...s, group: g.number });
      }
    }
    return allPlayers
      .filter(p => p.generalClassification > 0)
      .sort((a, b) => a.generalClassification - b.generalClassification);
  }, [groups]);

  // Calculate BYE threshold: nextPowerOf2(totalPlayers) - totalPlayers
  const totalPlayers = playerRanking.length;
  const nextPow2 = Math.pow(2, Math.ceil(Math.log2(totalPlayers)));
  const byeCount = nextPow2 - totalPlayers;

  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text mb-6">
          Grupos
        </h2>

        <div className="mb-4">
          <FilterPills items={viewItems} active={view} onChange={setView} />
        </div>

        {view === 'cuadro' && (
          <CuadroPrincipal groups={groups} />
        )}

        {view === 'groups' && (
          <>
            <div className="mb-6">
              <FilterPills items={groupItems} active={groupFilter} onChange={setGroupFilter} />
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                message="No se encontraron grupos con el filtro seleccionado."
                onReset={() => setGroupFilter('all')}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger-children">
                {filtered.map((group) => (
                  <GroupStandingsTable key={group.number} group={group as never} />
                ))}
              </div>
            )}
          </>
        )}

        {view === 'ranking' && (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="bg-bg-header px-4 py-3 border-b border-border-light">
              <h3 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">
                Ranking General de Jugadores
              </h3>
              <p className="text-[11px] text-text-muted mt-1">
                {totalPlayers} jugadores · Los primeros {byeCount} quedan en BYE (no juegan 1ra ronda de eliminacion)
              </p>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-text-muted/70 border-b border-border-subtle">
                    <th className="px-3 py-2.5 text-left font-semibold w-10">#</th>
                    <th className="px-3 py-2.5 text-left font-semibold">Jugador</th>
                    <th className="px-2 py-2.5 text-center font-semibold">Grupo</th>
                    <th className="px-2 py-2.5 text-center font-semibold">Ord</th>
                    <th className="px-2 py-2.5 text-center font-semibold">Pts</th>
                    <th className="px-2 py-2.5 text-center font-semibold">Dif</th>
                    <th className="px-2 py-2.5 text-center font-semibold">CA</th>
                    <th className="px-3 py-2.5 text-center font-semibold">1ra Ronda</th>
                  </tr>
                </thead>
                <tbody>
                  {playerRanking.map((p) => {
                    const isBye = p.generalClassification <= byeCount;
                    return (
                      <tr
                        key={p.generalClassification}
                        className={`table-row-hover border-b border-border-subtle ${
                          isBye ? 'bg-emerald/[0.04]' : ''
                        } ${p.generalClassification === byeCount ? 'border-b-2 border-b-emerald/30' : ''}`}
                      >
                        <td className="px-3 py-2.5">{getMedal(p.generalClassification)}</td>
                        <td className="px-3 py-2.5 font-semibold text-text-primary">{p.player}</td>
                        <td className="px-2 py-2.5 text-center font-mono text-text-muted">{p.group}</td>
                        <td className="px-2 py-2.5 text-center font-mono text-text-muted">{p.groupOrder}°</td>
                        <td className="px-2 py-2.5 text-center font-mono font-bold text-text-primary">{p.totalPts}</td>
                        <td className={`px-2 py-2.5 text-center font-mono font-bold ${p.differential > 0 ? 'text-positive' : p.differential < 0 ? 'text-negative' : 'text-text-muted'}`}>
                          {p.differential > 0 ? '+' : ''}{p.differential}
                        </td>
                        <td className="px-2 py-2.5 text-center font-mono text-emerald-400">{p.totalCA}</td>
                        <td className="px-3 py-2.5 text-center">
                          {isBye ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              BYE
                            </span>
                          ) : (
                            <span className="text-[10px] text-text-muted">Juega</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
