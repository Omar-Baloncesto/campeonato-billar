/* ==================================================================
 *  Parsers puros: de filas de CSV a los tipos del torneo.
 *
 *  Van separados de la descarga para poder probarlos sin red y para
 *  que el servidor y el cliente compartan exactamente la misma lógica.
 *
 *  Regla de oro: NADA de posiciones de columna fijas donde el Sheet
 *  las mueve. El número de columnas CA P1..Pn depende de cuántos
 *  jugadores tenga cada grupo, así que se leen del encabezado.
 * ================================================================== */

import { cell, num, numOrNull, pctOrNull, normalizeKey, normalizeName, isPlayerName } from './csv';
import { roundNameFor } from './rounds';
import type {
  TournamentConfig, Player, GroupResult, GroupData,
  RankedPlayer, EliminationMatch, RankingFinalRow, RankingGroupRow,
  FixtureMatch, MatchStatus,
} from '../data/types';

/* ------------------------------------------------------------------ */
/*  CONFIGURACION                                                      */
/* ------------------------------------------------------------------ */

export function parseConfig(rows: string[][], playerRows: string[][]): TournamentConfig {
  const byKey: Record<string, string> = {};
  for (const row of rows) {
    const label = cell(row, 0);
    const value = cell(row, 1);
    if (label && value) byKey[normalizeKey(label)] = value;
  }

  /** Busca por etiqueta exacta y, si falla, por prefijo. */
  const get = (...hints: string[]): string => {
    for (const hint of hints) {
      const k = normalizeKey(hint);
      if (byKey[k]) return byKey[k];
      const found = Object.keys(byKey).find(x => x.startsWith(k));
      if (found) return byKey[found];
    }
    return '';
  };

  // El número de grupos sale de JUGADORES (columna C), no de una celda
  // de configuración que puede quedarse desactualizada.
  const groups = new Set<number>();
  for (const r of playerRows.slice(1)) {
    const g = numOrNull(cell(r, 2));
    if (g && g > 0) groups.add(g);
  }

  // ¿Se cruzan categorías? Si en JUGADORES hay más de una, sí.
  const categories = new Set<string>();
  for (const r of playerRows.slice(1)) {
    const c = cell(r, 3);
    if (c) categories.add(normalizeKey(c));
  }

  const primera = numOrNull(get('Carambolas primera categoria', 'Carambolas primera'));
  const segunda = numOrNull(get('Carambolas segunda categoria', 'Carambolas segunda'));
  // Compatibilidad con la configuración vieja de una sola categoría
  const preliminar = numOrNull(get('Carambolas - Ronda preliminar', 'Carambolas - Ronda'));

  return {
    totalPlayers: num(get('Numero total de jugadores', 'Numero total')) || playerRows.slice(1).filter(r => cell(r, 1)).length,
    playersPerGroup: num(get('Jugadores por grupo')) || 4,
    totalGroups: groups.size || num(get('Numero total de grupos', 'Total de grupos', 'Grupos')),
    category: get('Categoria') || 'Primera',
    carambolasPrimera: primera ?? preliminar ?? 20,
    carambolasSegunda: segunda ?? preliminar ?? 17,
    carambolasSemifinal: num(get('Carambolas - Semifinal', 'Carambolas - Semi')) || 25,
    carambolasFinal: num(get('Carambolas - Final')) || 25,
    entriesLimit: num(get('Limite de entradas')) || 30,
    timePerEntry: num(get('Tiempo por entrada (segundos)', 'Tiempo por entrada')) || 40,
    mixedCategories: categories.size > 1,
  };
}

/* ------------------------------------------------------------------ */
/*  JUGADORES  +  Base de Datos                                        */
/* ------------------------------------------------------------------ */

/** Base de Datos: fila 1 título, fila 2 encabezados, fila 3+ datos.
 *  B = nombre, C = categoría, D = ciudad, E = carambolas (objetivo). */
