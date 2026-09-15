import { fetchConfig, fetchPlayers, fetchGroups, fetchResults, fetchEliminationMatches } from '../lib/sheets';
import ConfigClient from './ConfigClient';

// ISR: la página se regenera cada 15 s como mucho, y al instante
// cuando el Apps Script llama a /api/revalidate al editar una celda.
export const revalidate = 15;

export default async function ConfiguracionPage() {
  const [config, players, { groups }, results, elimination] = await Promise.all([
    fetchConfig(),
    fetchPlayers().catch(() => []),
    fetchGroups().catch(() => ({ groups: [], ranking: [] })),
    fetchResults().catch(() => []),
    fetchEliminationMatches().catch(() => []),
  ]);

  return (
    <ConfigClient
      config={config}
      players={players}
      groups={groups}
      resultsCount={results.length}
      eliminationCount={elimination.filter(m => !m.isBye).length}
      eliminationRounds={new Set(elimination.map(m => m.round)).size}
    />
  );
}
