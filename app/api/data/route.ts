import { NextResponse } from 'next/server';
import {
  fetchConfig,
  fetchPlayers,
  fetchResults,
  fetchGroupStandings,
  fetchRankingFinal,
  fetchRankingGroups,
} from '../../lib/sheets';

export const dynamic = 'force-dynamic';

const SPREADSHEET_ID = '13drcy7eWhX3P0cfrzYWAoBAJ53bRwQLU3NGKxEgiXYQ';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    switch (type) {
      case 'config':
        return NextResponse.json(await fetchConfig());
      case 'config-raw': {
        // Diagnóstico: devuelve el CSV crudo que Google entrega para
        // A1:B15 de CONFIGURACION, byte a byte, para detectar caracteres
        // invisibles en las celdas A-label.
        const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=CONFIGURACION&range=A1:B15&_=${Date.now()}`;
        const res = await fetch(url, { cache: 'no-store' });
        const csv = await res.text();
        const bytes = Array.from(csv).map(c => {
          const code = c.charCodeAt(0);
          if (code < 32 || code > 126) return { char: c, hex: '0x' + code.toString(16) };
          return null;
        }).filter(Boolean);
        return NextResponse.json({
          status: res.status,
          length: csv.length,
          csv,
          suspicious_chars: bytes,
        });
      }
      case 'players':
        return NextResponse.json(await fetchPlayers());
      case 'results':
        return NextResponse.json(await fetchResults());
      case 'groups':
        return NextResponse.json(await fetchGroupStandings());
      case 'ranking-final':
        return NextResponse.json(await fetchRankingFinal());
      case 'ranking-groups':
        return NextResponse.json(await fetchRankingGroups());
      case 'all': {
        const [config, players, results, groups, rankingFinal, rankingGroups] = await Promise.all([
          fetchConfig(),
          fetchPlayers(),
          fetchResults(),
          fetchGroupStandings(),
          fetchRankingFinal(),
          fetchRankingGroups(),
        ]);
        return NextResponse.json({ config, players, results, groups, rankingFinal, rankingGroups });
      }
      default:
        return NextResponse.json({ error: 'Invalid type. Use: config, players, results, groups, ranking-final, ranking-groups, or all' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data from Google Sheets' }, { status: 500 });
  }
}
