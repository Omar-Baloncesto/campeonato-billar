/* ==================================================================
 *  Nombres de ronda de la eliminación directa.
 *
 *  El número de rondas depende de cuántos jugadores clasifiquen, así
 *  que NADA aquí está fijado: el nombre sale de cuántos partidos tiene
 *  la ronda, exactamente igual que en el Apps Script.
 *     1 partido  -> FINAL          8 partidos  -> OCTAVOS DE FINAL
 *     2 partidos -> SEMIFINAL     16 partidos  -> DIECISEISAVOS DE FINAL
 *     4 partidos -> CUARTOS       32 partidos  -> TREINTAIDOSAVOS
 * ================================================================== */

const BY_MATCH_COUNT: Record<number, string> = {
  1: 'Final',
  2: 'Semifinal',
  4: 'Cuartos de Final',
  8: 'Octavos de Final',
  16: 'Dieciseisavos de Final',
  32: 'Treintaidosavos de Final',
  64: 'Sesentaicuatroavos de Final',
};

export function roundNameFor(matchCount: number, roundNumber: number): string {
  return BY_MATCH_COUNT[matchCount] || `Ronda ${roundNumber}`;
}

/** Versión corta para pestañas y filtros. */
export function shortRoundName(name: string): string {
  return name
    .replace(/ de Final$/i, '')
    .replace(/^Dieciseisavos$/i, '16avos')
    .replace(/^Treintaidosavos$/i, '32avos')
    .replace(/^Sesentaicuatroavos$/i, '64avos');
}

/**
 * Mapa ronda -> nombre a partir de los partidos reales.
 * Cada ronda se nombra por el total de cruces que tiene el cuadro,
 * incluidos los BYE, que también son una posición del cuadro.
 */
export function buildRoundNames(rounds: { round: number; total: number }[]): Record<number, string> {
  const names: Record<number, string> = {};
  for (const r of rounds) names[r.round] = roundNameFor(r.total, r.round);
  return names;
}
