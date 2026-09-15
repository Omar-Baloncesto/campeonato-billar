'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import type { GroupData } from '../data/types';
import { fmtInt, fmtSigned, fmtAvg, EMPTY } from '../lib/format';

function PositionBadge({ pos }: { pos: number }) {
  if (pos === 1) return <span className="medal-gold">1</span>;
  if (pos === 2) return <span className="medal-silver">2</span>;
  if (pos === 3) return <span className="medal-bronze">3</span>;
  return <span className="text-text-muted">{pos || EMPTY}</span>;
}

/** Celda numérica que distingue "0 de verdad" de "todavía sin jugar". */
function Cell({ value, className = '' }: { value: number | null; className?: string }) {
  const pending = value === null;
  return (
    <td className={`px-1.5 py-1.5 text-center font-mono ${pending ? 'text-text-muted/40' : className}`}>
      {pending ? EMPTY : fmtInt(value)}
    </td>
  );
}

export default function GroupStandingsTable({ group }: { group: GroupData }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showRightFade, setShowRightFade] = useState(false);

  const checkOverflow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowRightFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkOverflow();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkOverflow, { passive: true });
    window.addEventListener('resize', checkOverflow);
    return () => {
      el.removeEventListener('scroll', checkOverflow);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [checkOverflow]);

  // Orden de la tabla: el puesto que calcula el Sheet (ORDEN GRUPO).
  const rows = [...group.standings].sort((a, b) => {
    if (a.groupOrder && b.groupOrder) return a.groupOrder - b.groupOrder;
    return a.position - b.position;
  });

  const nMatches = group.matchesPerPlayer;
  const matchIdx = Array.from({ length: nMatches }, (_, i) => i);

  const playedTotal = rows.reduce((s, r) => s + r.played, 0) / 2;
  const scheduledTotal = (rows.length * nMatches) / 2;

  return (
    <div className="glass-card rounded-xl overflow-hidden glow-hover">
      <div className="bg-bg-header px-4 py-3 border-b border-border-light flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">
          Grupo {group.number}
        </h3>
        <span className="text-[10px] text-text-muted tabular-nums">
          {rows.length} jugadores · {Math.round(playedTotal)}/{Math.round(scheduledTotal)} partidos
        </span>
      </div>

      <div className="relative">
        {showRightFade && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-bg-card to-transparent z-10 pointer-events-none" />
        )}
        <div ref={scrollRef} className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-text-muted/70 border-b border-border-subtle">
                <th className="px-3 py-2.5 text-left font-semibold w-8" title="Puesto en el grupo">#</th>
                <th className="px-3 py-2.5 text-left font-semibold min-w-[140px]">Jugador</th>
                <th className="px-2 py-2.5 text-center font-semibold" title="Partidos jugados">PJ</th>
                <th className="px-2 py-2.5 text-center font-semibold" title="Carambolas a favor">CA</th>
                <th className="px-2 py-2.5 text-center font-semibold" title="Carambolas en contra">CR</th>
                <th className="px-2 py-2.5 text-center font-semibold" title={group.differentialLabel}>
                  {group.differentialIsPercent ? 'Dif %' : 'Dif'}
                </th>
                <th className="px-2 py-2.5 text-center font-semibold" title="Puntos">Pts</th>
                <th className="px-2 py-2.5 text-center font-semibold" title="Puesto en la clasificación general">Gral</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr
                  key={`${s.position}-${s.player}`}
                  className={`table-row-hover border-b border-border-subtle ${s.groupOrder > 0 && s.groupOrder <= 2 ? 'bg-emerald/[0.04]' : ''}`}
                >
                  <td className="px-3 py-2.5 font-bold"><PositionBadge pos={s.groupOrder} /></td>
                  <td className="px-3 py-2.5 font-semibold text-text-primary">{s.player}</td>
                  <td className="px-2 py-2.5 text-center font-mono text-text-muted tabular-nums">
                    {s.played}<span className="text-text-muted/40">/{s.scheduled}</span>
                  </td>
                  <td className="px-2 py-2.5 text-center font-mono text-emerald-400 tabular-nums">{s.totalCA}</td>
                  <td className="px-2 py-2.5 text-center font-mono text-text-muted tabular-nums">{s.totalCR}</td>
                  <td className={`px-2 py-2.5 text-center font-mono font-bold tabular-nums ${s.differential > 0 ? 'text-positive' : s.differential < 0 ? 'text-negative' : 'text-text-muted'}`}>
                    {group.differentialIsPercent ? fmtSigned(s.differential) : fmtSigned(s.differential, 2)}
                  </td>
                  <td className="px-2 py-2.5 text-center font-mono font-bold text-text-primary tabular-nums">{s.totalPts}</td>
                  <td className="px-2 py-2.5 text-center font-mono text-text-muted tabular-nums">
                    {s.generalClassification || EMPTY}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detalle partido a partido */}
      <details className="border-t border-border-subtle group">
        <summary className="px-4 py-2.5 text-[11px] text-text-muted cursor-pointer hover:text-emerald-400 transition-colors flex items-center gap-1.5">
          <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          Ver detalle por partido
        </summary>
        <div className="overflow-x-auto scrollbar-hide px-2 pb-3">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-text-muted/80">
                <th className="px-2 py-1.5 text-left sticky left-0 bg-bg-card">Jugador</th>
                {matchIdx.map(i => (
                  <th key={`ca${i}`} className="px-1.5 py-1.5 text-center" title={`Carambolas a favor, partido ${i + 1}`}>CA{i + 1}</th>
                ))}
                <th className="px-1.5 py-1.5 text-center text-emerald-400">ΣCA</th>
                {matchIdx.map(i => (
                  <th key={`cr${i}`} className="px-1.5 py-1.5 text-center" title={`Carambolas en contra, partido ${i + 1}`}>CR{i + 1}</th>
                ))}
                <th className="px-1.5 py-1.5 text-center text-negative">ΣCR</th>
                {matchIdx.map(i => (
                  <th key={`p${i}`} className="px-1.5 py-1.5 text-center" title={`Puntos, partido ${i + 1}`}>P{i + 1}</th>
                ))}
                <th className="px-1.5 py-1.5 text-center">Pts</th>
                <th className="px-1.5 py-1.5 text-center" title={group.differentialLabel}>
                  {group.differentialIsPercent ? 'Dif %' : 'Dif'}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={`${s.position}-${s.player}-d`} className="border-t border-border-subtle/50">
                  <td className="px-2 py-1.5 font-medium sticky left-0 bg-bg-card whitespace-nowrap">{s.player}</td>
                  {matchIdx.map(i => <Cell key={`ca${i}`} value={s.ca[i] ?? null} />)}
                  <td className="px-1.5 py-1.5 text-center font-mono font-bold text-emerald-400">{s.totalCA}</td>
                  {matchIdx.map(i => <Cell key={`cr${i}`} value={s.cr[i] ?? null} />)}
                  <td className="px-1.5 py-1.5 text-center font-mono font-bold text-negative">{s.totalCR}</td>
                  {matchIdx.map(i => <Cell key={`p${i}`} value={s.pts[i] ?? null} className="text-text-primary" />)}
                  <td className="px-1.5 py-1.5 text-center font-mono font-bold">{s.totalPts}</td>
                  <td className={`px-1.5 py-1.5 text-center font-mono ${s.differential > 0 ? 'text-positive' : s.differential < 0 ? 'text-negative' : 'text-text-muted'}`}>
                    {fmtSigned(s.differential)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-text-muted/60 px-2 pt-2 leading-relaxed">
            {EMPTY} = partido sin jugar todavía. {group.differentialIsPercent
              ? <>«Dif %» compara el rendimiento sobre el objetivo de cada jugador: suma de <span className="font-mono">carambolas ÷ objetivo</span> propias menos las del rival.</>
              : <>«Dif» es la diferencia de promedios entre carambolas a favor y en contra.</>}
            {' '}Media de carambolas por partido en el grupo:{' '}
            <span className="font-mono">{fmtAvg(carambolasPorPartido(rows), 1)}</span>.
          </p>
        </div>
      </details>
    </div>
  );
}

/** Carambolas a favor por partido jugado. No es el promedio deportivo
 *  (ese necesita entradas y GRUPOS no las trae), es una media de tanteo. */
function carambolasPorPartido(rows: { totalCA: number; played: number }[]): number | null {
  const ca = rows.reduce((s, r) => s + r.totalCA, 0);
  const played = rows.reduce((s, r) => s + r.played, 0);
  if (!played) return null;
  return ca / played;
}
