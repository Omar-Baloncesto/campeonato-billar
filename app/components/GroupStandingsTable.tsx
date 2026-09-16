'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import type { GroupData, GroupStanding } from '../data/types';
import { fmtInt, fmtSigned, EMPTY } from '../lib/format';

/* ==================================================================
 *  La tabla del grupo, tal cual está en el Google Sheet.
 *
 *  Mismas columnas y mismo orden que la hoja GRUPOS: Nº, Jugador,
 *  CA P1..Pn, TOTAL CA, CR P1..Pn, TOTAL CR, DIF %, PTS P1..Pn,
 *  TOTAL PTS, ORDEN GRUPO y CLASIF GRAL. Nada resumido y nada
 *  escondido: quien mira la web ve lo mismo que quien mira la hoja.
 *
 *  En pantalla estrecha la tabla se desplaza en horizontal y las dos
 *  primeras columnas se quedan fijas, para no perder de vista quién
 *  es cada fila.
 * ================================================================== */

function PositionBadge({ pos }: { pos: number }) {
  if (pos === 1) return <span className="medal-gold font-bold">1</span>;
  if (pos === 2) return <span className="medal-silver font-bold">2</span>;
  if (pos === 3) return <span className="medal-bronze font-bold">3</span>;
  return <span className="text-text-muted">{pos || EMPTY}</span>;
}

/** Celda numérica que distingue "0 de verdad" de "todavía sin jugar". */
function Cell({
  value,
  className = '',
  bold = false,
}: {
  value: number | null;
  className?: string;
  bold?: boolean;
}) {
  const pending = value === null;
  return (
    <td
      className={`px-2 py-2 text-center font-mono tabular-nums whitespace-nowrap ${
        pending ? 'text-text-muted/35' : className
      } ${bold ? 'font-bold' : ''}`}
    >
      {pending ? EMPTY : fmtInt(value)}
    </td>
  );
}

/** Separador entre bloques de columnas (a favor / en contra / puntos). */
const SEP = 'border-l border-border-light';

