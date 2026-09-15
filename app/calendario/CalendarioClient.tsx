'use client';

import { useState, useMemo } from 'react';
import FilterPills from '../components/FilterPills';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import { fmtDate, fmtTime, fmtInt, fmtPct, EMPTY } from '../lib/format';
import type { FixtureMatch, GroupResult, MatchStatus } from '../data/types';

/* ==================================================================
 *  Calendario.
 *
 *  Sale de la hoja FIXTURE_GRUPOS, que es la que manda: allí están las
 *  columnas Fecha y Hora que se digitan a mano. Los marcadores se
 *  cruzan con RESULTADOS por grupo + número de partido.
 *
 *  Antes esta página leía un archivo fijo dentro del código con la
 *  programación de otro torneo, así que nunca cambiaba.
 * ================================================================== */

interface Row extends FixtureMatch {
  result: GroupResult | null;
  status: MatchStatus | 'unscheduled';
}

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  played: { label: 'Jugado', className: 'bg-emerald-500/10 text-emerald-400' },
  draw: { label: 'Empate', className: 'bg-yellow-500/15 text-yellow-400' },
  walkover: { label: 'W.O.', className: 'bg-red-500/15 text-red-400' },
  pending: { label: 'Programado', className: 'bg-white/5 text-text-muted' },
  unscheduled: { label: 'Sin fecha', className: 'bg-white/5 text-text-muted/70' },
};

