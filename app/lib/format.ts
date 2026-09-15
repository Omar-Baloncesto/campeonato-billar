/* ==================================================================
 *  Formato de números en español, igual que se ven en el Sheet.
 *
 *  Nada de Intl aquí: el formateo tiene que dar EXACTAMENTE el mismo
 *  texto en el servidor y en el navegador, o React se queja de que el
 *  HTML no coincide al hidratar.
 *
 *  Un valor null es "todavía no se jugó" y se pinta como raya, nunca
 *  como 0: un 0 de verdad (alguien que no hizo carambolas) tiene que
 *  poder distinguirse de un partido pendiente.
 * ================================================================== */

export const EMPTY = '—';

export function fmtInt(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return EMPTY;
  return String(Math.round(n));
}

/** 0.4666 → "0,467" */
export function fmtAvg(n: number | null | undefined, digits = 3): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return EMPTY;
  return n.toFixed(digits).replace('.', ',');
}

/** 0.7058 → "70,6 %" */
export function fmtPct(n: number | null | undefined, digits = 1): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return EMPTY;
  return `${(n * 100).toFixed(digits).replace('.', ',')} %`;
}

/** Diferencia con signo: 1.171 → "+1,171" */
export function fmtSigned(n: number | null | undefined, digits = 3): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return EMPTY;
  const s = n.toFixed(digits).replace('.', ',');
  return n > 0 ? `+${s}` : s;
}

/** "2026-01-30" → "viernes 30 de enero" */
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export function fmtDate(iso: string): string {
  const m = (iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return '';
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]}`;
}

/** "14:00" → "2:00 p. m." */
export function fmtTime(time24: string): string {
  const m = (time24 || '').match(/^(\d{2}):(\d{2})$/);
  if (!m) return '';
  const h = Number(m[1]);
  const period = h < 12 ? 'a. m.' : 'p. m.';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m[2]} ${period}`;
}