export function parseTargets(rows: string[][]): Map<string, number> {
  const targets = new Map<string, number>();
  for (const row of rows) {
    const name = cell(row, 1);
    const target = numOrNull(cell(row, 4));
    if (!name || target === null) continue;
    if (normalizeKey(name).startsWith('nombre')) continue; // encabezado
    targets.set(normalizeName(name), target);
  }
  return targets;
}

export function parsePlayers(rows: string[][], targets: Map<string, number>): Player[] {
  return rows
    .slice(1)
    .filter(r => cell(r, 0) && cell(r, 1))
    .map(r => {
      const name = cell(r, 1);
      return {
        id: num(cell(r, 0)),
        name,
        group: num(cell(r, 2)),
        category: cell(r, 3) || 'Primera',
        active: cell(r, 4).toUpperCase() === 'SI',
        city: cell(r, 5),
        target: targets.get(normalizeName(name)) ?? null,
      };
    });
}

/* ------------------------------------------------------------------ */
/*  RESULTADOS                                                         */
/* ------------------------------------------------------------------ */

/**
 * A Grupo | B Partido | C Jugador A | D Carambolas A | E Entradas A
 * F Promedio A | G Jugador B | H Carambolas B | I Entradas B
 * J Promedio B | K Resultado | L W.O. | M Objetivo A | N Objetivo B
 * O % Objetivo A | P % Objetivo B
 *
 * M..P se añadieron después, así que pueden no existir en un Sheet
 * viejo: en ese caso el % se calcula, y si tampoco hay objetivo se
 * deja en null y la web lo omite.
 */
export function parseResults(rows: string[][], targets?: Map<string, number>): GroupResult[] {
  const out: GroupResult[] = [];

  for (const row of rows.slice(1)) {
    const group = numOrNull(cell(row, 0));
    const playerA = cell(row, 2);
    const playerB = cell(row, 6);
    if (group === null || !playerA || !playerB) continue;

    const carambolasA = numOrNull(cell(row, 3));
    const entriesA = numOrNull(cell(row, 4));
    const carambolasB = numOrNull(cell(row, 7));
    const entriesB = numOrNull(cell(row, 8));
    const rawResult = cell(row, 10);
    const walkover = cell(row, 11).toUpperCase() === 'SI';

    const targetA = numOrNull(cell(row, 12)) ?? targets?.get(normalizeName(playerA)) ?? null;
    const targetB = numOrNull(cell(row, 13)) ?? targets?.get(normalizeName(playerB)) ?? null;

    const pctA = pctOrNull(cell(row, 14)) ?? ratio(carambolasA, targetA);
    const pctB = pctOrNull(cell(row, 15)) ?? ratio(carambolasB, targetB);

    const upper = rawResult.toUpperCase();
    let status: MatchStatus;
    if (walkover || upper === 'W.O.') status = 'walkover';
    else if (upper === 'EMPATE') status = 'draw';
    else if (carambolasA === null || carambolasB === null) status = 'pending';
    else status = 'played';

    out.push({
      group,
      match: num(cell(row, 1)),
      playerA,
      carambolasA,
      entriesA,
      averageA: numOrNull(cell(row, 5)) ?? ratio(carambolasA, entriesA),
      playerB,
      carambolasB,
      entriesB,
      averageB: numOrNull(cell(row, 9)) ?? ratio(carambolasB, entriesB),
      winner: isPlayerName(rawResult) ? rawResult : '',
      rawResult,
      walkover,
      status,
      targetA,
      targetB,
      pctA,
      pctB,
    });
  }
  return out;
}

function ratio(a: number | null, b: number | null): number | null {
  if (a === null || b === null || b === 0) return null;
  return a / b;
}

/* ------------------------------------------------------------------ */
/*  GRUPOS                                                             */
/* ------------------------------------------------------------------ */

interface GroupColumns {
  no: number;
  player: number;
  ca: number[];
  totalCA: number;
  cr: number[];
  totalCR: number;
  dif: number;
  difLabel: string;
  pts: number[];
  totalPts: number;
  orden: number;
  clasif: number;
}

