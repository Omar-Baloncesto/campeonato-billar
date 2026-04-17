import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const PATHS_TO_REVALIDATE = [
  '/',
  '/configuracion',
  '/jugadores',
  '/grupos',
  '/resultados',
  '/ranking',
  '/calendario',
  '/eliminacion',
];

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.REVALIDATE_TOKEN;
  if (!expected) return false;

  const header = request.headers.get('x-revalidate-token');
  const queryToken = request.nextUrl.searchParams.get('token');
  const provided = header ?? queryToken;

  return typeof provided === 'string' && provided === expected;
}

async function handle(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ revalidated: false, error: 'Unauthorized' }, { status: 401 });
  }

  revalidateTag('sheet-data', { expire: 0 });
  for (const path of PATHS_TO_REVALIDATE) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, now: Date.now() });
}

export async function POST(request: NextRequest) {
  return handle(request);
}

export async function GET(request: NextRequest) {
  return handle(request);
}
