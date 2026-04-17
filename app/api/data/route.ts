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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    switch (type) {
      case 'config':
        return NextResponse.json(await fetchConfig());
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