/**
 * Lee el encabezado de un grupo y devuelve dónde está cada dato.
 * El número de columnas CA P1..Pn cambia con el tamaño del grupo,
 * por eso se deduce del encabezado en vez de fijarlo.
 */
function readGroupHeader(row: string[]): GroupColumns | null {
  const cols: GroupColumns = {
    no: -1, player: -1, ca: [], totalCA: -1, cr: [], totalCR: -1,
    dif: -1, difLabel: '', pts: [], totalPts: -1, orden: -1, clasif: -1,
  };

  for (let i = 0; i < row.length; i++) {
    const raw = cell(row, i);
    const k = normalizeKey(raw);
    if (!k) continue;

    if (k === 'no' || k === 'n') cols.no = i;
    else if (k === 'jugador') cols.player = i;
    else if (k === 'total ca') cols.totalCA = i;
    else if (k === 'total cr') cols.totalCR = i;
    else if (k === 'total pts') cols.totalPts = i;
    else if (k === 'orden grupo') cols.orden = i;
    else if (k === 'clasif gral') cols.clasif = i;
    else if (k === 'dif %' || k === 'prom - dif' || k.startsWith('dif')) {
      cols.dif = i;
      cols.difLabel = raw;
    } else if (/^ca p\d+$/.test(k)) cols.ca.push(i);
    else if (/^cr p\d+$/.test(k)) cols.cr.push(i);
    else if (/^pts p\d+$/.test(k)) cols.pts.push(i);
  }

  if (cols.no < 0 || cols.player < 0 || cols.totalPts < 0) return null;
  return cols;
}

export function parseGroupStandings(rows: string[][]): GroupData[] {
  const groups: GroupData[] = [];
  let current: GroupData | null = null;
  let cols: GroupColumns | null = null;

  for (const row of rows) {
    // Encabezado de grupo: "GRUPO 3" (la celda combinada empieza en A o B)
    const headerText = `${cell(row, 0)} ${cell(row, 1)}`;
    const groupMatch = headerText.match(/GRUPO\s+(\d+)/i);
    if (groupMatch) {
      const number = parseInt(groupMatch[1], 10);
      current = groups.find(g => g.number === number) || null;
      if (!current) {
        current = {
          number,
          standings: [],
          matchesPerPlayer: 0,
          differentialLabel: 'DIF',
          differentialIsPercent: true,
        };
        groups.push(current);
      }
      cols = null;
      continue;
    }

    // Fila de encabezados de columna
    const maybeCols = readGroupHeader(row);
    if (maybeCols) {
      cols = maybeCols;
      if (current) {
        current.matchesPerPlayer = cols.ca.length;
        current.differentialLabel = cols.difLabel || 'DIF';
        current.differentialIsPercent = normalizeKey(cols.difLabel).includes('%');
      }
      continue;
    }

    if (!current || !cols) continue;

    // Fila de datos: Nº numérico y nombre de jugador
    const posRaw = cell(row, cols.no);
    const player = cell(row, cols.player);
    if (!player || posRaw === '' || Number.isNaN(Number(posRaw))) continue;

    const ca = cols.ca.map(i => numOrNull(cell(row, i)));
    const cr = cols.cr.map(i => numOrNull(cell(row, i)));
    const pts = cols.pts.map(i => numOrNull(cell(row, i)));

    let played = 0;
    for (let i = 0; i < ca.length; i++) {
      if (ca[i] !== null && cr[i] !== null) played++;
    }
    current.standings.push({
      position: num(posRaw),
      player,
      ca,
      totalCA: num(cell(row, cols.totalCA)),
      cr,
      totalCR: num(cell(row, cols.totalCR)),
      differential: num(cell(row, cols.dif)),
      pts,
      totalPts: num(cell(row, cols.totalPts)),
      groupOrder: num(cell(row, cols.orden)),
      generalClassification: num(cell(row, cols.clasif)),
      played,
      scheduled: 0, // se ajusta abajo, cuando se sabe cuántos son en el grupo
    });
  }

  // Todos contra todos: en un grupo de n se juegan n-1 partidos por cabeza.
  // Las columnas CA P* sobrantes (el encabezado las trae para el grupo más
  // grande del torneo) se recortan para no pintar partidos que no existen.
  for (const g of groups) {
    const headerCols = g.matchesPerPlayer;
    // Por si alguna fila trae datos más allá de n-1, no se recorta nada útil.
    let lastWithData = 0;
    for (const s of g.standings) {
      for (let i = 0; i < headerCols; i++) {
        if (s.ca[i] !== null || s.cr[i] !== null || s.pts[i] !== null) lastWithData = Math.max(lastWithData, i + 1);
      }
    }
    const perPlayer = Math.min(headerCols, Math.max(g.standings.length - 1, lastWithData));
    g.matchesPerPlayer = perPlayer;
    for (const s of g.standings) {
      s.scheduled = perPlayer;
      s.ca = s.ca.slice(0, perPlayer);
      s.cr = s.cr.slice(0, perPlayer);
      s.pts = s.pts.slice(0, perPlayer);
      s.played = s.ca.filter((v, i) => v !== null && s.cr[i] !== null).length;
    }
  }

  return groups.filter(g => g.standings.length > 0);
}

