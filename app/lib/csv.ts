/* ==================================================================
 *  Utilidades de CSV y de conversión de números
 *  (sin dependencias de servidor: se pueden importar desde el cliente)
 * ================================================================== */

export function parseCSV(csv: string): string[][] {
  const rows: string[][] = [];
  let current = '';
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    if (inQuotes) {
      if (ch === '"' && csv[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(current.trim());
      current = '';
    } else if (ch === '\n' || (ch === '\r' && csv[i + 1] === '\n')) {
      row.push(current.trim());
      rows.push(row);
      row = [];
      current = '';
      if (ch === '\r') i++;
    } else {
      current += ch;
    }
  }
  if (current || row.length > 0) {
    row.push(current.trim());
    rows.push(row);
  }
  return rows;
}

/** Celda de una fila, siempre string y sin espacios sobrantes. */
export function cell(row: string[] | undefined, i: number | undefined): string {
  if (!row || i === undefined || i < 0) return '';
  return (row[i] ?? '').trim();
}

/**
 * Número o null. Una celda vacía significa "todavía no se jugó", NO cero.
 * El Sheet está en español: los decimales vienen con coma.
 */
export function numOrNull(val: string | undefined): number | null {
  const v = (val ?? '').trim();
  if (v === '') return null;
  const n = Number(v.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/** Número con 0 por defecto. Úsalo solo donde el 0 sea correcto. */
export function num(val: string | undefined): number {
  return numOrNull(val) ?? 0;
}

/** "50,0%" → 0.5 · "0,529" → 0.529 · "" → null */
export function pctOrNull(val: string | undefined): number | null {
  const v = (val ?? '').trim();
  if (v === '') return null;
  if (v.endsWith('%')) {
    const n = numOrNull(v.slice(0, -1));
    return n === null ? null : n / 100;
  }
  return numOrNull(v);
}

/**
 * Normaliza una cadena para comparar sin que tildes, mayúsculas,
 * espacios extra o guiones tipográficos rompan el match.
 *   "Categoría" → "categoria" · "Carambolas – Final" → "carambolas - final"
 */
export function normalizeKey(s: string): string {
  return (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[‐-―]/g, '-')
    .replace(/[^a-zA-Z0-9 \-%]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Compara nombres de jugador ignorando tildes, dobles espacios y mayúsculas. */
export function normalizeName(s: string): string {
  return (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

/** Textos que la columna Resultado usa en vez de un nombre de jugador. */
export const NON_PLAYER_RESULTS = new Set(['EMPATE', 'SIN JUGAR', 'W.O.', 'WO', 'BYE', 'PENDIENTE']);

export function isPlayerName(value: string): boolean {
  const v = (value || '').trim();
  return v !== '' && !NON_PLAYER_RESULTS.has(v.toUpperCase());
}
