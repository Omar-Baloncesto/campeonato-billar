'use client';

import { useState, useMemo } from 'react';
import FilterPills from '../components/FilterPills';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import { fmtInt, fmtPct, fmtAvg, fmtTime, EMPTY } from '../lib/format';
import type { FixtureMatch, GroupResult, TournamentConfig, MatchStatus } from '../data/types';

/* ==================================================================
 *  Calendario del torneo.
 *
 *  Manda FIXTURE_GRUPOS: allí están las columnas Fecha (G), Hora (H)
 *  y, si se usa, Mesa (I). Los marcadores se cruzan con RESULTADOS por
 *  grupo + número de partido.
 *
 *  La vista es una línea de tiempo: un bloque por jornada, dentro los
 *  turnos de juego, y en cada turno los partidos que salen a la vez.
 * ================================================================== */

type Estado = MatchStatus | 'unscheduled';

interface Row extends FixtureMatch {
  result: GroupResult | null;
  status: Estado;
}

const GROUP_COLORS = [
  '#10b981', '#f59e0b', '#3b82f6', '#a855f7', '#06b6d4',
  '#ec4899', '#f97316', '#f43f5e', '#84cc16', '#8b5cf6', '#14b8a6',
];
const groupColor = (g: number) => GROUP_COLORS[(g - 1 + GROUP_COLORS.length) % GROUP_COLORS.length];

const ESTADO: Record<Estado, { label: string; className: string }> = {
  played: { label: 'Jugado', className: 'bg-emerald-500/12 text-emerald-400' },
  draw: { label: 'Empate', className: 'bg-yellow-500/15 text-yellow-400' },
  walkover: { label: 'W.O.', className: 'bg-red-500/15 text-red-400' },
  pending: { label: 'Por jugar', className: 'bg-white/5 text-text-muted' },
  unscheduled: { label: 'Sin fecha', className: 'bg-white/5 text-text-muted/70' },
};

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function partesFecha(iso: string) {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return {
    diaSemana: DIAS[d.getUTCDay()],
    dia: d.getUTCDate(),
    mes: MESES[d.getUTCMonth()],
    anio: d.getUTCFullYear(),
    corto: `${DIAS[d.getUTCDay()].slice(0, 3)} ${d.getUTCDate()}`,
  };
}

/* ------------------------------------------------------------------ */
/*  Un partido                                                         */
/* ------------------------------------------------------------------ */

