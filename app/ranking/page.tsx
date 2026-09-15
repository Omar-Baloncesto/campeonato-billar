import { fetchRankingFinal, fetchRankingGroups, fetchEliminationMatches, fetchPlayers } from '../lib/sheets';
import RankingClient from './RankingClient';

// ISR: la página se regenera cada 15 s como mucho, y al instante
// cuando el Apps Script llama a /api/revalidate al editar una celda.
export const revalidate = 15;

export default async function RankingPage() {
  const [rankingFinal, rankingGroups, elimination, players] = await Promise.all([
    fetchRankingFinal().catch(() => []),
    fetchRankingGroups().catch(() => []),
    fetchEliminationMatches().catch(() => []),
    fetchPlayers().catch(() => []),
  ]);

  // El nombre de cada ronda sale del cuadro real, no de una lista fija.
  const roundNames: Record<number, string> = {};
  for (const m of elimination) roundNames[m.round] = m.roundName;

  return (
    <RankingClient
      rankingFinal={rankingFinal}
      rankingGroups={rankingGroups}
      roundNames={roundNames}
      players={players}
    />
  );
}