/**
 * Columnas "Clasif" / "Ranking Jugadores" que el Sheet pone a la derecha
 * de los grupos. Es el orden con el que se siembra la eliminación.
 */
export function parseGlobalRanking(rows: string[][]): RankedPlayer[] {
  if (rows.length === 0) return [];

  let colRank = -1;
  let colName = -1;
  for (let i = 0; i < rows[0].length; i++) {
    const k = normalizeKey(cell(rows[0], i));
    if (k === 'clasif') colRank = i;
    else if (k === 'ranking jugadores') colName = i;
  }
  if (colName < 0) return [];

  const out: RankedPlayer[] = [];
  for (let r = 1; r < rows.length; r++) {
    const player = cell(rows[r], colName);
    if (!player) continue;
    const ranking = colRank >= 0 ? numOrNull(cell(rows[r], colRank)) : null;
    out.push({ ranking: ranking ?? out.length + 1, player });
  }
  return out.sort((a, b) => a.ranking - b.ranking);
}

/* ------------------------------------------------------------------ */
/*  ELIMINACIÓN SIMPLE                                                 */
/* ------------------------------------------------------------------ */

/**
 * A Ronda | B Partido | C Jugador A | D Entradas A | E Carambolas A
 * F Prom A | G Jugador B | H Entradas B | I Carambolas B | J Prom B
 * K Ganador | L Objetivo A | M Objetivo B | N Fecha | O Hora
 *
 * N y O se digitan a mano, igual que en FIXTURE_GRUPOS, y son las que
 * colocan cada ronda en el calendario. Si están vacías, la ronda sale
 * como pendiente de programar.
 *
 * Las filas de título ("FINAL", "SEMIFINAL"…) se saltan solas porque
 * la columna A no es un número.
 */
