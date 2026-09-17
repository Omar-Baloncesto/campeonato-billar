'use client';

import { useState, useMemo, useRef, useEffect, useCallback, Fragment } from 'react';
import { getCityColor } from '../lib/constants';
import FilterPills from '../components/FilterPills';
import EmptyState from '../components/EmptyState';
import { fmtAvg, EMPTY, fmtSigned, fmtPct } from '../lib/format';
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
  // La hoja nueva trae las columnas que explican el orden; la vieja no.
  const detalleOrden = rankingGroups.some(r => r.groupOrder != null);


  const byName = useMemo(() => {
    const m = new Map<string, Player>();
    for (const p of players) m.set(normalize(p.name), p);
    return m;
  }, [players]);

  const tabs = [
    { key: 'final', label: 'Ranking Final' },
    { key: 'groups', label: 'Ranking de Grupos' },
  ];

  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text mb-2">
          Ranking
        </h2>
        <p className="text-sm text-text-muted mb-6">
          Las dos tablas se actualizan solas: en el Google Sheets cada celda es una fórmula, así
          que cambian en cuanto se anota una carambola. El{' '}
          <strong className="text-text-primary font-semibold">Ranking de Grupos</strong> sale de
          RESULTADOS y el{' '}
          <strong className="text-text-primary font-semibold">Ranking Final</strong> del cuadro de
          eliminación. Son dos torneos distintos: el puesto en los grupos no cuenta en el final.
        </p>

        <div className="mb-6">
          <FilterPills items={tabs} active={tab} onChange={setTab} />
        </div>

        {tab === 'final' && (
          rankingFinal.length === 0 ? (
            <EmptyState message="El ranking final todavía no está generado. Se crea al terminar la eliminación, desde el menú «Torneo Billar»." />
          ) : (
            <TablaRankingFinal
              filas={rankingFinal}
              roundNames={roundNames}
              byName={byName}
            />
          )
        )}

        {tab === 'groups' && (
          rankingGroups.length === 0 ? (
            <EmptyState message="El ranking de grupos todavía no está generado." />
          ) : (
            <TablaRankingGrupos
              filas={rankingGroups}
              detalleOrden={detalleOrden}
              byName={byName}
            />
          )
        )}

      </div>
    </div>
  );
}

/* ==================================================================
 *  RANKING DE LA FASE DE GRUPOS
 *
 *  Calcada de la hoja RankingGrupos: mismo orden de columnas y los
 *  mismos tres rótulos de color encima. El del medio dice qué decide
 *  el orden y el de la derecha avisa de lo que NO lo decide, porque
 *  ver el Promedio pegado al ranking hacía pensar que ordenaba, y no
 *  ordena: por promedio cambiarían de puesto casi todos.
 *
 *  Nada se esconde en pantalla estrecha: la tabla se desliza y las
 *  dos primeras columnas se quedan fijas, igual que en Grupos. Si se
 *  escondieran columnas, los rótulos de arriba dejarían de cuadrar
 *  con lo que hay debajo.
 * ================================================================== */

/** Separador entre bloques de columnas. */
const SEP = 'border-l border-border-light';

