import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { SHEET_TAG } from '../../lib/sheets';

/* ==================================================================
 *  Tiempo real.
 *
 *  El Apps Script llama a esta ruta cada vez que se edita una celda
 *  del torneo. Eso borra la copia guardada de los datos del Sheet y
 *  la web enseña el cambio en la siguiente visita, sin esperar a los
 *  15 s del refresco automático.
 *
 *  Antes esta ruta no hacía nada: invalidaba el tag "sheet-data" pero
 *  ninguna descarga lo llevaba, y revalidatePath no tenía efecto
 *  porque todas las páginas eran force-dynamic.
 * ================================================================== */

export const dynamic = 'force-dynamic';

const PATHS = [
  '/', '/configuracion', '/jugadores', '/calendario',
  '/grupos', '/resultados', '/eliminacion', '/ranking',
];

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.REVALIDATE_TOKEN;
  if (!expected) return false;
  const provided =
    request.headers.get('x-revalidate-token') ?? request.nextUrl.searchParams.get('token');
  return typeof provided === 'string' && provided === expected;
}

async function handle(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ revalidated: false, error: 'Unauthorized' }, { status: 401 });
  }

  // expire: 0 caduca ya, sin servir la copia vieja mientras se refresca.
  revalidateTag(SHEET_TAG, { expire: 0 });
  for (const path of PATHS) revalidatePath(path);

  return NextResponse.json({ revalidated: true, paths: PATHS.length, now: Date.now() });
}

export async function POST(request: NextRequest) {
  return handle(request);
}

export async function GET(request: NextRequest) {
  return handle(request);
}
