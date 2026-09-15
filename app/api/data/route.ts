import { NextResponse } from 'next/server';
import {
  fetchConfig, fetchPlayers, fetchResults, fetchGroups,
  fetchRankingFinal, fetchRankingGroups, fetchEliminationMatches, fetchFixture,
} from '../../lib/sheets';

/* ==================================================================
 *  API de solo lectura con los datos del torneo ya normalizados.
 *  Útil para comprobar qué está leyendo la web del Sheet.
 *      /api/data?type=groups
 * ================================================================== */

export const dynamic = 'force-dynamic';

const HANDLERS: Record<string, () => Promise<unknown>> = {
  config: fetchConfig,
  players: fetchPlayers,
  results: fetchResults,
  groups: fetchGroups,
  elimination: fetchEliminationMatches,
  fixture: fetchFixture,
  'ranking-final': fetchRankingFinal,
  'ranking-groups': fetchRankingGroups,
};

export async function GET(request: Request) {
  const type = new URL(request.url).searchParams.get('type') || '';

  try {
    if (type === 'all') {
      const keys = Object.keys(HANDLERS);
      const values = await Promise.all(keys.map(k => HANDLERS[k]()));
      return NextResponse.json(Object.fromEntries(keys.map((k, i) => [k, values[i]])));
    }

    const handler = HANDLERS[type];
    if (!handler) {
      return NextResponse.json(
        { error: `type inválido. Usa: ${Object.keys(HANDLERS).join(', ')}, all` },
        { status: 400 },
      );
    }
    return NextResponse.json(await handler());
  } catch (error) {
    console.error('[api/data]', error);
    return NextResponse.json({ error: 'No se pudo leer el Google Sheet' }, { status: 500 });
  }
}