function TablaRankingGrupos({
  filas,
  detalleOrden,
  byName,
}: {
  filas: RankingGroupRow[];
  detalleOrden: boolean;
  byName: Map<string, Player>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState(false);
  const [desborda, setDesborda] = useState(false);

  const check = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setDesborda(el.scrollWidth > el.clientWidth + 4);
    setFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    check();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      el.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [check]);

  // Columnas fijas al desplazar: # y Jugador.
  const stickyNo = 'sticky left-0 z-20 bg-bg-card w-12 min-w-12 max-w-12 box-border';
  const stickyName = 'sticky left-12 z-20 bg-bg-card';

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="bg-bg-header px-4 py-3 border-b border-border-light flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">
          Ranking de la Fase de Grupos
        </h3>
        <p className="text-[11px] text-text-muted">
          {filas.length} jugadores · ordenados como se siembra la eliminación
          {detalleOrden && <> · primero los 1.º de cada grupo, luego los 2.º…</>}
          {desborda && <span className="text-text-muted/50"> · desliza →</span>}
        </p>
      </div>

      <div className="relative">
        {fade && (
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-bg-card to-transparent z-30 pointer-events-none" />
        )}

        <div ref={scrollRef} className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-sm border-collapse">
            <thead>
              {/* Fila 1: los rótulos, los mismos que en el Sheet */}
              {detalleOrden && (
                <tr className="text-[9px] uppercase tracking-[0.14em] font-bold">
                  {/* El bloque fijo de la izquierda tiene que medir EXACTAMENTE
                      lo que miden las columnas fijas de abajo. Si se le mete
                      aquí un colSpan que alcance a Categoría, al deslizar se
                      queda clavado un trozo ancho que tapa el rótulo verde. */}
                  <th className={`${stickyNo} py-1.5`} />
                  <th className={`${stickyName} py-1.5 text-center text-text-muted/70`}>
                    Quién es
                  </th>
                  <th className="py-1.5" />
                  {/* En pantalla estrecha el rótulo se acorta en vez de
                      partirse en tres renglones. El número de columnas no
                      cambia, así que los colSpan siguen cuadrando. */}
                  <th
                    className={`${SEP} px-2 py-1.5 text-center text-emerald-400 bg-emerald/[0.08] whitespace-nowrap`}
                    colSpan={5}
                    title="Estas cinco columnas, en este orden, son las que deciden el puesto."
                  >
                    <span className="sm:hidden">Decide el orden</span>
                    <span className="hidden sm:inline">Esto decide el orden</span>
                  </th>
                  <th
                    className={`${SEP} px-2 py-1.5 text-center text-amber-400 bg-amber-400/[0.08] whitespace-nowrap`}
                    colSpan={3}
                    title="Datos de interés que NO influyen en el puesto."
                  >
                    <span className="sm:hidden">No ordena</span>
                    <span className="hidden sm:inline">Solo informativo · no ordena</span>
                  </th>
                </tr>
              )}

              {/* Fila 2: los encabezados */}
              <tr className="text-text-muted/70 text-xs border-b border-border-subtle">
                <th className={`${stickyNo} px-3 py-3 text-left`}>#</th>
                <th className={`${stickyName} px-3 py-3 text-left min-w-[150px]`}>Jugador</th>
                <th className="px-3 py-3 text-left">Categoría</th>

                {detalleOrden ? (
                  <>
                    <th className={`${SEP} px-2 py-3 text-center`} title="Grupo">Gr</th>
                    <th className="px-2 py-3 text-center" title="1er criterio: puesto dentro de su grupo">
                      Pos
                    </th>
                    <th className="px-2 py-3 text-center" title="Puntos del grupo: 2 por partido ganado, 1 por empate">
                      Pts
                    </th>
                    <th className="px-2 py-3 text-center" title="2º criterio: puntos ÷ partidos que juega su grupo">
                      Pts/P
                    </th>
                    <th className="px-2 py-3 text-center" title="3er criterio: ventaja ÷ partidos que juega su grupo">
                      Vent/P
                    </th>
                    <th className={`${SEP} px-2 py-3 text-center`} title="Carambolas a favor. No cuenta los W.O.">
                      Car
                    </th>
                    <th className="px-2 py-3 text-center" title="Entradas jugadas. No cuenta los W.O.">
                      Ent
                    </th>
                    <th className="px-2 py-3 text-center" title="Carambolas ÷ entradas. No ordena esta tabla.">
                      Prom
                    </th>
                  </>
                ) : (
                  <>
                    <th className={`${SEP} px-2 py-3 text-center`} title="Grupo">Gr</th>
                    <th className="px-2 py-3 text-center">Car</th>
                    <th className="px-2 py-3 text-center">Ent</th>
                    <th className="px-2 py-3 text-center">Prom</th>
                    <th className="px-2 py-3 text-center">Pts</th>
                  </>
                )}
              </tr>
            </thead>

            <tbody>
              {filas.map((r, i) => {
                const p = byName.get(normalize(r.player));
                // La columna C de RankingGrupos trae la categoría. Se usa
                // la de JUGADORES y esa queda de respaldo.
                const category = p?.category || r.categoryOrCity;
                // Los dos primeros de cada grupo son los que pasan a la
                // eliminación, igual que el verde de la hoja.
                const clasifica = r.groupOrder != null && r.groupOrder <= 2;
                // Primero van todos los 1.º de cada grupo, luego todos los
                // 2.º… Sin separar los bloques, las 22 filas se leen como
                // una lista sola y entonces la ventaja por partido parece
                // desordenada: en realidad solo desempata DENTRO del bloque.
                const abreBloque =
                  detalleOrden && r.groupOrder != null &&
                  (i === 0 || filas[i - 1].groupOrder !== r.groupOrder)
                    ? r.groupOrder
                    : null;
                return (
                  <Fragment key={`${r.ranking}-${r.player}`}>
                  {abreBloque != null && (
                    <tr className="border-t border-border-light">
                      <td colSpan={11} className="p-0">
                        {/* El texto va pegado a la izquierda aunque se
                            deslice la tabla, como las columnas fijas. */}
                        <div className="sticky left-0 w-fit px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-text-muted/70 whitespace-nowrap">
                          Los {abreBloque}.º de cada grupo
                          {abreBloque <= 2 && (
                            <span className="text-emerald-400 normal-case tracking-normal ml-2">
                              · pasan a la eliminación
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  <tr
                    className={`table-row-hover border-b border-border-subtle ${
                      clasifica ? 'bg-emerald/[0.07]' : ''
                    }`}
                  >
                    <td
                      className={`${stickyNo} px-3 py-3 ${
                        clasifica ? 'shadow-[inset_2px_0_0_0_var(--color-emerald)]' : ''
                      }`}
                    >
                      {medal(r.ranking)}
                    </td>
                    <td className={`${stickyName} px-3 py-3 font-semibold whitespace-nowrap`}>
                      {r.player}
                    </td>
                    <td className="px-3 py-3 text-xs text-text-muted whitespace-nowrap">
                      {category || EMPTY}
                    </td>

                    {detalleOrden ? (
                      <>
                        <td className={`${SEP} px-2 py-3 text-center font-mono text-text-muted tabular-nums`}>
                          {r.group ?? p?.group ?? EMPTY}
                        </td>
                        <td className="px-2 py-3 text-center font-mono text-text-primary tabular-nums">
                          {r.groupOrder ? `${r.groupOrder}º` : EMPTY}
                        </td>
                        <td className="px-2 py-3 text-center font-mono font-bold text-text-primary tabular-nums">
                          {r.points}
                        </td>
                        <td className="px-2 py-3 text-center font-mono text-text-primary tabular-nums">
                          {r.pointsPerMatch != null ? fmtAvg(r.pointsPerMatch) : EMPTY}
                        </td>
                        <td
                          className={`px-2 py-3 text-center font-mono tabular-nums whitespace-nowrap ${
                            r.advantagePerMatch == null
                              ? 'text-text-muted'
                              : r.advantagePerMatch > 0
                                ? 'text-positive'
                                : r.advantagePerMatch < 0
                                  ? 'text-negative'
                                  : 'text-text-muted'
                          }`}
                        >
                          {r.advantagePerMatch != null ? fmtSigned(r.advantagePerMatch) : EMPTY}
                        </td>

                        <td className={`${SEP} px-2 py-3 text-center font-mono text-text-muted/70 italic tabular-nums`}>
                          {r.carambolas}
                        </td>
                        <td className="px-2 py-3 text-center font-mono text-text-muted/70 italic tabular-nums">
                          {r.entries}
                        </td>
                        <td className="px-2 py-3 text-center font-mono text-text-muted/70 italic tabular-nums">
                          {fmtAvg(r.average)}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className={`${SEP} px-2 py-3 text-center font-mono text-text-muted tabular-nums`}>
                          {r.group ?? p?.group ?? EMPTY}
                        </td>
                        <td className="px-2 py-3 text-center font-mono text-emerald-400 tabular-nums">{r.carambolas}</td>
                        <td className="px-2 py-3 text-center font-mono text-text-muted tabular-nums">{r.entries}</td>
                        <td className="px-2 py-3 text-center font-mono text-text-primary tabular-nums">{fmtAvg(r.average)}</td>
                        <td className="px-2 py-3 text-center font-mono font-bold text-text-primary tabular-nums">{r.points}</td>
                      </>
                    )}
                  </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {detalleOrden && (
        <div className="bg-bg-header px-4 py-2.5 border-t border-border-light text-[11px] text-text-muted leading-relaxed">
          <span className="inline-block w-2 h-2 rounded-sm bg-emerald align-middle mr-1.5" />
          Pasan a la eliminación los <strong className="text-text-primary font-semibold">dos primeros de cada grupo</strong>.
          El orden se decide mirando, en este orden: puesto en el grupo → puntos por partido →
          ventaja por partido → carambolas a favor.
        </div>
      )}
    </div>
  );
}

/* ==================================================================
 *  RANKING FINAL
 *
 *  Calcada de la hoja RankingFinal, con los mismos rótulos de color.
 *
 *  Todo sale del cuadro de eliminación: la fase de grupos no pinta
 *  nada aquí, son dos torneos distintos.
 *
 *  Lo que de verdad importa es el RENDIMIENTO: carambolas hechas entre
 *  las que tenía que hacer. Es lo que iguala a las dos categorías,
 *  porque Primera juega a 20 y Segunda a 17, así que 17 de 17 (100 %)
 *  rinde más que 18 de 20 (90 %) aunque sean menos carambolas. Ese es
 *  el criterio que separa a los que cayeron en la misma ronda, y por
 *  eso va en el bloque verde.
 *
 *  Con la hoja vieja de tres columnas no hay nada de esto, así que se
 *  enseña la tabla de siempre.
 * ================================================================== */

function TablaRankingFinal({
  filas,
  roundNames,
  byName,
}: {
  filas: RankingFinalRow[];
  roundNames: Record<number, string>;
  byName: Map<string, Player>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState(false);
  const [desborda, setDesborda] = useState(false);

  const check = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setDesborda(el.scrollWidth > el.clientWidth + 4);
    setFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    check();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      el.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [check]);

  // La hoja nueva trae la etiqueta de hasta dónde llegó; la vieja no.
  const detalle = filas.some(r => !!r.reachedLabel);

  const roundLabel = (round: number) => {
    const name = roundNames[round];
    if (name) return `Llegó a ${shortRoundName(name).toLowerCase()}`;
    return `Ronda ${round}`;
  };

  const stickyNo = 'sticky left-0 z-20 bg-bg-card w-12 min-w-12 max-w-12 box-border';
  const stickyName = 'sticky left-12 z-20 bg-bg-card';

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="bg-bg-header px-4 py-3 border-b border-border-light flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">
          Ranking Final del Torneo
        </h3>
        <p className="text-[11px] text-text-muted">
          {filas.length} jugadores
          {detalle && <> · hasta dónde llegó cada uno, y cómo rindió</>}
          {desborda && <span className="text-text-muted/50"> · desliza →</span>}
        </p>
      </div>

      <div className="relative">
        {fade && (
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-bg-card to-transparent z-30 pointer-events-none" />
        )}

        <div ref={scrollRef} className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-sm border-collapse">
            <thead>
              {detalle && (
                <tr className="text-[9px] uppercase tracking-[0.14em] font-bold">
                  <th className={`${stickyNo} py-1.5`} />
                  <th className={`${stickyName} py-1.5 text-center text-text-muted/70`}>
                    Quién es
                  </th>
                  <th className="py-1.5" colSpan={2} />
                  <th
                    className={`${SEP} px-2 py-1.5 text-center text-emerald-400 bg-emerald/[0.08] whitespace-nowrap`}
                    colSpan={3}
                    title="Estas tres columnas, en este orden, son las que deciden el puesto."
                  >
                    <span className="sm:hidden">Decide el orden</span>
                    <span className="hidden sm:inline">Esto decide el orden</span>
                  </th>
                  <th
                    className={`${SEP} px-2 py-1.5 text-center text-amber-400 bg-amber-400/[0.08] whitespace-nowrap`}
                    colSpan={4}
                    title="Datos de interés que NO influyen en el puesto."
                  >
                    <span className="sm:hidden">No ordena</span>
                    <span className="hidden sm:inline">Solo informativo · no ordena</span>
                  </th>
                </tr>
              )}

              <tr className="text-text-muted/70 text-xs border-b border-border-subtle">
                <th className={`${stickyNo} px-3 py-3 text-left`}>#</th>
                <th className={`${stickyName} px-3 py-3 text-left min-w-[150px]`}>Jugador</th>
                <th className="px-3 py-3 text-left">Categoría</th>

                {detalle ? (
                  <>
                    <th className="px-2 py-3 text-center" title="Carambolas que tiene que hacer para ganar una partida">
                      Obj
                    </th>
                    <th className={`${SEP} px-3 py-3 text-left`}>Hasta dónde llegó</th>
                    <th
                      className="px-2 py-3 text-center"
                      title="Carambolas hechas ÷ carambolas que debía hacer. 17 de 17 (100 %) rinde más que 18 de 20 (90 %)."
                    >
                      Rendim.
                    </th>
                    <th className="px-2 py-3 text-center" title="3er criterio: carambolas ÷ entradas de toda la eliminación">
                      Prom
                    </th>
                    <th className={`${SEP} px-2 py-3 text-center`} title="Partidas jugadas. Los BYE no cuentan.">PJ</th>
                    <th className="px-2 py-3 text-center" title="Partidas ganadas">PG</th>
                    <th className="px-2 py-3 text-center" title="Carambolas hechas en toda la eliminación">Car</th>
                    <th className="px-2 py-3 text-center" title="Entradas jugadas en toda la eliminación">Ent</th>
                  </>
                ) : (
                  <>
                    <th className="px-3 py-3 text-left hidden md:table-cell">Club</th>
                    <th className="px-4 py-3 text-left">Etapa alcanzada</th>
                  </>
                )}
              </tr>
            </thead>

            <tbody>
              {filas.map((r, i) => {
                const p = byName.get(normalize(r.player));
                const category = r.category || p?.category || '';
                // Los bloques son «hasta dónde llegó»: sin separarlos, el
                // rendimiento parece desordenado cuando en realidad solo
                // desempata DENTRO de cada bloque.
                const abreBloque =
                  detalle && r.reachedLabel &&
                  (i === 0 || filas[i - 1].reachedLabel !== r.reachedLabel)
                    ? r.reachedLabel
                    : null;
                const podio = r.ranking <= 3;
                return (
                  <Fragment key={`${r.ranking}-${r.player}`}>
                  {abreBloque != null && i > 1 && (
                    <tr className="border-t border-border-light">
                      <td colSpan={11} className="p-0">
                        <div className="sticky left-0 w-fit px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-text-muted/70 whitespace-nowrap">
                          {abreBloque.toUpperCase() === 'EN JUEGO'
                            ? 'Siguen en carrera'
                            : `Cayeron en ${abreBloque.toLowerCase()}`}
                        </div>
                      </td>
                    </tr>
                  )}
                  <tr
                    className={`table-row-hover border-b border-border-subtle ${
                      podio ? 'bg-emerald/[0.05]' : ''
                    }`}
                  >
                    <td className={`${stickyNo} px-3 py-3`}>{medal(r.ranking)}</td>
                    <td className={`${stickyName} px-3 py-3 font-semibold whitespace-nowrap ${podio ? 'text-text-primary' : ''}`}>
                      {r.player}
                    </td>
                    <td className="px-3 py-3 text-xs text-text-muted whitespace-nowrap">
                      {category || EMPTY}
                    </td>

                    {detalle ? (
                      <>
                        <td className="px-2 py-3 text-center font-mono text-text-muted tabular-nums">
                          {r.target ?? EMPTY}
                        </td>
                        <td className={`${SEP} px-3 py-3 whitespace-nowrap`}>
                          <EtapaBadge etiqueta={r.reachedLabel || ''} />
                        </td>
                        <td
                          className={`px-2 py-3 text-center font-mono font-bold tabular-nums whitespace-nowrap ${
                            r.performance != null && r.performance >= 1
                              ? 'text-positive'
                              : 'text-text-primary'
                          }`}
                        >
                          {fmtPct(r.performance)}
                        </td>
                        <td className="px-2 py-3 text-center font-mono text-text-primary tabular-nums">
                          {fmtAvg(r.average)}
                        </td>
                        <td className={`${SEP} px-2 py-3 text-center font-mono text-text-muted/70 italic tabular-nums`}>
                          {r.matches ?? EMPTY}
                        </td>
                        <td className="px-2 py-3 text-center font-mono text-text-muted/70 italic tabular-nums">
                          {r.won ?? EMPTY}
                        </td>
                        <td className="px-2 py-3 text-center font-mono text-text-muted/70 italic tabular-nums">
                          {r.carambolas ?? EMPTY}
                        </td>
                        <td className="px-2 py-3 text-center font-mono text-text-muted/70 italic tabular-nums">
                          {r.entries ?? EMPTY}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-3 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ background: getCityColor(p?.city || '') }}
                            />
                            <span className="text-xs text-text-muted">{p?.city || EMPTY}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-text-primary">
                          {roundLabel(r.roundReached)}
                        </td>
                      </>
                    )}
                  </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {detalle && (
        <div className="bg-bg-header px-4 py-2.5 border-t border-border-light text-[11px] text-text-muted leading-relaxed">
          Todo sale del cuadro de eliminación; la fase de grupos no cuenta aquí. Orden:{' '}
          <strong className="text-text-primary font-semibold">hasta dónde llegó</strong> →{' '}
          <strong className="text-text-primary font-semibold">rendimiento</strong> → promedio.
          El rendimiento son las carambolas que hizo entre las que debía hacer, y es lo que iguala
          a las dos categorías: Primera juega a 20 y Segunda a 17, así que{' '}
          <strong className="text-text-primary font-semibold">17 de 17 (100 %) rinde más que 18 de 20 (90 %)</strong>,
          aunque sean menos carambolas.
        </div>
      )}
    </div>
  );
}

/** La etapa, con el color que le corresponde. */
function EtapaBadge({ etiqueta }: { etiqueta: string }) {
  const e = etiqueta.toUpperCase();
  if (e === 'CAMPEÓN' || e === 'CAMPEON') {
    return <span className="medal-gold font-bold tracking-wide">🏆 CAMPEÓN</span>;
  }
  if (e === 'SUBCAMPEÓN' || e === 'SUBCAMPEON') {
    return <span className="medal-silver font-bold tracking-wide">SUBCAMPEÓN</span>;
  }
  if (e === 'EN JUEGO') {
    return (
      <span className="text-emerald-400 font-semibold">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald align-middle mr-1.5" />
        EN JUEGO
      </span>
    );
  }
  return <span className="text-xs text-text-muted">{etiqueta}</span>;
}
