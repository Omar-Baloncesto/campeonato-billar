/* ==================================================================
 *  Tipos del torneo
 *
 *  Todo lo que puede estar "pendiente" en el Sheet (una carambola que
 *  todavía no se digita) se modela como `number | null`, NUNCA como 0.
 *  Un 0 es un resultado real; null es "todavía no se jugó".
 * ================================================================== */

export interface TournamentConfig {
  totalPlayers: number;
  playersPerGroup: number;
  totalGroups: number;
  category: string;
  /** Carambolas que debe hacer un jugador de primera categoría */
  carambolasPrimera: number;
  /** Carambolas que debe hacer un jugador de segunda categoría */
  carambolasSegunda: number;
  carambolasSemifinal: number;
  carambolasFinal: number;
  entriesLimit: number;
  timePerEntry: number;
  /** true cuando el torneo cruza categorías y el ganador sale del % de objetivo */
  mixedCategories: boolean;
}

export interface Player {
  id: number;
  name: string;
  group: number;
  category: string;
  active: boolean;
  city: string;
  /** Carambolas a hacer según su categoría (Base de Datos, columna E) */
  target: number | null;
}

export type MatchStatus = 'played' | 'pending' | 'walkover' | 'draw';

export interface GroupResult {
  group: number;
  match: number;
  playerA: string;
  carambolasA: number | null;
  entriesA: number | null;
  /** carambolas / entradas — el promedio de la partida */
  averageA: number | null;
  playerB: string;
  carambolasB: number | null;
  entriesB: number | null;
  averageB: number | null;
  /** Nombre del ganador, o '' si aún no está decidido */
  winner: string;
  /** Texto crudo de la columna Resultado: nombre, EMPATE, SIN JUGAR o W.O. */
  rawResult: string;
  walkover: boolean;
  status: MatchStatus;
  /** Objetivo de carambolas de cada jugador */
  targetA: number | null;
  targetB: number | null;
  /** carambolas / objetivo — ES LO QUE DECIDE EL PARTIDO */
  pctA: number | null;
  pctB: number | null;
}

export interface GroupStanding {
  /** Nº dentro del grupo (orden de inscripción, columna A) */
  position: number;
  player: string;
  /** Carambolas a favor por partido, en orden P1..Pn */
  ca: (number | null)[];
  totalCA: number;
  /** Carambolas en contra por partido */
  cr: (number | null)[];
  totalCR: number;
  /** DIF % (torneo mixto) o PROM - DIF (categoría única) */
  differential: number;
  /** Puntos por partido */
  pts: (number | null)[];
  totalPts: number;
  /** Puesto dentro del grupo */
  groupOrder: number;
  /** Puesto en la clasificación general del torneo */
  generalClassification: number;
  /** Partidos con resultado completo */
  played: number;
  /** Partidos previstos para este jugador */
  scheduled: number;
}

export interface GroupData {
  number: number;
  standings: GroupStanding[];
  /** Cuántos partidos juega cada jugador del grupo */
  matchesPerPlayer: number;
  /** Etiqueta real de la columna de diferencia en el Sheet */
  differentialLabel: string;
  /** true si la diferencia es un % (torneo con hándicap) */
  differentialIsPercent: boolean;
}

export interface RankedPlayer {
  /** Puesto en la clasificación general */
  ranking: number;
  player: string;
}

export interface EliminationMatch {
  round: number;
  /** FINAL, SEMIFINAL, CUARTOS DE FINAL… tal como lo nombra el Sheet */
  roundName: string;
  match: number;
  playerA: string;
  entriesA: number | null;
  carambolasA: number | null;
  averageA: number | null;
  playerB: string;
  entriesB: number | null;
  carambolasB: number | null;
  averageB: number | null;
  winner: string;
  isBye: boolean;
  targetA: number | null;
  targetB: number | null;
  pctA: number | null;
  pctB: number | null;
  status: MatchStatus;
}

export interface RankingFinalRow {
  ranking: number;
  player: string;
  roundReached: number;
}

export interface RankingGroupRow {
  ranking: number;
  player: string;
  /** Lo que trae la columna C del Sheet (hoy es la categoría) */
  categoryOrCity: string;
  carambolas: number;
  entries: number;
  average: number;
  points: number;
}

export interface FixtureMatch {
  group: number;
  match: number;
  playerA: string;
  targetA: number | null;
  playerB: string;
  targetB: number | null;
  /** '' mientras no se programe en el Sheet */
  isoDate: string;
  time24: string;
}