function Partido({ row, mostrarPct }: { row: Row; mostrarPct: boolean }) {
  const r = row.result;
  const ganaA = !!r && r.winner !== '' && r.winner === row.playerA;
  const ganaB = !!r && r.winner !== '' && r.winner === row.playerB;
  const jugado = row.status === 'played' || row.status === 'draw' || row.status === 'walkover';
  const est = ESTADO[row.status];
  const pct = mostrarPct && !!r && r.targetA !== null && r.targetB !== null;

  return (
    <article
      className={`glass-card rounded-xl overflow-hidden glow-hover ${jugado ? '' : 'opacity-90'}`}
      style={{ borderLeft: `3px solid ${groupColor(row.group)}` }}
    >
      <header className="flex items-center gap-2 px-3 pt-2.5 pb-1.5">
        <span
          className="text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded"
          style={{ background: `${groupColor(row.group)}22`, color: groupColor(row.group) }}
        >
          G{row.group}
        </span>
        <span className="text-[10px] text-text-muted/70 tracking-wider">Partido {row.match}</span>
        {row.table !== null && (
          <span className="text-[10px] text-text-muted/70 tracking-wider">· Mesa {row.table}</span>
        )}
        <span className={`ml-auto text-[9px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${est.className}`}>
          {est.label}
        </span>
      </header>

      <div className="px-3 pb-2.5 space-y-1">
        {[
          { name: row.playerA, target: row.targetA, car: r?.carambolasA ?? null, ent: r?.entriesA ?? null, prom: r?.averageA ?? null, p: r?.pctA ?? null, gana: ganaA },
          { name: row.playerB, target: row.targetB, car: r?.carambolasB ?? null, ent: r?.entriesB ?? null, prom: r?.averageB ?? null, p: r?.pctB ?? null, gana: ganaB },
        ].map((j, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${
              j.gana ? 'bg-emerald-500/8 border border-emerald-500/20' : 'border border-transparent'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className={`text-xs truncate ${j.gana ? 'text-text-primary font-bold' : 'text-text-muted font-semibold'}`}>
                {j.name}
              </div>
              {j.target !== null && (
                <div className="text-[9px] text-text-muted/50 tabular-nums">a {j.target} carambolas</div>
              )}
            </div>
            {jugado ? (
              <div className="flex items-center gap-2 font-mono tabular-nums shrink-0">
                {pct && (
                  <span className={`text-[10px] w-11 text-right ${j.gana ? 'text-emerald-400' : 'text-text-muted/70'}`}>
                    {fmtPct(j.p, 0)}
                  </span>
                )}
                <span className="text-[10px] text-text-muted/60 w-10 text-right hidden sm:inline">{fmtAvg(j.prom)}</span>
                <span className={`text-sm w-6 text-right font-bold ${j.gana ? 'text-emerald-400' : 'text-text-muted'}`}>
                  {fmtInt(j.car)}
                </span>
              </div>
            ) : (
              <span className="text-sm font-mono text-text-muted/30 w-6 text-right shrink-0">{EMPTY}</span>
            )}
          </div>
        ))}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Página                                                             */
/* ------------------------------------------------------------------ */

export default function CalendarioClient({
  fixture,
  results,
  config,
}: {
  fixture: FixtureMatch[];
  results: GroupResult[];
  config: TournamentConfig;
}) {
  const [dayFilter, setDayFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');

  const rows = useMemo<Row[]>(() => {
    const byKey = new Map<string, GroupResult>();
    for (const r of results) byKey.set(`${r.group}-${r.match}`, r);

    return fixture.map(f => {
      const result = byKey.get(`${f.group}-${f.match}`) || null;
      const status: Estado =
        result && result.status !== 'pending'
          ? result.status
          : f.isoDate
            ? 'pending'
            : 'unscheduled';
      return { ...f, result, status };
    });
  }, [fixture, results]);

  const conFecha = rows.filter(r => r.isoDate).length;
  const jugados = rows.filter(r => r.status === 'played' || r.status === 'draw' || r.status === 'walkover').length;
  const mostrarPct = config.mixedCategories;

  const dias = useMemo(
    () => [...new Set(rows.map(r => r.isoDate).filter(Boolean))].sort(),
    [rows],
  );
  const grupos = useMemo(
    () => [...new Set(rows.map(r => r.group))].sort((a, b) => a - b),
    [rows],
  );

  const filtrados = rows.filter(r => {
    if (dayFilter !== 'all' && r.isoDate !== dayFilter) return false;
    if (groupFilter !== 'all' && r.group !== Number(groupFilter)) return false;
    return true;
  });

  /** Jornada → turno → partidos. Ordenado por fecha y hora. */
  const jornadas = useMemo(() => {
    const porDia = new Map<string, Map<string, Row[]>>();
    for (const r of filtrados) {
      const dia = r.isoDate || '';
      const turno = r.time24 || '';
      if (!porDia.has(dia)) porDia.set(dia, new Map());
      const turnos = porDia.get(dia)!;
      if (!turnos.has(turno)) turnos.set(turno, []);
      turnos.get(turno)!.push(r);
    }
    return [...porDia.entries()]
      .sort((a, b) => (a[0] || '9999').localeCompare(b[0] || '9999'))
      .map(([dia, turnos]) => ({
        dia,
        turnos: [...turnos.entries()]
          .sort((a, b) => (a[0] || '99:99').localeCompare(b[0] || '99:99'))
          .map(([hora, lista]) => ({
            hora,
            lista: lista.sort((x, y) => (x.table ?? 99) - (y.table ?? 99) || x.group - y.group || x.match - y.match),
          })),
      }));
  }, [filtrados]);

  const dayItems = [
    { key: 'all', label: 'Todas' },
    ...dias.map(d => ({ key: d, label: partesFecha(d)?.corto || d })),
  ];
  const groupItems = [
    { key: 'all', label: 'Todos' },
    ...grupos.map(g => ({ key: String(g), label: `Grupo ${g}`, color: groupColor(g) })),
  ];

  if (fixture.length === 0) {
    return (
      <div className="animate-fade-in px-4 py-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text mb-6">Calendario</h2>
          <EmptyState message="La hoja FIXTURE_GRUPOS todavía no tiene partidos. Corre el paso 3 del menú «Torneo Billar» en el Google Sheets." />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text">Calendario</h2>
          <p className="text-sm text-text-muted mt-1">
            Fase de grupos · {rows.length} partidos
            {dias.length > 0 && ` · ${dias.length} jornada${dias.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <StatCard label="Partidos" value={rows.length} />
          <StatCard
            label="Programados"
            value={`${conFecha}/${rows.length}`}
            hint={conFecha === rows.length ? 'completo' : undefined}
          />
          <StatCard
            label="Jugados"
            value={`${jugados}/${rows.length}`}
            hint={rows.length ? `${Math.round((jugados / rows.length) * 100)} % disputado` : undefined}
            accent
          />
        </div>

        {conFecha === 0 && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] px-4 py-3 mb-6">
            <p className="text-xs text-text-muted leading-relaxed">
              Todavía no hay fechas puestas. Se digitan en el Google Sheets, hoja{' '}
              <span className="font-mono text-text-primary">FIXTURE_GRUPOS</span>: columna{' '}
              <span className="font-mono text-text-primary">G</span> la fecha,{' '}
              <span className="font-mono text-text-primary">H</span> la hora y, si quieres,{' '}
              <span className="font-mono text-text-primary">I</span> la mesa. En cuanto las pongas
              aparecen aquí ordenadas por día y hora.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2 mb-8">
          {dias.length > 1 && <FilterPills items={dayItems} active={dayFilter} onChange={setDayFilter} />}
          {grupos.length > 1 && (
            <FilterPills items={groupItems} active={groupFilter} onChange={setGroupFilter} variant="outline" />
          )}
        </div>

        {filtrados.length === 0 ? (
          <EmptyState
            message="No hay partidos con ese filtro."
            onReset={() => {
              setDayFilter('all');
              setGroupFilter('all');
            }}
          />
        ) : (
          jornadas.map(({ dia, turnos }) => {
            // El número de jornada es el del torneo entero, no el de la
            // lista filtrada: al ver solo el jueves sigue siendo la 2ª.
            const numeroJornada = dias.indexOf(dia) + 1;
            const f = partesFecha(dia);
            const total = turnos.reduce((n, t) => n + t.lista.length, 0);
            const jug = turnos.reduce(
              (n, t) => n + t.lista.filter(r => r.status === 'played' || r.status === 'draw' || r.status === 'walkover').length,
              0,
            );

            return (
              <section key={dia || 'sin-fecha'} className="mb-10">
                {/* Cabecera de la jornada */}
                <div className="flex items-end justify-between gap-3 flex-wrap mb-5 pb-3 border-b border-border-light">
                  <div>
                    <div className="text-[10px] tracking-[0.25em] uppercase text-emerald-400/70 font-bold mb-0.5">
                      {f ? `Jornada ${numeroJornada}` : 'Pendiente de programar'}
                    </div>
                    <h3 className="text-lg md:text-xl font-black text-text-primary leading-tight">
                      {f ? (
                        <>
                          <span className="capitalize">{f.diaSemana}</span> {f.dia} de {f.mes}
                          <span className="text-text-muted/50 font-bold text-base"> · {f.anio}</span>
                        </>
                      ) : (
                        'Sin fecha asignada'
                      )}
                    </h3>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-sm font-black text-emerald-400 tabular-nums">
                      {jug}/{total}
                      <span className="ml-1.5 text-[10px] font-normal text-text-muted uppercase tracking-wider">
                        jugados
                      </span>
                    </div>
                  </div>
                </div>

                {/* Turnos */}
                {turnos.map(({ hora, lista }) => (
                  <div key={hora || 'sin-hora'} className="flex gap-3 md:gap-5 mb-5">
                    {/* Riel de la línea de tiempo */}
                    <div className="flex flex-col items-center shrink-0 w-14 md:w-20 pt-1">
                      <div className="text-[11px] md:text-xs font-black text-text-primary tabular-nums whitespace-nowrap">
                        {hora ? fmtTime(hora) : EMPTY}
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" />
                      <div className="flex-1 w-px bg-border-light mt-1" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-text-muted/60 uppercase tracking-wider mb-2">
                        {lista.length} partido{lista.length !== 1 ? 's' : ''} a la vez
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {lista.map(r => (
                          <Partido key={`${r.group}-${r.match}`} row={r} mostrarPct={mostrarPct} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