export function parseElimination(rows: string[][], targets?: Map<string, number>): EliminationMatch[] {
  const raw: Omit<EliminationMatch, 'roundName'>[] = [];

  for (const row of rows) {
    const round = numOrNull(cell(row, 0));
    const match = numOrNull(cell(row, 1));
    if (round === null || match === null || round < 1) continue;

    const playerA = cell(row, 2);
    if (!playerA) continue;
    const playerBRaw = cell(row, 6);
    const isBye = playerBRaw.toUpperCase() === 'BYE' || playerA.toUpperCase() === 'BYE';

    const entriesA = numOrNull(cell(row, 3));
    const carambolasA = numOrNull(cell(row, 4));
    const entriesB = numOrNull(cell(row, 7));
    const carambolasB = numOrNull(cell(row, 8));

    const targetA = numOrNull(cell(row, 11)) ?? targets?.get(normalizeName(playerA)) ?? null;
    const targetB = numOrNull(cell(row, 12)) ?? targets?.get(normalizeName(playerBRaw)) ?? null;

    const winner = cell(row, 10);

    let status: MatchStatus;
    if (isBye) status = 'walkover';
    else if (carambolasA === null || carambolasB === null) status = 'pending';
    else if (winner.toUpperCase() === 'EMPATE') status = 'draw';
    else status = 'played';

    raw.push({
      round,
      match,
      playerA,
      entriesA,
      carambolasA,
      averageA: numOrNull(cell(row, 5)) ?? ratio(carambolasA, entriesA),
      playerB: playerBRaw,
      entriesB,
      carambolasB,
      averageB: numOrNull(cell(row, 9)) ?? ratio(carambolasB, entriesB),
      winner: isPlayerName(winner) ? winner : '',
      isBye,
      targetA,
      targetB,
      pctA: ratio(carambolasA, targetA),
      pctB: ratio(carambolasB, targetB),
      status,
      isoDate: parseDateAny(cell(row, 13)),
      time24: parseTime24(cell(row, 14)),
    });
  }

  // El nombre de cada ronda sale de cuántos cruces tiene, BYEs incluidos.
  const totals: Record<number, number> = {};
  for (const m of raw) totals[m.round] = (totals[m.round] || 0) + 1;

  return raw.map(m => ({ ...m, roundName: roundNameFor(totals[m.round], m.round) }));
}

/* ------------------------------------------------------------------ */
/*  RANKINGS                                                           */
/* ------------------------------------------------------------------ */

export function parseRankingFinal(rows: string[][]): RankingFinalRow[] {
  return rows
    .slice(1)
    .filter(r => cell(r, 0) && cell(r, 1))
    .map(r => ({
      ranking: num(cell(r, 0)),
      player: cell(r, 1),
      roundReached: num(cell(r, 2)),
    }));
}

/**
 * RankingGrupos.
 *
 * La hoja existe en dos formatos y los dos tienen que leerse, porque el
 * Sheet puede ir por delante o por detrás de la web:
 *
 *   · el viejo, siete columnas fijas:
 *       Ranking | Jugador | Categoría | Carambolas | Entradas | Promedio | Puntos
 *   · el nuevo, con las columnas que explican el orden y una fila de
 *     rótulos encima:
 *       Ranking | Jugador | Categoría | Grupo | Puesto | Puntos |
 *       Pts x Partido | Ventaja x Partido | Carambolas | Entradas | Promedio
 *
 * Por eso no se leen posiciones fijas: se busca la fila de encabezados y
 * cada columna por su nombre.
 */