function MatchRow({ row }: { row: Row }) {
  const r = row.result;
  const winnerA = !!r && r.winner !== '' && r.winner === row.playerA;
  const winnerB = !!r && r.winner !== '' && r.winner === row.playerB;
  const style = STATUS_STYLE[row.status] || STATUS_STYLE.pending;
  const showPct = !!r && r.targetA !== null && r.targetB !== null && r.targetA !== r.targetB;

  return (
    <div className="glass-card rounded-lg px-3 py-2.5 flex items-center gap-3 glow-hover">
      <div className="text-[10px] font-mono text-text-muted/70 w-16 shrink-0 text-center leading-tight">
        <div>G{row.group}</div>
        <div className="text-text-muted/50">P{row.match}</div>
      </div>

      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className={`flex-1 text-xs truncate ${winnerA ? 'text-text-primary font-bold' : 'text-text-muted'}`}>
            {row.playerA}
          </span>
          {showPct && <span className="text-[9px] font-mono text-text-muted/60 w-12 text-right">{fmtPct(r!.pctA, 0)}</span>}
          <span className={`text-xs font-mono w-6 text-right tabular-nums ${winnerA ? 'text-emerald-400 font-bold' : 'text-text-muted'}`}>
            {r ? fmtInt(r.carambolasA) : EMPTY}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`flex-1 text-xs truncate ${winnerB ? 'text-text-primary font-bold' : 'text-text-muted'}`}>
            {row.playerB}
          </span>
          {showPct && <span className="text-[9px] font-mono text-text-muted/60 w-12 text-right">{fmtPct(r!.pctB, 0)}</span>}
          <span className={`text-xs font-mono w-6 text-right tabular-nums ${winnerB ? 'text-emerald-400 font-bold' : 'text-text-muted'}`}>
            {r ? fmtInt(r.carambolasB) : EMPTY}
          </span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        {row.time24 && (
          <div className="text-[10px] font-mono text-text-muted mb-0.5">{fmtTime(row.time24)}</div>
        )}
        <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${style.className}`}>
          {style.label}
        </span>
      </div>
    </div>
  );
}

export default function CalendarioClient({
  fixture,
  results,
}: {
  fixture: FixtureMatch[];
  results: GroupResult[];
}) {
  const [groupFilter, setGroupFilter] = useState('all');

  const rows = useMemo<Row[]>(() => {
    const byKey = new Map<string, GroupResult>();
    for (const r of results) byKey.set(`${r.group}-${r.match}`, r);

    return fixture.map(f => {
      const result = byKey.get(`${f.group}-${f.match}`) || null;
      // "Programado" solo si de verdad tiene fecha; si no, está sin fecha.
      const status: Row['status'] =
        result && result.status !== 'pending'
          ? result.status
          : f.isoDate
            ? 'pending'
            : 'unscheduled';
      return { ...f, result, status };
    });
  }, [fixture, results]);

  const groups = [...new Set(rows.map(r => r.group))].sort((a, b) => a - b);
  const groupItems = [
    { key: 'all', label: 'Todos' },
    ...groups.map(g => ({ key: String(g), label: `Grupo ${g}` })),
  ];

  const filtered = groupFilter === 'all' ? rows : rows.filter(r => r.group === Number(groupFilter));

  const scheduled = rows.filter(r => r.isoDate).length;
  const played = rows.filter(r => r.status === 'played' || r.status === 'draw').length;

  // Si hay fechas, se agrupa por jornada. Si no, por grupo.
  const byDate = useMemo(() => {
    const map = new Map<string, Row[]>();
    for (const r of filtered) {
      const key = r.isoDate || '';
      const list = map.get(key) || [];
      list.push(r);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.time24 || '99:99').localeCompare(b.time24 || '99:99') || a.group - b.group || a.match - b.match);
    }
    return [...map.entries()].sort((a, b) => (a[0] || '9999').localeCompare(b[0] || '9999'));
  }, [filtered]);

  const byGroup = useMemo(() => {
    const map = new Map<number, Row[]>();
    for (const r of filtered) {
      const list = map.get(r.group) || [];
      list.push(r);
      map.set(r.group, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.match - b.match);
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  if (fixture.length === 0) {
    return (
      <div className="animate-fade-in px-4 py-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text mb-6">Calendario</h2>
          <EmptyState message="La hoja FIXTURE_GRUPOS todavía no tiene partidos. Corre el paso 3 del menú «Torneo Billar» en el Google Sheets." />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in px-4 py-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase gradient-text">Calendario</h2>
          <p className="text-sm text-text-muted mt-1">
            Fase de grupos · {rows.length} partidos · {played} jugados
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <StatCard label="Partidos" value={rows.length} />
          <StatCard label="Con fecha" value={`${scheduled}/${rows.length}`} />
          <StatCard label="Jugados" value={`${played}/${rows.length}`} accent />
        </div>

        {scheduled === 0 && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] px-4 py-3 mb-6">
            <p className="text-xs text-text-muted leading-relaxed">
              Todavía no hay ninguna fecha puesta. Se digitan en el Google Sheets, en la hoja{' '}
              <span className="font-mono text-text-primary">FIXTURE_GRUPOS</span>, columnas{' '}
              <span className="font-mono text-text-primary">G (Fecha)</span> y{' '}
              <span className="font-mono text-text-primary">H (Hora)</span>. En cuanto las pongas
              aparecen aquí agrupadas por jornada.
            </p>
          </div>
        )}

        <div className="mb-6">
          <FilterPills items={groupItems} active={groupFilter} onChange={setGroupFilter} />
        </div>

        {filtered.length === 0 ? (
          <EmptyState message="No hay partidos con ese filtro." onReset={() => setGroupFilter('all')} />
        ) : scheduled > 0 ? (
          byDate.map(([date, list]) => (
            <section key={date || 'sin-fecha'} className="mb-8">
              <h3 className="text-sm font-bold tracking-wider text-emerald-400 uppercase mb-3 first-letter:uppercase">
                {date ? fmtDate(date) : 'Sin fecha asignada'}
                <span className="ml-2 text-[11px] font-normal text-text-muted normal-case tracking-normal">
                  {list.length} partido{list.length !== 1 ? 's' : ''}
                </span>
              </h3>
              <div className="space-y-2">
                {list.map(r => <MatchRow key={`${r.group}-${r.match}`} row={r} />)}
              </div>
            </section>
          ))
        ) : (
          byGroup.map(([group, list]) => (
            <section key={group} className="mb-8">
              <h3 className="text-sm font-bold tracking-wider text-emerald-400 uppercase mb-3">
                Grupo {group}
                <span className="ml-2 text-[11px] font-normal text-text-muted normal-case tracking-normal">
                  {list.length} partido{list.length !== 1 ? 's' : ''}
                </span>
              </h3>
              <div className="space-y-2">
                {list.map(r => <MatchRow key={`${r.group}-${r.match}`} row={r} />)}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
