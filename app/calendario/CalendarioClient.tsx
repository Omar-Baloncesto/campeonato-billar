'use client';

import { useState, useMemo } from 'react';
import FilterPills from '../components/FilterPills';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import MatchCard, { colorDe } from './MatchCard';
import { estaJugado, type CalendarMatch } from '../lib/calendar';
import { fmtTime, fmtDate } from '../lib/format';
import type { TournamentConfig } from '../data/types';

/* ==================================================================
 *  Calendario del torneo.
 *
 *  Dos vistas sobre los mismos datos:
 *    · Programación — todo lo que se juega, día por día y turno por
 *      turno. Incluye la fase de grupos y el cuadro de eliminación.
 *    · Resultados   — solo lo ya jugado, lo más reciente primero.
 *
 *  Todo sale del Google Sheets. Los cruces del cuadro son fórmulas que
 *  miran el ranking de GRUPOS, así que se actualizan solos según se
 *  van anotando los resultados de la fase de grupos.
 * ================================================================== */

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function diaCorto(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return `${DIAS[d.getUTCDay()].slice(0, 3)} ${d.getUTCDate()}`;
}

export default function CalendarioClient({
  partidos,
  config,
}: {
  partidos: CalendarMatch[];
  config: TournamentConfig;
}) {
  const [vista, setVista] = useState<'programacion' | 'resultados'>('programacion');
  const [filtroDia, setFiltroDia] = useState('all');
  const [filtroFase, setFiltroFase] = useState('all');

  const mostrarPct = config.mixedCategories;

  const dias = useMemo(
    () => [...new Set(partidos.map(p => p.isoDate).filter(Boolean))].sort(),
    [partidos],
  );

  const jugados = useMemo(() => partidos.filter(estaJugado), [partidos]);
  const conFecha = partidos.filter(p => p.isoDate).length;
  const deGrupos = partidos.filter(p => p.kind === 'grupo');
  const deCuadro = partidos.filter(p => p.kind === 'eliminacion');

  const hayCuadro = deCuadro.length > 0;

  const faseItems = [
    { key: 'all', label: 'Todo' },
    { key: 'grupo', label: 'Fase de grupos' },
    ...(hayCuadro ? [{ key: 'eliminacion', label: 'Eliminación' }] : []),
  ];

  const diaItems = [
    { key: 'all', label: 'Todas' },
    ...dias.map(d => ({ key: d, label: diaCorto(d) })),
  ];

  /** Lo que se ve con los filtros puestos. */
  const visibles = useMemo(
    () => partidos.filter(p => filtroFase === 'all' || p.kind === filtroFase),
    [partidos, filtroFase],
  );

  /** Programación: jornada → turno → partidos. */
  const jornadas = useMemo(() => {
    const porDia = new Map<string, Map<string, CalendarMatch[]>>();
    for (const p of visibles) {
      if (filtroDia !== 'all' && p.isoDate !== filtroDia) continue;
      const dia = p.isoDate || '';
      if (!porDia.has(dia)) porDia.set(dia, new Map());
      const turnos = porDia.get(dia)!;
      const t = p.time24 || '';
      if (!turnos.has(t)) turnos.set(t, []);
      turnos.get(t)!.push(p);
    }
    return [...porDia.entries()]
      .sort((a, b) => (a[0] || '9999').localeCompare(b[0] || '9999'))
      .map(([dia, turnos]) => ({
        dia,
        turnos: [...turnos.entries()].sort((a, b) => (a[0] || '99:99').localeCompare(b[0] || '99:99')),
      }));
  }, [visibles, filtroDia]);

  /** Resultados: lo último jugado arriba. */
  const resultados = useMemo(
    () => visibles.filter(estaJugado).reverse(),
    [visibles],
  );

  if (partidos.length === 0) {
    return (
      <div className="animate-fade-in px-4 py-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text mb-6">Calendario</h2>
          <EmptyState message="Todavía no hay partidos. Corre el paso 3 del menú «Torneo Billar» en el Google Sheets para generar el fixture." />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text">Calendario</h2>
            <p className="text-sm text-text-muted mt-1">
              {deGrupos.length} de grupos
              {hayCuadro && ` · ${deCuadro.length} de eliminación`}
              {dias.length > 0 && ` · ${dias.length} jornada${dias.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10 shrink-0">
            <Boton activo={vista === 'programacion'} onClick={() => setVista('programacion')} label="Programación" />
            <Boton activo={vista === 'resultados'} onClick={() => setVista('resultados')} label="Resultados" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <StatCard label="Partidos" value={partidos.length} />
          <StatCard
            label="Programados"
            value={`${conFecha}/${partidos.length}`}
            hint={conFecha === partidos.length ? 'completo' : undefined}
          />
          <StatCard
            label="Jugados"
            value={`${jugados.length}/${partidos.length}`}
            hint={`${Math.round((jugados.length / partidos.length) * 100)} % disputado`}
            accent
          />
        </div>

        {conFecha === 0 && (
          <Aviso>
            Todavía no hay fechas puestas. Se digitan en el Google Sheets: las de la fase de grupos
            en <b>FIXTURE_GRUPOS</b> columnas <b>G</b> y <b>H</b>, y las del cuadro en{' '}
            <b>Eliminación Simple</b> columnas <b>N</b> y <b>O</b>.
          </Aviso>
        )}

        {hayCuadro && deCuadro.every(p => !p.isoDate) && conFecha > 0 && (
          <Aviso>
            Al cuadro de eliminación le faltan las fechas. Se ponen en la hoja{' '}
            <b>Eliminación Simple</b>, columnas <b>N (Fecha)</b> y <b>O (Hora)</b>. Mientras tanto
            sus partidos salen abajo, en «Sin fecha asignada».
          </Aviso>
        )}

        <div className="flex flex-col gap-2 mb-8">
          {faseItems.length > 1 && (
            <FilterPills items={faseItems} active={filtroFase} onChange={setFiltroFase} />
          )}
          {vista === 'programacion' && dias.length > 1 && (
            <FilterPills items={diaItems} active={filtroDia} onChange={setFiltroDia} variant="outline" />
          )}
        </div>

        {/* ---------------- PROGRAMACIÓN ---------------- */}
        {vista === 'programacion' && (
          jornadas.length === 0 ? (
            <EmptyState message="No hay partidos con ese filtro." onReset={() => { setFiltroDia('all'); setFiltroFase('all'); }} />
          ) : (
            jornadas.map(({ dia, turnos }) => {
              const numero = dias.indexOf(dia) + 1;
              const total = turnos.reduce((n, [, l]) => n + l.length, 0);
              const jug = turnos.reduce((n, [, l]) => n + l.filter(estaJugado).length, 0);
              const soloCuadro = turnos.every(([, l]) => l.every(p => p.kind === 'eliminacion'));

              return (
                <section key={dia || 'sin-fecha'} className="mb-10">
                  <div className="flex items-end justify-between gap-3 flex-wrap mb-5 pb-3 border-b border-border-light">
                    <div>
                      <div
                        className="text-[10px] tracking-[0.25em] uppercase font-bold mb-0.5"
                        style={{ color: soloCuadro ? '#F5B800' : 'rgb(52 211 153 / 0.7)' }}
                      >
                        {dia ? (soloCuadro ? 'Eliminación' : `Jornada ${numero}`) : 'Pendiente de programar'}
                      </div>
                      <h3 className="text-lg md:text-xl font-black text-text-primary leading-tight first-letter:uppercase">
                        {dia ? fmtDate(dia) : 'Sin fecha asignada'}
                        {dia && <span className="text-text-muted/50 font-bold text-base"> · {dia.slice(0, 4)}</span>}
                      </h3>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-sm font-black text-emerald-400 tabular-nums">
                        {jug}/{total}
                        <span className="ml-1.5 text-[10px] font-normal text-text-muted uppercase tracking-wider">jugados</span>
                      </div>
                    </div>
                  </div>

                  {turnos.map(([hora, lista]) => (
                    <div key={hora || 'sin-hora'} className="flex gap-3 md:gap-5 mb-5">
                      <div className="flex flex-col items-center shrink-0 w-14 md:w-20 pt-1">
                        <div className="text-[11px] md:text-xs font-black text-text-primary tabular-nums whitespace-nowrap">
                          {hora ? fmtTime(hora) : '—'}
                        </div>
                        <div
                          className="w-1.5 h-1.5 rounded-full mt-1.5"
                          style={{ background: lista[0] ? colorDe(lista[0]) : '#10b981' }}
                        />
                        <div className="flex-1 w-px bg-border-light mt-1" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-text-muted/60 uppercase tracking-wider mb-2">
                          {lista.length} partido{lista.length !== 1 ? 's' : ''}
                          {hora && lista.length > 1 ? ' a la vez' : ''}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {lista.map(p => <MatchCard key={p.id} m={p} mostrarPct={mostrarPct} />)}
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              );
            })
          )
        )}

        {/* ---------------- RESULTADOS ---------------- */}
        {vista === 'resultados' && (
          resultados.length === 0 ? (
            <EmptyState message="Todavía no se ha jugado ningún partido. En cuanto se anoten carambolas y entradas en la hoja RESULTADOS del Google Sheets, aparecen aquí." />
          ) : (
            <>
              <p className="text-[11px] text-text-muted/70 mb-4">
                {resultados.length} partido{resultados.length !== 1 ? 's' : ''} jugado
                {resultados.length !== 1 ? 's' : ''} · el más reciente arriba
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {resultados.map(p => (
                  <MatchCard key={p.id} m={p} mostrarPct={mostrarPct} mostrarCuando />
                ))}
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] px-4 py-3 mb-6">
      <p className="text-xs text-text-muted leading-relaxed">{children}</p>
    </div>
  );
}

function Boton({ activo, onClick, label }: { activo: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded text-[11px] font-semibold transition-all ${
        activo
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          : 'text-text-muted hover:text-text-primary border border-transparent'
      }`}
    >
      {label}
    </button>
  );
}
