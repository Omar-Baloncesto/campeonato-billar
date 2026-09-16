'use client';

import type { CalendarMatch } from '../lib/calendar';
import { etiqueta, estaJugado } from '../lib/calendar';
import { fmtInt, fmtAvg, fmtPct, fmtTime, EMPTY } from '../lib/format';

/* ==================================================================
 *  Ficha de un partido. Sirve igual para la fase de grupos y para el
 *  cuadro: cambia el color y la etiqueta, no la forma.
 * ================================================================== */

const COLORES_GRUPO = [
  '#10b981', '#f59e0b', '#3b82f6', '#a855f7', '#06b6d4',
  '#ec4899', '#f97316', '#f43f5e', '#84cc16', '#8b5cf6', '#14b8a6',
];

/** Dorado para la eliminación: se distingue de un vistazo de los grupos. */
const COLOR_CUADRO = '#F5B800';

export function colorDe(m: CalendarMatch): string {
  if (m.kind === 'eliminacion') return COLOR_CUADRO;
  const g = m.group ?? 1;
  return COLORES_GRUPO[(g - 1 + COLORES_GRUPO.length) % COLORES_GRUPO.length];
}

const ESTADO: Record<string, { label: string; className: string }> = {
  played: { label: 'Jugado', className: 'bg-emerald-500/12 text-emerald-400' },
  draw: { label: 'Empate', className: 'bg-yellow-500/15 text-yellow-400' },
  walkover: { label: 'W.O.', className: 'bg-red-500/15 text-red-400' },
  pending: { label: 'Por jugar', className: 'bg-white/5 text-text-muted' },
  unscheduled: { label: 'Sin fecha', className: 'bg-white/5 text-text-muted/70' },
};

export default function MatchCard({
  m,
  mostrarPct,
  mostrarCuando = false,
}: {
  m: CalendarMatch;
  mostrarPct: boolean;
  /** Añade el día y la hora dentro de la ficha (vista de Resultados) */
  mostrarCuando?: boolean;
}) {
  const jugado = estaJugado(m);
  const clave = jugado ? m.status : m.isoDate ? 'pending' : 'unscheduled';
  const est = ESTADO[clave] || ESTADO.pending;
  const color = colorDe(m);
  const pct = mostrarPct && m.targetA !== null && m.targetB !== null;

  const ganaA = m.winner !== '' && m.winner === m.playerA;
  const ganaB = m.winner !== '' && m.winner === m.playerB;

  const porHandicap =
    pct && jugado && m.targetA !== m.targetB &&
    m.carambolasA !== null && m.carambolasB !== null &&
    ((ganaA && m.carambolasA < m.carambolasB) || (ganaB && m.carambolasB < m.carambolasA));

  const lados = [
    { n: m.playerA, o: m.targetA, c: m.carambolasA, e: m.entriesA, p: m.averageA, q: m.pctA, gana: ganaA },
    { n: m.playerB, o: m.targetB, c: m.carambolasB, e: m.entriesB, p: m.averageB, q: m.pctB, gana: ganaB },
  ];

  return (
    <article
      className={`glass-card rounded-xl overflow-hidden glow-hover ${m.porDefinir ? 'opacity-60' : ''}`}
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <header className="flex items-center gap-2 px-3 pt-2.5 pb-1.5 flex-wrap">
        <span
          className="text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase"
          style={{ background: `${color}22`, color }}
        >
          {etiqueta(m)}
        </span>
        <span className="text-[10px] text-text-muted/70 tracking-wider">Partido {m.match}</span>
        {m.table !== null && (
          <span className="text-[10px] text-text-muted/70 tracking-wider">· Mesa {m.table}</span>
        )}
        {mostrarCuando && m.time24 && (
          <span className="text-[10px] text-text-muted/70 tracking-wider">· {fmtTime(m.time24)}</span>
        )}
        <span className={`ml-auto text-[9px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${est.className}`}>
          {est.label}
        </span>
      </header>

      <div className="px-3 pb-2.5 space-y-1">
        {lados.map((j, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${
              j.gana ? 'bg-emerald-500/8 border border-emerald-500/20' : 'border border-transparent'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className={`text-xs truncate ${
                j.n.trim() === ''
                  ? 'text-text-muted/40 italic'
                  : j.gana ? 'text-text-primary font-bold' : 'text-text-muted font-semibold'
              }`}>
                {j.n.trim() === '' ? 'Por definir' : j.n}
              </div>
              {j.o !== null && (
                <div className="text-[9px] text-text-muted/50 tabular-nums">a {j.o} carambolas</div>
              )}
            </div>
            {jugado ? (
              <div className="flex items-center gap-2 font-mono tabular-nums shrink-0">
                {pct && (
                  <span className={`text-[10px] w-11 text-right ${j.gana ? 'text-emerald-400' : 'text-text-muted/70'}`}>
                    {fmtPct(j.q, 0)}
                  </span>
                )}
                <span className="text-[10px] text-text-muted/60 w-10 text-right hidden sm:inline">{fmtAvg(j.p)}</span>
                <span className={`text-sm w-6 text-right font-bold ${j.gana ? 'text-emerald-400' : 'text-text-muted'}`}>
                  {fmtInt(j.c)}
                </span>
              </div>
            ) : (
              <span className="text-sm font-mono text-text-muted/30 w-6 text-right shrink-0">{EMPTY}</span>
            )}
          </div>
        ))}
      </div>

      {porHandicap && (
        <p className="text-[10px] text-text-muted/70 px-4 pb-2.5 -mt-1 leading-snug">
          Gana <span className="text-emerald-400 font-semibold">{m.winner}</span> con menos
          carambolas: consiguió un porcentaje más alto de su objetivo.
        </p>
      )}

      {m.porDefinir && (
        <p className="text-[10px] text-text-muted/50 px-4 pb-2.5 -mt-1">
          Los jugadores salen solos cuando termine la ronda anterior.
        </p>
      )}
    </article>
  );
}