export default function GroupStandingsTable({ group }: { group: GroupData }) {
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

  /**
   * ORDEN GRUPO solo significa algo cuando el Sheet ya lo ha calculado.
   * Antes de que se juegue nada, la hoja pone 1 a todo el mundo: pintar
   * cinco medallas de oro sería mentir. Mientras eso pase se enseña el
   * Nº de la columna A, que es el orden de inscripción.
   */
  const ordenes = group.standings.map(s => s.groupOrder);
  const ordenCalculado =
    ordenes.every(o => o > 0) && new Set(ordenes).size === ordenes.length;

  const rows: GroupStanding[] = [...group.standings].sort((a, b) =>
    ordenCalculado ? a.groupOrder - b.groupOrder : a.position - b.position,
  );

  const n = group.matchesPerPlayer;
  const idx = Array.from({ length: n }, (_, i) => i);
  const difLabel = group.differentialIsPercent ? 'DIF %' : 'DIF';

  const played = Math.round(rows.reduce((s, r) => s + r.played, 0) / 2);
  const scheduled = Math.round((rows.length * n) / 2);
  const pct = scheduled > 0 ? Math.round((played / scheduled) * 100) : 0;

  // Columnas fijas al desplazar: Nº y Jugador.
  const stickyNo =
    'sticky left-0 z-20 bg-bg-card w-10 min-w-10 max-w-10 box-border';
  const stickyName = 'sticky left-10 z-20 bg-bg-card';

  return (
    <section className="glass-card rounded-xl overflow-hidden">
      {/* Cabecera del grupo */}
      <header className="bg-bg-header px-4 py-3 border-b border-border-light flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-sm font-bold tracking-[0.12em] text-emerald-400 uppercase">
          Grupo {group.number}
        </h3>
        <div className="flex items-baseline gap-3 text-[11px] text-text-muted tabular-nums">
          <span>{rows.length} jugadores</span>
          <span aria-hidden className="text-text-muted/30">·</span>
          <span>
            {played}/{scheduled} partidos
          </span>
          {scheduled > 0 && (
            <span className="text-text-muted/60">{pct} %</span>
          )}
          {desborda && (
            <span className="text-text-muted/50 hidden max-lg:inline">· desliza →</span>
          )}
        </div>
      </header>

      {/* Barra de avance del grupo */}
      <div className="h-px bg-border-subtle">
        <div
          className="h-px bg-emerald-500/60 transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="relative">
        {fade && (
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-bg-card to-transparent z-30 pointer-events-none" />
        )}

        <div ref={scrollRef} className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-xs border-collapse">
            <thead>
              {/* Fila 1: los tres bloques del Sheet */}
              <tr className="text-[9px] uppercase tracking-[0.14em] text-text-muted/50">
                <th className={`${stickyNo} py-1.5`} />
                <th className={`${stickyName} py-1.5`} />
                <th className={`${SEP} px-2 py-1.5 font-semibold`} colSpan={n + 1}>
                  Carambolas a favor
                </th>
                <th className={`${SEP} px-2 py-1.5 font-semibold`} colSpan={n + 1}>
                  En contra
                </th>
                <th className={`${SEP} px-2 py-1.5 font-semibold`} colSpan={1}>
                  Dif.
                </th>
                <th className={`${SEP} px-2 py-1.5 font-semibold`} colSpan={n + 1}>
                  Puntos
                </th>
                <th className={`${SEP} px-2 py-1.5 font-semibold`} colSpan={1}>
                  Gral
                </th>
              </tr>

              {/* Fila 2: los encabezados exactos de la hoja */}
              <tr className="text-[10px] text-text-muted border-b border-border-light">
                <th className={`${stickyNo} px-1 py-2 text-center font-semibold`} title="Puesto en el grupo">
                  Nº
                </th>
                <th className={`${stickyName} px-3 py-2 text-left font-semibold min-w-[150px]`}>
                  Jugador
                </th>

                {idx.map(i => (
                  <th key={`hca${i}`} className={`${i === 0 ? SEP : ''} px-2 py-2 text-center font-normal`} title={`Carambolas a favor · partido ${i + 1}`}>
                    CA&nbsp;P{i + 1}
                  </th>
                ))}
                <th className="px-2 py-2 text-center font-bold text-emerald-400/90">TOTAL</th>

                {idx.map(i => (
                  <th key={`hcr${i}`} className={`${i === 0 ? SEP : ''} px-2 py-2 text-center font-normal`} title={`Carambolas en contra · partido ${i + 1}`}>
                    CR&nbsp;P{i + 1}
                  </th>
                ))}
                <th className="px-2 py-2 text-center font-bold">TOTAL</th>

                <th className={`${SEP} px-2 py-2 text-center font-bold`} title={group.differentialLabel}>
                  {difLabel}
                </th>

                {idx.map(i => (
                  <th key={`hp${i}`} className={`${i === 0 ? SEP : ''} px-2 py-2 text-center font-normal`} title={`Puntos · partido ${i + 1}`}>
                    PTS&nbsp;P{i + 1}
                  </th>
                ))}
                <th className="px-2 py-2 text-center font-bold text-text-primary">TOTAL</th>

                <th className={`${SEP} px-2 py-2 text-center font-semibold`} title="Puesto en la clasificación general del torneo">
                  Clasif
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map(s => {
                const clasifica = ordenCalculado && s.groupOrder <= 2;
                return (
                  <tr
                    key={`${s.position}-${s.player}`}
                    className={`table-row-hover border-b border-border-subtle ${
                      clasifica ? 'bg-emerald/[0.07]' : ''
                    }`}
                  >
                    <td
                      className={`${stickyNo} px-1 py-2 text-center font-mono ${
                        clasifica ? 'shadow-[inset_2px_0_0_0_var(--color-emerald)]' : ''
                      }`}
                    >
                      {ordenCalculado
                        ? <PositionBadge pos={s.groupOrder} />
                        : <span className="text-text-muted">{s.position}</span>}
                    </td>
                    <td className={`${stickyName} px-3 py-2 font-semibold text-text-primary whitespace-nowrap`}>
                      {s.player}
                    </td>

                    {idx.map(i => (
                      <Cell key={`ca${i}`} value={s.ca[i] ?? null} className={`text-text-primary/80 ${i === 0 ? SEP : ''}`} />
                    ))}
                    <td className="px-2 py-2 text-center font-mono font-bold text-emerald-400 tabular-nums">
                      {s.totalCA}
                    </td>

                    {idx.map(i => (
                      <Cell key={`cr${i}`} value={s.cr[i] ?? null} className={`text-text-muted ${i === 0 ? SEP : ''}`} />
                    ))}
                    <td className="px-2 py-2 text-center font-mono font-bold text-text-muted tabular-nums">
                      {s.totalCR}
                    </td>

                    <td
                      className={`${SEP} px-2 py-2 text-center font-mono font-bold tabular-nums whitespace-nowrap ${
                        s.differential > 0 ? 'text-positive' : s.differential < 0 ? 'text-negative' : 'text-text-muted'
                      }`}
                    >
                      {fmtSigned(s.differential)}
                    </td>

                    {idx.map(i => (
                      <Cell key={`p${i}`} value={s.pts[i] ?? null} className={`text-text-primary/80 ${i === 0 ? SEP : ''}`} />
                    ))}
                    <td className="px-2 py-2 text-center font-mono font-bold text-text-primary tabular-nums">
                      {s.totalPts}
                    </td>

                    <td className={`${SEP} px-2 py-2 text-center font-mono text-text-muted tabular-nums`}>
                      {s.generalClassification || EMPTY}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </section>
  );
}
