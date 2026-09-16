'use client';

import { useState, useMemo } from 'react';
import FilterPills from '../components/FilterPills';
import GroupStandingsTable from '../components/GroupStandingsTable';
import CuadroPrincipal from '../components/CuadroPrincipal';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import type { GroupData, GroupStanding, RankedPlayer, TournamentConfig } from '../data/types';
import { fmtSigned, EMPTY } from '../lib/format';

function medal(pos: number) {
  if (pos === 1) return <span className="text-lg">🥇</span>;
  if (pos === 2) return <span className="text-lg">🥈</span>;
  if (pos === 3) return <span className="text-lg">🥉</span>;
  return <span className="text-text-muted text-sm tabular-nums">{pos}</span>;
}

type Row = GroupStanding & { group: number; differentialIsPercent: boolean };

export default function GruposClient({
  groups,
  ranking,
  config,
}: {
  groups: GroupData[];
  ranking: RankedPlayer[];
  config: TournamentConfig;
}) {
  const [view, setView] = useState('groups');
  const [groupFilter, setGroupFilter] = useState('all');

  const viewItems = [
    { key: 'cuadro', label: 'Cuadro Principal' },
    { key: 'groups', label: 'Tablas de Grupo' },
    { key: 'ranking', label: 'Clasificación General' },
  ];

  const groupItems = [
    { key: 'all', label: 'Todos' },
    ...groups.map(g => ({ key: String(g.number), label: `Grupo ${g.number}` })),
  ];

  const filtered = groupFilter === 'all'
    ? groups
    : groups.filter(g => g.number === Number(groupFilter));

  /**
   * Clasificación general. La fuente buena es la columna "Ranking
   * Jugadores" de GRUPOS, que es exactamente el orden con el que el
   * Apps Script siembra la eliminación. Si esa columna no estuviera,
   * se reconstruye desde CLASIF GRAL de cada tabla.
   */
  const allRows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    for (const g of groups) {
      for (const s of g.standings) {
        out.push({ ...s, group: g.number, differentialIsPercent: g.differentialIsPercent });
      }
    }
    return out;
  }, [groups]);

  const byName = useMemo(() => {
    const m = new Map<string, Row>();
    for (const r of allRows) m.set(r.player.trim().toUpperCase(), r);
    return m;
  }, [allRows]);

  const generalRanking = useMemo(() => {
    if (ranking.length > 0) {
      return ranking.map(r => ({
        ranking: r.ranking,
        row: byName.get(r.player.trim().toUpperCase()) ?? null,
        player: r.player,
      }));
    }
    return allRows
      .filter(r => r.generalClassification > 0)
      .sort((a, b) => a.generalClassification - b.generalClassification)
      .map(r => ({ ranking: r.generalClassification, row: r, player: r.player }));
  }, [ranking, byName, allRows]);

  // El cuadro de eliminación es la potencia de 2 siguiente; los mejores
  // clasificados entran con BYE.
  const totalPlayers = generalRanking.length;
  const bracketSize = totalPlayers > 1 ? Math.pow(2, Math.ceil(Math.log2(totalPlayers))) : 0;
  const byeCount = Math.max(0, bracketSize - totalPlayers);

  const playedMatches = useMemo(
    () => Math.round(allRows.reduce((s, r) => s + r.played, 0) / 2),
    [allRows],
  );
  const scheduledMatches = useMemo(
    () => Math.round(groups.reduce((s, g) => s + (g.standings.length * g.matchesPerPlayer) / 2, 0)),
    [groups],
  );

  if (groups.length === 0) {
    return (
      <div className="animate-fade-in px-4 py-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text mb-6">Grupos</h2>
          <EmptyState message="La hoja GRUPOS todavía no tiene datos. Corre el paso 6 del menú «Torneo Billar» en el Google Sheets." />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text">
            Fase de Grupos
          </h2>
          <p className="text-sm text-text-muted mt-1">
            {groups.length} grupos · {totalPlayers} jugadores · {playedMatches} de {scheduledMatches} partidos jugados
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          <StatCard label="Grupos" value={groups.length} />
          <StatCard label="Jugadores" value={totalPlayers} />
          <StatCard
            label="Partidos"
            value={`${playedMatches}/${scheduledMatches}`}
            hint={scheduledMatches > 0 ? `${Math.round((playedMatches / scheduledMatches) * 100)} % disputado` : undefined}
          />
          <StatCard label="Pasan con BYE" value={byeCount} hint={`Cuadro de ${bracketSize}`} accent />
        </div>

        <div className="mb-4">
          <FilterPills items={viewItems} active={view} onChange={setView} />
        </div>

        {view === 'cuadro' && <CuadroPrincipal groups={groups} />}

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
              <>
                <div className="flex flex-col gap-4 stagger-children">
                  {filtered.map(group => (
                    <GroupStandingsTable key={group.number} group={group} />
                  ))}
                </div>

                {/* La leyenda, una sola vez para toda la página */}
                <p className="mt-4 px-1 text-[11px] text-text-muted/70 leading-relaxed">
                  Las tablas son las mismas de la hoja GRUPOS del Google Sheets, columna por
                  columna. <span className="font-mono">{EMPTY}</span> es un partido que todavía no se
                  ha jugado; un <span className="font-mono">0</span> es un cero de verdad.{' '}
                  {groups[0]?.differentialIsPercent ? (
                    <>
                      <span className="font-semibold text-text-muted">DIF %</span> compara el
                      rendimiento sobre el objetivo de cada jugador: sus{' '}
                      <span className="font-mono">carambolas ÷ objetivo</span> menos las del rival.
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-text-muted">DIF</span> es la diferencia
                      entre carambolas a favor y en contra.
                    </>
                  )}{' '}
                  <span className="font-semibold text-text-muted">PTS x P</span> y{' '}
                  <span className="font-semibold text-text-muted">VENT x P</span> son lo mismo
                  repartido entre los partidos que juega cada grupo: como unos grupos son de 5 y
                  otros de 4, es lo que permite compararlos sin que salga favorecido quien juega un
                  partido más. Es lo que ordena la clasificación general. Los dos primeros de cada
                  grupo van resaltados en verde.
                </p>
              </>
            )}
          </>
        )}

        {view === 'ranking' && (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="bg-bg-header px-4 py-3 border-b border-border-light">
              <h3 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">
                Clasificación General
              </h3>
              <p className="text-[11px] text-text-muted mt-1">
                {totalPlayers} jugadores · cuadro de {bracketSize}
                {byeCount > 0 && <> · los {byeCount} primeros pasan con BYE a la segunda ronda</>}
              </p>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-text-muted/70 border-b border-border-subtle">
                    <th className="px-3 py-2.5 text-left font-semibold w-10">#</th>
                    <th className="px-3 py-2.5 text-left font-semibold">Jugador</th>
                    <th className="px-2 py-2.5 text-center font-semibold">Grupo</th>
                    <th className="px-2 py-2.5 text-center font-semibold" title="Puesto dentro del grupo">Pos</th>
                    <th className="px-2 py-2.5 text-center font-semibold">Pts</th>
                    <th className="px-2 py-2.5 text-center font-semibold" title="Diferencia de rendimiento">Dif</th>
                    <th className="px-2 py-2.5 text-center font-semibold" title="Carambolas a favor">CA</th>
                    <th className="px-2 py-2.5 text-center font-semibold" title="Carambolas en contra">CR</th>
                    <th className="px-3 py-2.5 text-center font-semibold">1ª Ronda</th>
                  </tr>
                </thead>
                <tbody>
                  {generalRanking.map(({ ranking: pos, row, player }) => {
                    const isBye = pos <= byeCount;
                    return (
                      <tr
                        key={`${pos}-${player}`}
                        className={`table-row-hover border-b border-border-subtle ${isBye ? 'bg-emerald/[0.04]' : ''} ${pos === byeCount ? 'border-b-2 border-b-emerald/30' : ''}`}
                      >
                        <td className="px-3 py-2.5">{medal(pos)}</td>
                        <td className="px-3 py-2.5 font-semibold text-text-primary">{player}</td>
                        <td className="px-2 py-2.5 text-center font-mono text-text-muted">{row?.group ?? EMPTY}</td>
                        <td className="px-2 py-2.5 text-center font-mono text-text-muted">{row ? `${row.groupOrder}º` : EMPTY}</td>
                        <td className="px-2 py-2.5 text-center font-mono font-bold text-text-primary tabular-nums">{row?.totalPts ?? EMPTY}</td>
                        <td className={`px-2 py-2.5 text-center font-mono font-bold tabular-nums ${!row ? 'text-text-muted' : row.differential > 0 ? 'text-positive' : row.differential < 0 ? 'text-negative' : 'text-text-muted'}`}>
                          {row ? fmtSigned(row.differential) : EMPTY}
                        </td>
                        <td className="px-2 py-2.5 text-center font-mono text-emerald-400 tabular-nums">{row?.totalCA ?? EMPTY}</td>
                        <td className="px-2 py-2.5 text-center font-mono text-text-muted tabular-nums">{row?.totalCR ?? EMPTY}</td>
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
            {config.mixedCategories && (
              <p className="px-4 py-3 text-[10px] text-text-muted/70 border-t border-border-subtle leading-relaxed">
                Torneo con hándicap: primera categoría hace {config.carambolasPrimera} carambolas y
                segunda {config.carambolasSegunda}. El punto de cada partido se lo lleva quien consiga
                el mayor porcentaje de su propio objetivo, no quien haga más carambolas.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
