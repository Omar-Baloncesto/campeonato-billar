/* ==================================================================
 *  Lectura del Google Sheet del torneo (lado servidor).
 *
 *  Antes cada visita disparaba ~7 descargas a Google con
 *  `cache: 'no-store'`, así que con varias personas mirando a la vez
 *  Google acababa limitando las peticiones. Ahora todas las descargas
 *  van marcadas con el tag SHEET_TAG y se guardan SHEET_TTL segundos:
 *
 *    · sin tocar nada, los datos se refrescan solos cada 15 s
 *    · el Apps Script puede llamar a /api/revalidate al editar una
 *      celda y entonces el cambio se ve al instante
 *
 *  Sobre el endpoint: /export?format=csv&gid=N devuelve siempre el
 *  estado actual de la hoja; /gviz/tq?sheet=NOMBRE a veces sirve una
 *  copia vieja. Por eso se intenta primero por gid y el gviz queda
 *  solo como último recurso.
 * ================================================================== */

import { parseCSV } from './csv';
import {
  parseConfig, parseTargets, parsePlayers, parseResults,
  parseGroupStandings, parseGlobalRanking, parseElimination,
  parseRankingFinal, parseRankingGroups, parseFixture,
} from './parsers';
import type {
  TournamentConfig, Player, GroupResult, GroupData, RankedPlayer,
  EliminationMatch, RankingFinalRow, RankingGroupRow, FixtureMatch,
} from '../data/types';

export const SPREADSHEET_ID = '13drcy7eWhX3P0cfrzYWAoBAJ53bRwQLU3NGKxEgiXYQ';

/** Tag común: /api/revalidate lo invalida y todas las páginas se refrescan. */
export const SHEET_TAG = 'sheet-data';

/** Segundos que se reutiliza una descarga antes de volver a pedirla. */
export const SHEET_TTL = 15;

/**
 * gid numérico de cada pestaña. El gid se ve en la URL del navegador
 * al hacer clic en la pestaña: .../edit#gid=394693629
 *
 * Las pestañas que no estén aquí siguen funcionando (se leen por
 * nombre), pero pueden tardar un poco más en reflejar un cambio.
 */
export const SHEET_GIDS: Record<string, string> = {
  CONFIGURACION: '394693629',
  JUGADORES: '1215907359',
};

export const SHEETS = {
  baseDatos: 'Base de Datos',
  config: 'CONFIGURACION',
  players: 'JUGADORES',
  fixture: 'FIXTURE_GRUPOS',
  results: 'RESULTADOS',
  groups: 'GRUPOS',
  elimination: 'Eliminación Simple',
  rankingGroups: 'RankingGrupos',
  rankingFinal: 'RankingFinal',
} as const;

/**
 * Normalmente Google. Se puede apuntar a otro sitio con SHEETS_BASE_URL
 * para probar la web en local contra una copia del Sheet.
 */
const BASE_URL = process.env.SHEETS_BASE_URL || 'https://docs.google.com';

function candidateUrls(sheetName: string, range?: string): string[] {
  const base = `${BASE_URL}/spreadsheets/d/${SPREADSHEET_ID}`;
  const urls: string[] = [];
  const gid = SHEET_GIDS[sheetName];

  if (gid) {
    let u = `${base}/export?format=csv&gid=${gid}`;
    if (range) u += `&range=${encodeURIComponent(range)}`;
    urls.push(u);
  }

  // Exportar por nombre de hoja: funciona en muchos libros y es fresco.
  urls.push(`${base}/export?format=csv&range=${encodeURIComponent(`'${sheetName}'!${range || 'A1:BZ500'}`)}`);

  // Último recurso.
  let gviz = `${base}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  if (range) gviz += `&range=${encodeURIComponent(range)}`;
  urls.push(gviz);

  return urls;
}

/** Una respuesta HTML es una página de error de Google, no un CSV. */
function looksLikeCsv(text: string): boolean {
  const head = text.trimStart().slice(0, 200).toLowerCase();
  if (head.startsWith('<') || head.includes('<!doctype') || head.includes('<html')) return false;
  return text.trim().length > 0;
}

/**
 * Nunca lanza: si Google no responde devuelve una lista vacía y la
 * página enseña su estado vacío. Un fallo puntual de Google no debe
 * tumbar el build ni dejar la web en blanco.
 */
async function fetchSheet(sheetName: string, range?: string): Promise<string[][]> {
  for (const url of candidateUrls(sheetName, range)) {
    try {
      const res = await fetch(url, {
        next: { revalidate: SHEET_TTL, tags: [SHEET_TAG] },
      });
      if (!res.ok) continue;
      const csv = await res.text();
      if (!looksLikeCsv(csv)) continue;
      const rows = parseCSV(csv);
      if (rows.length > 0) return rows;
    } catch {
      // se prueba la siguiente forma de pedir la hoja
    }
  }

  console.warn(`[sheets] no se pudo leer la hoja "${sheetName}"`);
  return [];
}

/* ------------------------------------------------------------------ */
/*  Lecturas                                                           */
/* ------------------------------------------------------------------ */

/** Objetivo de carambolas de cada jugador, desde 'Base de Datos' columna E. */
export async function fetchTargets(): Promise<Map<string, number>> {
  try {
    return parseTargets(await fetchSheet(SHEETS.baseDatos, 'A1:E300'));
  } catch {
    return new Map();
  }
}

export async function fetchConfig(): Promise<TournamentConfig> {
  const [rows, playerRows] = await Promise.all([
    fetchSheet(SHEETS.config, 'A1:B20'),
    fetchSheet(SHEETS.players, 'A1:F300'),
  ]);
  return parseConfig(rows, playerRows);
}

export async function fetchPlayers(): Promise<Player[]> {
  const [rows, targets] = await Promise.all([
    fetchSheet(SHEETS.players, 'A1:F300'),
    fetchTargets(),
  ]);
  return parsePlayers(rows, targets);
}

export async function fetchResults(): Promise<GroupResult[]> {
  const [rows, targets] = await Promise.all([
    fetchSheet(SHEETS.results, 'A1:P400'),
    fetchTargets(),
  ]);
  return parseResults(rows, targets);
}

/** GRUPOS trae en el mismo rango las tablas y el ranking general. */
export async function fetchGroups(): Promise<{ groups: GroupData[]; ranking: RankedPlayer[] }> {
  const rows = await fetchSheet(SHEETS.groups, 'A1:AZ400');
  return { groups: parseGroupStandings(rows), ranking: parseGlobalRanking(rows) };
}

export async function fetchGroupStandings(): Promise<GroupData[]> {
  return (await fetchGroups()).groups;
}

export async function fetchEliminationMatches(): Promise<EliminationMatch[]> {
  const [rows, targets] = await Promise.all([
    fetchSheet(SHEETS.elimination, 'A1:M300'),
    fetchTargets(),
  ]);
  return parseElimination(rows, targets);
}

export async function fetchRankingFinal(): Promise<RankingFinalRow[]> {
  return parseRankingFinal(await fetchSheet(SHEETS.rankingFinal, 'A1:C300'));
}

export async function fetchRankingGroups(): Promise<RankingGroupRow[]> {
  return parseRankingGroups(await fetchSheet(SHEETS.rankingGroups, 'A1:G300'));
}

export async function fetchFixture(): Promise<FixtureMatch[]> {
  return parseFixture(await fetchSheet(SHEETS.fixture, 'A1:H400'));
}
