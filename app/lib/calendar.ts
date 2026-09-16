/* ==================================================================
 *  Une en una sola lista los partidos de grupos y los del cuadro de
 *  eliminación, para que el calendario los pinte juntos, cada uno en
 *  su día y su hora.
 *
 *  De dónde sale cada cosa:
 *    · grupos      -> FIXTURE_GRUPOS (fecha, hora, mesa) + RESULTADOS
 *    · eliminación -> Eliminación Simple (fecha y hora en N y O)
 *
 *  Los jugadores del cuadro no se escriben a mano: son fórmulas que
 *  apuntan al ranking de GRUPOS, así que en cuanto se anota un
 *  resultado de la fase de grupos, los cruces de la eliminación se
 *  recalculan solos y aquí aparecen ya actualizados.
 * ================================================================== */

import type {
  FixtureMatch, GroupResult, EliminationMatch, MatchStatus,
} from '../data/types';

export type MatchKind = 'grupo' | 'eliminacion';

export interface CalendarMatch {
  id: string;
  kind: MatchKind;
  /** Número de grupo, solo en la fase de grupos */
  group: number | null;
  /** Nombre de la ronda, solo en la eliminación */
  roundName: string | null;
  round: number | null;
  match: number;
  playerA: string;
  playerB: string;
  targetA: number | null;
  targetB: number | null;
  carambolasA: number | null;
  carambolasB: number | null;
  entriesA: number | null;
  entriesB: number | null;
  averageA: number | null;
  averageB: number | null;
  pctA: number | null;
  pctB: number | null;
  winner: string;
  status: MatchStatus;
  isoDate: string;
  time24: string;
  table: number | null;
  /** true cuando todavía no se sabe quién juega (espera a la ronda anterior) */
  porDefinir: boolean;
}

/** Orden natural del calendario: día, hora, mesa y por último el grupo. */
export function ordenar(a: CalendarMatch, b: CalendarMatch): number {
  const fa = a.isoDate || '9999-99-99';
  const fb = b.isoDate || '9999-99-99';
  if (fa !== fb) return fa.localeCompare(fb);
  const ha = a.time24 || '99:99';
  const hb = b.time24 || '99:99';
  if (ha !== hb) return ha.localeCompare(hb);
  const ma = a.table ?? 99;
  const mb = b.table ?? 99;
  if (ma !== mb) return ma - mb;
  if (a.kind !== b.kind) return a.kind === 'grupo' ? -1 : 1;
  const ga = a.group ?? a.round ?? 0;
  const gb = b.group ?? b.round ?? 0;
  if (ga !== gb) return ga - gb;
  return a.match - b.match;
}

export function construirCalendario(
  fixture: FixtureMatch[],
  results: GroupResult[],
  elimination: EliminationMatch[],
): CalendarMatch[] {
  const porClave = new Map<string, GroupResult>();
  for (const r of results) porClave.set(`${r.group}-${r.match}`, r);

  const grupos: CalendarMatch[] = fixture.map(f => {
    const r = porClave.get(`${f.group}-${f.match}`) || null;
    return {
      id: `g-${f.group}-${f.match}`,
      kind: 'grupo',
      group: f.group,
      roundName: null,
      round: null,
      match: f.match,
      playerA: f.playerA,
      playerB: f.playerB,
      targetA: r?.targetA ?? f.targetA,
      targetB: r?.targetB ?? f.targetB,
      carambolasA: r?.carambolasA ?? null,
      carambolasB: r?.carambolasB ?? null,
      entriesA: r?.entriesA ?? null,
      entriesB: r?.entriesB ?? null,
      averageA: r?.averageA ?? null,
      averageB: r?.averageB ?? null,
      pctA: r?.pctA ?? null,
      pctB: r?.pctB ?? null,
      winner: r?.winner ?? '',
      status: r ? r.status : 'pending',
      isoDate: f.isoDate,
      time24: f.time24,
      table: f.table,
      porDefinir: false,
    };
  });

  // Los BYE no son partidos: nadie se sienta a jugarlos.
  const cuadro: CalendarMatch[] = elimination
    .filter(m => !m.isBye)
    .map(m => ({
      id: `e-${m.round}-${m.match}`,
      kind: 'eliminacion' as const,
      group: null,
      roundName: m.roundName,
      round: m.round,
      match: m.match,
      playerA: m.playerA,
      playerB: m.playerB,
      targetA: m.targetA,
      targetB: m.targetB,
      carambolasA: m.carambolasA,
      carambolasB: m.carambolasB,
      entriesA: m.entriesA,
      entriesB: m.entriesB,
      averageA: m.averageA,
      averageB: m.averageB,
      pctA: m.pctA,
      pctB: m.pctB,
      winner: m.winner,
      status: m.status,
      isoDate: m.isoDate,
      time24: m.time24,
      table: null,
      porDefinir: m.playerA.trim() === '' || m.playerB.trim() === '',
    }));

  return [...grupos, ...cuadro].sort(ordenar);
}

/** Etiqueta corta para la ficha: «Grupo 3» o «Cuartos de Final». */
export function etiqueta(m: CalendarMatch): string {
  return m.kind === 'grupo' ? `Grupo ${m.group}` : (m.roundName || `Ronda ${m.round}`);
}

export function estaJugado(m: CalendarMatch): boolean {
  return m.status === 'played' || m.status === 'draw' || m.status === 'walkover';
}