export function parseRankingGroups(rows: string[][]): RankingGroupRow[] {
  // La fila de encabezados es la primera que trae "Ranking" y "Jugador".
  let filaEnc = -1;
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const celdas = rows[i].map(c => normalizeKey(c));
    if (celdas.includes('ranking') && celdas.includes('jugador')) { filaEnc = i; break; }
  }
  if (filaEnc < 0) return [];

  const col: Record<string, number> = {};
  rows[filaEnc].forEach((c, i) => {
    const k = normalizeKey(c);
    if (k && !(k in col)) col[k] = i;
  });

  const idx = (...nombres: string[]) => {
    for (const n of nombres) {
      const k = normalizeKey(n);
      if (k in col) return col[k];
    }
    return -1;
  };

  const cRank = idx('Ranking');
  const cJug  = idx('Jugador');
  const cCat  = idx('Categoría', 'Categoria', 'Ciudad');
  const cCar  = idx('Carambolas');
  const cEnt  = idx('Entradas');
  const cProm = idx('Promedio');
  const cPts  = idx('Puntos');
  const cGrup = idx('Grupo');
  const cPues = idx('Puesto');
  const cPxP  = idx('Pts x Partido', 'Pts x Part.');
  const cVxP  = idx('Ventaja x Partido', 'Ventaja x Part.');

  const out: RankingGroupRow[] = [];
  for (let r = filaEnc + 1; r < rows.length; r++) {
    const fila = rows[r];
    const ranking = numOrNull(cell(fila, cRank));
    const player = cell(fila, cJug);
    if (ranking === null || !player) continue;

    out.push({
      ranking,
      player,
      categoryOrCity: cell(fila, cCat),
      carambolas: num(cell(fila, cCar)),
      entries: num(cell(fila, cEnt)),
      average: num(cell(fila, cProm)),
      points: num(cell(fila, cPts)),
      group: numOrNull(cell(fila, cGrup)),
      groupOrder: numOrNull(cell(fila, cPues)),
      pointsPerMatch: numOrNull(cell(fila, cPxP)),
      advantagePerMatch: numOrNull(cell(fila, cVxP)),
    });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/*  FIXTURE_GRUPOS                                                     */
/* ------------------------------------------------------------------ */

/** A Grupo | B Partido | C Jugador A | D Carambolas A | E Jugador B
 *  F Carambolas B | G Fecha | H Hora | I Mesa
 *  G, H e I se digitan a mano. La columna I es opcional. */
export function parseFixture(rows: string[][]): FixtureMatch[] {
  const out: FixtureMatch[] = [];
  for (const row of rows.slice(1)) {
    const group = numOrNull(cell(row, 0));
    const playerA = cell(row, 2);
    const playerB = cell(row, 4);
    if (group === null || !playerA || !playerB) continue;

    out.push({
      group,
      match: num(cell(row, 1)),
      playerA,
      targetA: numOrNull(cell(row, 3)),
      playerB,
      targetB: numOrNull(cell(row, 5)),
      isoDate: parseDateAny(cell(row, 6)),
      time24: parseTime24(cell(row, 7)),
      table: numOrNull(cell(row, 8)),
    });
  }
  return out;
}

/**
 * Lee la fecha venga como venga desde el Sheet y la devuelve como
 * "2026-09-16". Aguanta "16/09/2026", "16-09-2026", "16.09.2026",
 * "16 09 26" y "2026-09-16", porque cada quien la digita distinto.
 */
export function parseDateAny(dateStr: string): string {
  const s = (dateStr || '').trim();
  if (!s) return '';

  const partes = s.split(/[-/.\s]+/);
  if (partes.length !== 3 || partes.some(p => !/^\d{1,4}$/.test(p))) return '';

  let day: number, month: number, year: number;
  if (partes[0].length === 4) {
    [year, month, day] = partes.map(Number);
  } else {
    [day, month, year] = partes.map(Number);
    // El Sheet está en español, así que lo normal es día/mes. Pero si el
    // primer número no puede ser un mes y el segundo sí, viene al revés.
    if (day <= 12 && month > 12) { const t = day; day = month; month = t; }
    if (year < 100) year += 2000;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) return '';
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** "9:00 a. m." → "09:00" · "2:00 p. m." → "14:00" · "" → "" */
export function parseTime24(timeStr: string): string {
  const clean = (timeStr || '').replace(/\s+/g, ' ').trim().toLowerCase();
  if (!clean) return '';
  const m = clean.match(/^(\d{1,2})[:.](\d{2})(?::\d{2})?\s*(a\.?\s*m\.?|p\.?\s*m\.?|am|pm|m\.?)?$/);
  if (!m) return '';
  let hours = parseInt(m[1], 10);
  const minutes = m[2];
  const period = (m[3] || '').replace(/[\s.]/g, '');
  if (period.startsWith('p') && hours < 12) hours += 12;
  if (period.startsWith('a') && hours === 12) hours = 0;
  if (period === 'm') hours = 12;
  return `${String(hours).padStart(2, '0')}:${minutes}`;
}
