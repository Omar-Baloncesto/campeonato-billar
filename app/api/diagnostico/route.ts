import { NextResponse } from 'next/server';
import { SPREADSHEET_ID, SHEET_GIDS, extraerGids } from '../../lib/sheets';
import { parseCSV, normalizeKey } from '../../lib/csv';

/* ==================================================================
 *  Diagnóstico de la lectura del Google Sheet.
 *
 *  Cuando una página sale vacía con la hoja llena, el problema está
 *  casi siempre en CÓMO se le pide la pestaña a Google, no en los
 *  datos. Esta ruta prueba TODAS las formas de pedirla y dice cuál
 *  funciona, cuál no y por qué.
 *
 *      /api/diagnostico                      todas las pestañas
 *      /api/diagnostico?hoja=Eliminación Simple
 *
 *  Además intenta descubrir el gid real de cada pestaña leyendo la
 *  vista HTML del libro: si eso funciona, la web puede dejar de
 *  depender de los gid escritos a mano, que se quedan viejos cada vez
 *  que un script borra y recrea una hoja.
 * ================================================================== */

export const dynamic = 'force-dynamic';

const BASE = 'https://docs.google.com';
const SHEETS = [
  'Base de Datos', 'CONFIGURACION', 'JUGADORES', 'FIXTURE_GRUPOS',
  'Calendario', 'RESULTADOS', 'GRUPOS', 'Eliminación Simple',
  'RankingGrupos', 'RankingFinal',
];

/** Señas para saber si llegó la pestaña pedida y no otra. */
function pareceLaHoja(nombre: string, rows: string[][]): boolean {
  const busca = (etiquetas: string[]) =>
    rows.slice(0, 400).some(r => {
      const celdas = r.map(c => normalizeKey(c));
      return etiquetas.every(e => celdas.includes(normalizeKey(e)));
    });
  switch (nombre) {
    case 'Eliminación Simple': return busca(['ronda', 'ganador']);
    case 'GRUPOS': return busca(['total pts']);
    case 'RESULTADOS': return busca(['resultado', 'jugador a']);
    case 'FIXTURE_GRUPOS': return busca(['grupo', 'partido', 'jugador a']);
    case 'JUGADORES': return busca(['grupo', 'activo']);
    case 'Base de Datos': return busca(['nombre del jugador', 'carambolas']);
    case 'RankingGrupos': return busca(['ranking', 'promedio']);
    case 'RankingFinal': return busca(['ranking', 'ronda alcanzada']);
    case 'Calendario': return busca(['fecha', 'hora', 'grupo']);
    default: return rows.length > 0;
  }
}

async function probar(nombre: string, etiqueta: string, url: string) {
  const t0 = Date.now();
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const texto = await res.text();
    const esHtml = texto.trimStart().slice(0, 200).toLowerCase().includes('<');
    const rows = esHtml ? [] : parseCSV(texto);
    return {
      via: etiqueta,
      http: res.status,
      ms: Date.now() - t0,
      bytes: texto.length,
      esHtml,
      filas: rows.length,
      esLaHoja: rows.length > 0 ? pareceLaHoja(nombre, rows) : false,
      primeraFila: rows[0] ? rows[0].slice(0, 6).join(' | ').slice(0, 120) : texto.slice(0, 80),
    };
  } catch (e) {
    return { via: etiqueta, error: String(e).slice(0, 120), ms: Date.now() - t0 };
  }
}

/** Saca los gid de verdad de la vista HTML del libro. */
async function gidsReales(): Promise<Record<string, string> | { error: string; pista?: string }> {
  try {
    const res = await fetch(`${BASE}/spreadsheets/d/${SPREADSHEET_ID}/htmlview`, { cache: 'no-store' });
    if (!res.ok) return { error: `htmlview HTTP ${res.status}` };
    const html = await res.text();
    const out = extraerGids(html);
    if (Object.keys(out).length > 0) return out;
    // Si no aparece, se devuelve un trozo del HTML para poder adaptarlo
    const i = html.indexOf('gid=');
    return {
      error: 'no se encontraron pestañas en el HTML',
      pista: i >= 0 ? html.slice(Math.max(0, i - 200), i + 200) : html.slice(0, 300),
    };
  } catch (e) {
    return { error: String(e).slice(0, 120) };
  }
}

export async function GET(request: Request) {
  const pedida = new URL(request.url).searchParams.get('hoja');
  const hojas = pedida ? [pedida] : SHEETS;

  const reales = await gidsReales();

  const resultado = [];
  for (const nombre of hojas) {
    const gid = SHEET_GIDS[nombre];
    const b = `${BASE}/spreadsheets/d/${SPREADSHEET_ID}`;
    const n = encodeURIComponent(nombre);
    const intentos = [];

    if (gid) intentos.push(await probar(nombre, `A · export por gid (${gid})`, `${b}/export?format=csv&gid=${gid}`));
    intentos.push(await probar(nombre, 'B · gviz por nombre, headers=0', `${b}/gviz/tq?tqx=out:csv&headers=0&sheet=${n}`));
    intentos.push(await probar(nombre, 'C · gviz por nombre, sin headers', `${b}/gviz/tq?tqx=out:csv&sheet=${n}`));
    intentos.push(await probar(nombre, 'D · export con el nombre en range', `${b}/export?format=csv&range=${encodeURIComponent(`'${nombre}'!A1:BZ500`)}`));

    const gidReal = !('error' in reales) ? reales[nombre] : undefined;
    if (gidReal && gidReal !== gid) {
      intentos.push(await probar(nombre, `E · export por gid REAL (${gidReal})`, `${b}/export?format=csv&gid=${gidReal}`));
    }

    resultado.push({
      hoja: nombre,
      gidEnElCodigo: gid || '(ninguno)',
      gidReal: gidReal || '(no descubierto)',
      gidCoincide: gid && gidReal ? gid === gidReal : null,
      funciona: intentos.filter(i => 'esLaHoja' in i && i.esLaHoja).map(i => i.via),
      intentos,
    });
  }

  return NextResponse.json(
    { generado: new Date().toISOString(), gidsDescubiertos: reales, hojas: resultado },
    { headers: { 'cache-control': 'no-store' } },
  );
}
